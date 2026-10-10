#!/usr/bin/env bash
set -euo pipefail

validation_only=0
if [ "$#" -eq 2 ] && [ "$1" = "--validate-only" ]; then
    validation_only=1
    bundle_dir=$2
elif [ "$#" -eq 1 ] && [ "$1" != "--validate-only" ]; then
    bundle_dir=$1
else
    printf 'Uso: sudo bash %s DIRETORIO_DO_PACOTE\nValidação: bash %s --validate-only DIRETORIO_DO_PACOTE\n' "$0" "$0" >&2
    exit 2
fi
if [ "$validation_only" -eq 0 ] && [ "$EUID" -ne 0 ]; then
    printf 'Execute este instalador com sudo no servidor.\n' >&2
    exit 1
fi
command -v python3 >/dev/null || {
    printf 'Python 3 é necessário.\n' >&2
    exit 1
}

exec python3 - "$bundle_dir" "$validation_only" <<'PY'
import fcntl
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone

NGINX_CONFIG = """# Inclua estes blocos no contexto http da configuração existente.
# As portas locais atendem apenas às duas novas origens.
server {
    listen 127.0.0.1:8111;
    server_name kdtech.advogadosmca.com.br;

    root /srv/kdtech/current;
    index index.html;

    location ^~ /assets/ {
        try_files $uri =404;
    }

    location / {
        # Preserva os metadados das páginas estáticas de cada projeto.
        try_files $uri $uri/index.html /index.html;
    }
}

server {
    listen 127.0.0.1:8112;
    server_name lousa.advogadosmca.com.br;

    root /srv/lousa/current;
    index index.html;

    location ^~ /assets/ {
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/index.html /index.html;
    }
}
"""

PROJECTS = {
    "kdtech": ("kdtech.advogadosmca.com.br", 8111),
    "lousa": ("lousa.advogadosmca.com.br", 8112),
}
STATIC_SUFFIXES = {
    ".html", ".js", ".css", ".map", ".json", ".txt", ".svg", ".png",
    ".jpg", ".jpeg", ".webp", ".gif", ".ico", ".woff", ".woff2", ".ttf",
    ".otf", ".eot", ".pdf", ".mp3", ".wav", ".ogg", ".mp4", ".webm",
    ".xml", ".webmanifest", ".avif",
}
MAX_ARCHIVE_BYTES = 256 * 1024 * 1024
MAX_UNPACKED_BYTES = 512 * 1024 * 1024


def fail(message):
    raise RuntimeError(message)


def regular_file_bytes(path, limit):
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(descriptor, "rb") as source:
        metadata = os.fstat(source.fileno())
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_size > limit:
            fail(f"Arquivo inválido ou maior que o limite: {path.name}")
        data = source.read(limit + 1)
    if len(data) > limit:
        fail(f"Arquivo maior que o limite: {path.name}")
    return data


def archive_members(data):
    members = []
    seen = set()
    total = 0
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        for member in archive:
            raw = member.name
            if (raw.startswith("/") or "\\" in raw
                    or ".." in raw.split("/")
                    or any(ord(character) < 32 for character in raw)):
                fail("O pacote contém um caminho inválido.")
            relative = PurePosixPath(raw)
            if any(part.startswith((".git", ".env")) or part == "node_modules"
                   for part in relative.parts):
                fail("O pacote contém arquivos que não devem ser publicados.")
            if not (member.isfile() or member.isdir()) or member.issparse():
                fail("O pacote deve conter somente arquivos e diretórios estáticos.")
            if str(relative) == ".":
                if not member.isdir():
                    fail("Entrada raiz inválida no pacote.")
                continue
            if str(relative) in seen:
                fail("O pacote contém caminhos duplicados.")
            seen.add(str(relative))
            if member.isfile():
                if relative.suffix.lower() not in STATIC_SUFFIXES and relative.name != "_redirects":
                    fail("O pacote contém um tipo de arquivo não estático.")
                total += member.size
                if member.size < 0 or total > MAX_UNPACKED_BYTES:
                    fail("Conteúdo descompactado maior que o limite.")
            members.append(member)
            if len(members) > 20_000:
                fail("O pacote contém arquivos demais.")
    if "index.html" not in seen or not any(
        member.isfile() and str(PurePosixPath(member.name)) == "index.html"
        for member in members
    ):
        fail("O pacote precisa conter index.html na raiz.")
    return members


