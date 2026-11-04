<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Autoloader
{
    public static function register(): void
    {
        spl_autoload_register([__CLASS__, 'load']);
    }

    public static function load(string $class): void
    {
        if (strpos($class, 'JT_') !== 0) {
            return;
        }

        $map = [
            'JT_Sports_Plugin' => 'class-jt-sports-plugin.php',
            'JT_Admin_Settings' => 'admin/class-jt-admin-settings.php',
            'JT_Personalization' => 'personalization/class-jt-personalization.php',
            'JT_COD_Rules' => 'cod/class-jt-cod-rules.php',
            'JT_Stripe_Connector' => 'stripe/class-jt-stripe-connector.php',
            'JT_Courier_Manager' => 'shipping/class-jt-courier-manager.php',
            'JT_Courier_Interface' => 'shipping/class-jt-courier-interface.php',
            'JT_Aramex_Adapter' => 'shipping/class-jt-aramex-adapter.php',
            'JT_DHL_Adapter' => 'shipping/class-jt-dhl-adapter.php',
            'JT_Fulfilment' => 'shipping/class-jt-fulfilment.php',
            'JT_Tracking' => 'shipping/class-jt-tracking.php',
            'JT_REST_API' => 'api/class-jt-rest-api.php',
            'JT_Webhooks' => 'api/class-jt-webhooks.php',
            'JT_Cache_Invalidation' => 'api/class-jt-cache-invalidation.php',
            'JT_CORS' => 'api/class-jt-cors.php',
        ];

        if (!isset($map[$class])) {
            return;
        }

        $path = JT_SPORTS_PLUGIN_DIR . 'includes/' . $map[$class];
        if (file_exists($path)) {
            require_once $path;
        }
    }
}
