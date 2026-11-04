#!/bin/sh
set -e

# Render provides dynamic PORT (defaults to 80 if not set)
PORT="${PORT:-80}"
echo "[Vels Agro Deployment] Binding Nginx to PORT: ${PORT}"

# Dynamically replace 'listen 80;' with 'listen ${PORT};'
sed -i "s/listen 80;/listen ${PORT};/g" /etc/nginx/conf.d/default.conf

# Start Nginx in foreground
exec nginx -g "daemon off;"
