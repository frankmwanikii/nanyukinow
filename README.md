# Nanyuki Now

Mobile-first directory for Nanyuki — eat, stay, explore, and list your business.

Built with **Laravel · Inertia.js · React · Tailwind CSS**.

**Live:** [https://nanyukinow.co.ke](https://nanyukinow.co.ke)  
**Admin:** [https://nanyukinow.co.ke/admin](https://nanyukinow.co.ke/admin)

---

## Table of contents

1. [What’s included](#whats-included)
2. [Tech stack](#tech-stack)
3. [Requirements](#requirements)
4. [Local development](#local-development)
5. [Deploy on cPanel](#deploy-on-cpanel) ← start here for hosting
6. [Environment variables](#environment-variables)
7. [Admin access](#admin-access)
8. [Updating after go-live](#updating-after-go-live)
9. [Troubleshooting](#troubleshooting)
10. [Brand](#brand)

---

## What’s included

| Area | Features |
|------|----------|
| **Public site** | Home, Explore, listing detail, pricing, stories, EN / Kiswahili toggle |
| **Member account** | Listings CRUD, gallery, billing / upgrade, messages, notifications |
| **Admin** | Dashboard, listings, categories, locations, users (member profiles), stories, gallery, pricing, finance (payments), pages, settings |
| **Auth** | Email/password + Google OAuth, password reset, email verify |

---

## Tech stack

| Layer | Version / tool |
|-------|----------------|
| PHP | **8.3+** |
| Framework | Laravel **13** |
| Frontend | Inertia.js 2 + React 18 |
| CSS | Tailwind CSS 3 |
| Build | Vite 8 |
| Auth | Laravel Breeze + Socialite (Google) |
| DB | MySQL / MariaDB (production) or SQLite (local) |

---

## Requirements

### Local

- PHP 8.3+ with extensions: `bcmath`, `ctype`, `curl`, `dom`, `fileinfo`, `json`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `zip`
- Composer 2
- Node.js 20+ (22 recommended) and npm
- MySQL 8 / MariaDB 10.6+ *or* SQLite

### cPanel hosting

- **PHP 8.3** (or 8.4) selectable in MultiPHP Manager
- MySQL / MariaDB database
- **SSH access** strongly recommended (Composer + Artisan)
- Enough disk for `vendor/` + `node_modules/` (build on your laptop if Node is unavailable on the server)
- `mod_rewrite` enabled (default on most cPanel hosts)

---

## Local development

```bash
# Optional: use the portable Node shipped with the repo
export PATH="$(pwd)/.tools/node/bin:$PATH"

composer install
cp .env.example .env
php artisan key:generate

# SQLite (simplest) — already set in .env.example
# touch database/database.sqlite

# Or switch to MySQL in .env, then:
php artisan migrate
php artisan db:seed          # demo data + admin user (optional)

npm install
npm run dev                  # hot reload
# npm run build              # production assets

php artisan serve --port=8791
```

Open [http://127.0.0.1:8791](http://127.0.0.1:8791).

One-shot setup (Composer script):

```bash
composer run setup
```

---

## Deploy on cPanel

This is the production path used for hosts like **nanyukinow.co.ke**. Follow every step in order.

### Overview

```
~/nanyukinow/          ← app root (Laravel project, outside public_html if possible)
  app/
  bootstrap/
  ...
  public/              ← document root must point HERE
    index.php
    build/             ← Vite output (npm run build)
    storage → ../storage/app/public
public_html/           ← either redirected, or replaced by a symlink to public/
```

---

### Step 1 — Create the MySQL database

In cPanel → **MySQL® Databases**:

1. Create a database, e.g. `nanyuki_now`
2. Create a user with a strong password
3. Add the user to the database with **ALL PRIVILEGES**
4. Note the **full** names (cPanel often prefixes them):

```
DB_DATABASE=yourcpanel_nanyuki_now
DB_USERNAME=yourcpanel_dbuser
DB_PASSWORD=********
DB_HOST=localhost
```

---

### Step 2 — Upload the project

**Option A — Git (preferred if SSH + Git are available)**

```bash
cd ~
git clone <your-repo-url> nanyukinow
cd nanyukinow
```

**Option B — ZIP upload**

1. On your computer, zip the project **excluding** `node_modules/` and ideally excluding `vendor/` if you will run Composer on the server
2. Upload via File Manager or FTP into e.g. `/home/USER/nanyukinow/`
3. Extract so that `artisan` sits at `/home/USER/nanyukinow/artisan`

> Do **not** put the whole Laravel tree inside `public_html` as the web root. Only `public/` should be web-accessible.

---

### Step 3 — Point the domain at `public/`

Pick **one** approach.

#### Recommended: change document root

cPanel → **Domains** → your domain → **Document Root**:

```
/home/USER/nanyukinow/public
```

#### Alternative: symlink `public_html`

```bash
cd ~
# Backup existing public_html first
mv public_html public_html_backup_$(date +%Y%m%d)

ln -s ~/nanyukinow/public public_html
```

#### Alternative: root `.htaccess` redirect

If you must leave files under `public_html` as a copy of `public/` only, ensure every request hits `index.php` (Laravel’s `public/.htaccess` already does this). Never expose `.env` or `vendor/` over HTTP.

---

### Step 4 — PHP version

cPanel → **MultiPHP Manager** → select the domain → **PHP 8.3** (or 8.4).

Enable extensions if listed separately (common names):

- `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `curl`, `zip`, `gd` or `imagick`

---

### Step 5 — Environment file

```bash
cd ~/nanyukinow
cp .env.example .env
nano .env   # or edit in File Manager
```

**Minimum production `.env`:**

```env
APP_NAME="Nanyuki Now"
APP_ENV=production
APP_KEY=                    # generated in next step
APP_DEBUG=false
APP_URL=https://nanyukinow.co.ke

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=yourcpanel_nanyuki_now
DB_USERNAME=yourcpanel_dbuser
DB_PASSWORD=your_db_password

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=public

MAIL_MAILER=smtp
MAIL_HOST=mail.nanyukinow.co.ke
MAIL_PORT=465
MAIL_USERNAME=noreply@nanyukinow.co.ke
MAIL_PASSWORD=********
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="noreply@nanyukinow.co.ke"
MAIL_FROM_NAME="${APP_NAME}"

# Optional — Google login
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"

# Optional — Maps / reCAPTCHA (also need matching VITE_* keys at build time)
VITE_GOOGLE_MAPS_API_KEY=
VITE_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

Generate the app key:

```bash
php artisan key:generate
```

---

### Step 6 — Install PHP dependencies

**On the server (SSH):**

```bash
cd ~/nanyukinow
composer install --no-dev --optimize-autoloader
```

**If Composer is missing on the host:** run `composer install --no-dev` on your laptop, then upload the `vendor/` folder (large). Prefer installing Composer once via SSH when possible.

---

### Step 7 — Build frontend assets

Assets **must** be built before the site will render Inertia pages.

**On your laptop (recommended):**

```bash
npm ci
# Set any VITE_* keys you need in .env before building
npm run build
```

Then upload the entire `public/build/` folder to the server.

**On the server (if Node is available):**

```bash
cd ~/nanyukinow
npm ci
npm run build
```

Confirm these exist:

```
public/build/manifest.json
public/build/assets/*.js
public/build/assets/*.css
```

Without `manifest.json`, Laravel throws *Unable to locate file in Vite manifest*.

---

### Step 8 — Migrate, storage link, optimize

```bash
cd ~/nanyukinow

php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optional seed (admin + sample data) — only on a fresh DB
php artisan db:seed --force
```

Permissions (adjust user/group to match your host):

```bash
chmod -R ug+rwx storage bootstrap/cache
# Often:
# chown -R USER:USER storage bootstrap/cache
```

---

### Step 9 — SSL

cPanel → **SSL/TLS Status** or **Let’s Encrypt** → issue a certificate for the domain.  
Set `APP_URL` to `https://…` and force HTTPS in the host panel if available.

---

### Step 10 — Smoke-check

| URL | Expect |
|-----|--------|
| `/` | Homepage loads (no Vite / 500 errors) |
| `/admin/login` | Admin sign-in |
| `/pricing` | Public pricing tiers |
| `/storage/...` | Uploaded images resolve after `storage:link` |

---

## Environment variables

| Key | Purpose |
|-----|---------|
| `APP_KEY` | Encryption key — required |
| `APP_URL` | Canonical site URL (no trailing slash) |
| `APP_DEBUG` | Must be `false` in production |
| `DB_*` | MySQL credentials from cPanel |
| `FILESYSTEM_DISK=public` | Public uploads under `storage/app/public` |
| `GOOGLE_*` | Google OAuth login |
| `VITE_GOOGLE_MAPS_API_KEY` | Maps / Places (baked in at `npm run build`) |
| `VITE_RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` | Contact / spam protection |
| `MAIL_*` | Password reset & notifications |

After changing `.env` on production:

```bash
php artisan config:clear
php artisan config:cache
```

If you change `VITE_*` values, you must **rebuild** frontend assets (`npm run build`) and redeploy `public/build/`.

---

## Admin access

Default admin from `AdminUserSeeder` (change immediately after first login):

| Field | Value |
|-------|--------|
| URL | `/admin/login` |
| Email | `admin@nanyukinow.co.ke` |
| Username | `admin` |
| Password | `ChangeMeNow!2026` |

Seed only the admin user:

```bash
php artisan db:seed --class=AdminUserSeeder --force
```

Member profiles in admin use **username** in the URL, e.g. `/admin/users/admin`.

---

## Updating after go-live

```bash
cd ~/nanyukinow
git pull                         # or upload changed files

composer install --no-dev --optimize-autoloader

# On laptop if no Node on server:
#   npm ci && npm run build
# then upload public/build/

php artisan migrate --force
php artisan storage:link         # safe to re-run
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan ziggy:generate       # if routes changed and you commit ziggy.js
```

Clear opcode / Laravel caches if something looks stale:

```bash
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **500** blank page | Set `APP_DEBUG=true` temporarily; check `storage/logs/laravel.log`. Fix, then set debug back to `false`. |
| *Unable to locate file in Vite manifest* | Run `npm run build` and deploy `public/build/` including `manifest.json`. |
| CSS/JS 404 | Document root is not `public/`, or `public/build` missing. |
| *No application encryption key* | `php artisan key:generate` |
| Uploads fail / images 404 | `php artisan storage:link` and writable `storage/` |
| Database connection refused | Confirm cPanel DB name/user (with prefix) and `DB_HOST=localhost` |
| Pretty URLs 404 | Enable `mod_rewrite`; ensure `public/.htaccess` is present |
| Google login fails | Match `GOOGLE_REDIRECT_URI` to `${APP_URL}/auth/google/callback` in Google Cloud Console |
| Permission denied writing cache | `chmod -R ug+rwx storage bootstrap/cache` |
| Queue / sessions fail | Run migrations (`sessions`, `jobs`, `cache` tables) — `SESSION_DRIVER=database` |

---

## Brand

| Token | Hex | Use |
|-------|-----|-----|
| Olive | `#4b533a` | Navbar, dark sections |
| Mustard | `#f2b82e` | CTAs, accents |
| Mint | `#a8e190` | Highlights |
| Sand | earth-sand | Admin / page backgrounds |

**Fonts:** Sora (display) · DM Sans (body)

---

## License

Proprietary — Nanyuki Now. All rights reserved unless otherwise agreed.
