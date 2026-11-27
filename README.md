# Nanyuki Now

The best of Nanyuki. Places to eat, stay, and explore, plus tools for local businesses to list and grow.

**Live:** [https://nanyukinow.co.ke](https://nanyukinow.co.ke)

Built with Laravel, Inertia.js, React, and Tailwind CSS.

---

## Table of contents

1. [What’s included](#whats-included)
2. [Tech stack](#tech-stack)
3. [Requirements](#requirements)
4. [Local development](#local-development)
5. [Production on cPanel](#production-on-cpanel)
6. [GitHub auto-deploy](#github-auto-deploy)
7. [Environment variables](#environment-variables)
8. [Admin access](#admin-access)
9. [Cron and queues](#cron-and-queues)
10. [Updating manually](#updating-manually)
11. [Troubleshooting](#troubleshooting)
12. [Brand](#brand)

---

## What’s included

| Area | Features |
|------|----------|
| Public site | Home, Explore, listing detail, pricing, stories, EN / Kiswahili |
| Member account | Listings, gallery, billing, messages, notifications |
| Admin | Dashboard, listings, categories, locations, users, stories, gallery, pricing, finance, pages, settings |
| Auth | Email/password, Google OAuth, password reset, email verify, passkeys |

---

## Tech stack

| Layer | Version / tool |
|-------|----------------|
| PHP | 8.3+ |
| Framework | Laravel 13 |
| Frontend | Inertia.js 2 + React |
| CSS | Tailwind CSS |
| Build | Vite |
| Auth | Laravel Breeze + Socialite (Google) |
| DB | MySQL / MariaDB (production) or SQLite (local) |

---

## Requirements

### Local

- PHP 8.3+ with `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `zip`
- Composer 2
- Node.js 20+ and npm
- MySQL 8 / MariaDB 10.6+ or SQLite

### Production (cPanel)

- PHP 8.3 (MultiPHP / ea-php83)
- MySQL database on the same account
- FTP or File Manager access for deploys
- `mod_rewrite` enabled
- Disk for `vendor/` plus Vite `public/build/`

---

## Local development

```bash
composer install
cp .env.example .env
php artisan key:generate

# SQLite (simple) or configure MySQL in .env
php artisan migrate
php artisan db:seed   # optional demo data

npm install
npm run dev           # Vite hot reload
php artisan serve --port=8791
```

Open [http://127.0.0.1:8791](http://127.0.0.1:8791).

One-shot setup:

```bash
composer run setup
```

---

## Production on cPanel

Current production path for **nanyukinow.co.ke**:

```text
/home3/allthin2/nanyukinow.co.ke/     ← Laravel app root
  app/
  bootstrap/
  config/
  public/                            ← web files (index.php, build/, storage link)
  storage/
  vendor/
  .env
  .htaccess                          ← rewrites into public/ when needed
```

### Document root

Prefer pointing the domain document root at `nanyukinow.co.ke/public`.

If the host returns 404 after that change (some LiteSpeed setups do), keep the domain root on `nanyukinow.co.ke` and use a root `.htaccess` that rewrites into `public/` while leaving real files at the root alone.

### PHP

cPanel → MultiPHP Manager → domain → **PHP 8.3**.

Useful extensions: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`, `zip`, `gd`.

### Database

Create a MySQL database and user in cPanel, grant ALL PRIVILEGES, then set in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yourcpanel_dbname
DB_USERNAME=yourcpanel_dbuser
DB_PASSWORD=********
```

### App environment

Keep a production `.env` on the server only. Never commit it.

Minimum:

```env
APP_NAME="Nanyuki Now"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://nanyukinow.co.ke
ADMIN_PATH=nn-admin

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=local
```

After first deploy:

```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Uploads live under `storage/app/public` and are served via `public/storage`.

### Smoke checks

| URL | Expect |
|-----|--------|
| `/` | Homepage |
| `/login` | Member login |
| `/explore` | Explore |
| `/storage/...` | Existing uploaded media |
| `/{ADMIN_PATH}/login` | Staff console (path from `.env`) |

---

## GitHub auto-deploy

Pushing to `main` runs [`.github/workflows/deploy-cpanel.yml`](.github/workflows/deploy-cpanel.yml).

The workflow:

1. Installs Composer deps (no-dev)
2. Runs `npm ci` and `npm run build`
3. Packages a release tarball (keeps server `.env` and `storage/app/public` intact)
4. Uploads over FTP
5. Extracts on the server and runs migrate + cache + storage link
6. Removes the temporary extract script

### One-time GitHub secrets

In the GitHub repo → **Settings → Secrets and variables → Actions**, add:

| Secret | Value |
|--------|--------|
| `CPANEL_FTP_HOST` | cPanel server IP or FTP host |
| `CPANEL_FTP_USER` | FTP user scoped to the app folder |
| `CPANEL_FTP_PASSWORD` | FTP password |
| `CPANEL_DEPLOY_TOKEN` | Long random token used only by the extract step |

You can also run the workflow manually from the **Actions** tab (**Deploy to cPanel** → **Run workflow**).

### What auto-deploy does not replace

- Editing production `.env`
- Changing DNS
- Creating databases
- Uploading brand-new large media libraries (existing `storage/app/public` is preserved on purpose)

---

## Environment variables

| Key | Purpose |
|-----|---------|
| `APP_KEY` | Encryption key (required) |
| `APP_URL` | Canonical site URL, no trailing slash |
| `APP_DEBUG` | Must be `false` in production |
| `ADMIN_PATH` | Staff console URL prefix |
| `DB_*` | MySQL credentials |
| `GOOGLE_*` | Google OAuth |
| `VITE_GOOGLE_MAPS_API_KEY` | Maps (baked in at build time) |
| `VITE_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` | Spam protection |
| `MAIL_*` | Password reset and notifications |
| `MOBITECH_*` / `GEMINI_*` | SMS and Nyuki AI (optional) |

After changing server `.env`:

```bash
php artisan config:clear
php artisan config:cache
```

If you change `VITE_*` values, rebuild assets (`npm run build`) and redeploy `public/build/`.

---

## Admin access

Staff console path comes from `ADMIN_PATH` in `.env` (production uses a non-default path).

Classic `/admin` stays closed.

Default seeded admin (change immediately after first login):

| Field | Value |
|-------|--------|
| Email | `admin@nanyukinow.co.ke` |
| Username | `admin` |
| Password | `ChangeMeNow!2026` |

```bash
php artisan db:seed --class=AdminUserSeeder --force
```

---

## Cron and queues

On shared cPanel there is often no long-running queue worker. Add cron jobs:

```cron
* * * * * cd /home3/allthin2/nanyukinow.co.ke && /usr/local/bin/ea-php83 artisan schedule:run >> /dev/null 2>&1
* * * * * cd /home3/allthin2/nanyukinow.co.ke && /usr/local/bin/ea-php83 artisan queue:work --stop-when-empty --max-time=50 >> /dev/null 2>&1
```

Adjust the PHP binary path to match MultiPHP on your host.

---

## Updating manually

If you are not using GitHub Actions:

```bash
# From your machine: build, then upload changed files + public/build + vendor if needed
npm ci && npm run build
composer install --no-dev --optimize-autoloader

# On the server
php artisan migrate --force
php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Do not overwrite production `.env` or wipe `storage/app/public` unless you mean to.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 500 blank page | Check `storage/logs/laravel.log`. Keep `APP_DEBUG=false` in production after fixing. |
| Unable to locate Vite manifest | Deploy `public/build/` including `manifest.json`. |
| CSS/JS 404 | Confirm rewrite into `public/` and that `public/build` exists. |
| Uploads fail / images 404 | `php artisan storage:link` and writable `storage/` |
| Database connection refused | Confirm cPanel DB name/user prefix and `DB_HOST=localhost` |
| Pretty URLs 404 | Ensure `public/.htaccess` exists and rewrite is enabled |
| Google login fails | Match redirect URI to `${APP_URL}/auth/google/callback` |
| Queue / sessions fail | Run migrations for `sessions`, `jobs`, and `cache` tables |
| GitHub deploy fails | Confirm Actions secrets and that the FTP user can write the app folder |

---

## Brand

| Token | Hex | Use |
|-------|-----|-----|
| Olive | `#4b533a` | Navbar, dark sections |
| Mustard | `#f2b82e` | CTAs, accents |
| Mint | `#a8e190` | Highlights |
| Sand | earth-sand | Soft page backgrounds |

**Fonts:** Sora (display), DM Sans (body)

---

## License

Proprietary. Nanyuki Now. All rights reserved unless otherwise agreed.

---

Made with love by Frank Mwaniki
