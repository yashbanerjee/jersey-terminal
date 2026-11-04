# Backup strategy

## Database

- Use Railway MySQL automated backups / snapshots daily.
- Before plugin upgrades, take a manual snapshot.
- Store restore credentials in the ops vault (not git).

## WordPress files

- Persistent volume at `/var/www/html` holds uploads, plugins, themes.
- Weekly offsite archive of `wp-content/uploads` and `wp-content/plugins`.
- Plugin source of truth also lives in this git repo under `wordpress/wp-content/plugins/jt-sports-commerce-extensions`.

## Redis

- Treat as ephemeral cache/queue. Losing Redis must not lose orders (Woo DB is SoT).
- After Redis flush, worker re-schedules repeatable jobs on boot.

## Restore drill

1. Provision empty MySQL from snapshot.
2. Attach restored volume or sync `wp-content`.
3. Point WordPress env at restored DB.
4. Smoke: `/wp-json/jt-sports/v1/health`, place test Stripe order in test mode.
