<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Courier_Manager
{
    /** @var array<string,JT_Courier_Interface> */
    private static array $adapters = [];

    public static function init(): void
    {
        self::$adapters['aramex'] = new JT_Aramex_Adapter();
        self::$adapters['dhl'] = new JT_DHL_Adapter();
    }

    public static function get(string $id): ?JT_Courier_Interface
    {
        return self::$adapters[$id] ?? null;
    }

    public static function resolve_for_order(WC_Order $order): string
    {
        $country = $order->get_shipping_country();
        // UAE domestic → Aramex primary; international → DHL Express
        return $country === 'AE' ? 'aramex' : 'dhl';
    }

    public static function zone_for_country(string $country): int
    {
        $country = strtoupper($country);
        if ($country === 'AE') {
            return 1;
        }
        if (in_array($country, ['SA', 'KW', 'BH', 'OM', 'QA'], true)) {
            return 2;
        }
        if (in_array($country, ['GB', 'IE', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'PT', 'SE', 'NO', 'DK', 'FI', 'AT', 'CH'], true)) {
            return 3;
        }
        if (in_array($country, ['US', 'CA'], true)) {
            return 4;
        }
        if (in_array($country, ['IN', 'PK', 'SG', 'MY', 'AU', 'NZ', 'JP', 'KR', 'CN', 'HK', 'PH', 'TH', 'ID'], true)) {
            return 5;
        }
        return 6;
    }
}
