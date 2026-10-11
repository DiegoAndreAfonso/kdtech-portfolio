#!/usr/bin/env python3
"""Empacota uma build standalone validada sem planilhas ou diretórios de dados."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tarfile
from datetime import datetime, timezone

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('destination', type=Path)
args = parser.parse_args()
source = args.source.resolve(strict=True)
destination = args.destination.resolve()
commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
if subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain'], text=True).strip():
    raise SystemExit('Commitar e revisar as alterações antes de empacotar.')
standalone = source / '.next/standalone'
static = source / '.next/static'
if not (standalone / 'server.js').is_file() or not static.is_dir():
    raise SystemExit('Build standalone ausente.')
destination.mkdir(parents=True, exist_ok=False)
files = {}
for base, prefix in [(standalone, ''), (static, '.next/static')]:
    for path in sorted(base.rglob('*')):
        if path.is_file():
            relative = path.relative_to(base).as_posix()
            if prefix == '' and relative.startswith('.next/static/'):
                continue
            if not path.resolve().is_relative_to(source):
                raise SystemExit('Link para arquivo externo à aplicação.')
            name = f'{prefix}/{relative}' if prefix else relative
            parts = Path(name).parts
            if parts[0] == 'data' or any(part in {'.git', 'videos', '.env'} or part.startswith('.env.') for part in parts):
                raise SystemExit(f'Arquivo não permitido: {name}')
            if name in files:
                raise SystemExit(f'Arquivo duplicado: {name}')
            files[name] = path.read_bytes()
with tarfile.open(destination / 'pela-ordem.tar.gz', 'w:gz') as archive:
    for name, content in sorted(files.items()):
        info = tarfile.TarInfo(name)
        info.size = len(content)
        info.mode = 0o644
        info.mtime = 0
        archive.addfile(info, io.BytesIO(content))
manifest = {
    'project': 'pela-ordem',
    'mode': 'sem-persistencia',
    'repository': 'gabrielportodev/hackthon',
    'upstream_commit': '021d4f63bd2e4b6d78169c391643ba2d2b27b062',
    'commit': commit,
    'created_at': datetime.now(timezone.utc).isoformat(),
    'node_major': 22,
    'service_port': 3313,
    'proxy_port': 8113,
    'hostname': 'pelaordem.advogadosmca.com.br',
    'files': len(files)
}
(destination / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
for name in ['nginx.conf', 'pela-ordem.service', 'install.py']:
    shutil.copyfile(Path(__file__).parent / name, destination / name)
names = ['pela-ordem.tar.gz', 'manifest.json', 'nginx.conf', 'pela-ordem.service', 'install.py']
(destination / 'SHA256SUMS').write_text(''.join(f'{hashlib.sha256((destination / name).read_bytes()).hexdigest()}  {name}\n' for name in names))
print(f'Pacote: {destination}; {len(files)} arquivos, commit {commit}.')
