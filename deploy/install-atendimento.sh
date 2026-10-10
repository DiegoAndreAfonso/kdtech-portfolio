#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Instância independente. Nunca altera a aplicação ou o banco do site principal.
usage() {
  printf 'Uso: %s PASTA_DO_PACOTE [--admin-email EMAIL] [--validate-only]\n' "${0##*/}"
}
fail() { printf 'Erro: %s\n' "$*" >&2; exit 1; }
bundle=''
admin_email='admin@atendimento.advogadosmca.com.br'
validate_only=0
while (($#)); do
  case "$1" in
    --admin-email) (($# >= 2)) || fail 'Informe o identificador de administrador.'; admin_email=$2; shift 2 ;;
    --validate-only) validate_only=1; shift ;;
    --help|-h) usage; exit 0 ;;
    --*) fail 'Opção desconhecida.' ;;
    *) [[ -z "$bundle" ]] || fail 'Informe somente uma pasta de pacote.'; bundle=$1; shift ;;
  esac
done
[[ -n "$bundle" ]] || { usage >&2; exit 1; }
command -v python3 >/dev/null || fail 'Python 3 não está instalado.'
php_bin=$(command -v php8.4 || command -v php || true)
[[ -n "$php_bin" ]] || fail 'PHP CLI não está instalado.'
work=$(mktemp -d /tmp/atendimento-validacao.XXXXXXXX)
resources_changed=0
old_current=''
cleanup() { rm -rf -- "$work"; }
trap cleanup EXIT

# A extração é manual: nenhum link, arquivo especial ou caminho fora da lista é aceito.
python3 - "$bundle" "$work" "$admin_email" <<'PY'
import hashlib, json, os, re, shutil, stat, sys, tarfile
from pathlib import Path, PurePosixPath
def regular_bytes(path, limit):
    with os.fdopen(os.open(path, os.O_RDONLY | os.O_NOFOLLOW), "rb") as handle:
        metadata = os.fstat(handle.fileno())
        if not stat.S_ISREG(metadata.st_mode) or metadata.st_size > limit:
            raise ValueError("Arquivo ausente, inválido ou muito grande.")
        content = handle.read(limit + 1)
        if len(content) > limit:
            raise ValueError("Arquivo muito grande.")
        return content
