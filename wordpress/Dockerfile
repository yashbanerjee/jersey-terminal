FROM wordpress:6.7.2-php8.2-apache

# PHP production tuning
RUN { \
  echo 'memory_limit=256M'; \
  echo 'upload_max_filesize=64M'; \
  echo 'post_max_size=64M'; \
  echo 'max_execution_time=300'; \
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

# WP-CLI for install / plugin activate / catalog seed on boot
RUN curl -fsSL -o /usr/local/bin/wp https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
  && chmod +x /usr/local/bin/wp

# Bundle WooCommerce into the image so Store API exists after first boot
RUN curl -fsSL -o /tmp/woocommerce.zip https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip \
  && unzip -q /tmp/woocommerce.zip -d /usr/src/wordpress/wp-content/plugins \
  && rm /tmp/woocommerce.zip

# Custom JT plugin + catalog import assets (build context = repo root)
COPY wordpress/wp-content/plugins/jt-sports-commerce-extensions \
  /usr/src/wordpress/wp-content/plugins/jt-sports-commerce-extensions
COPY scripts/import /usr/src/wordpress/jt-import

COPY wordpress/docker-entrypoint.d/99-jt-sports.sh /usr/local/bin/jt-sports-init.sh
COPY wordpress/jt-entrypoint.sh /usr/local/bin/jt-entrypoint.sh
COPY wordpress/jt-apache-foreground.sh /usr/local/bin/jt-apache-foreground.sh
RUN chmod +x /usr/local/bin/jt-sports-init.sh /usr/local/bin/jt-entrypoint.sh /usr/local/bin/jt-apache-foreground.sh \
  && mv /usr/local/bin/apache2-foreground /usr/local/bin/apache2-foreground.orig \
  && cp /usr/local/bin/jt-apache-foreground.sh /usr/local/bin/apache2-foreground \
  && chmod +x /usr/local/bin/apache2-foreground

ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=5 \
  CMD curl -fsSL "http://127.0.0.1:${PORT:-8080}/wp-json/" || exit 1

ENTRYPOINT ["/usr/local/bin/jt-entrypoint.sh"]
