<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Nanyuki Now — discover where to eat, stay, and explore in Nanyuki. Your city, right now.">

        <title inertia>{{ config('app.name', 'Nanyuki Now') }}</title>

        <link rel="icon" href="/favicon.ico?v=4" sizes="any">
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=4">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=4">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=4">
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=4">

        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700&display=swap" rel="stylesheet" />

        @routes
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
            @media (min-width: 640px) {
                .nn-firstpaint__bar { height: 4.75rem; }
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
                shell.innerHTML = '<div class="nn-firstpaint__bar"></div>';
                root.appendChild(shell);
            })();
        </script>
    </body>
</html>
