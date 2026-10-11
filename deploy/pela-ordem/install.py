#!/usr/bin/env python3
"""Instala somente o Pela Ordem; preserva os demais sites e suas configurações."""
import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import pwd
import re
import shutil
import socket
import subprocess
import sys
import tarfile
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone


def command(*args):
    subprocess.run(args, check=True)


def verify(bundle):
    expected = {'pela-ordem.tar.gz', 'manifest.json', 'nginx.conf', 'pela-ordem.service', 'install.py'}
    checksums = {}
    for line in (bundle / 'SHA256SUMS').read_text().splitlines():
        digest, name = line.split('  ', 1)
        if name not in expected or not re.fullmatch(r'[a-f0-9]{64}', digest) or name in checksums:
            raise RuntimeError('Lista de checksums inválida.')
        checksums[name] = digest
    if set(checksums) != expected:
        raise RuntimeError('Pacote incompleto.')
    for name, digest in checksums.items():
        path = bundle / name
        if path.is_symlink() or not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
            raise RuntimeError(f'Checksum inválido: {name}')
    manifest = json.loads((bundle / 'manifest.json').read_text())
    if manifest['project'] != 'pela-ordem' or manifest['mode'] != 'sem-persistencia' or not re.fullmatch(r'[a-f0-9]{40}', manifest['commit']):
        raise RuntimeError('Manifesto incompatível.')
    with tarfile.open(bundle / 'pela-ordem.tar.gz') as archive:
        members = archive.getmembers()
        size = 0
        names = set()
        for member in members:
            path = PurePosixPath(member.name)
            if path.is_absolute() or '..' in path.parts or member.name in names or not member.isfile():
                raise RuntimeError('Arquivo inseguro no pacote.')
            if path.parts[0] == 'data' or any(part in {'.git', '.env', 'videos'} or part.startswith('.env.') for part in path.parts):
                raise RuntimeError('O pacote contém um arquivo não permitido.')
            names.add(member.name)
            size += member.size
        if size > 400 * 1024 * 1024 or not {'server.js', 'package.json'}.issubset(names):
            raise RuntimeError('Conteúdo da aplicação inválido.')
    print('Manifesto, arquivos e SHA-256 válidos; pacote sem dados de processos.')
    return manifest


def check_http(port, path, expected=200):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{port}{path}', timeout=10) as response:
            code = response.status
            content = response.read()
    except urllib.error.HTTPError as error:
        code = error.code
        content = error.read()
    if code != expected:
        raise RuntimeError(f'HTTP {code} na porta {port}{path}; esperado {expected}.')
    return content


def atomic_current(target):
    current = Path('/srv/pela-ordem/current')
    temporary = current.with_name('.current-new')
    temporary.unlink(missing_ok=True)
    temporary.symlink_to(target)
    os.replace(temporary, current)


