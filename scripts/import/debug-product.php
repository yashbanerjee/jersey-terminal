<?php
$p = wc_get_product(10);
WP_CLI::log('type=' . $p->get_type());
WP_CLI::log('attrs=' . count($p->get_attributes()));
foreach ($p->get_attributes() as $a) {
    WP_CLI::log(
        $a->get_name()
        . ' opts=' . implode(',', $a->get_options())
        . ' var=' . ($a->get_variation() ? '1' : '0')
    );
}
WP_CLI::log('image=' . $p->get_image_id());
WP_CLI::log('gallery=' . implode(',', $p->get_gallery_image_ids()));
WP_CLI::log('price=' . $p->get_price());
WP_CLI::log('children=' . count($p->get_children()));
