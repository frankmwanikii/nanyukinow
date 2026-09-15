import { Head } from '@inertiajs/react';
import Navbar from '@/Components/site/Navbar';
import Footer from '@/Components/site/Footer';
import { LocaleProvider } from '@/i18n/LocaleContext';

export default function SiteLayout({
    title,
    children,
    hideFooter = false,
    compactNav = false,
}) {
    return (
        <LocaleProvider>
            <Head title={title} />
            <div
                className={`bg-earth-sand font-sans text-earth-dusk antialiased ${
                    hideFooter ? 'h-svh overflow-hidden' : 'min-h-screen'
                }`}
            >
                <Navbar compact={compactNav} />
                <main>{children}</main>
                {hideFooter ? null : <Footer />}
            </div>
        </LocaleProvider>
    );
}
