<?php
$product_id = 10;
$product = wc_get_product($product_id);
if (!$product) {
    WP_CLI::error('Product 10 missing');
}

foreach (['pa_size', 'pa_color'] as $tax) {
    if (!taxonomy_exists($tax)) {
        register_taxonomy($tax, ['product'], []);
    }
}

$size_terms = ['S', 'M', 'L', 'XL', 'XXL'];
$color_terms = ['Black', 'Red', 'White', 'Yellow'];
foreach ($size_terms as $n) {
    if (!term_exists($n, 'pa_size')) {
        wp_insert_term($n, 'pa_size');
    }
}
foreach ($color_terms as $n) {
    if (!term_exists($n, 'pa_color')) {
        wp_insert_term($n, 'pa_color');
    }
}

$attrs = [];
foreach ([
    ['size', $size_terms],
    ['color', $color_terms],
] as [$slug, $names]) {
    $attribute = new WC_Product_Attribute();
    $attribute->set_id(wc_attribute_taxonomy_id_by_name($slug));
    $attribute->set_name('pa_' . $slug);
    $attribute->set_options($names);
    $attribute->set_visible(true);
    $attribute->set_variation(true);
    $attrs[] = $attribute;
}
$product->set_attributes($attrs);
$product->set_regular_price('29.99');
$product->save();

foreach ($product->get_children() as $child_id) {
    wp_delete_post($child_id, true);
}

$count = 0;
foreach ($color_terms as $color) {
    foreach ($size_terms as $size) {
        $color_term = get_term_by('name', $color, 'pa_color');
        $size_term = get_term_by('name', $size, 'pa_size');
        $variation = new WC_Product_Variation();
        $variation->set_parent_id($product_id);
        $variation->set_status('publish');
        $variation->set_regular_price('29.99');
        $variation->set_price('29.99');
        $variation->set_manage_stock(false);
        $variation->set_stock_status('instock');
        $variation->set_attributes([
            'pa_size' => $size_term ? $size_term->slug : sanitize_title($size),
            'pa_color' => $color_term ? $color_term->slug : sanitize_title($color),
        ]);
        $vid = $variation->save();
        $count++;
        WP_CLI::log("variation #$vid Size:$size Color:$color");
    }
}

WC_Product_Variable::sync($product_id);
$synced = wc_get_product($product_id);
WP_CLI::success('Created ' . $count . ' variations; children=' . count($synced->get_children()) . ' price=' . $synced->get_price());