def validate_bundle(bundle):
    raw = regular_file_bytes(bundle / "manifest.json", 1024 * 1024)
    records = json.loads(raw)
    if not isinstance(records, list):
        fail("O manifesto precisa conter uma lista de projetos.")
    validated = {}
    for record in records:
        if not isinstance(record, dict):
            fail("Registro inválido no manifesto.")
        project = record.get("project")
        if not isinstance(project, str):
            fail("Identificador de projeto inválido no manifesto.")
        if project not in PROJECTS:
            continue
        if project in validated:
            fail("Projeto estático duplicado no manifesto.")
        hostname, _ = PROJECTS[project]
        if record.get("hostname") != hostname or record.get("archive") != f"{project}.tar.gz":
            fail(f"Origem ou nome do pacote incorreto para {project}.")
        commit = record.get("commit", "")
        digest = record.get("sha256", "")
        if not isinstance(commit, str) or not re.fullmatch(r"[0-9a-f]{40}", commit):
            fail(f"Commit inválido no manifesto de {project}.")
        if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest):
            fail(f"Checksum inválido no manifesto de {project}.")
        data = regular_file_bytes(bundle / record["archive"], MAX_ARCHIVE_BYTES)
        if hashlib.sha256(data).hexdigest() != digest:
            fail(f"Checksum não confere para {project}.")
        members = archive_members(data)
        validated[project] = (record, data, members)
    if set(validated) != set(PROJECTS):
        fail("O manifesto precisa incluir uma entrada para KDTech e uma para Lousa.")
    return validated


def safe_directory(path, create=False, mode=0o755):
    if create and not path.exists():
        path.mkdir(mode=mode)
    metadata = path.lstat()
    if (not stat.S_ISDIR(metadata.st_mode) or metadata.st_uid != 0
            or metadata.st_mode & 0o022):
        fail(f"O diretório precisa ser real, de root e sem escrita pública: {path}")


def atomic_write(path, data, mode=0o644):
    descriptor, temporary = tempfile.mkstemp(prefix=f".{path.name}-", dir=path.parent)
    temporary_path = Path(temporary)
    try:
        with os.fdopen(descriptor, "wb") as output:
            output.write(data)
            output.flush()
            os.fsync(output.fileno())
            os.fchmod(output.fileno(), mode)
        os.replace(temporary_path, path)
    finally:
        if temporary_path.exists():
            temporary_path.unlink()


def atomic_symlink(path, target):
    temporary = path.parent / f".{path.name}-{uuid.uuid4().hex}"
    try:
        temporary.symlink_to(target)
        os.replace(temporary, path)
    finally:
        if temporary.is_symlink():
            temporary.unlink()


def snapshot(path, backup):
    if not os.path.lexists(path):
        return {"kind": "absent"}
    metadata = path.lstat()
    if stat.S_ISLNK(metadata.st_mode):
        return {"kind": "symlink", "target": os.readlink(path)}
    if not stat.S_ISREG(metadata.st_mode):
        fail(f"Não será substituído um caminho que não é arquivo ou link: {path}")
    shutil.copy2(path, backup, follow_symlinks=False)
    backup.chmod(0o600)
    return {
        "kind": "file", "backup": str(backup),
        "mode": stat.S_IMODE(metadata.st_mode),
        "uid": metadata.st_uid, "gid": metadata.st_gid,
    }


def restore(path, state):
    if state["kind"] == "absent":
        if os.path.lexists(path):
            if path.is_dir() and not path.is_symlink():
                fail(f"Rollback não removerá um diretório: {path}")
            path.unlink()
    elif state["kind"] == "symlink":
        atomic_symlink(path, state["target"])
    else:
        data = Path(state["backup"]).read_bytes()
        atomic_write(path, data, state["mode"])
        os.chown(path, state["uid"], state["gid"])


def extract_static(data, members, destination):
    destination.mkdir(mode=0o755)
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        for member in members:
            target = destination / str(PurePosixPath(member.name))
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True, mode=0o755)
                continue
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            with archive.extractfile(member) as source, target.open("xb") as output:
                shutil.copyfileobj(source, output)
            target.chmod(0o644)


def run(*arguments):
    subprocess.run(arguments, check=True)


def verify_sites(releases):
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    for project, (hostname, port) in PROJECTS.items():
        release = releases[project]
        checks = [
            ("/index.html", release / "index.html"),
            ("/projetos/lousa", release / "projetos/lousa/index.html")
            if project == "kdtech" else ("/login", release / "index.html"),
        ]
        for route, expected in checks:
            request = urllib.request.Request(
                f"http://127.0.0.1:{port}{route}", headers={"Host": hostname}
            )
            with opener.open(request, timeout=3) as response:
                actual = response.read(MAX_UNPACKED_BYTES + 1)
            if hashlib.sha256(actual).digest() != hashlib.sha256(expected.read_bytes()).digest():
                fail(f"A origem local de {project} não serviu a versão esperada.")
        request = urllib.request.Request(
            f"http://127.0.0.1:{port}/assets/ausente-{uuid.uuid4().hex}.js",
            headers={"Host": hostname},
        )
        try:
            with opener.open(request, timeout=3):
                fail(f"A origem de {project} precisa retornar 404 para assets ausentes.")
        except urllib.error.HTTPError as error:
            if error.code != 404:
                raise


