import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from '@/Components/site/LucideCompat';
import { useRef } from 'react';
import Reveal from '@/Components/site/Reveal';
import StoryCard from '@/Components/site/StoryCard';

export default function StoriesSection({ stories = [] }) {
    const scrollerRef = useRef(null);

    if (!stories.length) return null;

    const scrollByCard = (dir) => {
        const el = scrollerRef.current;
        if (!el) return;
        const card = el.querySelector('[data-hub-card]');
        const width = card?.getBoundingClientRect().width || 280;
        el.scrollBy({ left: dir * (width + 20), behavior: 'smooth' });
    };

    return (
        <section
            id="stories"
            className="relative z-10 overflow-hidden py-14 sm:py-20"
            style={{
                backgroundImage: "url('/images/stories/shopping-hero.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 bg-earth-dusk/80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(242,184,46,0.12),_transparent_60%)]" />

            <div className="relative mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mustard">
                                Stories and tips
                            </p>
                            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Latest stories
                            </h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div
                                className="inline-flex gap-2"
                                role="group"
                                aria-label="Browse latest stories"
                            >
                                <button
                                    type="button"
                                    onClick={() => scrollByCard(-1)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                                    aria-label="Previous stories"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => scrollByCard(1)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                                    aria-label="Next stories"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <Link
                                href="/stories"
                                className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                            >
                                All stories
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </header>
                </Reveal>

                <div
                    ref={scrollerRef}
                    className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    tabIndex={0}
                    aria-label="Latest stories"
                >
                    {stories.map((article) => (
                        <div
                            key={article.id}
                            data-hub-card
                            className="w-[min(100%,17.5rem)] shrink-0 snap-start sm:w-[18rem]"
                        >
                            <StoryCard
                                article={article}
                                compact
                                className="bg-white/97 backdrop-blur-sm"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
