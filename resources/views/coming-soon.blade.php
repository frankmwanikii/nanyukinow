<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>Coming soon — {{ config('app.name', 'Nanyuki Now') }}</title>
    <link rel="icon" href="/favicon.ico?v=4" sizes="any">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700|fraunces:500,600,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --olive-950: #0f160e;
            --olive-900: #162016;
            --olive-800: #1f2f1e;
            --olive-700: #355038;
            --olive-300: #b7c9b0;
            --olive-100: #e7efe3;
            --cream: #f4f1ea;
            --mustard: #e0b02a;
        }
        * { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; }
        body {
            font-family: "DM Sans", system-ui, sans-serif;
            color: var(--cream);
            background: var(--olive-900);
            min-height: 100%;
            min-height: 100dvh;
            overflow-x: hidden;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0 1.25rem 2rem;
        }
        .stage {
            position: fixed;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
        }
        .orb {
            position: absolute;
            border-radius: 999px;
            filter: blur(48px);
            opacity: 0.55;
            animation: drift 18s ease-in-out infinite alternate;
        }
        .orb-a {
            width: min(48vw, 28rem);
            height: min(48vw, 28rem);
            left: -8%;
            top: -12%;
            background: radial-gradient(circle, rgba(224, 176, 42, 0.45), transparent 68%);
        }
        .orb-b {
            width: min(55vw, 34rem);
            height: min(55vw, 34rem);
            right: -14%;
            top: 18%;
            background: radial-gradient(circle, rgba(74, 120, 72, 0.55), transparent 70%);
            animation-delay: -6s;
            animation-duration: 22s;
        }
        .orb-c {
            width: min(60vw, 36rem);
            height: min(42vw, 24rem);
            left: 20%;
            bottom: -18%;
            background: radial-gradient(circle, rgba(20, 40, 22, 0.95), transparent 72%);
            animation-delay: -11s;
            animation-duration: 26s;
        }
        .grain {
            position: absolute;
            inset: 0;
            opacity: 0.07;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            mix-blend-mode: overlay;
        }
        .top-badge {
            position: relative;
            z-index: 2;
            width: 100%;
            max-width: 42rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.65rem;
            padding: clamp(1.35rem, 4vw, 2rem) 1rem clamp(1rem, 3vw, 1.5rem);
            font-family: Fraunces, Georgia, serif;
            font-size: clamp(1.75rem, 6vw, 2.75rem);
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--cream);
            animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .top-badge-dot {
            width: clamp(0.55rem, 2vw, 0.7rem);
            height: clamp(0.55rem, 2vw, 0.7rem);
            border-radius: 999px;
            background: var(--mustard);
            box-shadow: 0 0 0 0 rgba(224, 176, 42, 0.45);
            animation: pulse 2.2s ease-out infinite;
            flex-shrink: 0;
        }
        .card {
            position: relative;
            z-index: 1;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: min(34rem, 100%);
            text-align: center;
            padding-bottom: 2rem;
        }
        .logo {
            display: block;
            width: auto;
            height: clamp(5.75rem, 18vw, 8.75rem);
            margin: 0 auto 1.15rem;
            object-fit: contain;
            filter: drop-shadow(0 18px 40px rgba(0, 0, 0, 0.4));
            animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.12s both;
        }
        h1 {
            margin: 0 0 0.85rem;
            font-family: Fraunces, Georgia, serif;
            font-size: clamp(1.65rem, 4.8vw, 2.35rem);
            font-weight: 600;
            line-height: 1.2;
            letter-spacing: -0.02em;
            color: var(--cream);
            animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        .lead {
            margin: 0 auto;
            max-width: 26rem;
            font-size: 1.02rem;
            line-height: 1.65;
            color: var(--olive-300);
            animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        @keyframes rise {
            from {
                opacity: 0;
                transform: translateY(18px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(224, 176, 42, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(224, 176, 42, 0); }
            100% { box-shadow: 0 0 0 0 rgba(224, 176, 42, 0); }
        }
        @keyframes drift {
            from { transform: translate3d(0, 0, 0) scale(1); }
            to { transform: translate3d(3%, 4%, 0) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
            .orb, .logo, .top-badge, h1, .lead, .top-badge-dot {
                animation: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="stage" aria-hidden="true">
        <span class="orb orb-a"></span>
        <span class="orb orb-b"></span>
        <span class="orb orb-c"></span>
        <span class="grain"></span>
    </div>

    <p class="top-badge">
        <span class="top-badge-dot" aria-hidden="true"></span>
        Coming soon
    </p>

    <main class="card">
        <img
            class="logo"
            src="/images/logo.png"
            alt="{{ config('app.name', 'Nanyuki Now') }}"
            width="969"
            height="542"
            decoding="async"
        >
        <p class="sr-only">{{ config('app.name', 'Nanyuki Now') }}</p>
        <h1>Eat, stay &amp; explore.</h1>
        <p class="lead">
            We’re putting the finishing touches on Nanyuki’s local guide.
            Check back shortly.
        </p>
    </main>
</body>
</html>
