<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Jersey personalization (name on back + number).
 *
 * Captured on the storefront, carried as cart item data through the WooCommerce
 * Store API, saved as order line-item meta (visible in admin, emails and the
 * REST API) and summarised in an order note for the print team.
 */
class JT_Personalization
{
    public const META_PLAYER = '_jt_player_name';
    public const META_NUMBER = '_jt_jersey_number';
    public const META_TEXT   = '_jt_custom_text';
    public const META_FEE    = '_jt_personalization_fee';

    public static function init(): void
    {
        // Product admin
        add_action('woocommerce_product_options_general_product_data', [__CLASS__, 'product_fields']);
        add_action('woocommerce_process_product_meta', [__CLASS__, 'save_product_fields']);

        // Classic add-to-cart (form / query params)
        add_filter('woocommerce_add_cart_item_data', [__CLASS__, 'add_cart_item_data'], 10, 3);
        // Headless add-to-cart via Store API JSON body
        add_filter('woocommerce_store_api_add_to_cart_data', [__CLASS__, 'store_api_add_to_cart_data'], 10, 2);

        // Display + pricing
        add_filter('woocommerce_get_item_data', [__CLASS__, 'display_cart_item_data'], 10, 2);
        add_action('woocommerce_before_calculate_totals', [__CLASS__, 'apply_fee_to_cart'], 20);

        // Persist to order
        add_action('woocommerce_checkout_create_order_line_item', [__CLASS__, 'add_order_item_meta'], 10, 4);
        add_action('woocommerce_checkout_order_created', [__CLASS__, 'add_print_note']);
        add_action('woocommerce_store_api_checkout_order_processed', [__CLASS__, 'add_print_note']);

        // Admin order screen: pretty labels for the hidden meta keys
        add_filter('woocommerce_order_item_display_meta_key', [__CLASS__, 'display_meta_key'], 10, 2);
        add_filter('woocommerce_hidden_order_itemmeta', [__CLASS__, 'hidden_item_meta']);
    }

    /* ---------------------------------------------------------------------
     * Product settings
     * ------------------------------------------------------------------ */

    /**
     * Personalization is ON for every product unless explicitly disabled on
     * the product, so new jerseys always collect name + number.
     */
    public static function is_enabled(int $product_id): bool
    {
        $meta = get_post_meta($product_id, '_jt_personalization_enabled', true);
        if ($meta === 'no') {
            return false;
        }
        if ($meta === 'yes') {
            return true;
        }
        return get_option('jt_sports_personalization_default', 'yes') === 'yes';
    }

    public static function fee_for(int $product_id): float
    {
        $fee = get_post_meta($product_id, '_jt_personalization_fee', true);
        if ($fee === '' || $fee === false || $fee === null) {
            $fee = get_option('jt_sports_personalization_fee', '25.00');
        }
        return (float) $fee;
    }

    public static function max_name_length(int $product_id): int
    {
        return (int) (get_post_meta($product_id, '_jt_personalization_max_name', true) ?: 12);
    }

    public static function product_fields(): void
    {
        global $post;
        $current = get_post_meta($post->ID, '_jt_personalization_enabled', true);

        echo '<div class="options_group">';
        woocommerce_wp_select([
            'id' => '_jt_personalization_enabled',
            'label' => 'Jersey personalization',
            'description' => 'Collect player name and number for printing.',
            'desc_tip' => true,
            'value' => $current ?: 'default',
            'options' => [
                'default' => 'Store default (' . (get_option('jt_sports_personalization_default', 'yes') === 'yes' ? 'enabled' : 'disabled') . ')',
                'yes' => 'Enabled',
                'no' => 'Disabled',
            ],
        ]);
        woocommerce_wp_text_input([
            'id' => '_jt_personalization_fee',
            'label' => 'Personalization fee (AED)',
            'type' => 'number',
            'placeholder' => get_option('jt_sports_personalization_fee', '25.00'),
            'custom_attributes' => ['step' => '0.01', 'min' => '0'],
        ]);
        woocommerce_wp_text_input([
            'id' => '_jt_personalization_max_name',
            'label' => 'Max name length',
            'type' => 'number',
            'placeholder' => '12',
            'custom_attributes' => ['min' => '1', 'max' => '20'],
        ]);
        echo '</div>';
    }

