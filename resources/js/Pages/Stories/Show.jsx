import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Copy,
    Eye,
    Share2,
    UserRound,
} from '@/Components/site/LucideCompat';
import ShareListingModal from '@/Components/listing/ShareListingModal';
import { useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { formatArticleDate } from '@/utils/formatArticleDate';

const panelClass =
    'rounded-xl border border-olive-200/90 bg-white p-5 sm:p-6';

function XIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.849L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
    );
}

function WhatsAppIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
    );
}

function FacebookIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.2l.8-3H14V9z" />
        </svg>
    );
}

function shareActionClass() {
    return 'inline-flex items-center gap-2 rounded-md border border-olive-200 bg-[#f7f6f2] px-3 py-2 text-sm font-medium text-olive-800 transition hover:border-olive-300 hover:bg-white hover:text-earth-dusk';
}

function ShareBar({ article }) {
    const [copied, setCopied] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const shareUrl = useMemo(() => {
        if (typeof window === 'undefined') {
            return `/stories/${article.slug}`;
        }
        return `${window.location.origin}/stories/${article.slug}`;
    }, [article.slug]);

    const shareText = `${article.title}. Nanyuki Now`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const links = [
        {
            label: 'WhatsApp',
            href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            icon: WhatsAppIcon,
        },
        {
            label: 'Facebook',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: FacebookIcon,
        },
        {
            label: 'X',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            icon: XIcon,
        },
    ];

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    return (
        <>
            <div className={panelClass}>
                <p className="font-display text-lg font-semibold text-earth-dusk">
                    Share
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setShareOpen(true)}
                        className={shareActionClass()}
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </button>
                    {links.map(({ label, href, icon: Icon }) => (
                        <a
                            key={label}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={shareActionClass()}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </a>
                    ))}
                    <button
                        type="button"
                        onClick={copyLink}
                        className={shareActionClass()}
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        {copied ? 'Copied' : 'Copy link'}
                    </button>
                </div>
            </div>
            <ShareListingModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                listing={{ title: article.title }}
            />
        </>
    );
}

