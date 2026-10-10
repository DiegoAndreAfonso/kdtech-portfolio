#!/usr/bin/env python3
"""Empacota releases compiladas e o Atendimento sem credenciais locais."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
import tarfile


def commit(root: Path) -> str:
    value = subprocess.check_output(
        ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
    ).strip()
    if not re.fullmatch(r"[0-9a-f]{40}", value):
        raise ValueError("Commit inválido")
    return value


def files_under(root: Path, directory: Path):
    if directory.is_symlink() or not directory.is_dir():
        raise ValueError(f"Diretório ausente ou link: {directory}")
    for path in sorted(directory.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"Link não permitido: {path}")
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if any(part.startswith(".") for part in relative.parts):
            raise ValueError(f"Arquivo oculto não permitido: {relative}")
        if path.suffix.lower() in {".map", ".sql", ".sqlite", ".db", ".bak", ".log"}:
            raise ValueError(f"Arquivo não publicável: {relative}")
        yield path


def archive(output: Path, root: Path, paths: list[Path]) -> str:
    with tarfile.open(output, "w:gz") as tar:
        for path in paths:
            if path.is_symlink() or not path.is_file():
                raise ValueError(f"Arquivo ausente ou link: {path}")
            info = tar.gettarinfo(str(path), arcname=str(path.relative_to(root)))
            info.uid = info.gid = 0
            info.uname = info.gname = ""
            info.mode = 0o644
            with path.open("rb") as stream:
                tar.addfile(info, stream)
    return hashlib.sha256(output.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lousa", type=Path, required=True)
    parser.add_argument("--atendimento", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    portfolio = Path(__file__).resolve().parent.parent
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    allowed_output = {"kdtech.tar.gz", "lousa.tar.gz", "atendimento.tar.gz", "manifest.json", "SHA256SUMS", "install.sh", "install-static.sh", "install-atendimento.sh", "verify-server.py", "README.md"}
    if any(path.is_symlink() or not path.is_file() or path.name not in allowed_output for path in output.iterdir()):
        raise ValueError("Use uma pasta de saída nova ou contendo somente o pacote anterior")
    projects = []
    for name, root in [("kdtech", portfolio), ("lousa", args.lousa.resolve())]:
        dist = root / "dist"
        if not (dist / "index.html").is_file():
            raise ValueError(f"Build ausente: {dist}")
        if name == "kdtech" and "https://kdtech.advogadosmca.com.br" not in (dist / "index.html").read_text():
            raise ValueError("Compile KDTech com SITE_ORIGIN=https://kdtech.advogadosmca.com.br")
        paths = [path for path in files_under(dist, dist) if path.name != "_redirects"]
        filename = f"{name}.tar.gz"
        checksum = archive(output / filename, dist, paths)
        projects.append(dict(project=name, hostname=f"{name}.advogadosmca.com.br", commit=commit(root), archive=filename, sha256=checksum))

    root = args.atendimento.resolve()
    paths = list(files_under(root, root / "site1.com/public_html"))
    allowed_public = {"site1.com/public_html/" + name for name in ["index.php", "login.php", "logout.php", "auth.php", "create.php", "edit.php", "resolve.php", "assets/app.css"]}
    if {str(path.relative_to(root)) for path in paths} != allowed_public:
        raise ValueError("O diretório público do Atendimento contém arquivos inesperados ou está incompleto")
    required = [
        "site1.com/config/runtime.php", "site1.com/config/connection.php",
        "site1.com/database/schema.sql",
        "site1.com/database/migrations/001_usuario_solicitacao.sql",
        "scripts/provision-admin.php",
    ]
    paths.extend(root / name for name in required)
    relative_paths = [str(path.relative_to(root)) for path in paths]
    subprocess.run(["git", "-C", str(root), "ls-files", "--error-unmatch", "--", *relative_paths], check=True, stdout=subprocess.DEVNULL)
    if subprocess.run(["git", "-C", str(root), "diff", "--quiet", "HEAD", "--", *relative_paths]).returncode != 0:
        raise ValueError("Registre as alterações dos arquivos empacotados do Atendimento antes de gerar a release")
    checksum = archive(output / "atendimento.tar.gz", root, sorted(paths))
    projects.append(dict(project="atendimento", hostname="atendimento.advogadosmca.com.br", commit=commit(root), archive="atendimento.tar.gz", sha256=checksum))
    (output / "manifest.json").write_text(json.dumps(projects, ensure_ascii=False, indent=2) + "\n")
    for name in ["install.sh", "install-static.sh", "install-atendimento.sh", "verify-server.py", "README.md"]:
        shutil.copyfile(portfolio / "deploy" / name, output / name)
    files = sorted(path for path in output.iterdir() if path.is_file() and path.name != "SHA256SUMS")
    (output / "SHA256SUMS").write_text("".join(f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}\n" for path in files))
    print(f"Pacote preparado: {output}")
    for project in projects:
        print(f"{project['project']}: {project['commit']} — {project['archive']}")


if __name__ == "__main__":
    main()
