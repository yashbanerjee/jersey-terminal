<?php
/**
 * Upsert United Tigers match + training jerseys into WooCommerce.
 * Usage: wp eval-file /var/www/html/jt-import/import-united-tigers.php --allow-root
 */

if (!class_exists('WooCommerce')) {
    WP_CLI::error('WooCommerce is required.');
}

require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$base = dirname(__FILE__);
$file = $base . '/united-tigers-products.json';
$items = json_decode((string) file_get_contents($file), true);
if (!$items || !is_array($items)) {
    WP_CLI::error('united-tigers-products.json missing or invalid');
}

function ut_ensure_category(string $name, string $slug): int
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

function ut_ensure_attribute(string $name, string $slug): int
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

function ut_ensure_terms(string $taxonomy, array $names): void
{
    foreach ($names as $name) {
        if (!term_exists($name, $taxonomy)) {
            wp_insert_term($name, $taxonomy);
        }
    }
}

function ut_resolve_image_src(string $src, string $base): string
{
    $src = trim($src);
    if ($src === '') {
        return '';
    }
    if (preg_match('#^https?://#i', $src)) {
        return $src;
    }
    $local = $base . '/' . ltrim(str_replace('\\', '/', $src), '/');
    return file_exists($local) ? $local : '';
}

function ut_sideload_image(string $src, int $post_id, string $base): int
{
    $resolved = ut_resolve_image_src($src, $base);
    if ($resolved === '') {
        WP_CLI::warning('image missing: ' . $src);
        return 0;
    }

    if (preg_match('#^https?://#i', $resolved)) {
        $tmp = download_url($resolved, 60);
        if (is_wp_error($tmp)) {
            WP_CLI::warning('image download failed: ' . $resolved . ' — ' . $tmp->get_error_message());
            return 0;
        }
        $name = basename(parse_url($resolved, PHP_URL_PATH) ?: 'image.jpg');
    } else {
        $tmp = wp_tempnam(basename($resolved));
        if (!$tmp || !@copy($resolved, $tmp)) {
            WP_CLI::warning('local image copy failed: ' . $resolved);
            return 0;
        }
        $name = basename($resolved);
    }

    $file = [
        'name' => $name,
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

function ut_find_by_slug(string $slug): int
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

function ut_attach_images(WC_Product $product, int $product_id, array $images, string $version, string $base): void
{
    $meta_key = '_jt_ut_images_version';
    $current = (string) get_post_meta($product_id, $meta_key, true);
    $has_image = (bool) $product->get_image_id();

    if ($has_image && $current !== '' && $current === $version) {
        WP_CLI::log("Images already at version {$version} for #{$product_id}");
        return;
    }

    $gallery = [];
    $featured = 0;
    foreach ($images as $idx => $src) {
        $img_id = ut_sideload_image((string) $src, $product_id, $base);
        if (!$img_id) {
            continue;
        }
        if ($idx === 0 || !$featured) {
            $featured = $img_id;
        } else {
            $gallery[] = $img_id;
        }
    }

    if ($featured) {
        $product->set_image_id($featured);
        $product->set_gallery_image_ids($gallery);
        $product->save();
        update_post_meta($product_id, $meta_key, $version);
        WP_CLI::log('Attached ' . (1 + count($gallery)) . " images (version {$version})");
    } else {
        WP_CLI::warning("No images attached for product #{$product_id}");
    }
}

ut_ensure_attribute('Size', 'size');
if (!taxonomy_exists('pa_size')) {
    register_taxonomy('pa_size', ['product'], []);
}

$cat_jerseys = ut_ensure_category('Jerseys', 'jerseys');
$cat_featured = ut_ensure_category('Featured', 'featured');
$cat_new = ut_ensure_category('New Arrivals', 'new-arrivals');
$cat_training = ut_ensure_category('Training', 'training-wear');
$cat_ut = ut_ensure_category('United Tigers', 'united-tigers');
$cat_collections = ut_ensure_category('Collections', 'collections');

$imported = 0;

foreach ($items as $item) {
    $slug = (string) $item['slug'];
    $name = (string) $item['name'];
    $price = number_format((float) $item['price'], 2, '.', '');
    $short = (string) ($item['short_description'] ?? $item['description'] ?? '');
    $desc = (string) ($item['description'] ?? $short);
    $sizes = $item['sizes'] ?? ['S', 'M', 'L', 'XL', 'XXL'];
    $images = $item['images'] ?? [];
    $images_version = (string) ($item['imagesVersion'] ?? 'default');
    $extra_cats = $item['categories'] ?? [];

    $existing = ut_find_by_slug($slug);
    if ($existing) {
        WP_CLI::log("Updating: $name");
        $product = wc_get_product($existing);
        if (!$product || $product->get_type() !== 'variable') {
            wp_delete_post($existing, true);
            $product = new WC_Product_Variable();
        }
    } else {
        WP_CLI::log("Creating: $name");
        $product = new WC_Product_Variable();
    }

    $product->set_name($name);
    $product->set_slug($slug);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $product->set_description($desc);
    $product->set_short_description($short);
    $product->set_sku((string) ($item['sku'] ?? ''));
    $product->set_manage_stock(false);
    $product->set_stock_status('instock');
    $product->set_featured(!empty($item['featured']));

    ut_ensure_terms('pa_size', $sizes);
    $attribute = new WC_Product_Attribute();
    $attribute->set_id(wc_attribute_taxonomy_id_by_name('size'));
    $attribute->set_name('pa_size');
    $attribute->set_options($sizes);
    $attribute->set_visible(true);
    $attribute->set_variation(true);
    $product->set_attributes([$attribute]);

    $cat_ids = array_filter([$cat_jerseys, $cat_collections, $cat_ut, $cat_featured, $cat_new]);
    if (in_array('training-wear', $extra_cats, true)) {
        $cat_ids[] = $cat_training;
    }
    $product->set_category_ids(array_values(array_unique(array_map('intval', $cat_ids))));

    $product_id = $product->save();
    ut_attach_images($product, $product_id, $images, $images_version, $base);

    foreach ($product->get_children() as $child_id) {
        wp_delete_post($child_id, true);
    }

    foreach ($sizes as $size) {
        $variation = new WC_Product_Variation();
        $variation->set_parent_id($product_id);
        $variation->set_status('publish');
        $variation->set_regular_price($price);
        $variation->set_price($price);
        $variation->set_manage_stock(false);
        $variation->set_stock_status('instock');
        $term = get_term_by('name', $size, 'pa_size');
        $variation->set_attributes([
            'pa_size' => $term ? $term->slug : sanitize_title($size),
        ]);
        $variation->save();
    }
    WC_Product_Variable::sync($product_id);

    $imported++;
    WP_CLI::success("Imported $name (#$product_id)");
}

WP_CLI::success("Done. Imported/updated $imported United Tigers products.");
