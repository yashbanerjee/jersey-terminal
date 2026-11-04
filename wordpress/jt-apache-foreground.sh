#!/bin/bash
set -euo pipefail

# Invoked by the official WordPress docker-entrypoint after files/config are ready.
WP_PATH="${WORDPRESS_PATH:-/var/www/html}"

if command -v wp >/dev/null 2>&1 && [ -f "${WP_PATH}/wp-config.php" ]; then
  if ! wp core is-installed --path="$WP_PATH" --allow-root 2>/dev/null; then
    echo "[jt-sports] Installing WordPress..."
    wp core install \
      --path="$WP_PATH" \
      --url="${WP_HOME:-${WORDPRESS_URL:-http://localhost}}" \
      --title="${WORDPRESS_TITLE:-Jersey Terminal}" \
      --admin_user="${WORDPRESS_ADMIN_USER:-admin}" \
      --admin_password="${WORDPRESS_ADMIN_PASSWORD:-ChangeMeNow!JT}" \
      --admin_email="${WORDPRESS_ADMIN_EMAIL:-admin@jerseyterminal.local}" \
      --skip-email \
      --allow-root || echo "[jt-sports] wp core install returned non-zero (may already be installing)"
  fi

  wp plugin activate woocommerce --path="$WP_PATH" --allow-root 2>/dev/null \
    || echo "[jt-sports] WooCommerce activate skipped"
  wp plugin activate jt-sports-commerce-extensions --path="$WP_PATH" --allow-root 2>/dev/null \
    || echo "[jt-sports] JT plugin activate skipped"

  # Pretty permalinks help the Store API resolve reliably.
  wp rewrite structure '/%postname%/' --path="$WP_PATH" --allow-root 2>/dev/null || true
  wp rewrite flush --path="$WP_PATH" --allow-root 2>/dev/null || true

  PRODUCT_COUNT="$(wp post list --post_type=product --format=count --path="$WP_PATH" --allow-root 2>/dev/null || echo 0)"
  if [ "${PRODUCT_COUNT}" = "0" ] && [ -f "${WP_PATH}/jt-import/import-catalog.php" ]; then
    echo "[jt-sports] Seeding catalog (${PRODUCT_COUNT} products)..."
    wp eval-file "${WP_PATH}/jt-import/import-catalog.php" --path="$WP_PATH" --allow-root \
      || echo "[jt-sports] Catalog import failed (non-fatal)"
  fi
fi

exec /usr/local/bin/apache2-foreground.orig
