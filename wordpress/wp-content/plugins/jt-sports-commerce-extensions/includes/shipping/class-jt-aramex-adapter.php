<?php

if (!defined('ABSPATH')) {
    exit;
}

class JT_Aramex_Adapter implements JT_Courier_Interface
{
    public function get_id(): string
    {
        return 'aramex';
    }

    private function creds(): array
    {
        return [
            'UserName' => get_option('jt_sports_aramex_username', getenv('ARAMEX_USERNAME') ?: ''),
            'Password' => get_option('jt_sports_aramex_password', getenv('ARAMEX_PASSWORD') ?: ''),
            'AccountNumber' => get_option('jt_sports_aramex_account_number', getenv('ARAMEX_ACCOUNT_NUMBER') ?: ''),
            'AccountPin' => get_option('jt_sports_aramex_account_pin', getenv('ARAMEX_ACCOUNT_PIN') ?: ''),
            'AccountEntity' => getenv('ARAMEX_ACCOUNT_ENTITY') ?: 'DXB',
            'AccountCountryCode' => getenv('ARAMEX_ACCOUNT_COUNTRY') ?: 'AE',
        ];
    }

    public function get_rate(array $shipment): array|WP_Error
    {
        $creds = $this->creds();
        if (!$creds['UserName'] || !$creds['AccountNumber']) {
            return new WP_Error('aramex_config', 'Aramex credentials missing');
        }

        // Live rate via Aramex Rate Calculator SOAP/REST when account is connected.
        // Without credentials we refuse to invent rates.
        $endpoint = 'https://ws.aramex.net/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate';
        $payload = [
            'ClientInfo' => array_merge($creds, [
                'Version' => 'v1.0',
                'Source' => 24,
            ]),
            'OriginAddress' => $shipment['origin'] ?? ['CountryCode' => 'AE', 'City' => 'Dubai'],
            'DestinationAddress' => $shipment['destination'] ?? [],
            'ShipmentDetails' => [
                'PaymentType' => 'P',
                'ProductGroup' => ($shipment['international'] ?? false) ? 'EXP' : 'DOM',
                'ProductType' => 'PDX',
                'ActualWeight' => ['Value' => $shipment['weight'] ?? 1, 'Unit' => 'KG'],
                'NumberOfPieces' => $shipment['pieces'] ?? 1,
            ],
        ];

        $response = wp_remote_post($endpoint, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => wp_json_encode($payload),
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        if (!empty($data['HasErrors'])) {
            return new WP_Error('aramex_rate', 'Aramex rate error', ['data' => $data]);
        }

        $amount = $data['TotalAmount']['Value'] ?? null;
        if ($amount === null) {
            return new WP_Error('aramex_rate', 'No rate returned');
        }

        return [
            'rate' => (float) $amount,
            'currency' => $data['TotalAmount']['CurrencyCode'] ?? 'AED',
            'service' => 'aramex_express',
        ];
    }

    public function create_shipment(WC_Order $order, array $options = []): array|WP_Error
    {
        $creds = $this->creds();
        if (!$creds['UserName'] || !$creds['AccountNumber']) {
            return new WP_Error('aramex_config', 'Aramex credentials missing');
        }

        $endpoint = 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments';
        $shipping = $order->get_address('shipping');
        $payload = [
            'ClientInfo' => array_merge($creds, ['Version' => 'v1.0', 'Source' => 24]),
            'Shipments' => [[
                'Reference1' => (string) $order->get_id(),
                'Shipper' => [
                    'AccountNumber' => $creds['AccountNumber'],
                    'PartyAddress' => [
                        'CountryCode' => 'AE',
                        'City' => 'Dubai',
                    ],
                    'Contact' => [
                        'PersonName' => 'JT Sports',
                        'CompanyName' => 'JT Sports',
                        'PhoneNumber1' => '000000000',
                        'EmailAddress' => get_option('admin_email'),
                    ],
                ],
                'Consignee' => [
                    'PartyAddress' => [
                        'Line1' => $shipping['address_1'],
                        'Line2' => $shipping['address_2'],
                        'City' => $shipping['city'],
                        'StateOrProvinceCode' => $shipping['state'],
                        'PostCode' => $shipping['postcode'],
                        'CountryCode' => $shipping['country'],
                    ],
                    'Contact' => [
                        'PersonName' => trim($shipping['first_name'] . ' ' . $shipping['last_name']),
                        'CompanyName' => $shipping['company'] ?: trim($shipping['first_name'] . ' ' . $shipping['last_name']),
                        'PhoneNumber1' => $order->get_billing_phone(),
                        'EmailAddress' => $order->get_billing_email(),
                    ],
                ],
                'Details' => [
                    'NumberOfPieces' => 1,
                    'ActualWeight' => ['Value' => $options['weight'] ?? 1, 'Unit' => 'KG'],
                    'ProductGroup' => $shipping['country'] === 'AE' ? 'DOM' : 'EXP',
                    'ProductType' => 'PDX',
                    'PaymentType' => 'P',
                    'DescriptionOfGoods' => 'Sports merchandise',
                    'GoodsOriginCountry' => 'AE',
                    'CustomsValueAmount' => [
                        'Value' => (float) $order->get_total(),
                        'CurrencyCode' => $order->get_currency(),
                    ],
                ],
            ]],
            'LabelInfo' => ['ReportID' => 9201, 'ReportType' => 'URL'],
        ];

        $response = wp_remote_post($endpoint, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => wp_json_encode($payload),
            'timeout' => 45,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        $awb = $data['Shipments'][0]['ID'] ?? $data['Shipments'][0]['ShipmentLabel']['LabelURL'] ?? null;
        $label = $data['Shipments'][0]['ShipmentLabel']['LabelURL'] ?? null;
        $shipment_id = $data['Shipments'][0]['ID'] ?? null;

        if (!$shipment_id) {
            return new WP_Error('aramex_create', 'Shipment creation failed', ['data' => $data]);
        }

        return [
            'awb' => (string) $shipment_id,
            'label_url' => $label ?: null,
            'tracking_url' => 'https://www.aramex.com/track/results?ShipmentNumber=' . urlencode((string) $shipment_id),
        ];
    }

    public function track(string $awb): array|WP_Error
    {
        $creds = $this->creds();
        $endpoint = 'https://ws.aramex.net/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments';
        $payload = [
            'ClientInfo' => array_merge($creds, ['Version' => 'v1.0', 'Source' => 24]),
            'Shipments' => [$awb],
            'GetLastTrackingUpdateOnly' => false,
        ];

        $response = wp_remote_post($endpoint, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => wp_json_encode($payload),
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        $update = $data['TrackingResults'][0]['Value'][0]['UpdateDescription']
            ?? $data['TrackingResults'][0]['Value'][0]['UpdateCode']
            ?? null;

        if ($update === null) {
            return new WP_Error('aramex_track', 'No tracking data', ['data' => $data]);
        }

        return [
            'status' => (string) $update,
            'raw' => $data,
        ];
    }
}