try:
    bundle, work = Path(sys.argv[1]).resolve(strict=True), Path(sys.argv[2])
    email = sys.argv[3]
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email) or len(email) > 150:
        raise ValueError("Identificador de administrador inválido.")
    manifest = bundle / "manifest.json"
    parsed = json.loads(regular_bytes(manifest, 1024 * 1024))
    entries = parsed if isinstance(parsed, list) else parsed.get("projects")
    if not isinstance(entries, list):
        raise ValueError("O manifesto deve conter uma lista projects.")
    matches = [x for x in entries if isinstance(x, dict) and x.get("project") == "atendimento"]
    if len(matches) != 1:
        raise ValueError("O manifesto precisa de uma única entrada atendimento.")
    item = matches[0]
    if item.get("hostname") != "atendimento.advogadosmca.com.br" or item.get("archive") != "atendimento.tar.gz":
        raise ValueError("Hostname ou nome do arquivo de atendimento inesperado.")
    if not re.fullmatch(r"[0-9a-f]{7,64}", str(item.get("commit", ""))):
        raise ValueError("Identificação da revisão inválida.")
    if not re.fullmatch(r"[0-9a-f]{64}", str(item.get("sha256", ""))):
        raise ValueError("SHA-256 inválido.")
    source = bundle / "atendimento.tar.gz"
    checked = work / "artifact.tar.gz"
    checked.write_bytes(regular_bytes(source, 64 * 1024 * 1024))
    with checked.open("rb") as handle:
        digest = hashlib.file_digest(handle, "sha256").hexdigest()
    if digest != item["sha256"]:
        raise ValueError("O SHA-256 do arquivo não corresponde ao manifesto.")
    public = {"site1.com/public_html/" + name for name in
              ["index.php", "login.php", "logout.php", "auth.php", "create.php", "edit.php", "resolve.php", "assets/app.css"]}
    required = public | {"site1.com/config/runtime.php", "site1.com/config/connection.php",
                         "scripts/provision-admin.php", "site1.com/database/schema.sql"}
    allowed = required | {"site1.com/database/migrations/001_usuario_solicitacao.sql", "DEPLOYMENT.md"}
    directories = {"."}
    for name in allowed:
        directories.update(str(p) for p in PurePosixPath(name).parents)
    root = work / "artifact"
    root.mkdir()
    seen, files, size = set(), set(), 0
    with tarfile.open(checked, "r:gz") as archive:
        members = archive.getmembers()
        if len(members) > 100:
            raise ValueError("Arquivo com quantidade inesperada de entradas.")
        for member in members:
            raw = member.name
            path = PurePosixPath(raw)
            name = str(path)
            if path.is_absolute() or ".." in path.parts or "\\" in raw or any(ord(c) < 32 for c in raw) or name in seen or member.issparse():
                raise ValueError("Caminho inseguro ou duplicado no arquivo.")
            seen.add(name)
            if member.isdir():
                if name not in directories:
                    raise ValueError("Diretório não permitido no arquivo.")
                (root / name).mkdir(parents=True, exist_ok=True)
            elif member.isfile():
                if name not in allowed:
                    raise ValueError("Arquivo não permitido no pacote de produção.")
                if member.size < 0:
                    raise ValueError("Tamanho de arquivo inválido.")
                size += member.size
                if size > 64 * 1024 * 1024:
                    raise ValueError("Conteúdo descompactado muito grande.")
                destination = root / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                with archive.extractfile(member) as source_file, destination.open("xb") as output:
                    shutil.copyfileobj(source_file, output)
                files.add(name)
            else:
                raise ValueError("Links e arquivos especiais não são permitidos.")
    if not required.issubset(files):
        raise ValueError("O pacote não contém todos os arquivos de execução necessários.")
    for name in public:
        if name.endswith(".php"):
            text = (root / name).read_text()
            if re.search(r"\b(?:phpinfo|var_dump|print_r)\s*\(|ini_set\s*\(\s*['\"]display_errors", text, re.I):
                raise ValueError("O pacote contém diagnóstico público não permitido.")
    schema = (root / "site1.com/database/schema.sql").read_text()
    if "/*!" in schema or "\\" in schema or re.search(r"\bDELIMITER\b", schema, re.I):
        raise ValueError("O schema contém comandos de cliente ou comentários executáveis.")
    sql = re.sub(r"/\*.*?\*/|--[^\n]*", "", schema, flags=re.S)
    statements = [x.strip() for x in sql.split(";") if x.strip()]
    tables = []
    for statement in statements:
        match = re.match(r"^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(usuarios|solicitacoes)\s*\(", statement, re.I)
        if not match:
            raise ValueError("O schema deve conter somente criação incremental das duas tabelas.")
        safe_statement = re.sub(r"\bON\s+DELETE\s+SET\s+NULL\b", "", statement, flags=re.I)
        if re.search(r"\b(?:DROP|TRUNCATE|DELETE|INSERT|UPDATE|REPLACE|ALTER|GRANT|REVOKE|LOAD|OUTFILE|USE|RENAME|CALL|TRIGGER|PROCEDURE|FUNCTION|SELECT)\b", safe_statement, re.I):
            raise ValueError("O schema contém uma operação não permitida.")
        tables.append(match[1].lower())
    if sorted(tables) != ["solicitacoes", "usuarios"]:
        raise ValueError("O schema precisa criar usuarios e solicitacoes sem dados demonstrativos.")
    (work / "commit").write_text(item["commit"] + "\n")
    (work / "receipt.json").write_text(json.dumps(item))
except (OSError, ValueError, KeyError, TypeError, AttributeError, tarfile.TarError):
    print("Falha na validação do manifesto, do arquivo ou do schema. Nenhuma instalação realizada.", file=sys.stderr)
    sys.exit(1)
PY
while IFS= read -r -d '' file; do
  "$php_bin" -l "$file" >"$work/php-lint.log" 2>&1 || fail 'O pacote contém PHP com erro de sintaxe.'
done < <(find "$work/artifact" -type f -name '*.php' -print0)
printf 'Manifesto, SHA-256, extração, schema e sintaxe PHP validados.\n'
if ((validate_only)); then exit 0; fi

