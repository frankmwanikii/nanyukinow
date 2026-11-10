<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Coming soon. {{ config('app.name', 'Nanyuki Now') }}</title>
    <link rel="icon" href="/favicon.ico?v=4" sizes="any">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=dm-sans:400,500,600,700&display=swap" rel="stylesheet">
    <style>
        @font-face {
            font-family: "Geometry Soft Pro";
            src: url("/fonts/GeometrySoftPro-BoldN.otf") format("opentype");
            font-weight: 700;
            font-style: normal;
            font-display: swap;
        }

        :root {
            --olive-950: #161911;
            --olive-900: #1c2218;
            --olive-800: #2a2e23;
            --olive-600: #6b7a5c;
            --sand: #ebe4d6;
            --mustard: #f2b82e;
            --ink: #f4f5f1;
        }

        * { box-sizing: border-box; }

        html, body {
            margin: 0;
            min-height: 100%;
            min-height: 100dvh;
        }

        body {
            font-family: "DM Sans", system-ui, sans-serif;
            color: var(--ink);
            background: var(--olive-950);
        }

        .page {
            position: relative;
            min-height: 100dvh;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .photo {
            position: absolute;
            inset: -24px;
            z-index: 0;
            background:
                url("/images/hero/slide-2.webp") center / cover no-repeat;
            filter: blur(14px);
            transform: scale(1.08);
        }

        .photo::after {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(22, 25, 17, 0.52);
        }

        .content {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 36rem;
            margin: 0 auto;
            padding: 2rem 1.25rem calc(1.75rem + env(safe-area-inset-bottom));
            text-align: center;
            animation: rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (min-width: 640px) {
            .content {
                padding: 2.5rem 2rem calc(2.25rem + env(safe-area-inset-bottom));
            }
        }

        @media (min-width: 1024px) {
            .content {
                max-width: 40rem;
                padding: 3rem 2rem;
            }
        }

        .logo {
            display: block;
            width: auto;
            height: clamp(4.25rem, 16vw, 6rem);
            margin: 0 auto 1.5rem;
            object-fit: contain;
            filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.35));
        }

        h1 {
            margin: 0 auto;
            max-width: 12ch;
            font-family: "Geometry Soft Pro", "DM Sans", sans-serif;
            font-size: clamp(2.35rem, 8vw, 4.25rem);
            font-weight: 700;
            line-height: 0.98;
            letter-spacing: -0.035em;
            color: var(--ink);
            text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
        }

        .lead {
            margin: 1rem auto 0;
            max-width: 32rem;
            font-size: clamp(1rem, 2.4vw, 1.125rem);
            line-height: 1.55;
            color: rgba(244, 245, 241, 0.86);
            text-shadow: 0 1px 12px rgba(0, 0, 0, 0.28);
        }

        .form-block {
            margin: 1.65rem auto 0;
            max-width: 34rem;
        }

        .form {
            display: grid;
            gap: 0.65rem;
        }

        @media (min-width: 640px) {
            .form {
                grid-template-columns: minmax(0, 1fr) auto;
                gap: 0.55rem;
            }
        }

        .form input[type="email"] {
            width: 100%;
            min-width: 0;
            border: 1px solid rgba(244, 245, 241, 0.22);
            background: rgba(22, 25, 17, 0.55);
            color: var(--ink);
            font: inherit;
            font-size: 1rem;
            padding: 0.95rem 1rem;
            outline: none;
        }

        .form input[type="email"]::placeholder {
            color: rgba(244, 245, 241, 0.45);
        }

        .form input[type="email"]:focus {
            border-color: var(--mustard);
            background: rgba(22, 25, 17, 0.72);
        }

        .form button {
            border: 1px solid var(--mustard);
            background: var(--mustard);
            color: var(--olive-950);
            font-family: "Geometry Soft Pro", "DM Sans", sans-serif;
            font-size: 1.05rem;
            font-weight: 700;
            letter-spacing: -0.01em;
            padding: 0.95rem 1.35rem;
            cursor: pointer;
            transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
        }

        .form button:hover {
            background: var(--olive-950);
            border-color: var(--ink);
            color: var(--ink);
        }

        .form button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .status {
            min-height: 1.25rem;
            margin: 0.65rem 0 0;
            font-size: 0.9rem;
            line-height: 1.4;
            color: rgba(244, 245, 241, 0.7);
        }

        .status.is-error { color: #fecaca; }
        .status.is-ok { color: #bbf7d0; }

        .meta {
            margin-top: 1.75rem;
            font-size: 0.8rem;
            letter-spacing: 0.02em;
            color: rgba(244, 245, 241, 0.42);
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
                transform: translateY(16px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .content { animation: none !important; }
            .form button { transition: none !important; }
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="photo" role="img" aria-label="Nanyuki highlands"></div>

        <div class="content">
            <img
                class="logo"
                src="/images/logo.png"
                alt="{{ config('app.name', 'Nanyuki Now') }}"
                width="220"
                height="123"
                decoding="async"
            >

            <h1>Almost ready</h1>
            <p class="lead">
                Nanyuki Now is finishing up. Leave your email for launch day,
                plus an early look at places to eat, stay, and explore.
            </p>

            <div class="form-block">
                <form class="form" id="notify-form" action="{{ route('newsletter.subscribe') }}" method="post" novalidate>
                    @csrf
                    <label class="sr-only" for="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autocomplete="email"
                        required
                        placeholder="Enter your email"
                    >
                    <button type="submit" id="notify-btn">Notify me</button>
                </form>
                <p class="status" id="notify-status" role="status" aria-live="polite"></p>
            </div>

            <p class="meta">Coming soon to Nanyuki</p>
        </div>
    </div>

    <script>
        (function () {
            const form = document.getElementById("notify-form");
            const button = document.getElementById("notify-btn");
            const status = document.getElementById("notify-status");
            const email = document.getElementById("email");
            if (!form || !button || !status || !email) return;

            form.addEventListener("submit", async function (event) {
                event.preventDefault();
                status.textContent = "";
                status.className = "status";

                const value = String(email.value || "").trim();
                if (!value || !value.includes("@")) {
                    status.textContent = "Enter a valid email address.";
                    status.classList.add("is-error");
                    email.focus();
                    return;
                }

                button.disabled = true;
                button.textContent = "Sending…";

                try {
                    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
                    const response = await fetch(form.action, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": token,
                            "X-Requested-With": "XMLHttpRequest",
                        },
                        credentials: "same-origin",
                        body: JSON.stringify({ email: value }),
                    });

                    const payload = await response.json().catch(function () {
                        return {};
                    });

                    if (!response.ok) {
                        status.textContent =
                            payload?.errors?.email?.[0] ||
                            payload?.message ||
                            "Could not subscribe. Try again.";
                        status.classList.add("is-error");
                        return;
                    }

                    status.textContent =
                        payload?.message || "You are on the list. We will be in touch.";
                    status.classList.add("is-ok");
                    form.reset();
                } catch (error) {
                    status.textContent = "Could not subscribe. Check your connection and try again.";
                    status.classList.add("is-error");
                } finally {
                    button.disabled = false;
                    button.textContent = "Notify me";
                }
            });
        })();
    </script>
</body>
</html>
