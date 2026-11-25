# Safe production updates

Production data is stored outside the application release files:

- Never upload or replace `.env`.
- Never upload or replace `database/database.sqlite` when SQLite is used.
- Never delete or replace `storage/app/private`; container attachments live there.
- Never run `php artisan migrate:fresh`, `db:wipe`, or reset the production database.

## Before every update

```bash
php artisan system:backup
php artisan down
```

Confirm that a new folder exists under `storage/app/backups` before continuing.

## Apply an update

Upload the new application files while preserving `.env`, the production database, and the entire `storage` directory. Then run:

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan optimize
php artisan up
```

Migrations must always add or transform data safely. Existing migration files must never be edited after they have run on production; create a new migration for every later database change.

## Daily backups

The application schedules a database and attachment backup every day at 02:00 and retains 30 days. The server must run Laravel's scheduler every minute:

```cron
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```

Copy backups to a separate server or cloud storage regularly. A backup stored only on the same server does not protect against disk or account failure.
