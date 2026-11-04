<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_DHL_Adapter implements JT_Courier_Interface
{
    public function get_id(): string
    {
        return 'dhl';
    }

    private function auth_header(): string
    {
        $key = get_option('jt_sports_dhl_api_key', getenv('DHL_API_KEY') ?: '');
        $secret = get_option('jt_sports_dhl_api_secret', getenv('DHL_API_SECRET') ?: '');
        return 'Basic ' . base64_encode($key . ':' . $secret);
    }

    public function get_rate(array $shipment): array|WP_Error
    {
        $key = get_option('jt_sports_dhl_api_key', getenv('DHL_API_KEY') ?: '');
        if (!$key) {
            return new WP_Error('dhl_config', 'DHL credentials missing');
        }

        $account = get_option('jt_sports_dhl_account_number', getenv('DHL_ACCOUNT_NUMBER') ?: '');
        $url = add_query_arg([
            'accountNumber' => $account,
            'originCountryCode' => $shipment['origin']['CountryCode'] ?? 'AE',
            'originCityName' => $shipment['origin']['City'] ?? 'Dubai',
            'destinationCountryCode' => $shipment['destination']['CountryCode'] ?? '',
            'destinationCityName' => $shipment['destination']['City'] ?? '',
            'weight' => $shipment['weight'] ?? 1,
            'length' => $shipment['length'] ?? 10,
            'width' => $shipment['width'] ?? 10,
            'height' => $shipment['height'] ?? 10,
            'plannedShippingDate' => gmdate('Y-m-d'),
            'isCustomsDeclarable' => !empty($shipment['international']) ? 'true' : 'false',
            'unitOfMeasurement' => 'metric',
        ], 'https://express.api.dhl.com/mydhlapi/rates');

        $response = wp_remote_get($url, [
            'headers' => [
                'Authorization' => $this->auth_header(),
                'Accept' => 'application/json',
            ],
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        $product = $data['products'][0] ?? null;
        if (!$product) {
            return new WP_Error('dhl_rate', 'No DHL rate', ['data' => $data]);
        }

        $price = $product['totalPrice'][0]['price'] ?? null;
        return [
            'rate' => (float) $price,
            'currency' => $product['totalPrice'][0]['priceCurrency'] ?? 'AED',
            'service' => $product['productName'] ?? 'dhl_express',
        ];
    }

    public function create_shipment(WC_Order $order, array $options = []): array|WP_Error
    {
        $key = get_option('jt_sports_dhl_api_key', getenv('DHL_API_KEY') ?: '');
        if (!$key) {
            return new WP_Error('dhl_config', 'DHL credentials missing');
        }

        $shipping = $order->get_address('shipping');
        $arrangement = get_option('jt_sports_customs_arrangement', 'DAP');
        $payload = [
            'plannedShippingDateAndTime' => gmdate('Y-m-d\T15:00:00\G\M\T\P'),
            'pickup' => ['isRequested' => false],
            'productCode' => 'P',
            'accounts' => [[
                'typeCode' => 'shipper',
                'number' => get_option('jt_sports_dhl_account_number', ''),
            ]],
            'customerDetails' => [
                'shipperDetails' => [
                    'postalAddress' => [
                        'postalCode' => '00000',
                        'cityName' => 'Dubai',
                        'countryCode' => 'AE',
                        'addressLine1' => 'JT Sports Warehouse',
                    ],
                    'contactInformation' => [
                        'email' => get_option('admin_email'),
                        'phone' => '000000000',
                        'companyName' => 'JT Sports',
                        'fullName' => 'JT Sports',
                    ],
                ],
                'receiverDetails' => [
                    'postalAddress' => [
                        'postalCode' => $shipping['postcode'] ?: '00000',
                        'cityName' => $shipping['city'],
                        'countryCode' => $shipping['country'],
                        'addressLine1' => $shipping['address_1'],
                        'countyName' => $shipping['state'],
                    ],
                    'contactInformation' => [
                        'email' => $order->get_billing_email(),
                        'phone' => $order->get_billing_phone() ?: '000000000',
                        'companyName' => $shipping['company'] ?: 'Customer',
                        'fullName' => trim($shipping['first_name'] . ' ' . $shipping['last_name']),
                    ],
                ],
            ],
            'content' => [
                'packages' => [[
                    'weight' => $options['weight'] ?? 1,
                    'dimensions' => [
                        'length' => $options['length'] ?? 10,
                        'width' => $options['width'] ?? 10,
                        'height' => $options['height'] ?? 10,
                    ],
                ]],
                'isCustomsDeclarable' => $shipping['country'] !== 'AE',
                'description' => 'Sports merchandise',
                'incoterm' => $arrangement,
                'unitOfMeasurement' => 'metric',
                'declaredValue' => (float) $order->get_total(),
                'declaredValueCurrency' => $order->get_currency(),
            ],
        ];

        $response = wp_remote_post('https://express.api.dhl.com/mydhlapi/shipments', [
            'headers' => [
                'Authorization' => $this->auth_header(),
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'body' => wp_json_encode($payload),
            'timeout' => 45,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        $awb = $data['shipmentTrackingNumber'] ?? null;
        if (!$awb) {
            return new WP_Error('dhl_create', 'DHL shipment failed', ['data' => $data]);
        }

        return [
            'awb' => (string) $awb,
            'label_url' => $data['documents'][0]['url'] ?? null,
            'tracking_url' => 'https://www.dhl.com/ae-en/home/tracking.html?tracking-id=' . urlencode((string) $awb),
        ];
    }

    public function track(string $awb): array|WP_Error
    {
        $url = 'https://express.api.dhl.com/mydhlapi/shipments/' . rawurlencode($awb) . '/tracking';
        $response = wp_remote_get($url, [
            'headers' => [
                'Authorization' => $this->auth_header(),
                'Accept' => 'application/json',
            ],
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        $status = $data['shipments'][0]['status']['status']
            ?? $data['shipments'][0]['events'][0]['description']
            ?? null;

        if ($status === null) {
            return new WP_Error('dhl_track', 'No tracking data', ['data' => $data]);
        }

        return [
            'status' => (string) $status,
            'estimated_delivery' => $data['shipments'][0]['estimatedDeliveryDate'] ?? null,
            'raw' => $data,
        ];
    }
}
