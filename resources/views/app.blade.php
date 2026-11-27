<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
        <meta name="description" content="Nanyuki Now: discover where to eat, stay, and explore in Nanyuki. Your city, right now.">

        <title inertia>{{ config('app.name', 'Nanyuki Now') }}</title>

        <link rel="icon" href="/favicon.ico?v=4" sizes="any">
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=4">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4">

        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700&display=swap" rel="stylesheet" />

        @php
            $onAdmin = \App\Support\AdminArea::requestIsAdmin(request());
        @endphp
        {{-- Public pages omit admin.* so ADMIN_PATH is not leaked in HTML. --}}
        @routes($onAdmin ? null : 'guest')
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        <style>
            html, body { margin: 0; background: #ebe4d6; color: #1c1712; }
            #app { min-height: 100svh; }
            .nn-firstpaint {
                min-height: 100svh;
                background: #ebe4d6;
            }
            .nn-firstpaint__bar {
                height: 4.25rem;
                background: #4f5a3e;
            }
            .nn-firstpaint__hero {
                height: min(62svh, 34rem);
                background: linear-gradient(180deg, #4f5a3e 0%, #2f3528 55%, #1c1712 100%);
            }
            .nn-firstpaint__body {
                max-width: 1400px;
                margin: 0 auto;
                padding: 1.5rem 1rem 2rem;
            }
            .nn-firstpaint__line {
                height: 0.85rem;
                border-radius: 2px;
                background: rgba(22, 25, 17, 0.1);
                margin-bottom: 0.65rem;
            }
            .nn-firstpaint__grid {
                display: grid;
                gap: 1rem;
                margin-top: 1.25rem;
            }
            .nn-firstpaint__card {
                aspect-ratio: 4 / 3;
                background: rgba(22, 25, 17, 0.08);
                animation: nn-pulse 1.2s ease-in-out infinite;
            }
            @keyframes nn-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.55; }
            }
            @media (min-width: 640px) {
                .nn-firstpaint__bar { height: 4.75rem; }
                .nn-firstpaint__body { padding: 2rem 1.5rem; }
                .nn-firstpaint__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
            @media (min-width: 1024px) {
                .nn-firstpaint__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            }
            @media (prefers-reduced-motion: reduce) {
                .nn-firstpaint__card { animation: none; }
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia
        <script>
            (function () {
                var root = document.getElementById('app');
                if (!root || root.childElementCount) return;
                var shell = document.createElement('div');
                shell.className = 'nn-firstpaint';
                shell.setAttribute('aria-hidden', 'true');
                shell.innerHTML =
                    '<div class="nn-firstpaint__bar"></div>' +
                    '<div class="nn-firstpaint__hero"></div>' +
                    '<div class="nn-firstpaint__body">' +
                    '<div class="nn-firstpaint__line" style="width:42%"></div>' +
                    '<div class="nn-firstpaint__line" style="width:28%"></div>' +
                    '<div class="nn-firstpaint__grid">' +
                    '<div class="nn-firstpaint__card"></div>' +
                    '<div class="nn-firstpaint__card"></div>' +
                    '<div class="nn-firstpaint__card"></div>' +
                    '</div></div>';
                root.appendChild(shell);
            })();
        </script>
    </body>
</html>