    public static function save_product_fields(int $post_id): void
    {
        $enabled = isset($_POST['_jt_personalization_enabled']) ? sanitize_text_field(wp_unslash($_POST['_jt_personalization_enabled'])) : 'default';
        if ($enabled === 'default') {
            delete_post_meta($post_id, '_jt_personalization_enabled');
        } else {
            update_post_meta($post_id, '_jt_personalization_enabled', $enabled === 'yes' ? 'yes' : 'no');
        }

        if (isset($_POST['_jt_personalization_fee'])) {
            $fee = wp_unslash($_POST['_jt_personalization_fee']);
            if ($fee === '') {
                delete_post_meta($post_id, '_jt_personalization_fee');
            } else {
                update_post_meta($post_id, '_jt_personalization_fee', wc_format_decimal($fee));
            }
        }
        if (isset($_POST['_jt_personalization_max_name'])) {
            $max = absint($_POST['_jt_personalization_max_name']);
            if ($max > 0) {
                update_post_meta($post_id, '_jt_personalization_max_name', $max);
            } else {
                delete_post_meta($post_id, '_jt_personalization_max_name');
            }
        }
    }

    /* ---------------------------------------------------------------------
     * Validation
     * ------------------------------------------------------------------ */

    public static function validate(array $data, int $product_id): array
    {
        $max_name = self::max_name_length($product_id);
        $player = isset($data['player_name']) ? trim(sanitize_text_field((string) $data['player_name'])) : '';
        $number = isset($data['jersey_number']) ? trim(sanitize_text_field((string) $data['jersey_number'])) : '';
        $custom = isset($data['custom_text']) ? trim(sanitize_text_field((string) $data['custom_text'])) : '';

        if (mb_strlen($player) > $max_name) {
            throw new Exception(sprintf('Player name must be %d characters or fewer.', $max_name));
        }
        if ($number !== '' && !preg_match('/^\d{1,2}$/', $number)) {
            throw new Exception('Jersey number must be 1–2 digits.');
        }
        if (mb_strlen($custom) > 16) {
            throw new Exception('Custom text must be 16 characters or fewer.');
        }
        if ($player !== '' && !preg_match("/^[\p{L}\s.'\-]+$/u", $player)) {
            throw new Exception('Player name can only contain letters, spaces, hyphens and apostrophes.');
        }

        return [
            'player_name' => mb_strtoupper($player),
            'jersey_number' => $number,
            'custom_text' => $custom,
        ];
    }

    private static function is_empty(array $p): bool
    {
        return ($p['player_name'] ?? '') === '' && ($p['jersey_number'] ?? '') === '' && ($p['custom_text'] ?? '') === '';
    }

    /** Build the cart item data array for a validated personalization. */
    private static function build_cart_item_data(array $raw, int $product_id): array
    {
        $validated = self::validate($raw, $product_id);
        if (self::is_empty($validated)) {
            return [];
        }
        return [
            'jt_personalization' => $validated,
            'jt_personalization_fee' => self::fee_for($product_id),
            // Make each personalised jersey its own cart line
            'unique_key' => md5(wp_json_encode($validated)),
        ];
    }

    /* ---------------------------------------------------------------------
     * Add to cart
     * ------------------------------------------------------------------ */

    /** Classic / form-based add to cart. */
    public static function add_cart_item_data($cart_item_data, $product_id, $variation_id)
    {
        if (!self::is_enabled((int) $product_id) || isset($cart_item_data['jt_personalization'])) {
            return $cart_item_data;
        }

        $raw = [];
        if (isset($_REQUEST['jt_personalization']) && is_array($_REQUEST['jt_personalization'])) {
            $raw = wp_unslash($_REQUEST['jt_personalization']);
        } elseif (isset($_REQUEST['personalization']) && is_array($_REQUEST['personalization'])) {
            $raw = wp_unslash($_REQUEST['personalization']);
        }
        if (empty($raw)) {
            return $cart_item_data;
        }

        return array_merge($cart_item_data, self::build_cart_item_data($raw, (int) $product_id));
    }

    /** Store API: read `jt_personalization` from the JSON body of POST /wc/store/v1/cart/add-item. */
    public static function store_api_add_to_cart_data($add_to_cart_data, $request)
    {
        $raw = $request->get_param('jt_personalization');
        if (!is_array($raw) || empty($raw)) {
            return $add_to_cart_data;
        }

        $product = wc_get_product((int) $add_to_cart_data['id']);
        if (!$product) {
            return $add_to_cart_data;
        }
        $parent_id = $product->get_parent_id() ?: $product->get_id();
        if (!self::is_enabled((int) $parent_id)) {
            return $add_to_cart_data;
        }

        try {
            $data = self::build_cart_item_data($raw, (int) $parent_id);
        } catch (Exception $e) {
            if (class_exists('\Automattic\WooCommerce\StoreApi\Exceptions\RouteException')) {
                throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException(
                    'jt_personalization_invalid',
                    esc_html($e->getMessage()),
                    400
                );
            }
            throw $e;
        }

        if ($data) {
            $add_to_cart_data['cart_item_data'] = array_merge((array) ($add_to_cart_data['cart_item_data'] ?? []), $data);
        }
        return $add_to_cart_data;
    }

    /* ---------------------------------------------------------------------
     * Display & pricing
     * ------------------------------------------------------------------ */