def install(bundle, manifest):
    if os.geteuid() != 0:
        raise RuntimeError('Execute este instalador com sudo no servidor.')
    version = subprocess.check_output(['/usr/bin/node', '--version'], text=True).strip()
    if not re.fullmatch(r'v\d+\.\d+\.\d+', version) or int(version.split('.')[0][1:]) < 20:
        raise RuntimeError('Node.js 20 ou superior é necessário.')
    base = Path('/srv/pela-ordem')
    base.mkdir(mode=0o755, exist_ok=True)
    if base.is_symlink():
        raise RuntimeError('Diretório da aplicação inválido.')
    stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    backup = base / 'deployment-backups' / stamp
    release = base / 'releases' / f'{stamp}-{manifest["commit"][:12]}'
    backup.mkdir(parents=True, mode=0o700)
    release.mkdir(parents=True, mode=0o755)
    current = base / 'current'
    if current.exists() and not current.is_symlink():
        raise RuntimeError('O caminho current não é um link de versão.')
    previous = os.readlink(current) if current.is_symlink() else None
    files = [Path('/etc/nginx/sites-available/pela-ordem'), Path('/etc/systemd/system/pela-ordem.service')]
    enabled = Path('/etc/nginx/sites-enabled/pela-ordem')
    enabled_before = os.readlink(enabled) if enabled.is_symlink() else None
    if enabled.exists() and not enabled.is_symlink():
        raise RuntimeError('O vhost habilitado não é um link.')
    originals = {}
    for index, path in enumerate(files):
        if path.is_symlink():
            raise RuntimeError('Configuração inesperada em link simbólico.')
        originals[path] = path.read_bytes() if path.exists() else None
        if originals[path] is not None:
            (backup / f'config-{index}').write_bytes(originals[path])
    if previous is None:
        for port in [3313, 8113]:
            with socket.socket() as probe:
                try:
                    probe.bind(('127.0.0.1', port))
                except OSError as error:
                    raise RuntimeError(f'A porta {port} já está ocupada; nenhuma configuração foi alterada.') from error
    active_before = subprocess.run(['systemctl', 'is-active', '--quiet', 'pela-ordem']).returncode == 0
    enabled_service_before = subprocess.run(['systemctl', 'is-enabled', '--quiet', 'pela-ordem']).returncode == 0
    for port in [8111, 8112, 8114]:
        check_http(port, '/' if port != 8114 else '/login.php')
    check_http(80, '/login')
    check_http(8080, '/login')
    try:
        try:
            account = pwd.getpwnam('pelaordem')
        except KeyError:
            command('useradd', '--system', '--no-create-home', '--home-dir', '/nonexistent', '--shell', '/usr/sbin/nologin', 'pelaordem')
            account = pwd.getpwnam('pelaordem')
        if account.pw_shell not in {'/usr/sbin/nologin', '/sbin/nologin'}:
            raise RuntimeError('O usuário de serviço existente possui login interativo.')
        with tarfile.open(bundle / 'pela-ordem.tar.gz') as archive:
            for member in archive.getmembers():
                target = release / member.name
                target.parent.mkdir(parents=True, exist_ok=True)
                with archive.extractfile(member) as source, target.open('wb') as output:
                    shutil.copyfileobj(source, output)
                target.chmod(0o644)
        # A aplicação lê a release, mas não pode gravar planilhas ou processos nela.
        for directory in [release, *[p for p in release.rglob('*') if p.is_dir()]]:
            directory.chmod(0o755)
        atomic_current(release)
        shutil.copyfile(bundle / 'nginx.conf', files[0])
        shutil.copyfile(bundle / 'pela-ordem.service', files[1])
        for path in files:
            path.chmod(0o644)
        if not enabled.is_symlink():
            enabled.symlink_to(files[0])
        command('nginx', '-t')
        command('systemd-analyze', 'verify', str(files[1]))
        command('systemctl', 'daemon-reload')
        command('systemctl', 'restart', 'pela-ordem')
        for attempt in range(20):
            try:
                check_http(3313, '/eproc/processos')
                break
            except (RuntimeError, OSError):
                if attempt == 19:
                    raise
                time.sleep(1)
        command('systemctl', 'is-active', '--quiet', 'pela-ordem')
        command('systemctl', 'reload', 'nginx')
        content = check_http(8113, '/eproc/processos')
        if b'Pela Ordem' not in content:
            raise RuntimeError('A página publicada não corresponde à release.')
        check_http(8113, '/api/state', 404)
        check_http(8113, '/api/pauta', 405)
        for port in [8111, 8112, 8114]:
            check_http(port, '/' if port != 8114 else '/login.php')
        check_http(80, '/login')
        check_http(8080, '/login')
        command('systemctl', 'enable', 'pela-ordem')
        (release / 'deployment-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
        print(f'Pela Ordem instalado em http://127.0.0.1:8113, commit {manifest["commit"]}.')
        print('Sem login, sem arquivo de estado e sem gravação de planilhas ou processos.')
        print(f'Versões anteriores e configurações preservadas em {backup}.')
        print('A rota pública no Tunnel deve ser configurada separadamente.')
    except BaseException:
        print('Instalação interrompida; restaurando a configuração anterior.', file=sys.stderr)
        if previous is None:
            current.unlink(missing_ok=True)
        else:
            atomic_current(previous)
        for path, content in originals.items():
            if content is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(content)
        enabled.unlink(missing_ok=True)
        if enabled_before is not None:
            enabled.symlink_to(enabled_before)
        command('systemctl', 'daemon-reload')
        if active_before:
            command('systemctl', 'restart', 'pela-ordem')
        else:
            subprocess.run(['systemctl', 'stop', 'pela-ordem'], check=False)
        if not enabled_service_before:
            subprocess.run(['systemctl', 'disable', 'pela-ordem'], check=False)
        command('nginx', '-t')
        command('systemctl', 'reload', 'nginx')
        raise


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('bundle', type=Path)
    parser.add_argument('--validate-only', action='store_true')
    args = parser.parse_args()
    bundle = args.bundle.resolve(strict=True)
    manifest = verify(bundle)
    if not args.validate_only:
        with Path('/run/lock/pela-ordem-deploy.lock').open('w') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)
            install(bundle, manifest)


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f'Falha: {error}', file=sys.stderr)
        sys.exit(1)
