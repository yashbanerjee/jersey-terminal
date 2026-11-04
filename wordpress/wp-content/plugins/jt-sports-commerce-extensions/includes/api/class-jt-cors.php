<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_CORS
{
    public static function init(): void
    {
        add_action('rest_api_init', static function () {
            remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
            add_filter('rest_pre_serve_request', [__CLASS__, 'headers']);
        }, 15);
    }

    public static function headers($value)
    {
        $origin = get_option('jt_sports_storefront_origin', getenv('JT_STOREFRONT_ORIGIN') ?: '');
        $request_origin = isset($_SERVER['HTTP_ORIGIN']) ? esc_url_raw(wp_unslash($_SERVER['HTTP_ORIGIN'])) : '';

        $allowed = array_filter([
            $origin,
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ]);

        if ($request_origin && in_array($request_origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $request_origin);
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Authorization, Content-Type, Nonce, Cart-Token, X-WC-Store-API-Nonce, X-JT-Internal-Secret');
            header('Vary: Origin');
        }

        return $value;
    }
}