    public static function display_cart_item_data($item_data, $cart_item)
    {
        if (empty($cart_item['jt_personalization'])) {
            return $item_data;
        }
        $p = $cart_item['jt_personalization'];
        if (!empty($p['player_name'])) {
            $item_data[] = ['key' => 'jt_player_name', 'name' => 'Name on back', 'value' => $p['player_name']];
        }
        if (!empty($p['jersey_number'])) {
            $item_data[] = ['key' => 'jt_jersey_number', 'name' => 'Number', 'value' => $p['jersey_number']];
        }
        if (!empty($p['custom_text'])) {
            $item_data[] = ['key' => 'jt_custom_text', 'name' => 'Custom text', 'value' => $p['custom_text']];
        }
        if (!empty($cart_item['jt_personalization_fee'])) {
            $item_data[] = ['key' => 'jt_personalization_fee', 'name' => 'Personalization', 'value' => wc_price($cart_item['jt_personalization_fee'])];
        }
        return $item_data;
    }

    public static function apply_fee_to_cart($cart): void
    {
        if (is_admin() && !defined('DOING_AJAX')) {
            return;
        }
        if (!$cart) {
            return;
        }
        foreach ($cart->get_cart() as $item) {
            if (empty($item['jt_personalization_fee']) || empty($item['data'])) {
                continue;
            }
            /** @var WC_Product $product */
            $product = $item['data'];
            // Always derive from the stored catalogue price so the fee never stacks
            // across repeated total calculations.
            $fresh = wc_get_product($product->get_id());
            $base = $fresh ? (float) $fresh->get_price('edit') : (float) $product->get_price('edit');
            $product->set_price($base + (float) $item['jt_personalization_fee']);
        }
    }

    /* ---------------------------------------------------------------------
     * Order persistence
     * ------------------------------------------------------------------ */

    public static function add_order_item_meta($item, $cart_item_key, $values, $order): void
    {
        if (empty($values['jt_personalization'])) {
            return;
        }
        $p = $values['jt_personalization'];
        $item->add_meta_data(self::META_PLAYER, $p['player_name'] ?? '', true);
        $item->add_meta_data(self::META_NUMBER, $p['jersey_number'] ?? '', true);
        $item->add_meta_data(self::META_TEXT, $p['custom_text'] ?? '', true);
        $item->add_meta_data(self::META_FEE, $values['jt_personalization_fee'] ?? 0, true);

        // Human-readable copies shown in admin, customer emails and the REST API
        if (!empty($p['player_name'])) {
            $item->add_meta_data('Name on back', $p['player_name'], true);
        }
        if (!empty($p['jersey_number'])) {
            $item->add_meta_data('Number', $p['jersey_number'], true);
        }
        if (!empty($p['custom_text'])) {
            $item->add_meta_data('Custom text', $p['custom_text'], true);
        }
    }

    /** One order note summarising everything that must be printed. */
    public static function add_print_note($order): void
    {
        $order = $order instanceof WC_Order ? $order : wc_get_order($order);
        if (!$order || $order->get_meta('_jt_print_note_added')) {
            return;
        }

        $lines = [];
        foreach ($order->get_items() as $item) {
            $name = $item->get_meta(self::META_PLAYER);
            $number = $item->get_meta(self::META_NUMBER);
            $text = $item->get_meta(self::META_TEXT);
            if ($name === '' && $number === '' && $text === '') {
                continue;
            }
            $spec = [];
            if ($name !== '') {
                $spec[] = 'Name: ' . $name;
            }
            if ($number !== '') {
                $spec[] = 'Number: ' . $number;
            }
            if ($text !== '') {
                $spec[] = 'Text: ' . $text;
            }
            $lines[] = sprintf('%d × %s — %s', $item->get_quantity(), $item->get_name(), implode(', ', $spec));
        }

        if (!$lines) {
            return;
        }

        $order->add_order_note("PRINT PERSONALIZATION\n" . implode("\n", $lines));
        $order->update_meta_data('_jt_has_personalization', 'yes');
        $order->update_meta_data('_jt_print_note_added', 'yes');
        $order->save();
    }

    /* ---------------------------------------------------------------------
     * Admin display helpers
     * ------------------------------------------------------------------ */

    public static function display_meta_key($display_key, $meta)
    {
        $map = [
            self::META_PLAYER => 'Name on back',
            self::META_NUMBER => 'Number',
            self::META_TEXT => 'Custom text',
            self::META_FEE => 'Personalization fee',
        ];
        return $map[$meta->key] ?? $display_key;
    }

    /** Hide raw underscore keys in admin — the readable copies are shown instead. */
    public static function hidden_item_meta($hidden)
    {
        return array_merge((array) $hidden, [self::META_PLAYER, self::META_NUMBER, self::META_TEXT, self::META_FEE]);
    }
}
