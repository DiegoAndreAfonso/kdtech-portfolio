#!/usr/bin/env bash
set -u

# Inventário somente leitura. Não lê credenciais, ambientes ou argumentos de processos.
printf 'Host: %s\n' "$(hostname)"
if [ -r /etc/os-release ]; then
  sed -n '/^PRETTY_NAME=/p' /etc/os-release
fi
printf '\nRecursos\n'
getconf _NPROCESSORS_ONLN 2>/dev/null || true
free -h 2>/dev/null || true
df -h / 2>/dev/null || true

printf '\nExecutáveis disponíveis\n'
for executable in cloudflared nginx caddy docker node npm php composer git ssh; do
  if command -v "$executable" >/dev/null 2>&1; then
    printf '%s: %s\n' "$executable" "$(command -v "$executable")"
  fi
done
node --version 2>/dev/null || true
php --version 2>/dev/null | head -n 1 || true
cloudflared --version 2>/dev/null || true

printf '\nServiços relevantes (sem argumentos ou variáveis)\n'
if command -v systemctl >/dev/null 2>&1; then
  systemctl list-units --type=service --all --no-pager --no-legend 2>/dev/null \
    | awk 'tolower($0) ~ /cloudflared|docker|nginx|caddy|php.*fpm|mysql|mariadb|ssh/ { print }'
fi

printf '\nPortas TCP locais\n'
if command -v ss >/dev/null 2>&1; then
  ss -lnt 2>/dev/null || true
fi

printf '\nContainers (sem ambientes ou comandos)\n'
if command -v docker >/dev/null 2>&1; then
  docker ps --format '{{.Names}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null || true
fi

printf '\nLocalização de configurações do Tunnel\n'
for candidate in /etc/cloudflared/config.yml /etc/cloudflared/config.yaml \
  "${HOME}/.cloudflared/config.yml" "${HOME}/.cloudflared/config.yaml"; do
  if [ -f "$candidate" ]; then
    printf '%s (conteúdo não lido)\n' "$candidate"
  fi
done
