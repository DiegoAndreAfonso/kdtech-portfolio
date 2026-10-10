#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

validation_only=0
if [[ ${1:-} == --validate-only ]]; then
    validation_only=1
    shift
fi
[[ $# -le 1 ]] || { echo "Uso: bash install.sh [--validate-only] [PASTA_DO_PACOTE]" >&2; exit 2; }
bundle_dir=$(cd -- "${1:-$(dirname -- "${BASH_SOURCE[0]}")}" && pwd -P)
if [[ ${EUID} -ne 0 && $validation_only -eq 0 ]]; then
    echo "Execute no servidor com sudo bash $bundle_dir/install.sh" >&2
    exit 1
fi
cd -- "$bundle_dir"
sha256sum --check --strict SHA256SUMS
bash "$bundle_dir/install-static.sh" --validate-only "$bundle_dir"
bash "$bundle_dir/install-atendimento.sh" --validate-only "$bundle_dir"
if [[ $validation_only -eq 1 ]]; then
    echo "Pacote validado. Nenhum serviço ou banco foi alterado."
    exit 0
fi
python3 "$bundle_dir/verify-server.py" --save-baseline "$bundle_dir/root-baseline.json"

bash "$bundle_dir/install-static.sh" "$bundle_dir"
bash "$bundle_dir/install-atendimento.sh" "$bundle_dir"
python3 "$bundle_dir/verify-server.py" --baseline "$bundle_dir/root-baseline.json"
echo "Serviços locais verificados. As rotas públicas são configuradas no Tunnel existente."
