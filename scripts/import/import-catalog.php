<?php
/**
 * Import Jersey Terminal catalog into local WooCommerce.
 * Usage: wp eval-file /var/www/html/jt-import/import-catalog.php --allow-root
 */

if (!class_exists('WooCommerce')) {
    WP_CLI::error('WooCommerce is required.');
}

require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$base = '/var/www/html/jt-import';
$products = json_decode(file_get_contents($base . '/products.json'), true);
if (!$products) {
    WP_CLI::error('products.json missing or invalid');
}

function jt_money(array $prices): string
{
    $minor = (int) ($prices['currency_minor_unit'] ?? 2);
    $raw = (string) ($prices['price'] ?? '0');
    return number_format(((float) $raw) / (10 ** $minor), 2, '.', '');
}

function jt_ensure_category(string $name, string $slug): int
{
    $term = term_exists($slug, 'product_cat');
    if ($term) {
        return (int) (is_array($term) ? $term['term_id'] : $term);
    }
    $created = wp_insert_term($name, 'product_cat', ['slug' => $slug]);
    if (is_wp_error($created)) {
        WP_CLI::warning($created->get_error_message());
        return 0;
    }
    return (int) $created['term_id'];
}

function jt_ensure_attribute(string $name, string $slug): int
{
    $taxonomy = 'pa_' . $slug;
    $id = wc_attribute_taxonomy_id_by_name($slug);
    if ($id) {
        return (int) $id;
    }
    $id = wc_create_attribute([
        'name' => $name,
        'slug' => $slug,
        'type' => 'select',
        'order_by' => 'menu_order',
        'has_archives' => false,
    ]);
    if (is_wp_error($id)) {
        WP_CLI::warning($id->get_error_message());
        return 0;
    }
    register_taxonomy($taxonomy, ['product'], []);
    return (int) $id;
}

function jt_ensure_terms(string $taxonomy, array $names): array
{
    $ids = [];
    foreach ($names as $name) {
        $term = term_exists($name, $taxonomy);
        if (!$term) {
            $term = wp_insert_term($name, $taxonomy);
        }
        if (!is_wp_error($term)) {
            $ids[] = (int) (is_array($term) ? $term['term_id'] : $term);
        }
    }
    return $ids;
}

function jt_sideload_image(string $url, int $post_id): int
{
    if (!$url) {
        return 0;
    }
    $tmp = download_url($url);
    if (is_wp_error($tmp)) {
        WP_CLI::warning('image download failed: ' . $url . ' — ' . $tmp->get_error_message());
        return 0;
    }
    $file = [
        'name' => basename(parse_url($url, PHP_URL_PATH)),
        'tmp_name' => $tmp,
    ];
    $id = media_handle_sideload($file, $post_id);
    if (is_wp_error($id)) {
        @unlink($tmp);
        WP_CLI::warning('sideload failed: ' . $id->get_error_message());
        return 0;
    }
    return (int) $id;
}

function jt_find_by_slug(string $slug): int
{
    $posts = get_posts([
        'name' => $slug,
        'post_type' => 'product',
        'post_status' => 'any',
        'numberposts' => 1,
        'fields' => 'ids',
    ]);
    return $posts ? (int) $posts[0] : 0;
}

// Categories mirroring jerseyterminal.com navigation / homepage
$cat_jerseys = jt_ensure_category('Jerseys', 'jerseys');
$cat_featured = jt_ensure_category('Featured', 'featured');
$cat_new = jt_ensure_category('New Arrivals', 'new-arrivals');
$cat_custom = jt_ensure_category('Custom Jerseys', 'custom-jerseys');
$cat_collections = jt_ensure_category('Collections', 'collections');

$teams = [
    'Lions' => 'lions',
    'Wolves' => 'wolves',
    'Titans' => 'titans',
    'Phoenix' => 'phoenix',
    'Sharks' => 'sharks',
    'Rangers' => 'rangers',
    'United Tigers' => 'united-tigers',
    'UAE Bulls' => 'uae-bulls',
];
foreach ($teams as $label => $slug) {
    jt_ensure_category($label, $slug);
}

jt_ensure_attribute('Size', 'size');
jt_ensure_attribute('Color', 'color');
// Ensure taxonomies registered in this request
foreach (['pa_size', 'pa_color'] as $tax) {
    if (!taxonomy_exists($tax)) {
        register_taxonomy($tax, ['product'], []);
    }
}

$featured_slugs = ['shadow-strike-jersey', 'velocity-jersey', 'champions-edition'];
$new_slugs = ['red-horizon', 'titan-white', 'elite-gold'];

$imported = 0;

