<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Webhooks
{
    public static function init(): void
    {
        add_action('woocommerce_update_product', [__CLASS__, 'product_changed'], 10, 1);
        add_action('woocommerce_new_product', [__CLASS__, 'product_changed'], 10, 1);
        add_action('before_delete_post', [__CLASS__, 'maybe_product_deleted']);
        add_action('woocommerce_product_set_stock', [__CLASS__, 'stock_changed']);
        add_action('woocommerce_variation_set_stock', [__CLASS__, 'stock_changed']);
        add_action('woocommerce_new_order', [__CLASS__, 'order_changed']);
        add_action('woocommerce_update_order', [__CLASS__, 'order_changed']);
        add_action('woocommerce_order_status_changed', [__CLASS__, 'order_status'], 10, 3);
    }

    public static function product_changed($product_id): void
    {
        JT_Cache_Invalidation::notify([
            'topic' => 'product.updated',
            'id' => (int) $product_id,
            'tags' => ['products', 'product-' . $product_id],
        ]);
    }

    public static function maybe_product_deleted($post_id): void
    {
        if (get_post_type($post_id) !== 'product') {
            return;
        }
        JT_Cache_Invalidation::notify([
            'topic' => 'product.deleted',
            'id' => (int) $post_id,
            'tags' => ['products', 'product-' . $post_id],
        ]);
    }

    public static function stock_changed($product): void
    {
        $id = is_object($product) ? $product->get_id() : (int) $product;
        JT_Cache_Invalidation::notify([
            'topic' => 'product.stock',
            'id' => $id,
            'tags' => ['products', 'product-' . $id],
        ]);
    }

    public static function order_changed($order_id): void
    {
        JT_Cache_Invalidation::notify([
            'topic' => 'order.updated',
            'id' => (int) $order_id,
            'tags' => [],
        ]);
    }

    public static function order_status($order_id, $from, $to): void
    {
        JT_Cache_Invalidation::notify([
            'topic' => 'order.status',
            'id' => (int) $order_id,
            'from' => $from,
            'to' => $to,
            'tags' => [],
        ]);
    }
}
