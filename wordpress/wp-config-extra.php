<?php
/**
 * Snippets intended for WORDPRESS_CONFIG_EXTRA / mounted config on Railway.
 * Do not load this file twice — it is documentation + copy-paste source.
 */

// HTTPS behind Railway / Cloudflare
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
    $_SERVER['HTTPS'] = 'on';
}

if (getenv('WP_HOME')) {
    define('WP_HOME', getenv('WP_HOME'));
}
if (getenv('WP_SITEURL')) {
    define('WP_SITEURL', getenv('WP_SITEURL'));
}

define('DISALLOW_FILE_EDIT', true);
