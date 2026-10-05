import { Link } from '@inertiajs/react';
import SiteLayout from '@/Layouts/SiteLayout';

export default function NotFound() {
    return (
        <SiteLayout
            title="Page not found"
            compactNav
            hideFooter
            shellClassName="bg-[#121412] text-white"
        >
            <div className="relative isolate min-h-svh overflow-hidden">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                    <img
                        src="/images/404-go-home.png?v=7"
                        alt=""
                        width="1280"
                        height="720"
                        className="mt-6 h-auto w-[min(110vw,52rem)] max-w-none object-contain opacity-95 sm:mt-4 sm:w-[min(92vw,54rem)]"
                        decoding="async"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_62%_54%_at_40%_48%,transparent_38%,#121412_82%)]" />
                </div>

                <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center justify-center px-4 pb-[6.5rem] pt-[5.5rem] text-center sm:px-6 sm:pb-16 sm:pt-[6.5rem] lg:pb-16">
                    <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                        <span className="text-white">You&apos;re drunk!</span>{' '}
                        <span className="text-mustard">Go home</span>
                    </h1>

                    <div className="mt-8 flex h-[min(48vw,17rem)] w-full max-w-3xl items-center justify-end pr-1 sm:mt-10 sm:h-[min(40vw,19rem)] sm:pr-8">
                        <div className="text-left">
                            <p className="font-display text-5xl font-semibold leading-none tracking-tight text-white/25 sm:text-6xl md:text-7xl">
                                404
                            </p>
                            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-white/30 sm:text-base">
                                Not Found
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/"
                        className="mt-2 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-earth-dusk transition hover:bg-white/90 sm:mt-4"
                    >
                        Go back home
                    </Link>

                    <p className="mt-5 max-w-md text-sm leading-relaxed text-white/55 sm:text-[15px]">
                        The page you are looking for doesn&apos;t exist or has
                        been moved. Please go back to the homepage.
                    </p>
                </div>
            </div>
        </SiteLayout>
    );
}
