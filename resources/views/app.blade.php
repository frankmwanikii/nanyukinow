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

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
