<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Fulfilment
{
    public static function init(): void
    {
        add_action('woocommerce_order_status_processing', [__CLASS__, 'maybe_fulfil'], 20);
        add_action('woocommerce_payment_complete', [__CLASS__, 'maybe_fulfil'], 20);
    }

    public static function order_eligible(WC_Order $order): bool|WP_Error
    {
        if ($order->get_meta('_jt_awb')) {
            return new WP_Error('exists', 'Shipment already created', ['status' => 409]);
        }

        $status = $order->get_status();
        if (in_array($status, ['cancelled', 'failed', 'refunded'], true)) {
            return new WP_Error('status', 'Order not eligible', ['status' => 409]);
        }

        // All orders are prepaid online; never ship an unpaid order.
        if (!$order->is_paid() && $status !== 'processing') {
            return new WP_Error('unpaid', 'Order not paid', ['status' => 409]);
        }

        $shipping = $order->get_address('shipping');
        if (empty($shipping['address_1']) || empty($shipping['country'])) {
            return new WP_Error('address', 'Invalid shipping address', ['status' => 422]);
        }

        return true;
    }

    public static function create_for_order(int $order_id): array|WP_Error
    {
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', ['status' => 404]);
        }

        $eligible = self::order_eligible($order);
        if (is_wp_error($eligible)) {
            return $eligible;
        }

        $courier_id = JT_Courier_Manager::resolve_for_order($order);
        $courier = JT_Courier_Manager::get($courier_id);
        if (!$courier) {
            return new WP_Error('courier', 'Courier unavailable');
        }

        $weight = 0.5;
        foreach ($order->get_items() as $item) {
            $product = $item->get_product();
            if ($product) {
                $w = (float) $product->get_weight();
                $weight += ($w > 0 ? $w : 0.3) * $item->get_quantity();
            }
        }

        $result = $courier->create_shipment($order, ['weight' => $weight]);
        if (is_wp_error($result)) {
            $order->add_order_note('Fulfilment failed: ' . $result->get_error_message());
            return $result;
        }

        $order->update_meta_data('_jt_awb', $result['awb']);
        $order->update_meta_data('_jt_courier', $courier_id);
        $order->update_meta_data('_jt_tracking_url', $result['tracking_url'] ?? '');
        $order->update_meta_data('_jt_label_url', $result['label_url'] ?? '');
        $order->update_meta_data('_jt_shipment_status', 'created');
        $order->update_meta_data('_jt_customs_arrangement', get_option('jt_sports_customs_arrangement', 'DAP'));
        $order->add_order_note(sprintf('Shipment created via %s. AWB: %s', strtoupper($courier_id), $result['awb']));
        $order->save();

        do_action('jt_sports_shipment_created', $order_id, $result);

        // Notify customer with tracking
        if ($order->get_billing_email() && !empty($result['tracking_url'])) {
            wp_mail(
                $order->get_billing_email(),
                sprintf('Your JT Sports order #%s has shipped', $order->get_order_number()),
                sprintf("Your order is on the way.\nCourier: %s\nAWB: %s\nTrack: %s\n", strtoupper($courier_id), $result['awb'], $result['tracking_url'])
            );
        }

        return $result;
    }

    public static function maybe_fulfil(int $order_id): void
    {
        // Automatic attempt; worker also polls as backup
        self::create_for_order($order_id);
    }
}