[[ $EUID -eq 0 ]] || fail 'A instalação deve ser executada como root.'
for executable in nginx php-fpm8.4 mysql systemctl curl getent useradd install flock realpath; do
  command -v "$executable" >/dev/null || fail "Dependência ausente: $executable."
done
"$php_bin" -r 'exit(PHP_MAJOR_VERSION === 8 && PHP_MINOR_VERSION === 4 && extension_loaded("pdo_mysql") && extension_loaded("session") ? 0 : 1);' \
  || fail 'É necessário PHP CLI 8.4 com PDO MySQL e sessões.'
[[ -r /etc/os-release ]] || fail 'Sistema operacional não identificado.'
python3 - <<'PY' || fail 'Instalador destinado ao Ubuntu 24.04.'
from pathlib import Path
values = dict(line.split("=", 1) for line in Path("/etc/os-release").read_text().splitlines() if "=" in line)
if values.get("ID", "").strip('"') != "ubuntu" or values.get("VERSION_ID", "").strip('"') != "24.04":
    raise SystemExit(1)
PY
systemctl is-active --quiet nginx && systemctl is-active --quiet php8.4-fpm \
  || fail 'Nginx e PHP-FPM 8.4 precisam estar ativos antes da instalação.'
nginx -t >"$work/nginx-before.log" 2>&1 || fail 'A configuração Nginx atual não é válida.'
php-fpm8.4 -t >"$work/fpm-before.log" 2>&1 || fail 'A configuração PHP-FPM atual não é válida.'
exec 9>/run/lock/atendimento-install.lock
flock -n 9 || fail 'Já existe uma instalação de atendimento em execução.'

base=/srv/atendimento
config=/etc/atendimento/config.json
marker=$base/install-state.json
pool=/etc/php/8.4/fpm/pool.d/atendimento.conf
vhost=/etc/nginx/sites-available/atendimento
enabled=/etc/nginx/sites-enabled/atendimento
credentials=/home/server/acesso-atendimento.json
read -r commit <"$work/commit"
release_id="$(date -u +%Y%m%dT%H%M%S%NZ)-${commit:0:12}"
release=$base/releases/$release_id
backup=/var/backups/atendimento/$release_id
mysql_socket=(mysql --protocol=socket --host=localhost --user=root --batch --skip-column-names)
printf 'SELECT 1;\n' | "${mysql_socket[@]}" >"$work/mysql-preflight.log" 2>&1 \
  || fail 'A autenticação root MySQL por socket não está disponível.'
inventory=$(printf "%s\n" "SELECT CONCAT((SELECT COUNT(*) FROM information_schema.SCHEMATA WHERE SCHEMA_NAME='atendimento_app'),' ',(SELECT COUNT(*) FROM mysql.user WHERE User='atendimento_app'),' ',(SELECT COUNT(*) FROM mysql.user WHERE User='atendimento_app' AND Host='localhost'));" \
  | "${mysql_socket[@]}" 2>"$work/mysql-inventory.log") || fail 'Não foi possível conferir conflitos no MySQL.'
read -r db_count user_count local_user_count <<<"$inventory"
[[ $db_count =~ ^[01]$ && $user_count =~ ^[0-9]+$ && $local_user_count =~ ^[01]$ ]] || fail 'Resposta inesperada do inventário MySQL.'

