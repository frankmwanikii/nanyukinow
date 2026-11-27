import { Link } from '@inertiajs/react';
import Reveal from '@/Components/site/Reveal';
import StoryCard from '@/Components/site/StoryCard';
import { ForwardMark } from '@/Components/site/Mark';

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

            <div className="relative mx-auto max-w-site">
                <Reveal>
                    <header className="flex items-end justify-between gap-3 px-4 sm:px-6">
                        <div className="min-w-0 flex-1">
                            <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                Latest stories
                            </h2>
                            <p className="mt-2 max-w-md text-sm text-white/70 sm:text-base">
                                Guides and local tips from around Nanyuki.
                            </p>
                        </div>
                        <Link
                            href="/stories"
                            className="mb-0.5 inline-flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white sm:mb-1 sm:gap-1.5 sm:px-3 sm:py-2"
                        >
                            All stories
                            <ForwardMark className="h-3.5 w-3.5" />
                        </Link>
                    </header>
                </Reveal>

                <div
                    className="mt-8 flex gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-6 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
                    aria-label="Latest stories"
                >
                    {items.map((article) => (
                        <div
                            key={article.id}
                            className="w-[min(78vw,19rem)] shrink-0 sm:w-auto sm:min-w-0"
                        >
                            <StoryCard
                                article={article}
                                compact
                                className="h-full bg-white"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
