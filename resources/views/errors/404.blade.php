<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Page not found — {{ config('app.name', 'Nanyuki Now') }}</title>
    <link rel="icon" href="/favicon.ico?v=4" sizes="any">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700|fraunces:500,600,700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; }
        body {
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.25rem;
            font-family: "DM Sans", system-ui, sans-serif;
            color: #fff;
            background: #121412;
            text-align: center;
        }
        .wrap { width: min(48rem, 100%); }
        h1 {
            margin: 0;
            font-family: Fraunces, Georgia, serif;
            font-size: clamp(1.85rem, 5vw, 3rem);
            font-weight: 600;
            letter-spacing: -0.02em;
        }
        .accent { color: #f2b82e; }
        .scene {
            position: relative;
            margin: 1.75rem auto 0;
            max-width: 40rem;
            overflow: hidden;
            border-radius: 1rem;
        }
        .scene img {
            display: block;
            width: 100%;
            height: auto;
        }
        .code {
            position: absolute;
            inset: 0 0 0 58%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(90deg, transparent, rgba(18,20,18,0.35), rgba(18,20,18,0.8));
            padding-left: 1rem;
            text-align: left;
        }
        .code strong {
            display: block;
            font-family: Fraunces, Georgia, serif;
            font-size: clamp(2.75rem, 8vw, 4.5rem);
            line-height: 1;
            color: rgba(255,255,255,0.35);
        }
        .code span {
            display: block;
            margin-top: 0.25rem;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.4);
        }
        .btn {
            display: inline-flex;
            margin-top: 1.75rem;
            padding: 0.85rem 1.5rem;
            border-radius: 0.6rem;
            background: #fff;
            color: #1c1712;
            font-size: 0.9rem;
            font-weight: 700;
            text-decoration: none;
        }
        .btn:hover { background: #f2b82e; }
        .lead {
            margin: 1.1rem auto 0;
            max-width: 28rem;
            font-size: 0.95rem;
            line-height: 1.6;
            color: rgba(255,255,255,0.55);
        }
    </style>
</head>
<body>
    <main class="wrap">
        <h1>You&apos;re lost! <span class="accent">Go home</span></h1>
        <div class="scene">
            <img src="{{ asset('images/404-go-home.jpg') }}" alt="A traveler looking a little lost at the bar" width="1280" height="720">
            <div class="code" aria-hidden="true">
                <div>
                    <strong>404</strong>
                    <span>Not Found</span>
                </div>
            </div>
        </div>
        <a class="btn" href="{{ url('/') }}">Go back home</a>
        <p class="lead">
            The page you are looking for doesn&apos;t exist or has been moved. Please go back to the homepage.
        </p>
    </main>
</body>
</html>
