<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Cash on Delivery is not offered on this store.
 * This guard removes the WooCommerce COD gateway from every checkout
 * (classic, blocks and Store API) even if it gets enabled in WooCommerce settings.
 */
class JT_COD_Rules
{
    public static function init(): void
    {
        add_filter('woocommerce_available_payment_gateways', [__CLASS__, 'remove_cod_gateway'], 99);
    }

    public static function remove_cod_gateway($gateways)
    {
        if (is_array($gateways) && isset($gateways['cod'])) {
            unset($gateways['cod']);
        }
        return $gateways;
    }
}
