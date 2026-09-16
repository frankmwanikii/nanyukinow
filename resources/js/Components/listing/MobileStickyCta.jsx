import { MessageCircle, Phone } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function MobileStickyCta({ listing }) {
    const tel = listing?.phone
        ? `tel:${String(listing.phone).replace(/\s+/g, '')}`
        : null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-[1080] border-t border-olive-200 bg-white/95 p-3 backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-lg gap-2">
                {tel ? (
                    <a
                        href={tel}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-mustard py-3 text-sm font-bold text-olive-950"
                    >
                        <Phone className="h-4 w-4" />
                        Call
                    </a>
                ) : null}
                <Link
                    href="/explore"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-olive-700 py-3 text-sm font-semibold text-white"
                >
                    <MessageCircle className="h-4 w-4" />
                    Message
                </Link>
            </div>
        </div>
    );
}
