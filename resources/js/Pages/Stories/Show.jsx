import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Clock,
    Copy,
    Lightbulb,
    Share2,
} from '@/Components/site/LucideCompat';
import { useEffect, useMemo, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import StoryCard from '@/Components/site/StoryCard';
import StoryComments from '@/Components/site/StoryComments';
import {
    articles,
    formatArticleDate,
    getArticleBySlug,
} from '@/data/articles';

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

function LinkedInIcon({ className = '' }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
            <path d="M6.5 8.5A2 2 0 1 1 6.5 4.5a2 2 0 0 1 0 4zm.1 2.2H4.4V20h2.2V10.7zm4.2 0H8.7V20h2.1v-4.8c0-1.3.7-2.1 1.8-2.1 1 0 1.5.7 1.5 2.1V20H16v-5.4c0-2.8-1.5-4.1-3.5-4.1-1.3 0-2.1.6-2.5 1.3h-.1v-1.1h-.1z" />
        </svg>
    );
}

function ShareBar({ article }) {
    const [copied, setCopied] = useState(false);
    const [canNativeShare, setCanNativeShare] = useState(false);

    useEffect(() => {
        setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share);
    }, []);

    const shareUrl = useMemo(() => {
        if (typeof window === 'undefined') {
            return `/stories/${article.slug}`;
        }
        return `${window.location.origin}/stories/${article.slug}`;
    }, [article.slug]);

    const shareText = `${article.title} — Nanyuki Now`;
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
        {
            label: 'LinkedIn',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: LinkedInIcon,
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

    const nativeShare = async () => {
        if (!navigator.share) return;
        try {
            await navigator.share({
                title: article.title,
                text: article.excerpt,
                url: shareUrl,
            });
        } catch {
            // cancelled
        }
    };

    return (
        <div className="rounded-2xl border border-olive-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="font-display text-lg font-semibold text-earth-dusk">
                        Share this story
                    </p>
                    <p className="mt-1 text-sm text-olive-600">
                        Pass it along to someone planning a trip.
                    </p>
                </div>
                {canNativeShare ? (
                    <button
                        type="button"
                        onClick={nativeShare}
                        className="inline-flex items-center gap-2 rounded-full bg-olive-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                    >
                        <Share2 className="h-4 w-4" />
                        Share
                    </button>
                ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
                {links.map(({ label, href, icon: Icon }) => (
                    <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-earth-sand/80 px-3.5 py-2 text-sm font-semibold text-olive-800 ring-1 ring-olive-200/80 transition hover:bg-olive-600 hover:text-white hover:ring-olive-600"
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </a>
                ))}
                <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-2 rounded-full bg-earth-sand/80 px-3.5 py-2 text-sm font-semibold text-olive-800 ring-1 ring-olive-200/80 transition hover:bg-olive-600 hover:text-white hover:ring-olive-600"
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
    );
}

function ArticleSections({ sections = [] }) {
    return (
        <div className="mt-12 space-y-14 sm:space-y-16">
            {sections.map((section, index) => {
                const reverse = index % 2 === 1;
                return (
                    <section
                        key={section.id || section.title}
                        className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
                    >
                        <div className={reverse ? 'lg:order-2' : ''}>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-olive-600">
                                {String(index + 1).padStart(2, '0')}
                            </p>
                            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-earth-dusk sm:text-3xl">
                                {section.title}
                            </h2>
                            <div className="mt-4 space-y-4 text-base leading-relaxed text-olive-800/90 sm:text-[1.05rem] sm:leading-8">
                                {(section.paragraphs || []).map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                            {section.list?.length ? (
                                <ol className="mt-6 space-y-4">
                                    {section.list.map((item, i) => (
                                        <li
                                            key={item.title || i}
                                            className="flex gap-4 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-olive-100 sm:p-5"
                                        >
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-600 font-display text-sm font-bold text-white">
                                                {i + 1}
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
                        </div>

                        {section.image ? (
                            <div
                                className={`overflow-hidden rounded-2xl shadow-lift ${
                                    reverse ? 'lg:order-1' : ''
                                }`}
                            >
                                <img
                                    src={section.image}
                                    alt={section.imageAlt || ''}
                                    className="aspect-[4/3] h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                        ) : null}
                    </section>
                );
            })}
        </div>
    );
}

export default function StoryShow({ slug }) {
    const article = getArticleBySlug(slug);

    if (!article) {
        return (
            <SiteLayout title="Story not found">
                <section className="mx-auto max-w-2xl px-4 py-28 text-center sm:px-6">
                    <h1 className="font-display text-3xl font-semibold text-earth-dusk">
                        Story not found
                    </h1>
                    <p className="mt-3 text-olive-700">
                        That article may have moved or isn’t published yet.
                    </p>
                    <Link
                        href="/stories"
                        className="mt-8 inline-flex rounded-full bg-olive-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                    >
                        Back to stories
                    </Link>
                </section>
            </SiteLayout>
        );
    }

    const related = articles
        .filter((item) => item.id !== article.id)
        .slice(0, 3);
    const hasSections = Array.isArray(article.sections) && article.sections.length > 0;

    return (
        <SiteLayout title={article.title}>
            <article>
                {/* Hero — retained overlay design */}
                <header className="relative flex min-h-[58svh] items-end overflow-hidden bg-olive-900 pt-24 sm:min-h-[64svh] sm:pt-28">
                    <div className="absolute inset-0">
                        <img
                            src={article.image}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1712] via-[#1c1712]/55 to-[#1c1712]/25" />
                    </div>
                    <div className="relative mx-auto w-full max-w-4xl px-4 pb-12 pt-16 sm:px-6 sm:pb-16">
                        <Link
                            href="/stories"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-mustard"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            All stories
                        </Link>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-mint">
                            {article.category}
                        </p>
                        <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
                            {article.title}
                        </h1>
                        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                            <span>{formatArticleDate(article.publishedAt)}</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {article.readMinutes} min read
                            </span>
                            <span>By {article.author}</span>
                        </div>
                    </div>
                </header>

                <div className="bg-earth-sand py-10 sm:py-14">
                    <div
                        className={`mx-auto px-4 sm:px-6 ${
                            hasSections ? 'max-w-5xl' : 'max-w-3xl'
                        }`}
                    >
                        <p className="mx-auto max-w-3xl font-display text-lg leading-relaxed text-olive-800 sm:text-xl sm:leading-8">
                            {(article.body && article.body[0]) || article.excerpt}
                        </p>

                        {!hasSections && article.body?.length > 1 ? (
                            <div className="mx-auto mt-8 max-w-3xl space-y-5 text-base leading-relaxed text-olive-800/90 sm:text-[1.05rem] sm:leading-8">
                                {article.body.slice(1).map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>
                        ) : null}

                        {hasSections ? (
                            <ArticleSections sections={article.sections} />
                        ) : null}

                        {article.proTip ? (
                            <aside className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-2xl border border-mustard/30 bg-white shadow-soft">
                                <div className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mustard/20 text-olive-900">
                                        <Lightbulb className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-display text-lg font-semibold text-earth-dusk">
                                            Pro-tip
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-olive-700 sm:text-base sm:leading-7">
                                            {article.proTip}
                                        </p>
                                    </div>
                                </div>
                            </aside>
                        ) : null}

                        <div className="mx-auto mt-12 max-w-3xl space-y-8">
                            <ShareBar article={article} />
                            <StoryComments slug={article.slug} />
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={`/stories?category=${encodeURIComponent(article.category)}`}
                                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-olive-700 ring-1 ring-olive-200 transition hover:bg-olive-600 hover:text-white hover:ring-olive-600"
                                >
                                    More in {article.category}
                                </Link>
                                <Link
                                    href="/stories"
                                    className="rounded-full bg-olive-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                                >
                                    Browse all stories
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {related.length > 0 ? (
                <section className="border-t border-olive-200/80 bg-white py-12 sm:py-16">
                    <div className="mx-auto max-w-site px-4 sm:px-6">
                        <h2 className="font-display text-2xl font-semibold text-earth-dusk sm:text-3xl">
                            Keep reading
                        </h2>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map((item) => (
                                <StoryCard key={item.id} article={item} />
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}
        </SiteLayout>
    );
}
