import { Head } from '@inertiajs/react';
import Navbar from '@/Components/site/Navbar';
import Footer from '@/Components/site/Footer';
import { LocaleProvider } from '@/i18n/LocaleContext';

export default function SiteLayout({ title, children }) {
    return (
        <LocaleProvider>
            <Head title={title} />
            <div className="min-h-screen bg-earth-sand font-sans text-earth-dusk antialiased">
                <Navbar />
                <main>{children}</main>
                <Footer />
            </div>
        </LocaleProvider>
    );
}
