# JT Sports Commerce

Premium UAE sports merchandise platform: **Next.js** storefront + **WordPress/WooCommerce** commerce backend + **Stripe** + **Aramex/DHL**, all on **Railway**.

## Monorepo

| Path | Purpose |
|------|---------|
| `apps/web` | Next.js App Router storefront |
| `apps/worker` | BullMQ worker (tracking, fulfilment poll, revalidate) |
| `packages/shared` | Shared Zod schemas / shipping enums |
| `wordpress/` | WordPress Docker image + `jt-sports-commerce-extensions` plugin |
| `railway/` | Deployment notes |
| `docs/` | API, testing, backup, production guides |

## Quick start (local)

```bash
pnpm install
pnpm --filter @jt/shared build
docker compose up -d
pnpm dev
```

- Storefront: http://localhost:3000  
- WordPress: http://localhost:8080  

Copy `.env.example` to `apps/web/.env.local` and set WooCommerce keys after creating a REST API key in WP admin.

## Brand assets

Place the official JT logo at `apps/web/public/brand/jt-logo.svg` (proportions unchanged). A temporary brand-safe placeholder ships for development.

## Non-negotiables

- WooCommerce is the only source of truth for products/orders.
- No Vercel; deploy app services on Railway.
- No duplicate admin dashboard.
- No fake payments or fabricated tracking statuses.
