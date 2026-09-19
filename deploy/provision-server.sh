#!/usr/bin/env bash
# Подготовка Ubuntu 24.04 под сайт «Везу букет». Безопасно перезапускать.
set -euo pipefail

DOMAIN=vezubuket23.ru
WEBROOT=/srv/vezubuket
EMAIL=smm.emotion@gmail.com

echo "==> Swap 2 ГБ (2 ГБ памяти и одно ядро — запас нужен)"
if ! swapon --show | grep -q swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Пакеты"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx ufw rsync curl ca-certificates >/dev/null
echo "    система: $(. /etc/os-release && echo \"$PRETTY_NAME\")"

echo "==> Каталоги релизов"
mkdir -p "$WEBROOT/releases" /var/www/certbot
# Заглушка, чтобы nginx поднялся до первой выкладки.
if [ ! -e "$WEBROOT/current" ]; then
  mkdir -p "$WEBROOT/releases/bootstrap"
  echo '<!doctype html><meta charset=utf-8><h1>Сервер готов, жду выкладку</h1>' \
    > "$WEBROOT/releases/bootstrap/index.html"
  ln -sfn "$WEBROOT/releases/bootstrap" "$WEBROOT/current"
fi
chown -R www-data:www-data "$WEBROOT"

echo "==> nginx"
cat > /etc/nginx/sites-available/vezubuket <<'CONF'
server {
    listen 80;
    listen [::]:80;
    server_name vezubuket23.ru www.vezubuket23.ru;

    root /srv/vezubuket/current;
    index index.html;

    location /.well-known/acme-challenge/ { root /var/www/certbot; }

    # Хэшированные файлы сборки — кэшируем навсегда.
    location ^~ /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }

    # Шрифты лежат у нас и не меняются.
    location ^~ /fonts/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri =404;
    }

    location ~* \.(?:js|css|woff2?|png|jpe?g|gif|webp|avif|ico|svg|mp4)$ {
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
        try_files $uri =404;
    }

    # Пререндеренные страницы не кэшируем: мета в них меняется со сборкой.
    location = /index.html { add_header Cache-Control "no-cache, must-revalidate"; }
    location = /sitemap.xml { add_header Cache-Control "no-cache"; }

    # $uri/ находит пререндеренный /catalog/index.html; /index.html — запасной путь.
    location / {
        # $uri/index.html проверяем ДО $uri/: иначе nginx отвечает 301 и
        # добавляет слеш (/catalog -> /catalog/), а canonical в пререндере
        # указывает на адрес без слеша — поисковик видит противоречие.
        try_files $uri $uri/index.html $uri/ /index.html;

        # HTML кэшировать нельзя: он ссылается на файлы с хэшем в имени, и
        # старая копия после выкладки запросит уже удалённые файлы.
        add_header Cache-Control "no-cache, must-revalidate" always;

        # add_header внутри location отменяет заголовки, унаследованные от
        # server, поэтому security-заголовки приходится повторить здесь.
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml font/ttf font/otf image/svg+xml application/wasm;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size 20m;
}
CONF
rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/vezubuket /etc/nginx/sites-enabled/vezubuket
nginx -t && systemctl enable --now nginx && systemctl reload nginx

echo "==> Файрвол"
ufw allow OpenSSH >/dev/null
ufw allow 'Nginx Full' >/dev/null
ufw --force enable >/dev/null

if [ "${ISSUE_CERT:-false}" = "true" ]; then
  echo "==> Сертификат"
  # Через apt, а не snap: в Debian snap не ставится из коробки.
  apt-get install -y -qq certbot python3-certbot-nginx >/dev/null
  IP=$(curl -s -4 --max-time 15 ifconfig.me)
  NAMES=""
  for h in "$DOMAIN" "www.$DOMAIN"; do
    R=$(getent ahostsv4 "$h" | awk '{print $1}' | head -1 || true)
    if [ "$R" = "$IP" ]; then NAMES="$NAMES -d $h"; else echo "    $h -> ${R:-нет} — пропускаю"; fi
  done
  if [ -n "$NAMES" ]; then
    certbot --nginx $NAMES --non-interactive --agree-tos -m "$EMAIL" --redirect --expand
  else
    echo "    ни одно имя не указывает сюда, сертификат не выпускаю"
  fi
fi

echo "==> Готово"
