import { Head } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import Navbar from '@/Components/site/Navbar';
import Footer from '@/Components/site/Footer';
import SuccessToastHost from '@/Components/site/SuccessToast';

const MobileBottomNav = lazy(
    () => import('@/Components/site/MobileBottomNav'),
);

export default function SiteLayout({
    title,
    children,
    hideFooter = false,
    compactNav = false,
    /** Explore-style map shell: fixed viewport, no page scroll */
    lockViewport = false,
    shellClassName = 'bg-earth-sand text-earth-dusk',
}) {
    return (
        <>
            <Head title={title} />
            <div
                className={`overflow-x-clip font-sans antialiased ${shellClassName} ${
                    lockViewport
                        ? 'h-svh overflow-hidden'
                        : hideFooter
                          ? 'min-h-svh pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
                          : 'min-h-screen pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
                }`}
            >
                <Navbar compact={compactNav} />
                <main>{children}</main>
                {hideFooter ? null : <Footer />}
            </div>
            <Suspense fallback={null}>
                <MobileBottomNav />
            </Suspense>
            <SuccessToastHost />
        </>
    );
}
