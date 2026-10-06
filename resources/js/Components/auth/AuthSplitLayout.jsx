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

/**
 * Full-viewport auth shell.
 * variant "centered" — dark glass login stage (sign in)
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
            <div className="relative min-h-svh overflow-hidden bg-olive-950 text-white lg:h-svh">
                <Head title={title} />

                {/* Brand wash — olive base + mustard horizon, no card frame */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: `
                            radial-gradient(ellipse 95% 50% at 50% 108%, rgba(242,184,46,0.38), transparent 60%),
                            radial-gradient(ellipse 70% 40% at 50% 92%, rgba(168,225,144,0.12), transparent 55%),
                            radial-gradient(ellipse 55% 35% at 15% 20%, rgba(107,119,88,0.45), transparent 50%),
                            radial-gradient(ellipse 45% 30% at 85% 15%, rgba(242,184,46,0.1), transparent 45%),
                            linear-gradient(165deg, #1c2116 0%, #23281e 42%, #161911 100%)
                        `,
                    }}
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-x-[-15%] bottom-[-22%] h-[48%] rounded-[100%] bg-mustard/25 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-olive-600/25 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute inset-0 bg-grain opacity-35 mix-blend-overlay"
                    aria-hidden
                />

                <main className="relative z-10 flex min-h-svh items-center justify-center px-4 py-6 sm:px-6 lg:h-svh lg:py-4">
                    <div className="w-full max-w-[24.5rem]">
                        {showBrandMark ? (
                            <Link
                                href="/"
                                className="mb-6 flex justify-center transition hover:opacity-90"
                            >
                                <img
                                    src="/images/logo.png"
                                    alt="Nanyuki Now"
                                    className="h-12 w-auto object-contain drop-shadow-md sm:h-14"
                                />
                            </Link>
                        ) : null}
                        {children}
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
