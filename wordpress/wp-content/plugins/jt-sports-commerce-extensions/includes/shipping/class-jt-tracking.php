<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Tracking
{
    public static function init(): void
    {
        // Public tracking served via REST
    }

    public static function sync(int $order_id, string $awb, string $courier_id): array|WP_Error
    {
        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found');
        }

        $courier = JT_Courier_Manager::get($courier_id);
        if (!$courier) {
            return new WP_Error('courier', 'Unknown courier');
        }

        $result = $courier->track($awb);
        if (is_wp_error($result)) {
            return $result;
        }

        // Never fabricate — only store courier-reported status
        $order->update_meta_data('_jt_shipment_status', $result['status']);
        $order->update_meta_data('_jt_shipment_last_update', gmdate('c'));
        if (!empty($result['estimated_delivery'])) {
            $order->update_meta_data('_jt_estimated_delivery', $result['estimated_delivery']);
        }
        $order->save();

        return [
            'order_id' => $order_id,
            'status' => $result['status'],
            'estimated_delivery' => $result['estimated_delivery'] ?? null,
        ];
    }

    public static function public_payload(WC_Order $order): array
    {
        return [
            'orderNumber' => $order->get_order_number(),
            'courier' => $order->get_meta('_jt_courier') ?: null,
            'awb' => $order->get_meta('_jt_awb') ?: null,
            'status' => $order->get_meta('_jt_shipment_status') ?: null,
            'estimatedDelivery' => $order->get_meta('_jt_estimated_delivery') ?: null,
            'trackingUrl' => $order->get_meta('_jt_tracking_url') ?: null,
            'lastUpdate' => $order->get_meta('_jt_shipment_last_update') ?: null,
            'customsArrangement' => $order->get_meta('_jt_customs_arrangement') ?: get_option('jt_sports_customs_arrangement', 'DAP'),
        ];
    }
}
