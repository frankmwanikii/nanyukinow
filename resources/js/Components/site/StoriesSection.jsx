import { Link } from '@inertiajs/react';
import Reveal from '@/Components/site/Reveal';
import SectionHeading from '@/Components/site/SectionHeading';
import StoryCard from '@/Components/site/StoryCard';
import { articles } from '@/data/articles';

const HOME_STORY_SLUGS = [
    'nanyuki-shopping-guide',
    'hotels-vs-bush-cabin',
    'mastering-nanyuki-bipolar-weather',
];

export default function StoriesSection() {
    const stories = HOME_STORY_SLUGS.map((slug) =>
        articles.find((article) => article.slug === slug),
    ).filter(Boolean);

    if (stories.length === 0) return null;

    return (
        <section
            id="stories"
            className="relative z-10 py-14 sm:py-20"
            style={{ backgroundColor: '#3f3127' }}
        >
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        light
                        eyebrow="Stories"
                        title="Make the most of your visit!"
                        subtitle="Travel tips and local know-how to plan a better stay around Nanyuki."
                    />
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {stories.map((article, i) => (
                        <Reveal key={article.id} delay={i * 0.06}>
                            <StoryCard article={article} />
                        </Reveal>
                    ))}
                </div>

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/stories"
                        className="inline-flex rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white shadow-soft transition hover:border-mustard hover:bg-mustard hover:text-olive-950 sm:px-8"
                    >
                        Browse all stories
                    </Link>
                </div>
            </div>
        </section>
    );
}
