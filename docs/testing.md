# Testing & acceptance

## Frontend

- [ ] Homepage responsive; brand colours; logo proportions intact
- [ ] Hero / scroll animations respect `prefers-reduced-motion`
- [ ] Shop filters, PDP gallery, mobile nav
- [ ] Cart drawer open/close; add-to-cart feedback

## Commerce

- [ ] Products load from Woo (no hardcoded production catalog)
- [ ] Variable products: size/colour stock & pricing
- [ ] Name & number form shows on every product (personalization enabled by default; disable per product in WooCommerce → Product → General)
- [ ] `POST /api/cart` with `personalization.player_name` / `jersey_number` adds a line priced jersey + fee; invalid names return a 400 with a readable message
- [ ] Cart drawer and checkout summary show the "PRINT: NAME #NUMBER" tag
- [ ] Order line items carry `Name on back` / `Number` meta (admin, emails, REST) and the order has a "PRINT PERSONALIZATION" note
- [ ] Coupons calculate in Store API cart
- [ ] Prices display in AED

## Stripe

- [ ] Staging: install official Woo Stripe plugin; verify Store API payment method
- [ ] Success / failure / cancel paths
- [ ] 3DS challenge completes and order syncs via webhook
- [ ] Duplicate webhook delivery is idempotent
- [ ] Frontend success URL alone does **not** mark paid

## Cash on Delivery (disabled)

- [ ] COD gateway never appears in Store API `/checkout` payment methods, even if enabled in WooCommerce → Payments
- [ ] `POST /api/checkout` with `payment_method: "cod"` returns 400

## Shipping

- [ ] Aramex UAE shipment creates real AWB with credentials
- [ ] DHL international shipment with customs fields
- [ ] Tracking page shows courier-reported status only
- [ ] Unpaid/failed orders do not create shipments

## Railway

- [ ] web, wordpress, mysql, redis, worker healthy
- [ ] WP volume persists uploads/plugins
- [ ] Custom domains + HTTPS via Cloudflare
- [ ] Staging isolated from production DB/keys
