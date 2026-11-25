import { Link } from '@inertiajs/react';
import { ChevronRight } from '@/Components/site/LucideCompat';
import Reveal from '@/Components/site/Reveal';
import StoryCard from '@/Components/site/StoryCard';

export default function StoriesSection({ stories = [] }) {
    const items = stories.slice(0, 4);

    if (!items.length) return null;

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

            <div className="relative mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Latest stories
                            </h2>
                            <p className="mt-2 max-w-md text-sm text-white/70 sm:text-base">
                                Guides and local tips from around Nanyuki.
                            </p>
                        </div>
                        <Link
                            href="/stories"
                            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-white/25 bg-white/10 px-5 text-sm font-semibold text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                        >
                            All stories
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </header>
                </Reveal>

                <div
                    className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4"
                    aria-label="Latest stories"
                >
                    {items.map((article) => (
                        <StoryCard
                            key={article.id}
                            article={article}
                            compact
                            className="h-full bg-white"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
