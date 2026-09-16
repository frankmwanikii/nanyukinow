import { Head } from '@inertiajs/react';
import Navbar from '@/Components/site/Navbar';
import Footer from '@/Components/site/Footer';
import MobileBottomNav from '@/Components/site/MobileBottomNav';

export default function SiteLayout({
    title,
    children,
    hideFooter = false,
    compactNav = false,
}) {
    return (
        <>
            <Head title={title} />
            <div
                className={`bg-earth-sand font-sans text-earth-dusk antialiased ${
                    hideFooter
                        ? 'h-svh overflow-hidden'
                        : 'min-h-screen pb-[4.75rem] lg:pb-0'
                }`}
            >
                <Navbar compact={compactNav} />
                <main>{children}</main>
                {hideFooter ? null : <Footer />}
            </div>
            <MobileBottomNav />
        </>
    );
}
