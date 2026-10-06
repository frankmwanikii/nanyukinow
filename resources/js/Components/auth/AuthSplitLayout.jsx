import { Head, Link } from '@inertiajs/react';

function BrandWash({ className = '' }) {
    return (
        <>
            <div
                className={`pointer-events-none absolute inset-0 ${className}`}
                style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 20% 0%, rgba(242,184,46,0.12), transparent 55%),
                        linear-gradient(165deg, #3a4232 0%, #2f3628 48%, #252a20 100%)
                    `,
                }}
                aria-hidden
            />
            <div
                className="pointer-events-none absolute inset-0 bg-grain opacity-25 mix-blend-overlay"
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
 * variant "brand" — clean olive wash sidebar + form (register)
 */
export default function AuthSplitLayout({
    title,
    panelTitle,
    panelBody,
    variant = 'brand',
    showBrandMark = true,
    dense = false,
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

            <div className="grid min-h-svh w-full min-w-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                <aside className="relative hidden min-w-0 overflow-hidden bg-olive-700 text-white lg:flex">
                    <BrandWash />

                    <div className="relative z-10 flex h-full w-full flex-col px-8 py-12 xl:px-10 xl:py-14">
                        <div className="flex flex-1 flex-col items-center justify-center text-center">
                            <Link
                                href="/"
                                className="mb-8 inline-flex transition hover:opacity-90 xl:mb-10"
                            >
                                <img
                                    src="/images/logo.png"
                                    alt="Nanyuki Now"
                                    className="h-28 w-auto object-contain drop-shadow-md xl:h-36"
                                />
                            </Link>
                            <div className="w-full max-w-sm">
                                <h1 className="font-display text-[1.65rem] font-semibold leading-[1.2] tracking-tight text-white xl:text-[1.8rem]">
                                    {panelTitle}
                                </h1>
                                {panelBody ? (
                                    <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                                        {panelBody}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <p className="border-t border-white/15 pt-5 text-center text-sm text-white/45">
                            Your city, right now.
                        </p>
                    </div>
                </aside>

                <div className="relative flex min-h-[12.5rem] items-center overflow-hidden bg-olive-700 px-6 py-10 text-white sm:min-h-[14rem] sm:py-12 lg:hidden">
                    <BrandWash />
                    <div className="relative z-10 mx-auto flex w-full max-w-sm flex-col items-center space-y-3.5 text-center">
                        <Link href="/" className="inline-flex">
                            <img
                                src="/images/logo.png"
                                alt="Nanyuki Now"
                                className="h-16 w-auto object-contain drop-shadow-md sm:h-20"
                            />
                        </Link>
                        {panelTitle ? (
                            <h1 className="font-display text-[1.35rem] font-semibold leading-snug tracking-tight text-white sm:text-[1.5rem]">
                                {panelTitle}
                            </h1>
                        ) : null}
                        {panelBody ? (
                            <p className="text-[15px] leading-relaxed text-white/70">
                                {panelBody}
                            </p>
                        ) : null}
                    </div>
                </div>

                <main
                    className={`flex w-full min-w-0 flex-1 justify-center px-4 sm:px-8 ${
                        dense
                            ? 'items-center overflow-y-auto py-4 sm:py-6 lg:justify-start lg:px-8 lg:py-5 xl:px-10'
                            : 'items-start py-6 sm:py-12 lg:items-center lg:justify-start lg:overflow-y-auto lg:px-8 lg:py-10 xl:px-10'
                    }`}
                >
                    <div
                        className={`w-full min-w-0 ${
                            dense
                                ? 'max-w-[30rem]'
                                : 'max-w-[28rem] lg:max-w-[56rem]'
                        }`}
                    >
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
