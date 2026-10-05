import { Head, Link } from '@inertiajs/react';

function BrandPattern({ className = '' }) {
    return (
        <>
            <div
                className={`pointer-events-none absolute inset-0 opacity-[0.22] ${className}`}
                style={{
                    backgroundImage: [
                        'radial-gradient(circle at 18% 22%, rgba(242,184,46,0.55) 0, rgba(242,184,46,0.55) 4.5rem, transparent 4.6rem)',
                        'radial-gradient(circle at 82% 18%, rgba(255,255,255,0.14) 0, rgba(255,255,255,0.14) 3.2rem, transparent 3.3rem)',
                        'radial-gradient(circle at 70% 72%, rgba(242,184,46,0.28) 0, rgba(242,184,46,0.28) 6rem, transparent 6.1rem)',
                        'radial-gradient(circle at 12% 78%, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 5rem, transparent 5.1rem)',
                        'radial-gradient(circle at 48% 48%, rgba(168,225,144,0.12) 0, rgba(168,225,144,0.12) 7rem, transparent 7.1rem)',
                        `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.14' stroke-width='1'%3E%3Cpath d='M32 4 L60 32 L32 60 L4 32 Z'/%3E%3Ccircle cx='32' cy='32' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
                    ].join(', '),
                    backgroundSize: 'auto, auto, auto, auto, auto, 64px 64px',
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 bg-grain opacity-50 mix-blend-overlay"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -left-16 top-1/3 h-72 w-72 rounded-full bg-mustard/20 blur-3xl"
                aria-hidden
            />
            <div
                className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-olive-950/40 blur-3xl"
                aria-hidden
            />
        </>
    );
}

function PremiumStage() {
    return (
        <>
            {/* Deep olive base + soft mustard spotlight */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 90% 55% at 50% -10%, rgba(242,184,46,0.22), transparent 55%),
                        radial-gradient(ellipse 70% 50% at 100% 100%, rgba(168,225,144,0.08), transparent 50%),
                        radial-gradient(ellipse 60% 45% at 0% 80%, rgba(242,184,46,0.1), transparent 45%),
                        linear-gradient(165deg, #1c2116 0%, #2f3628 42%, #23281e 100%)
                    `,
                }}
                aria-hidden
            />

            {/* Fine silk lines */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(115deg, rgba(255,255,255,0.55) 0 1px, transparent 1px 14px)',
                }}
                aria-hidden
            />

            <div
                className="pointer-events-none absolute inset-0 bg-grain opacity-40 mix-blend-overlay"
                aria-hidden
            />

            {/* Soft vignette — helps the form feel lifted */}
            <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(12,14,10,0.6)_100%)]"
                aria-hidden
            />
        </>
    );
}

/**
 * Full-viewport auth shell.
 * variant "centered" — premium olive stage + white form panel (sign in)
 * variant "brand" — olive shape-pattern sidebar + form (register)
 */
export default function AuthSplitLayout({
    title,
    panelTitle,
    panelBody,
    variant = 'brand',
    showBrandMark = true,
    children,
}) {
    const isCentered = variant === 'centered';

    if (isCentered) {
        return (
            <div className="relative min-h-svh overflow-hidden bg-[#1c2116] text-earth-dusk">
                <Head title={title} />
                <PremiumStage />

                <main className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
                    {showBrandMark ? (
                        <Link
                            href="/"
                            className="mb-7 inline-flex transition hover:opacity-90"
                        >
                            <img
                                src="/images/logo.png"
                                alt="Nanyuki Now"
                                className="h-16 w-auto object-contain drop-shadow-md sm:h-20"
                            />
                        </Link>
                    ) : null}

                    <div className="relative w-full max-w-[30rem]">
                        {/* Soft glow under the panel — suspended feel */}
                        <div
                            className="pointer-events-none absolute -inset-x-8 -bottom-10 top-12 rounded-[2rem] bg-black/45 blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-x-8 -bottom-4 h-10 rounded-full bg-mustard/15 blur-2xl"
                            aria-hidden
                        />
                        <div className="relative rounded-2xl border border-white/80 bg-white p-6 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.7),0_8px_24px_-8px_rgba(0,0,0,0.35)] sm:p-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-svh bg-white text-earth-dusk">
            <Head title={title} />

            <div className="grid min-h-svh lg:grid-cols-2">
                <aside className="relative hidden flex-col justify-between overflow-hidden bg-olive-700 text-white lg:flex">
                    <BrandPattern />

                    <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
                        <div aria-hidden className="h-10" />

                        <div className="max-w-md">
                            <h1 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight text-white xl:text-[2.1rem]">
                                {panelTitle}
                            </h1>
                            {panelBody ? (
                                <p className="mt-4 text-sm leading-relaxed text-white/75 xl:text-[15px]">
                                    {panelBody}
                                </p>
                            ) : null}
                        </div>

                        <p className="relative z-10 border-t border-white/15 pt-6 text-sm text-white/50">
                            Your city, right now.
                        </p>
                    </div>
                </aside>

                <div className="relative flex items-center gap-3 overflow-hidden bg-olive-700 px-5 py-4 lg:hidden">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f2b82e' stroke-opacity='0.35' stroke-width='1'%3E%3Cpath d='M24 3 L45 24 L24 45 L3 24 Z'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '48px 48px',
                        }}
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute inset-0 bg-grain opacity-40 mix-blend-overlay"
                        aria-hidden
                    />
                    <Link href="/" className="relative z-10 inline-flex">
                        <img
                            src="/images/logo.png"
                            alt="Nanyuki Now"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>
                </div>

                <main className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 sm:py-12 lg:items-center lg:overflow-y-auto lg:px-12 lg:py-16">
                    <div className="w-full max-w-[26rem]">{children}</div>
                </main>
            </div>
        </div>
    );
}