function ArticleSections({ sections = [] }) {
    return (
        <div className="mt-10 space-y-10 sm:space-y-12">
            {sections.map((section, index) => (
                <section key={section.id || section.title || index}>
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-earth-dusk sm:text-3xl">
                        {section.title}
                    </h2>
                    <div className="mt-4 space-y-4 text-base leading-[1.85] text-olive-800/90 sm:text-[1.05rem]">
                        {(section.paragraphs || []).map((paragraph, i) => (
                            <p key={i}>{paragraph}</p>
                        ))}
                    </div>
                    {section.list?.length ? (
                        <ol className="mt-6 space-y-0 border-t border-[#d8dde3]">
                            {section.list.map((item, i) => (
                                <li
                                    key={item.title || i}
                                    className="flex gap-4 border-b border-[#d8dde3] py-4"
                                >
                                    <span className="w-6 shrink-0 font-display text-sm font-semibold tabular-nums text-olive-500">
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <div>
                                        <p className="font-display text-base font-semibold text-earth-dusk">
                                            {item.title}
                                        </p>
                                        <p className="mt-1 text-sm leading-relaxed text-olive-700 sm:text-[0.95rem]">
                                            {item.text}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    ) : null}
                    {section.image ? (
                        <div className="mt-6">
                            <img
                                src={section.image}
                                alt={section.imageAlt || ''}
                                className="aspect-[16/9] w-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    ) : null}
                </section>
            ))}
        </div>
    );
}

function NavCard({ story, direction }) {
    if (!story) {
        return <span className="hidden sm:block" aria-hidden />;
    }

    const isPrev = direction === 'prev';

    return (
        <Link
            href={`/stories/${story.slug}`}
            className={`group flex min-w-0 flex-col gap-3 ${panelClass} transition hover:border-olive-300 sm:flex-row sm:items-center`}
        >
            {isPrev && story.image ? (
                <span
                    className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-cover bg-center sm:h-20 sm:w-28 sm:aspect-auto"
                    style={{ backgroundImage: `url('${story.image}')` }}
                    aria-hidden
                />
            ) : null}
            <span className={`min-w-0 flex-1 ${isPrev ? '' : 'sm:text-right'}`}>
                <span className="inline-flex items-center gap-1.5 text-sm text-olive-600">
                    {isPrev ? (
                        <>
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Previous
                        </>
                    ) : (
                        <>
                            Next
                            <ArrowRight className="h-3.5 w-3.5" />
                        </>
                    )}
                </span>
                {story.category ? (
                    <span className="mt-1 block text-sm text-olive-500">
                        {story.category}
                    </span>
                ) : null}
                <strong className="mt-1 block font-display text-base font-semibold leading-snug text-earth-dusk transition group-hover:underline">
                    {story.title}
                </strong>
            </span>
            {!isPrev && story.image ? (
                <span
                    className="aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-cover bg-center sm:h-20 sm:w-28 sm:aspect-auto"
                    style={{ backgroundImage: `url('${story.image}')` }}
                    aria-hidden
                />
            ) : null}
        </Link>
    );
}

export default function StoryShow({
    article = null,
    popular = [],
    adjacent = { prev: null, next: null },
    categories = [],
}) {
    if (!article) {
        return (
            <SiteLayout title="Story not found" compactNav>
                <section className="mx-auto max-w-2xl px-4 py-28 text-center sm:px-6">
                    <h1 className="font-display text-3xl font-semibold text-earth-dusk">
                        Story not found
                    </h1>
                    <p className="mt-3 text-olive-700">
                        That article may have moved or isn’t published yet.
                    </p>
                    <Link
                        href="/stories"
                        className="mt-8 inline-flex rounded-full bg-olive-800 px-6 py-3 text-sm font-semibold text-mustard transition hover:bg-mustard hover:text-olive-950"
                    >
                        Back to stories
                    </Link>
                </section>
            </SiteLayout>
        );
    }

    const hasSections =
        Array.isArray(article.sections) && article.sections.length > 0;
    const views = Number(article.views || 0);

    return (
        <SiteLayout title={article.title} compactNav>
            <section className="bg-[#f3f5f7] pb-14 pt-32 sm:pb-16 sm:pt-36">
                <div className="mx-auto grid max-w-site gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.75fr)] lg:gap-10 lg:items-start">
                    <article className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-olive-600">
                            <span>
                                Published On:{' '}
                                <strong className="font-semibold text-earth-dusk">
                                    {formatArticleDate(article.publishedAt)}
                                </strong>
                            </span>
                            <span className="text-olive-300" aria-hidden>
                                ·
                            </span>
                            <span>
                                Categories:{' '}
                                <Link
                                    href={
                                        article.categorySlug
                                            ? `/stories?category=${encodeURIComponent(article.categorySlug)}`
                                            : '/stories'
                                    }
                                    className="font-semibold text-olive-800 underline-offset-2 hover:underline"
                                >
                                    {article.category || 'Stories'}
                                </Link>
                            </span>
                        </div>

                        <hr className="mt-4 border-0 border-t border-[#d8dde3] sm:mt-5" />

                        <h1 className="mt-4 max-w-3xl font-display text-[1.85rem] font-semibold leading-tight tracking-tight text-earth-dusk sm:mt-5 sm:text-4xl md:text-[2.75rem] md:leading-[1.15]">
                            {article.title}
                        </h1>

                        {article.subtitle ? (
                            <p className="mt-3 max-w-2xl text-base leading-relaxed text-olive-700 sm:text-lg">
                                {article.subtitle}
                            </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-olive-600">
                            <span className="inline-flex items-center gap-2">
                                <UserRound className="h-4 w-4" />
                                {article.author || 'Nanyuki Now'}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                {views.toLocaleString()}{' '}
                                {views === 1 ? 'view' : 'views'}
                            </span>
                        </div>

                        {article.image ? (
                            <figure className="mt-8">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="aspect-[16/9] w-full object-cover"
                                    loading="eager"
                                />
                            </figure>
                        ) : null}

                        {article.bodyHtml ? (
                            <div
                                className="nn-editor story-body mt-8 max-w-3xl text-[1.05rem] leading-[1.85] text-[#2a2a2a] [&_a]:text-olive-800 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-mustard [&_blockquote]:bg-mustard/10 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-earth-dusk [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-6 [&_img]:rounded-2xl [&_p]:mt-4 [&_p:first-child]:mt-0"
                                dangerouslySetInnerHTML={{
                                    __html: article.bodyHtml,
                                }}
                            />
                        ) : null}

                        {hasSections ? (
                            <ArticleSections sections={article.sections} />
                        ) : null}

                        {article.proTip ? (
                            <aside className="mt-10 border-l-2 border-mustard pl-4 sm:pl-5">
                                <p className="font-display text-lg font-semibold text-earth-dusk">
                                    Pro tip
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-olive-700 sm:text-base sm:leading-7">
                                    {article.proTip}
                                </p>
                            </aside>
                        ) : null}

                        <div className="mt-10">
                            <ShareBar article={article} />
                        </div>

                        {(adjacent?.prev || adjacent?.next) && (
                            <nav
                                className="mt-10 grid gap-4 sm:grid-cols-2"
                                aria-label="More stories"
                            >
                                <NavCard
                                    story={adjacent.prev}
                                    direction="prev"
                                />
                                <NavCard
                                    story={adjacent.next}
                                    direction="next"
                                />
                            </nav>
                        )}
                    </article>

                    <aside
                        className="min-w-0 space-y-5 lg:sticky lg:top-32"
                        aria-label="Stories sidebar"
                    >
                        <div className={panelClass}>
                            <h2 className="font-display text-lg font-semibold text-earth-dusk">
                                Categories
                            </h2>
                            <ul className="mt-3 -mx-1">
                                {categories.map((cat) => {
                                    const active =
                                        cat.slug === article.categorySlug;
                                    return (
                                        <li key={cat.slug || cat.id}>
                                            <Link
                                                href={`/stories?category=${encodeURIComponent(cat.slug)}`}
                                                className={`block rounded-md px-2 py-2 text-sm transition ${
                                                    active
                                                        ? 'bg-olive-800 font-semibold text-white'
                                                        : 'text-olive-700 hover:bg-[#f7f6f2] hover:text-earth-dusk'
                                                }`}
                                                aria-current={
                                                    active ? 'page' : undefined
                                                }
                                            >
                                                {cat.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        <div className={panelClass}>
                            <h2 className="font-display text-lg font-semibold text-earth-dusk">
                                Popular
                            </h2>
                            <div className="mt-3 space-y-3">
                                {popular.length === 0 ? (
                                    <p className="text-sm text-olive-500">
                                        More stories coming soon.
                                    </p>
                                ) : (
                                    popular.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={`/stories/${item.slug}`}
                                            className="group flex gap-3"
                                        >
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt=""
                                                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <span
                                                    className="h-14 w-14 shrink-0 rounded-md bg-olive-800"
                                                    aria-hidden
                                                />
                                            )}
                                            <span className="min-w-0 self-center">
                                                <strong className="block font-display text-sm font-semibold leading-snug text-earth-dusk transition group-hover:underline">
                                                    {item.title}
                                                </strong>
                                                {(item.excerpt ||
                                                    item.subtitle) && (
                                                    <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-olive-600">
                                                        {item.excerpt ||
                                                            item.subtitle}
                                                    </span>
                                                )}
                                            </span>
                                        </Link>
                                    ))
                                )}
                            </div>
                            <Link
                                href="/stories"
                                className="mt-5 inline-flex text-sm font-medium text-olive-700 underline-offset-2 hover:underline"
                            >
                                Browse all stories
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </SiteLayout>
    );
}
