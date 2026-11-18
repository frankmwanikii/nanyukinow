import { Link } from '@inertiajs/react';
import { ArrowLeft, Globe } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { listingVisitUrl } from '@/utils/listingVisit';

export default function ListingVisit({
    listing,
    url,
    label = 'Website',
    links = [],
}) {
    const backHref = route('listings.show', listing.slug);

    return (
        <SiteLayout title={`${label} · ${listing.title}`} compactNav>
            {/*
              Preview fills one viewport under the fixed nav so the site footer
              sits below the fold — scroll down to reach it like any other page.
            */}
            <div className="flex min-h-svh flex-col pt-[4.75rem] sm:pt-[5.5rem]">
                <div className="shrink-0 border-b border-olive-200/70 bg-white">
                    <div className="mx-auto flex max-w-site items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href={backHref}
                            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk shadow-sm transition hover:bg-olive-900 hover:text-white hover:shadow-md sm:px-5"
                        >
                            <ArrowLeft
                                className="h-4 w-4 transition group-hover:-translate-x-0.5"
                                strokeWidth={2.25}
                            />
                            Back to listing
                        </Link>

                        {links.length > 1 ? (
                            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
                                {links.map((item) => {
                                    const active =
                                        String(item.url).toLowerCase() ===
                                        String(url).toLowerCase();
                                    return (
                                        <Link
                                            key={item.url}
                                            href={listingVisitUrl(
                                                listing.slug,
                                                item.url,
                                            )}
                                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                                active
                                                    ? 'bg-olive-900 text-white'
                                                    : 'bg-olive-50 text-olive-700 hover:bg-olive-100'
                                            }`}
                                        >
                                            <Globe className="h-3 w-3" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="relative min-h-0 flex-1 bg-olive-100">
                    <iframe
                        title={`${listing.title} — ${label}`}
                        src={url}
                        className="block h-full min-h-[calc(100svh-9.5rem)] w-full border-0 bg-white sm:min-h-[calc(100svh-10.5rem)]"
                        referrerPolicy="no-referrer-when-downgrade"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                    />
                </div>
            </div>
        </SiteLayout>
    );
}