known=$(python3 - "$marker" "$config" "$pool" "$vhost" "$admin_email" <<'PY'
import hashlib, json, os, pwd, grp, re, sys
from pathlib import Path
try:
    marker, config, pool, vhost = map(Path, sys.argv[1:5])
    if not marker.exists() and not marker.is_symlink():
        if config.exists() or config.is_symlink() or pool.exists() or pool.is_symlink() or vhost.exists() or vhost.is_symlink():
            raise ValueError()
        print("new")
    else:
        if marker.is_symlink() or config.is_symlink() or not marker.is_file() or not config.is_file():
            raise ValueError()
        for p in [marker, config]:
            if p.stat().st_uid != 0 or p.stat().st_mode & 0o022:
                raise ValueError()
        state = json.loads(marker.read_text())
        data = json.loads(config.read_text())
        if state.get("installer") != "install-atendimento.sh" or state.get("version") != 1 or state.get("project") != "atendimento" or state.get("admin_email") != sys.argv[5] or state.get("state") not in {"configured", "ready"} or marker.stat().st_mode & 0o777 != 0o600:
            raise ValueError()
        if hashlib.sha256(config.read_bytes()).hexdigest() != state.get("config_sha256"):
            raise ValueError()
        if any(data.get(k) != v for k, v in {"DB_HOST":"localhost", "DB_NAME":"atendimento_app", "DB_USER":"atendimento_app", "SESSION_SECURE":True}.items()):
            raise ValueError()
        if not isinstance(data.get("DB_PASSWORD"), str) or not re.fullmatch(r"[0-9a-f]{64}aA1!", data["DB_PASSWORD"]):
            raise ValueError()
        account = pwd.getpwnam("atendimento")
        group = grp.getgrnam("atendimento")
        if not 100 <= account.pw_uid < 1000 or account.pw_gid != group.gr_gid or account.pw_dir != "/var/lib/atendimento" or account.pw_shell != "/usr/sbin/nologin" or config.stat().st_gid != group.gr_gid or config.stat().st_mode & 0o777 != 0o640:
            raise ValueError()
        for directory in ["/srv/atendimento", "/srv/atendimento/releases", "/etc/atendimento", "/var/lib/atendimento", "/var/log/atendimento", "/var/lib/atendimento/sessions"]:
            path = Path(directory)
            if path.exists() or path.is_symlink():
                owner = account.pw_uid if directory.endswith("/sessions") else 0
                if path.is_symlink() or not path.is_dir() or path.stat().st_uid != owner or path.stat().st_mode & 0o022:
                    raise ValueError()
        for name in ["access.log", "nginx-error.log", "php-error.log"]:
            path = Path("/var/log/atendimento") / name
            if path.is_symlink() or (path.exists() and not path.is_file()):
                raise ValueError()
        current = Path("/srv/atendimento/current")
        if current.exists() or current.is_symlink():
            if not current.is_symlink():
                raise ValueError()
            target = current.resolve(strict=True)
            if target.parent != Path("/srv/atendimento/releases") or not target.is_dir() or target.stat().st_uid != 0:
                raise ValueError()
            if state["state"] == "ready" and str(target) != state.get("release"):
                raise ValueError()
        for path, key in [(pool,"pool_sha256"),(vhost,"vhost_sha256")]:
            if path.exists() or path.is_symlink():
                if path.is_symlink() or not path.is_file() or path.stat().st_uid != 0:
                    raise ValueError()
                if not path.read_text().startswith("# Gerenciado por install-atendimento.sh; instancia atendimento.\n"):
                    raise ValueError()
                if state.get(key) and hashlib.sha256(path.read_bytes()).hexdigest() != state[key]:
                    raise ValueError()
        print("known")
except (OSError, ValueError, KeyError, TypeError):
    print("Configuração existente desconhecida, modificada ou incompatível. Instalação recusada.", file=sys.stderr)
    sys.exit(1)
PY
) || fail 'O estado persistente precisa de conferência manual.'
if [[ "$known" == new ]]; then
  [[ $db_count == 0 && $user_count == 0 ]] || fail 'O banco ou o usuário atendimento_app já existe sem marcador conhecido.'
  ! getent passwd atendimento >/dev/null && ! getent group atendimento >/dev/null \
    || fail 'A conta de sistema atendimento já existe sem marcador conhecido.'
  [[ ! -e "$credentials" && ! -L "$credentials" ]] || fail 'O arquivo de acesso já existe sem instalação conhecida.'
  for directory in "$base" /etc/atendimento /var/lib/atendimento /var/log/atendimento; do
    [[ ! -e "$directory" && ! -L "$directory" ]] || fail "Diretório existente sem instalação conhecida: $directory."
  done
fi
[[ "$known" != known || ( $user_count == "$local_user_count" && $user_count -le 1 ) ]] \
  || fail 'O usuário MySQL conhecido possui entradas inesperadas.'
[[ -d /home/server && ! -L /home/server ]] && getent passwd server >/dev/null \
  || fail 'O diretório de acesso /home/server não está disponível.'
