<?php
/**
 * Plugin Name: JT Sports Commerce Extensions
 * Description: Jersey personalization, headless Stripe connector, Aramex/DHL fulfilment, tracking sync, and storefront cache invalidation for JT Sports. Cash on Delivery is disabled.
 * Version: 1.0.0
 * Author: JT Sports
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * WC requires at least: 8.0
 * Text Domain: jt-sports
 */

if (!defined('ABSPATH')) {
    exit;
}

define('JT_SPORTS_VERSION', '1.0.1');
define('JT_SPORTS_PLUGIN_FILE', __FILE__);
define('JT_SPORTS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('JT_SPORTS_PLUGIN_URL', plugin_dir_url(__FILE__));

require_once JT_SPORTS_PLUGIN_DIR . 'includes/class-jt-autoloader.php';
JT_Autoloader::register();

add_action('plugins_loaded', static function () {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', static function () {
            echo '<div class="notice notice-error"><p>JT Sports Commerce Extensions requires WooCommerce.</p></div>';
        });
        return;
    }

    JT_Sports_Plugin::instance()->boot();
});

register_activation_hook(__FILE__, ['JT_Sports_Plugin', 'activate']);
register_deactivation_hook(__FILE__, ['JT_Sports_Plugin', 'deactivate']);
