import { Link } from '@inertiajs/react';
import { explorePath, mainCategories } from '@/data/categories';
import {
    EatMark,
    EventMark,
    ExploreMark,
    PropertyMark,
    ServicesMark,
    ShopMark,
    StayMark,
} from '@/Components/site/Mark';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const icons = {
    eatDrink: EatMark,
    stay: StayMark,
    shopping: ShopMark,
    thingsToDo: ExploreMark,
    events: EventMark,
    properties: PropertyMark,
    services: ServicesMark,
};

const cards = mainCategories.map((cat) => ({
    key: cat.key,
    label: cat.label,
    href: explorePath({ category: cat.key }),
    Icon: icons[cat.key],
}));

export default function CategoryGrid() {
    return (
        <section id="categories" className="bg-earth-sand py-14 sm:py-20">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        title="Find it by category"
                        subtitle="From lodges to coffee, tours to nightlife."
                    />
                </Reveal>
                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 md:grid-cols-4">
                    {cards.map((card) => {
                        const Icon = card.Icon;
                        return (
                            <Link
                                key={card.key}
                                href={card.href}
                                prefetch
                                className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3.5 border border-olive-200/70 bg-white px-3 py-6 text-center transition hover:border-olive-500 hover:bg-olive-600 sm:py-8"
                            >
                                <Icon className="h-8 w-8 text-olive-700 transition group-hover:text-mustard sm:h-9 sm:w-9" />
                                <span className="font-display text-sm font-semibold text-earth-dusk transition group-hover:text-white sm:text-base">
                                    {card.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