python3 - "$credentials" <<'PY' || fail 'O diretório ou arquivo de acesso precisa de conferência manual.'
import pwd, sys
from pathlib import Path
account = pwd.getpwnam("server")
directory, credentials = Path("/home/server"), Path(sys.argv[1])
if directory.stat().st_uid != account.pw_uid:
    raise SystemExit(1)
if credentials.exists() or credentials.is_symlink():
    if credentials.is_symlink() or not credentials.is_file() or credentials.stat().st_uid != account.pw_uid or credentials.stat().st_mode & 0o777 != 0o600:
        raise SystemExit(1)
backups = Path("/var/backups/atendimento")
if backups.exists() or backups.is_symlink():
    if backups.is_symlink() or not backups.is_dir() or backups.stat().st_uid != 0 or backups.stat().st_mode & 0o077:
        raise SystemExit(1)
PY
[[ ! -e "$enabled" && ! -L "$enabled" ]] || {
  [[ "$known" == known && -L "$enabled" && $(readlink "$enabled") == "$vhost" ]] \
    || fail 'Existe outro vhost habilitado com o nome atendimento.'
}
if [[ -e "$base/current" || -L "$base/current" ]]; then
  [[ "$known" == known && -L "$base/current" ]] || fail 'O caminho current existente não é gerenciado.'
  old_current=$(readlink "$base/current")
  [[ "$old_current" == "$base/releases/"* && -d "$old_current" && $(realpath -- "$old_current") == "$old_current" ]] || fail 'O destino current não pertence às releases conhecidas.'
fi
if [[ "$known" == new ]]; then
  python3 - <<'PY' || fail 'A porta privada 8114 já está em uso.'
import socket
with socket.socket() as listener:
    listener.bind(("127.0.0.1", 8114))
PY
fi

install -d -m 0700 /var/backups/atendimento "$backup"
for file in "$pool" "$vhost" "$enabled" "$config" "$marker"; do
  if [[ -e "$file" || -L "$file" ]]; then cp -a -- "$file" "$backup/$(basename "$file").$(printf '%s' "$file" | sha256sum | cut -c1-8)"; fi
done
[[ -z "$old_current" ]] || printf '%s\n' "$old_current" >"$backup/current-target"
if [[ -f "$pool" ]]; then cp -a -- "$pool" "$work/old-pool"; fi
if [[ -f "$vhost" ]]; then cp -a -- "$vhost" "$work/old-vhost"; fi
if [[ -L "$enabled" ]]; then cp -a -- "$enabled" "$work/old-enabled"; fi
stage='preparação da conta e dos diretórios'

rollback() {
  local status=$?
  trap - ERR INT TERM
  set +e
  if ((resources_changed)); then
    if [[ -n "$old_current" ]]; then
      ln -s -- "$old_current" "$base/.current.rollback.$$"
      mv -Tf -- "$base/.current.rollback.$$" "$base/current"
    else
      rm -f -- "$base/current"
    fi
    if [[ -f "$work/old-pool" ]]; then cp -a -- "$work/old-pool" "$pool"; else rm -f -- "$pool"; fi
    if [[ -f "$work/old-vhost" ]]; then cp -a -- "$work/old-vhost" "$vhost"; else rm -f -- "$vhost"; fi
    rm -f -- "$enabled"
    [[ ! -L "$work/old-enabled" ]] || cp -a -- "$work/old-enabled" "$enabled"
    php-fpm8.4 -t >"$work/fpm-rollback.log" 2>&1 && systemctl reload php8.4-fpm
    nginx -t >"$work/nginx-rollback.log" 2>&1 && systemctl reload nginx
  fi
  install -o root -g root -d -m 0700 "$backup/diagnostics"
  for name in php-lint nginx-before fpm-before nginx-after fpm-after nginx-rollback fpm-rollback admin-provision health; do
    [[ ! -f "$work/$name.log" ]] || install -o root -g root -m 0600 "$work/$name.log" "$backup/diagnostics/$name.log"
  done
  printf 'Instalação interrompida na etapa: %s.\n' "$stage" >&2
  printf 'Configuração, marcador e dados persistentes foram preservados.\n' >&2
  printf 'Diagnósticos sem credenciais disponíveis para root em %s/diagnostics.\n' "$backup" >&2
  printf 'Arquivos anteriores disponíveis em %s.\n' "$backup" >&2
  ((status != 0)) || status=1
  exit "$status"
}
trap rollback ERR INT TERM

