#!/bin/bash
set -euo pipefail

# Invoked by the official WordPress docker-entrypoint after files/config are ready.
WP_PATH="${WORDPRESS_PATH:-/var/www/html}"
SRC_PLUGINS="/usr/src/wordpress/wp-content/plugins"
DEST_PLUGINS="${WP_PATH}/wp-content/plugins"

ensure_plugin_from_image() {
  local name="$1"
  local force="${2:-0}"
  if [ ! -d "${SRC_PLUGINS}/${name}" ]; then
    return 0
  fi
  mkdir -p "$DEST_PLUGINS"
  if [ "$force" = "1" ] || [ ! -d "${DEST_PLUGINS}/${name}" ]; then
    echo "[jt-sports] Syncing plugin ${name} onto volume..."
    rm -rf "${DEST_PLUGINS}/${name}"
    cp -a "${SRC_PLUGINS}/${name}" "${DEST_PLUGINS}/${name}"
  fi
}

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

  # Persistent wp-content volume can miss / pin wrong plugin builds — sync from image.
  # Force-refresh WooCommerce so an incompatible latest-stable left on the volume is replaced.
  ensure_plugin_from_image "woocommerce" 1
  ensure_plugin_from_image "jt-sports-commerce-extensions"
  mkdir -p "${WP_PATH}/jt-import"
  # Always refresh import scripts/assets from the image (volume may hold stale copies).
  if [ -d /usr/src/wordpress/jt-import ]; then
    cp -a /usr/src/wordpress/jt-import/. "${WP_PATH}/jt-import/"
  fi

  if [ -d "${DEST_PLUGINS}/woocommerce" ]; then
    wp plugin activate woocommerce --path="$WP_PATH" --allow-root \
      || echo "[jt-sports] WooCommerce activate failed"
  else
    echo "[jt-sports] WooCommerce missing — installing from wordpress.org..."
    wp plugin install woocommerce --activate --path="$WP_PATH" --allow-root \
      || echo "[jt-sports] WooCommerce install failed"
  fi

  wp plugin activate jt-sports-commerce-extensions --path="$WP_PATH" --allow-root \
    || echo "[jt-sports] JT plugin activate failed"

  # Pretty permalinks help the Store API resolve reliably.
  wp rewrite structure '/%postname%/' --path="$WP_PATH" --allow-root 2>/dev/null || true
  wp rewrite flush --path="$WP_PATH" --allow-root 2>/dev/null || true

  PRODUCT_COUNT="$(wp post list --post_type=product --format=count --path="$WP_PATH" --allow-root 2>/dev/null || echo 0)"
  if [ "${PRODUCT_COUNT}" = "0" ] && [ -f "${WP_PATH}/jt-import/import-catalog.php" ]; then
    echo "[jt-sports] Seeding catalog (${PRODUCT_COUNT} products)..."
    wp eval-file "${WP_PATH}/jt-import/import-catalog.php" --path="$WP_PATH" --allow-root \
      || echo "[jt-sports] Catalog import failed (non-fatal)"
  fi

  # Idempotent upsert for United Tigers jerseys (match + training).
  if [ -f "${WP_PATH}/jt-import/import-united-tigers.php" ]; then
    echo "[jt-sports] Upserting United Tigers jerseys..."
    wp eval-file "${WP_PATH}/jt-import/import-united-tigers.php" --path="$WP_PATH" --allow-root \
      || echo "[jt-sports] United Tigers import failed (non-fatal)"
  fi
fi

exec /usr/local/bin/apache2-foreground.orig
