import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import Navbar from '@/Components/site/Navbar';
import Footer from '@/Components/site/Footer';
import SuccessToastHost from '@/Components/site/SuccessToast';

const MobileBottomNav = lazy(
    () => import('@/Components/site/MobileBottomNav'),
);
const NyukiDesktopWidget = lazy(
    () => import('@/Components/site/NyukiDesktopWidget'),
);

export default function SiteLayout({
    title,
    children,
    hideFooter = false,
    hideNav = false,
    hideBottomNav = false,
    hideNyukiWidget = false,
    compactNav = false,
    /** Explore-style map shell: fixed viewport, no page scroll */
    lockViewport = false,
    shellClassName = 'bg-earth-sand text-earth-dusk',
}) {
    const padForBottomNav = !hideBottomNav && !lockViewport;

    return (
        <>
            <Head title={title} />
            <div
                className={`font-sans antialiased ${shellClassName} ${
                    lockViewport
                        ? // Avoid overflow-x-clip here: it breaks position:sticky inside Explore.
                          'h-svh overflow-hidden'
                        : padForBottomNav
                          ? hideFooter
                            ? 'min-h-svh overflow-x-clip pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
                            : 'min-h-screen overflow-x-clip pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
                          : hideFooter
                            ? 'min-h-svh overflow-x-clip'
                            : 'min-h-screen overflow-x-clip'
                }`}
            >
                {hideNav ? null : <Navbar compact={compactNav} />}
                <main>{children}</main>
                {hideFooter ? null : <Footer />}
            </div>
            {hideBottomNav ? null : (
                <Suspense fallback={null}>
                    <MobileBottomNav />
                </Suspense>
            )}
            {hideNyukiWidget ? null : (
                <Suspense fallback={null}>
                    <NyukiDesktopWidget />
                </Suspense>
            )}
            <SuccessToastHost />
        </>
    );
}
