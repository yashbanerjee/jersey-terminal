<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Admin_Settings
{
    public static function init(): void
    {
        add_action('admin_menu', [__CLASS__, 'menu']);
        add_action('admin_init', [__CLASS__, 'register']);
    }

    public static function menu(): void
    {
        add_submenu_page(
            'woocommerce',
            'JT Sports Settings',
            'JT Sports',
            'manage_woocommerce',
            'jt-sports-settings',
            [__CLASS__, 'render']
        );
    }

    public static function register(): void
    {
        $fields = [
            'jt_sports_storefront_origin',
            'jt_sports_revalidate_url',
            'jt_sports_revalidate_secret',
            'jt_sports_internal_api_secret',
            'jt_sports_stripe_publishable_key',
            'jt_sports_stripe_secret_key',
            'jt_sports_stripe_webhook_secret',
            'jt_sports_aramex_username',
            'jt_sports_aramex_password',
            'jt_sports_aramex_account_number',
            'jt_sports_aramex_account_pin',
            'jt_sports_dhl_api_key',
            'jt_sports_dhl_api_secret',
            'jt_sports_dhl_account_number',
            'jt_sports_personalization_fee',
            'jt_sports_personalization_default',
            'jt_sports_customs_arrangement',
            'jt_sports_currency',
            'jt_sports_whatsapp_number',
            'jt_sports_support_email',
            'jt_sports_support_phone',
            'jt_sports_support_city',
        ];

        foreach ($fields as $field) {
            register_setting('jt_sports_settings', $field);
        }
    }

    /** Public contact payload for the Next.js storefront. */
    public static function storefront_contact(): array
    {
        $whatsapp_raw = (string) get_option('jt_sports_whatsapp_number', '');
        $whatsapp = preg_replace('/\D+/', '', $whatsapp_raw) ?: '';

        return [
            'whatsappNumber' => $whatsapp,
            'whatsappEnabled' => strlen($whatsapp) >= 10,
            'email' => sanitize_email((string) get_option('jt_sports_support_email', '')),
            'phone' => sanitize_text_field((string) get_option('jt_sports_support_phone', '')),
            'city' => sanitize_text_field((string) get_option('jt_sports_support_city', '')),
            'brand' => 'Jersey Terminal',
        ];
    }

    public static function render(): void
    {
        if (!current_user_can('manage_woocommerce')) {
            return;
        }
        include JT_SPORTS_PLUGIN_DIR . 'includes/admin/views/settings-page.php';
    }
}
