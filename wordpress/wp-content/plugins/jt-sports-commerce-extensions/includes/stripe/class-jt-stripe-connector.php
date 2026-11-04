<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Headless Stripe connector used when the official Woo Stripe plugin
 * does not satisfy Store API checkout requirements.
 * Prefer official WooCommerce Stripe Gateway when compatible.
 */
class JT_Stripe_Connector
{
    public static function init(): void
    {
        add_action('rest_api_init', [__CLASS__, 'routes']);
    }

    private static function secret(): string
    {
        $opt = (string) get_option('jt_sports_stripe_secret_key', '');
        if ($opt) {
            return $opt;
        }
        return (string) (getenv('STRIPE_SECRET_KEY') ?: '');
    }

    private static function webhook_secret(): string
    {
        $opt = (string) get_option('jt_sports_stripe_webhook_secret', '');
        if ($opt) {
            return $opt;
        }
        return (string) (getenv('STRIPE_WEBHOOK_SECRET') ?: '');
    }

    public static function routes(): void
    {
        register_rest_route('jt-sports/v1', '/stripe/create-checkout-session', [
            'methods' => 'POST',
            'permission_callback' => [__CLASS__, 'verify_internal'],
            'callback' => [__CLASS__, 'create_checkout_session'],
        ]);

        register_rest_route('jt-sports/v1', '/stripe/webhook', [
            'methods' => 'POST',
            'permission_callback' => '__return_true',
            'callback' => [__CLASS__, 'handle_webhook'],
        ]);
    }

    public static function verify_internal(WP_REST_Request $request): bool
    {
        $secret = (string) get_option('jt_sports_internal_api_secret', getenv('JT_INTERNAL_API_SECRET') ?: '');
        $header = (string) $request->get_header('x_jt_internal_secret');
        return $secret !== '' && hash_equals($secret, $header);
    }

    public static function create_checkout_session(WP_REST_Request $request)
    {
        $order_id = absint($request->get_param('order_id'));
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', ['status' => 404]);
        }

        $secret = self::secret();
        if (!$secret) {
            return new WP_Error('config', 'Stripe secret missing', ['status' => 500]);
        }

        $success = esc_url_raw($request->get_param('success_url') ?: home_url('/'));
        $cancel = esc_url_raw($request->get_param('cancel_url') ?: home_url('/'));
        $amount = (int) round(((float) $order->get_total()) * 100);
        $idempotency = 'jt_order_' . $order_id . '_' . $order->get_order_key();

        $body = [
            'mode' => 'payment',
            'success_url' => $success . (str_contains($success, '?') ? '&' : '?') . 'session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => $cancel,
            'client_reference_id' => (string) $order_id,
            'metadata[order_id]' => (string) $order_id,
            'metadata[order_key]' => $order->get_order_key(),
            'line_items[0][price_data][currency]' => strtolower($order->get_currency() ?: 'aed'),
            'line_items[0][price_data][product_data][name]' => 'Order #' . $order->get_order_number(),
            'line_items[0][price_data][unit_amount]' => $amount,
            'line_items[0][quantity]' => 1,
            'payment_intent_data[metadata][order_id]' => (string) $order_id,
        ];

        $response = wp_remote_post('https://api.stripe.com/v1/checkout/sessions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $secret,
                'Idempotency-Key' => $idempotency,
            ],
            'body' => $body,
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (empty($data['id'])) {
            return new WP_Error('stripe', 'Failed to create session', ['status' => 502, 'data' => $data]);
        }

        $order->update_meta_data('_jt_stripe_checkout_session_id', $data['id']);
        $order->update_meta_data('_jt_stripe_payment_status', 'pending');
        $order->save();

        return [
            'id' => $data['id'],
            'url' => $data['url'] ?? null,
        ];
    }

    public static function handle_webhook(WP_REST_Request $request)
    {
        $payload = $request->get_body();
        $sig = (string) $request->get_header('stripe-signature');
        $secret = self::webhook_secret();

        if ($secret && $sig) {
            // Lightweight signature timestamp check; full HMAC verification
            if (!self::verify_signature($payload, $sig, $secret)) {
                return new WP_Error('invalid_signature', 'Invalid Stripe signature', ['status' => 400]);
            }
        }

        $event = json_decode($payload, true);
        if (!$event || empty($event['id']) || empty($event['type'])) {
            return new WP_Error('invalid', 'Invalid payload', ['status' => 400]);
        }

        $event_id = $event['id'];
        if (get_transient('jt_stripe_event_' . $event_id)) {
            return ['received' => true, 'duplicate' => true];
        }
        set_transient('jt_stripe_event_' . $event_id, 1, WEEK_IN_SECONDS);

        $type = $event['type'];
        $object = $event['data']['object'] ?? [];
        $order_id = absint($object['metadata']['order_id'] ?? ($object['client_reference_id'] ?? 0));

        if (!$order_id && !empty($object['id'])) {
            $orders = wc_get_orders([
                'limit' => 1,
                'meta_key' => '_jt_stripe_checkout_session_id',
                'meta_value' => $object['id'],
            ]);
            if ($orders) {
                $order_id = $orders[0]->get_id();
            }
        }

        $order = $order_id ? wc_get_order($order_id) : false;
        if (!$order) {
            return ['received' => true, 'order' => null];
        }

        switch ($type) {
            case 'checkout.session.completed':
            case 'payment_intent.succeeded':
                // Never trust redirect alone — webhook verifies payment
                if (!$order->is_paid()) {
                    $order->payment_complete($object['payment_intent'] ?? $object['id'] ?? '');
                    $order->update_meta_data('_jt_stripe_payment_status', 'succeeded');
                    $order->add_order_note('Stripe payment verified via webhook: ' . $type);
                    $order->save();
                }
                break;
            case 'payment_intent.payment_failed':
                $order->update_meta_data('_jt_stripe_payment_status', 'failed');
                $order->update_status('failed', 'Stripe payment failed.');
                break;
            case 'payment_intent.canceled':
                $order->update_meta_data('_jt_stripe_payment_status', 'canceled');
                $order->update_status('cancelled', 'Stripe payment canceled.');
                break;
            case 'charge.refunded':
                $order->update_meta_data('_jt_stripe_payment_status', 'refunded');
                $order->update_status('refunded', 'Stripe charge refunded.');
                break;
        }

        return ['received' => true];
    }

    private static function verify_signature(string $payload, string $header, string $secret): bool
    {
        $parts = [];
        foreach (explode(',', $header) as $item) {
            [$k, $v] = array_pad(explode('=', trim($item), 2), 2, null);
            if ($k && $v) {
                $parts[$k][] = $v;
            }
        }
        if (empty($parts['t'][0]) || empty($parts['v1'][0])) {
            return false;
        }
        $timestamp = $parts['t'][0];
        if (abs(time() - (int) $timestamp) > 300) {
            return false;
        }
        $signed = $timestamp . '.' . $payload;
        $expected = hash_hmac('sha256', $signed, $secret);
        foreach ($parts['v1'] as $sig) {
            if (hash_equals($expected, $sig)) {
                return true;
            }
        }
        return false;
    }
}