if [[ "$known" == new ]]; then
  useradd --system --user-group --home-dir /var/lib/atendimento --no-create-home --shell /usr/sbin/nologin atendimento
fi
install -d -o root -g root -m 0755 "$base" "$base/releases"
install -d -o root -g atendimento -m 0750 /etc/atendimento /var/lib/atendimento /var/log/atendimento
install -d -o atendimento -g atendimento -m 0700 /var/lib/atendimento/sessions
stage='configuração privada da instância'
if [[ "$known" == new ]]; then
  python3 - "$config" "$marker" "$admin_email" <<'PY'
import grp, hashlib, json, os, secrets, sys
from pathlib import Path
config, marker = map(Path, sys.argv[1:3])
data = {"DB_HOST":"localhost", "DB_NAME":"atendimento_app", "DB_USER":"atendimento_app",
        "DB_PASSWORD":secrets.token_hex(32) + "aA1!", "SESSION_SECURE":True}
with config.open("x") as handle:
    json.dump(data, handle, indent=2)
    handle.write("\n")
os.chown(config, 0, grp.getgrnam("atendimento").gr_gid)
os.chmod(config, 0o640)
state = {"installer":"install-atendimento.sh", "version":1, "project":"atendimento", "state":"configured",
         "admin_email":sys.argv[3], "config_sha256":hashlib.sha256(config.read_bytes()).hexdigest()}
with marker.open("x") as handle:
    json.dump(state, handle, indent=2)
    handle.write("\n")
os.chmod(marker, 0o600)
PY
fi
python3 - "$config" "$work/mysql-setup.sql" <<'PY'
import json, re, sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text())
password = data["DB_PASSWORD"]
if not isinstance(password, str) or not re.fullmatch(r"[0-9a-f]{64}aA1!", password):
    print("Formato da credencial persistente não reconhecido.", file=sys.stderr)
    sys.exit(1)
sql = "CREATE DATABASE IF NOT EXISTS atendimento_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n"
sql += "CREATE USER IF NOT EXISTS 'atendimento_app'@'localhost' IDENTIFIED BY '" + password + "';\n"
sql += "GRANT SELECT, INSERT, UPDATE, DELETE ON atendimento_app.* TO 'atendimento_app'@'localhost';\n"
Path(sys.argv[2]).write_text(sql)
PY
stage='criação do banco e do usuário MySQL dedicados'
"${mysql_socket[@]}" <"$work/mysql-setup.sql" >"$work/mysql-setup.log" 2>&1
stage='aplicação do schema MySQL incremental'
"${mysql_socket[@]}" atendimento_app <"$work/artifact/site1.com/database/schema.sql" >"$work/mysql-schema.log" 2>&1
stage='publicação dos arquivos da release'
install -d -o root -g root -m 0755 "$release"
cp -a -- "$work/artifact/." "$release/"
chown -R root:root "$release"
find "$release" -type d -exec chmod 0755 {} +
find "$release" -type f -exec chmod 0644 {} +
stage='provisionamento do administrador'
env APP_ENV=production ATENDIMENTO_CONFIG_FILE="$config" "$php_bin" "$release/scripts/provision-admin.php" \
  --config "$config" --email "$admin_email" --output "$credentials" --owner=server \
  >"$work/admin-provision.log" 2>&1
for name in access.log nginx-error.log; do
  touch "/var/log/atendimento/$name"
  chown root:atendimento "/var/log/atendimento/$name"
  chmod 0640 "/var/log/atendimento/$name"
done
touch /var/log/atendimento/php-error.log
chown atendimento:atendimento /var/log/atendimento/php-error.log
chmod 0600 /var/log/atendimento/php-error.log

