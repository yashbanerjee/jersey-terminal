# API documentation

## Next.js Route Handlers

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | public | Load balancer health |
| POST | `/api/revalidate` | `x-revalidate-secret` | Cache tag/path bust |
| POST | `/api/webhooks/woocommerce` | `x-wc-webhook-signature` | Idempotent product revalidate |
| GET/POST/PATCH/DELETE | `/api/cart` | cart cookies | Proxies Woo Store API |
| POST | `/api/checkout` | cart cookies | Store API checkout + Stripe (only payment method) |
| POST | `/api/auth/login` | — | JWT cookie session |
| POST | `/api/auth/logout` | — | Clears auth cookie |
| POST | `/api/auth/register` | — | Woo REST customers |
| GET | `/api/tracking` | — | Proxies JT tracking |

Consumer secrets are never returned to the browser.

## WordPress `jt-sports/v1`

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | public |
| GET | `/tracking?order=&email=` | public |
| POST | `/tracking/sync` | `X-JT-Internal-Secret` |
| POST | `/fulfilment/create` | internal |
| POST | `/webhooks/retry` | internal |
| POST | `/personalization/validate` | public |
| GET | `/product/{id}/extensions` | public |
| POST | `/stripe/create-checkout-session` | internal |
| POST | `/stripe/webhook` | Stripe signature |

## WooCommerce

- **Store API** (`/wc/store/v1`): cart, checkout, customer (browser-facing via Next proxy).
- **REST API** (`/wc/v3`): products, variations, customers (server-side only).
