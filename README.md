# Nanyuki Now

Mobile-first listing site for Nanyuki — eat, stay, and explore. Built with **Laravel + Inertia + React**.

## Stack

- Laravel 13 (PHP 8.3)
- Inertia.js + React 18
- Tailwind CSS
- Framer Motion (scroll + hover motion)
- EN / Kiswahili UI toggle

## Run locally

```bash
# Node (portable copy lives in .tools if system Node is missing)
export PATH="$(pwd)/.tools/node/bin:$PATH"

composer install
cp .env.example .env   # if needed
php artisan key:generate
php artisan migrate

npm install
npm run dev            # or: npm run build

php artisan serve --port=8791
```

Open http://127.0.0.1:8791

## Brand

- Olive `#4b533a` — navbar / dark sections
- Mustard `#f2b82e` — Nanyuki / CTAs
- Mint `#a8e190` — Now / accents
- Fonts: Sora (display) + DM Sans (body)

## What’s included

- Responsive homepage matching the listing structure (hero → featured → grids → categories → trending → CTA → activities → recent → testimonials → newsletter → footer)
- Navbar with search, dropdowns, Add Business, language switch
- Auth scaffolding (login / register via Laravel Breeze)
