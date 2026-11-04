<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_REST_API
{
    public static function init(): void
    {
        add_action('rest_api_init', [__CLASS__, 'routes']);
    }

    private static function internal(WP_REST_Request $request): bool
    {
        $secret = (string) get_option('jt_sports_internal_api_secret', getenv('JT_INTERNAL_API_SECRET') ?: '');
        $header = (string) $request->get_header('x_jt_internal_secret');
        return $secret !== '' && hash_equals($secret, $header);
    }

    public static function routes(): void
    {
        register_rest_route('jt-sports/v1', '/health', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => static fn () => [
                'ok' => true,
                'service' => 'jt-sports-commerce-extensions',
                'version' => JT_SPORTS_VERSION,
            ],
        ]);

        register_rest_route('jt-sports/v1', '/tracking', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => [__CLASS__, 'tracking_lookup'],
            'args' => [
                'order' => ['required' => true],
                'email' => ['required' => false],
            ],
        ]);

        register_rest_route('jt-sports/v1', '/tracking/sync', [
            'methods' => 'POST',
            'permission_callback' => [__CLASS__, 'internal_perm'],
            'callback' => [__CLASS__, 'tracking_sync'],
        ]);

        register_rest_route('jt-sports/v1', '/fulfilment/create', [
            'methods' => 'POST',
            'permission_callback' => [__CLASS__, 'internal_perm'],
            'callback' => [__CLASS__, 'fulfilment_create'],
        ]);

        register_rest_route('jt-sports/v1', '/webhooks/retry', [
            'methods' => 'POST',
            'permission_callback' => [__CLASS__, 'internal_perm'],
            'callback' => [__CLASS__, 'webhook_retry'],
        ]);

        register_rest_route('jt-sports/v1', '/personalization/validate', [
            'methods' => 'POST',
            'permission_callback' => '__return_true',
            'callback' => [__CLASS__, 'validate_personalization'],
        ]);

        register_rest_route('jt-sports/v1', '/product/(?P<id>\d+)/extensions', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => [__CLASS__, 'product_extensions'],
        ]);
    }

    public static function internal_perm(WP_REST_Request $request): bool
    {
        return self::internal($request);
    }

    public static function tracking_lookup(WP_REST_Request $request)
    {
        $order_number = sanitize_text_field((string) $request->get_param('order'));
        $email = sanitize_email((string) $request->get_param('email'));

        $orders = wc_get_orders([
            'limit' => 1,
            'order_number' => $order_number,
        ]);

        // Fallback search
        if (!$orders) {
            $orders = wc_get_orders([
                'limit' => 5,
                'search' => $order_number,
            ]);
        }

        $order = null;
        foreach ($orders as $candidate) {
            if ((string) $candidate->get_order_number() === $order_number || (string) $candidate->get_id() === $order_number) {
                $order = $candidate;
                break;
            }
        }

        if (!$order) {
            return new WP_Error('not_found', 'Order not found', ['status' => 404]);
        }

        if ($email && strcasecmp($email, $order->get_billing_email()) !== 0) {
            return new WP_Error('forbidden', 'Email does not match', ['status' => 403]);
        }

        return JT_Tracking::public_payload($order);
    }

    public static function tracking_sync(WP_REST_Request $request)
    {
        $order_id = absint($request->get_param('order_id'));
        $awb = sanitize_text_field((string) $request->get_param('awb'));
        $courier = sanitize_key((string) $request->get_param('courier'));
        return JT_Tracking::sync($order_id, $awb, $courier);
    }

    public static function fulfilment_create(WP_REST_Request $request)
    {
        $order_id = absint($request->get_param('order_id'));
        return JT_Fulfilment::create_for_order($order_id);
    }

    public static function webhook_retry()
    {
        $queue = get_option('jt_sports_failed_webhooks', []);
        if (!is_array($queue)) {
            $queue = [];
        }
        $retried = 0;
        $remaining = [];
        foreach ($queue as $item) {
            $ok = JT_Cache_Invalidation::send($item['payload'] ?? [], $item['url'] ?? '');
            if ($ok) {
                $retried++;
            } else {
                $remaining[] = $item;
            }
        }
        update_option('jt_sports_failed_webhooks', $remaining, false);
        return ['retried' => $retried, 'remaining' => count($remaining)];
    }

    public static function validate_personalization(WP_REST_Request $request)
    {
        $product_id = absint($request->get_param('product_id'));
        $data = (array) $request->get_param('personalization');
        try {
            $validated = JT_Personalization::validate($data, $product_id);
            return ['ok' => true, 'personalization' => $validated];
        } catch (Exception $e) {
            return new WP_Error('invalid', $e->getMessage(), ['status' => 422]);
        }
    }

    public static function product_extensions(WP_REST_Request $request)
    {
        $id = absint($request['id']);
        $product = wc_get_product($id);
        if (!$product) {
            return new WP_Error('not_found', 'Product not found', ['status' => 404]);
        }
        $parent_id = $product->get_parent_id() ?: $id;
        return [
            'personalizationEligible' => JT_Personalization::is_enabled((int) $parent_id),
            'personalizationFee' => number_format(JT_Personalization::fee_for((int) $parent_id), 2, '.', ''),
            'maxNameLength' => JT_Personalization::max_name_length((int) $parent_id),
        ];
    }
}
