# Railway Deployment Guide — JT Sports Commerce

## Project layout (single Railway project)

| Service    | Root directory / Dockerfile                         | Notes                                      |
|-----------|------------------------------------------------------|--------------------------------------------|
| `web`     | `apps/web/Dockerfile` (repo root context)            | Custom domain `www.yourdomain.com`         |
| `wordpress` | `wordpress/Dockerfile`                             | Volume mount `/var/www/html`, `cms.*`      |
| `mysql`   | Railway MySQL/MariaDB plugin                         | Private networking only                    |
| `redis`   | Railway Redis plugin                                 | Private networking                         |
| `worker`  | `apps/worker/Dockerfile` (repo root context)         | No public domain                           |

## Critical WordPress volume

Attach a persistent volume to the WordPress service at `/var/www/html`.

Do **not** horizontally scale WordPress until media uses shared object storage.

## Environment

Copy variables from root `.env.example` into each Railway service.

Use private hostnames for MySQL and Redis (`*.railway.internal`).

## Cloudflare

1. Point `www` and `cms` CNAME/A to Railway custom domains.
2. SSL/TLS mode: Full (strict).
3. Cache HTML carefully — bypass `/api/*`, cart, checkout, account.
4. Enable WAF managed rules.

## Staging vs production

Duplicate the Railway environment. Use separate MySQL databases and Stripe test vs live keys.

## Backups

- Enable Railway database backups / snapshots.
- Periodically archive the WordPress volume (`wp-content/uploads` + plugins).
- Document restore drills in `docs/backup-strategy.md`.
