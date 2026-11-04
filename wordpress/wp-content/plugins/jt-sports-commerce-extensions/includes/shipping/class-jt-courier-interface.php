<?php

if (!defined('ABSPATH')) {
    exit;
}

interface JT_Courier_Interface
{
    public function get_id(): string;

    /** @return array{rate:float,currency:string,service:string}|WP_Error */
    public function get_rate(array $shipment): array|WP_Error;

    /** @return array{awb:string,label_url?:string,tracking_url?:string}|WP_Error */
    public function create_shipment(WC_Order $order, array $options = []): array|WP_Error;

    /** @return array{status:string,raw?:mixed,estimated_delivery?:string}|WP_Error */
    public function track(string $awb): array|WP_Error;
}
