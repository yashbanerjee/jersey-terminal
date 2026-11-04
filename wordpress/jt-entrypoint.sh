#!/bin/bash
set -euo pipefail

# Railway's php/apache runtime can enable multiple MPMs; mod_php needs prefork only.
a2dismod mpm_event 2>/dev/null || true
a2dismod mpm_worker 2>/dev/null || true
rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.* || true
a2enmod mpm_prefork 2>/dev/null || true

# Railway injects PORT (often 8080); stock WordPress Apache listens on 80.
PORT="${PORT:-80}"
sed -ri "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s#<VirtualHost \*:80>#<VirtualHost *:${PORT}>#" /etc/apache2/sites-available/000-default.conf
grep -q '^ServerName ' /etc/apache2/apache2.conf || echo 'ServerName 0.0.0.0' >> /etc/apache2/apache2.conf

exec docker-entrypoint.sh apache2-foreground
