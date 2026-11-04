# Production deployment guide

1. Create one Railway project with services: `web`, `wordpress`, `mysql`, `redis`, `worker`.
2. Attach volume to WordPress → `/var/www/html`.
3. Set env vars from `.env.example` (never commit secrets).
4. Deploy WordPress; complete WP install; install WooCommerce + Stripe gateway + JT plugin.
5. Create Woo REST keys; configure Store API; set webhooks to `https://www…/api/webhooks/woocommerce`.
6. Configure JT Sports settings (CORS origin, revalidate URL/secret, couriers). Cash on Delivery is disabled by the plugin.
7. Deploy Next.js `web` with Dockerfile (repo root context).
8. Deploy `worker` with Redis URL + Woo keys + internal secret.
9. Add Cloudflare DNS for `www` and `cms`; SSL Full (strict); WAF.
10. Run acceptance checklist in `docs/testing.md` on staging, then promote.

## Stripe headless gate

Before go-live, prove official Woo Stripe + Store API on staging. If payment method/redirect/3DS fails headless, enable JT Stripe connector endpoints and point Stripe webhooks to `/wp-json/jt-sports/v1/stripe/webhook`.