foreach ($products as $item) {
    $slug = $item['slug'];
    $name = $item['name'];
    $type = $item['type'];
    $price = jt_money($item['prices'] ?? []);
    $short = $item['short_description'] ?? '';
    $desc = $item['description'] ?? $short;

    $existing = jt_find_by_slug($slug);
    if ($existing) {
        WP_CLI::log("Updating existing product: $name");
        $product = wc_get_product($existing);
    } else {
        $product = $type === 'variable' ? new WC_Product_Variable() : new WC_Product_Simple();
    }

    $product->set_name($name);
    $product->set_slug($slug);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $product->set_description($desc);
    $product->set_short_description($short);
    $product->set_sku($item['sku'] ?: '');
    $product->set_manage_stock(false);
    $product->set_stock_status('instock');

    if ($type !== 'variable') {
        $product->set_regular_price($price);
        $product->set_price($price);
    }

    $cat_ids = array_filter([$cat_jerseys, $cat_collections]);
    if (in_array($slug, $featured_slugs, true)) {
        $cat_ids[] = $cat_featured;
        $product->set_featured(true);
    }
    if (in_array($slug, $new_slugs, true)) {
        $cat_ids[] = $cat_new;
    }
    $product->set_category_ids(array_values(array_unique(array_map('intval', $cat_ids))));

    // Attributes for variable
    if ($type === 'variable') {
        $attrs = [];
        foreach ($item['attributes'] ?? [] as $attr) {
            $slug_attr = str_replace('pa_', '', $attr['taxonomy'] ?? '');
            if (!$slug_attr) {
                continue;
            }
            $taxonomy = 'pa_' . $slug_attr;
            $names = array_map(static fn ($t) => $t['name'], $attr['terms'] ?? []);
            jt_ensure_terms($taxonomy, $names);
            $attribute = new WC_Product_Attribute();
            $attribute->set_id(wc_attribute_taxonomy_id_by_name($slug_attr));
            $attribute->set_name($taxonomy);
            $attribute->set_options($names);
            $attribute->set_visible(true);
            $attribute->set_variation(!empty($attr['has_variations']));
            $attrs[] = $attribute;
        }
        $product->set_attributes($attrs);
    }

    $product_id = $product->save();

    // Images
    $gallery = [];
    $images = $item['images'] ?? [];
    foreach ($images as $idx => $img) {
        $img_id = jt_sideload_image($img['src'] ?? '', $product_id);
        if (!$img_id) {
            continue;
        }
        if ($idx === 0) {
            $product->set_image_id($img_id);
        } else {
            $gallery[] = $img_id;
        }
    }
    if ($gallery) {
        $product->set_gallery_image_ids($gallery);
    }
    $product->save();

    // Variations
    if ($type === 'variable') {
        $var_file = $base . '/variations-' . $item['id'] . '.json';
        if (file_exists($var_file)) {
            $variations = json_decode(file_get_contents($var_file), true) ?: [];
            // Remove old variations on re-import
            foreach ($product->get_children() as $child_id) {
                wp_delete_post($child_id, true);
            }
            foreach ($variations as $v) {
                $variation = new WC_Product_Variation();
                $variation->set_parent_id($product_id);
                $variation->set_status('publish');
                $variation->set_regular_price(jt_money($v['prices'] ?? $item['prices']));
                $variation->set_price(jt_money($v['prices'] ?? $item['prices']));
                $variation->set_manage_stock(false);
                $variation->set_stock_status('instock');
                $variation->set_sku($v['sku'] ?? '');

                $mapped = [];
                foreach ($v['attributes'] ?? [] as $a) {
                    $tax = $a['taxonomy'] ?? '';
                    $opt = $a['option'] ?? ($a['value'] ?? '');
                    if (!$tax && !empty($a['name'])) {
                        $tax = 'pa_' . sanitize_title($a['name']);
                    }
                    if ($tax && $opt) {
                        $term = get_term_by('name', $opt, $tax);
                        $mapped[$tax] = $term ? $term->slug : sanitize_title($opt);
                    }
                }
                // Store API often leaves attributes empty but sets "Size: XXL, Color: Yellow"
                if (!$mapped && !empty($v['variation'])) {
                    foreach (explode(',', (string) $v['variation']) as $part) {
                        $part = trim($part);
                        if (!str_contains($part, ':')) {
                            continue;
                        }
                        [$label, $value] = array_map('trim', explode(':', $part, 2));
                        $tax = 'pa_' . sanitize_title($label);
                        $term = get_term_by('name', $value, $tax);
                        $mapped[$tax] = $term ? $term->slug : sanitize_title($value);
                    }
                }
                $variation->set_attributes($mapped);

                if (!empty($v['images'][0]['src'])) {
                    $vid = jt_sideload_image($v['images'][0]['src'], $product_id);
                    if ($vid) {
                        $variation->set_image_id($vid);
                    }
                }
                $variation->save();
            }
            WC_Product_Variable::sync($product_id);
        }
    }

    $imported++;
    WP_CLI::success("Imported $name (#$product_id)");
}

WP_CLI::success("Done. Imported/updated $imported products from jerseyterminal.com");
