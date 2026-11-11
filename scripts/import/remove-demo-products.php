<?php
/**
 * Remove seeded demo jerseys; keep United Tigers products only.
 * Usage: wp eval-file /var/www/html/jt-import/remove-demo-products.php --allow-root
 */

if (!class_exists('WooCommerce')) {
    WP_CLI::error('WooCommerce is required.');
}

$keep = [
    'united-tiger-match-jersey',
    'united-tiger-training-jersey',
];

$demo = [
    'shadow-strike-jersey',
    'velocity-jersey',
    'champions-edition',
    'elite-gold',
    'titan-white',
    'red-horizon',
];

$removed = 0;

foreach ($demo as $slug) {
    $posts = get_posts([
        'name' => $slug,
        'post_type' => 'product',
        'post_status' => 'any',
        'numberposts' => 1,
        'fields' => 'ids',
    ]);
    if (!$posts) {
        continue;
    }
    $id = (int) $posts[0];
    $product = wc_get_product($id);
    if ($product) {
        foreach ($product->get_children() as $child_id) {
            wp_delete_post((int) $child_id, true);
        }
    }
    wp_delete_post($id, true);
    $removed++;
    WP_CLI::success("Removed demo product: $slug (#$id)");
}

// Safety: trash any leftover non-UT published products that match known demo names.
$all = get_posts([
    'post_type' => 'product',
    'post_status' => ['publish', 'draft', 'private'],
    'numberposts' => -1,
    'fields' => 'ids',
]);

foreach ($all as $pid) {
    $product = wc_get_product((int) $pid);
    if (!$product) {
        continue;
    }
    $slug = $product->get_slug();
    if (in_array($slug, $keep, true)) {
        continue;
    }
    // Only auto-remove known demo slugs; do not wipe future real catalogue items by accident.
    if (!in_array($slug, $demo, true)) {
        WP_CLI::log("Leaving non-demo product: $slug (#$pid)");
        continue;
    }
}

WP_CLI::success("Done. Removed $removed demo products. Kept United Tigers jerseys only.");