cat >"$work/new-pool" <<'POOL'
# Gerenciado por install-atendimento.sh; instancia atendimento.
[atendimento]
user = atendimento
group = atendimento
listen = /run/php/atendimento.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660
pm = ondemand
pm.max_children = 5
pm.process_idle_timeout = 10s
pm.max_requests = 500
clear_env = yes
env[APP_ENV] = production
env[ATENDIMENTO_CONFIG_FILE] = /etc/atendimento/config.json
security.limit_extensions = .php
php_admin_flag[display_errors] = off
php_admin_flag[display_startup_errors] = off
php_admin_flag[log_errors] = on
php_admin_flag[expose_php] = off
php_admin_value[error_log] = /var/log/atendimento/php-error.log
php_admin_value[session.save_path] = /var/lib/atendimento/sessions
php_admin_flag[session.cookie_secure] = on
php_admin_flag[session.cookie_httponly] = on
php_admin_flag[session.use_strict_mode] = on
php_admin_value[session.cookie_samesite] = Lax
POOL
cat >"$work/new-vhost" <<'NGINX'
# Gerenciado por install-atendimento.sh; instancia atendimento.
server {
    listen 127.0.0.1:8114;
    server_name atendimento.advogadosmca.com.br;
    root /srv/atendimento/current/site1.com/public_html;
    index login.php;
    server_tokens off;
    access_log /var/log/atendimento/access.log;
    error_log /var/log/atendimento/nginx-error.log warn;

    location / { try_files $uri $uri/ =404; }
    location ~ ^/(index|login|logout|auth|create|edit|resolve)\.php$ {
        try_files $uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        fastcgi_param HTTPS on;
        fastcgi_param HTTP_PROXY "";
        fastcgi_pass unix:/run/php/atendimento.sock;
    }
    location ~ \.php(?:/|$) { return 404; }
    location ~ /\. { deny all; }
}
NGINX
resources_changed=1
stage='configuração do PHP-FPM e do Nginx'
install -o root -g root -m 0644 "$work/new-pool" "$pool"
install -o root -g root -m 0644 "$work/new-vhost" "$vhost"
[[ -L "$enabled" ]] || ln -s -- "$vhost" "$enabled"
ln -s -- "$release" "$base/.current.new.$$"
mv -Tf -- "$base/.current.new.$$" "$base/current"
stage='validação do PHP-FPM'
php-fpm8.4 -t >"$work/fpm-after.log" 2>&1
stage='validação do Nginx'
nginx -t >"$work/nginx-after.log" 2>&1
stage='recarga do PHP-FPM'
systemctl reload php8.4-fpm
stage='recarga do Nginx'
systemctl reload nginx
stage='verificação HTTP do login'
healthy=0
for attempt in 1 2 3 4 5; do
  status=$(curl --silent --show-error --connect-timeout 3 --max-time 10 --output "$work/login.html" \
    --write-out '%{http_code}' --header 'Host: atendimento.advogadosmca.com.br' \
    http://127.0.0.1:8114/login.php 2>"$work/health.log") || status=000
  if [[ "$status" == 200 ]]; then healthy=1; break; fi
  sleep 1
done
((healthy == 1)) || { printf 'O serviço não confirmou HTTP 200 em login.php.\n' >&2; false; }
stage='registro final da instalação'
python3 - "$marker" "$pool" "$vhost" "$release" "$commit" <<'PY'
import hashlib, json, os, sys
from pathlib import Path
marker, pool, vhost = map(Path, sys.argv[1:4])
state = json.loads(marker.read_text())
state.update({"state":"ready", "release":sys.argv[4], "commit":sys.argv[5],
              "pool_sha256":hashlib.sha256(pool.read_bytes()).hexdigest(),
              "vhost_sha256":hashlib.sha256(vhost.read_bytes()).hexdigest()})
temporary = marker.with_name(".install-state.new")
with temporary.open("x") as handle:
    json.dump(state, handle, indent=2)
    handle.write("\n")
os.chmod(temporary, 0o600)
temporary.replace(marker)
PY
trap - ERR INT TERM
printf 'Atendimento instalado e validado em http://127.0.0.1:8114/login.php.\n'
printf 'Acesso inicial, quando criado, está em %s com permissão privada.\n' "$credentials"
printf 'Banco, sessões e chave de configuração pertencem somente a esta instância.\n'
printf 'A publicação do hostname no Tunnel deve ser feita separadamente.\n'