def main():
    os.umask(0o022)
    bundle = Path(sys.argv[1]).resolve(strict=True)
    if not bundle.is_dir():
        fail("Informe o diretório do pacote.")
    validated = validate_bundle(bundle)
    if sys.argv[2] == "1":
        for project, (record, _, _) in validated.items():
            print(f"{project}: checksum e conteúdo válidos (commit {record['commit']})")
        return
    if os.geteuid() != 0:
        fail("Execute este instalador com sudo no servidor.")
    for command in ("nginx", "systemctl"):
        if not shutil.which(command):
            fail(f"Comando necessário não encontrado: {command}")
    lock_descriptor = os.open(
        "/run/lock/kdtech-static.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600
    )
    with os.fdopen(lock_descriptor, "w") as lock:
        if os.fstat(lock.fileno()).st_uid != 0:
            fail("O arquivo de trava precisa pertencer a root.")
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            fail("Outra instalação destes projetos está em execução.")
        run("systemctl", "is-active", "--quiet", "nginx")
        run("nginx", "-t")
        available = Path("/etc/nginx/sites-available/kdtech-static")
        enabled = Path("/etc/nginx/sites-enabled/kdtech-static")
        for directory in (Path("/srv"), available.parent, enabled.parent):
            safe_directory(directory)
        if available.is_symlink():
            fail("O arquivo de configuração existente não pode ser um link.")
        if os.path.lexists(enabled) and (
            not enabled.is_symlink() or enabled.resolve() != available
        ):
            fail("Já existe uma entrada habilitada diferente para kdtech-static.")
        for project in PROJECTS:
            base = Path("/srv") / project
            safe_directory(base, create=True)
            safe_directory(base / "releases", create=True)
            current = base / "current"
            if os.path.lexists(current) and not current.is_symlink():
                fail(f"{current} precisa ser um link; nenhum arquivo será removido.")
        transaction = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:12]
        backups = Path("/srv/kdtech/deployment-backups")
        safe_directory(backups, create=True, mode=0o700)
        backup = backups / transaction
        backup.mkdir(mode=0o700)
        states = {
            available: snapshot(available, backup / "nginx-previous.conf"),
            enabled: snapshot(enabled, backup / "nginx-enabled"),
        }
        releases = {}
        for project, (record, data, members) in validated.items():
            base = Path("/srv") / project
            current = base / "current"
            states[current] = snapshot(current, backup / f"{project}-current")
            name = f"{transaction}-{record['commit'][:12]}"
            release = base / "releases" / name
            extract_static(data, members, release)
            atomic_write(
                base / "releases" / f"{name}.manifest.json",
                json.dumps(record, ensure_ascii=False, indent=2).encode() + b"\n",
            )
            releases[project] = release
        atomic_write(
            backup / "state.json",
            json.dumps({str(path): value for path, value in states.items()}, indent=2).encode() + b"\n",
            0o600,
        )
        try:
            atomic_write(available, NGINX_CONFIG.encode())
            atomic_symlink(enabled, available)
            for project, release in releases.items():
                atomic_symlink(Path("/srv") / project / "current", release)
            run("nginx", "-t")
            run("systemctl", "reload", "nginx")
            for attempt in range(5):
                try:
                    verify_sites(releases)
                    break
                except (OSError, RuntimeError):
                    if attempt == 4:
                        raise
                    time.sleep(1)
        except BaseException:
            print("Instalação não confirmada. Restaurando configuração e links anteriores.", file=sys.stderr)
            rollback_errors = []
            for path, state in reversed(list(states.items())):
                try:
                    restore(path, state)
                except Exception as error:
                    rollback_errors.append(f"{path}: {error}")
            try:
                run("nginx", "-t")
                run("systemctl", "reload", "nginx")
            except Exception as error:
                rollback_errors.append(str(error))
            if rollback_errors:
                print("Rollback requer revisão manual. Backups: " + str(backup), file=sys.stderr)
                for error in rollback_errors:
                    print(error, file=sys.stderr)
            raise
        for project, release in releases.items():
            print(f"{project}: {release} (commit {validated[project][0]['commit']})")
        print(f"Instalação validada. Backups: {backup}")
        print("As versões anteriores foram preservadas.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Falha: {error}", file=sys.stderr)
        sys.exit(1)
PY
