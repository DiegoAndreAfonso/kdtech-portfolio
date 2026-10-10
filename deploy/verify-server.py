#!/usr/bin/env python3
"""Confere respostas locais e preservação da configuração do site da raiz."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import urllib.error
import urllib.request


def baseline():
    paths = [
        "/etc/nginx/sites-available/advocacia",
        "/etc/nginx/sites-available/advocacia-backend",
        "/etc/nginx/snippets/advocacia-routes.conf",
    ]
    result = {path: hashlib.sha256(Path(path).read_bytes()).hexdigest() for path in paths}
    result["application_commit"] = subprocess.check_output(
        ["git", "-c", "safe.directory=/var/www/advocacia-gestao", "-C", "/var/www/advocacia-gestao", "rev-parse", "HEAD"], text=True
    ).strip()
    return result


def check(name, port, path, hostname, expected):
    request = urllib.request.Request(
        f"http://127.0.0.1:{port}{path}",
        headers={"Host": hostname, "Accept": "text/html"},
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        body = response.read().decode("utf-8", errors="replace")
        if response.status != 200 or expected.casefold() not in body.casefold():
            raise RuntimeError(f"Resposta inesperada de {name}")
        print(f"{name}: HTTP {response.status} em 127.0.0.1:{port}{path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--save-baseline", type=Path)
    parser.add_argument("--baseline", type=Path)
    args = parser.parse_args()
    current = baseline()
    if args.save_baseline:
        if args.save_baseline.exists():
            saved = json.loads(args.save_baseline.read_text())
            if current != saved:
                raise RuntimeError("A configuração da raiz mudou desde a preparação anterior; revise antes de instalar")
        else:
            args.save_baseline.write_text(json.dumps(current, indent=2) + "\n")
            args.save_baseline.chmod(0o644)
        check("Site da raiz", 80, "/login", "advogadosmca.com.br", "<html")
        print("Configuração da raiz registrada para conferência.")
        return
    if args.baseline and current != json.loads(args.baseline.read_text()):
        raise RuntimeError("A configuração da raiz ou sua versão de código mudou")
    for values in [
        ("Site da raiz", 80, "/login", "advogadosmca.com.br", "<html"),
        ("Gestão Jurídica", 8080, "/login", "gestao.advogadosmca.com.br", "<html"),
        ("KDTech", 8111, "/", "kdtech.advogadosmca.com.br", "KDTech"),
        ("Lousa", 8112, "/", "lousa.advogadosmca.com.br", "Lousa"),
        ("Atendimento", 8114, "/login.php", "atendimento.advogadosmca.com.br", "Central Emergencial"),
    ]:
        check(*values)
    print("Configuração da raiz preservada.")


if __name__ == "__main__":
    main()
