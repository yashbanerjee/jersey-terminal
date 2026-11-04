<?php

if (!defined('ABSPATH')) {
    exit;
}

final class JT_Sports_Plugin
{
    private static ?self $instance = null;

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function boot(): void
    {
        JT_CORS::init();
        JT_Admin_Settings::init();
        JT_Personalization::init();
        JT_COD_Rules::init();
        JT_Stripe_Connector::init();
        JT_Courier_Manager::init();
        JT_Fulfilment::init();
        JT_Tracking::init();
        JT_REST_API::init();
        JT_Webhooks::init();
        JT_Cache_Invalidation::init();

        add_filter('woocommerce_currency', static function ($currency) {
            $forced = get_option('jt_sports_currency', 'AED');
            return $forced ?: $currency;
        });
    }

    public static function activate(): void
    {
        add_option('jt_sports_currency', 'AED');
        add_option('jt_sports_personalization_fee', '25.00');
        add_option('jt_sports_personalization_default', 'yes');
        add_option('jt_sports_customs_arrangement', 'DAP');
        flush_rewrite_rules();
    }

    public static function deactivate(): void
    {
        flush_rewrite_rules();
    }
}
