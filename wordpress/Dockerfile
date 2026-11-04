FROM wordpress:6.7.2-php8.2-apache

# PHP production tuning
RUN { \
  echo 'memory_limit=256M'; \
  echo 'upload_max_filesize=64M'; \
  echo 'post_max_size=64M'; \
  echo 'max_execution_time=120'; \
  echo 'max_input_vars=3000'; \
} > /usr/local/etc/php/conf.d/jt-sports.ini

# HTTPS detection behind Railway / Cloudflare proxy
RUN { \
  echo '<?php'; \
  echo 'if (isset($_SERVER["HTTP_X_FORWARDED_PROTO"]) && $_SERVER["HTTP_X_FORWARDED_PROTO"] === "https") {'; \
  echo '  $_SERVER["HTTPS"] = "on";'; \
  echo '}'; \
  echo 'if (isset($_SERVER["HTTP_X_FORWARDED_HOST"])) {'; \
  echo '  $_SERVER["HTTP_HOST"] = $_SERVER["HTTP_X_FORWARDED_HOST"];'; \
  echo '}'; \
} > /usr/src/wordpress/jt-proxy-fix.php

# Copy custom plugin into image (also mounted via volume in production)
COPY wp-content/plugins/jt-sports-commerce-extensions /usr/src/wordpress/wp-content/plugins/jt-sports-commerce-extensions

COPY docker-entrypoint.d/99-jt-sports.sh /usr/local/bin/jt-sports-init.sh
RUN chmod +x /usr/local/bin/jt-sports-init.sh

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://127.0.0.1/wp-json/jt-sports/v1/health || exit 1

# Official image entrypoint; volume should mount at /var/www/html on Railway
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["apache2-foreground"]
