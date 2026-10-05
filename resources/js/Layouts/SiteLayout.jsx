import { Head } from '@inertiajs/react';
import Navbar from '@/Components/site/Navbar';
import Footer from '@/Components/site/Footer';
import MobileBottomNav from '@/Components/site/MobileBottomNav';
import SuccessToastHost from '@/Components/site/SuccessToast';

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
                          ? 'min-h-svh'
                          : 'min-h-screen pb-[4.75rem] lg:pb-0'
                }`}
            >
                <Navbar compact={compactNav} />
                <main>{children}</main>
                {hideFooter ? null : <Footer />}
            </div>
            <MobileBottomNav />
            <SuccessToastHost />
        </>
    );
}
