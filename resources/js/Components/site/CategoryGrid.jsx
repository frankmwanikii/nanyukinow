import { Link } from '@inertiajs/react';
import { explorePath, mainCategories } from '@/data/categories';
import {
    EatCategoryIcon,
    EventCategoryIcon,
    ExploreCategoryIcon,
    MoreCategoryIcon,
    PropertyCategoryIcon,
    ServicesCategoryIcon,
    ShopCategoryIcon,
    StayCategoryIcon,
} from '@/Components/site/CategoryIcons';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const icons = {
    eatDrink: EatCategoryIcon,
    stay: StayCategoryIcon,
    shopping: ShopCategoryIcon,
    thingsToDo: ExploreCategoryIcon,
    events: EventCategoryIcon,
    properties: PropertyCategoryIcon,
    services: ServicesCategoryIcon,
};

const cards = [
    ...mainCategories.map((cat) => ({
        key: cat.key,
        label: cat.label,
        href: explorePath({ category: cat.key }),
        Icon: icons[cat.key],
    })),
    {
        key: 'more',
        label: 'More',
        href: explorePath(),
        Icon: MoreCategoryIcon,
    },
];

export default function CategoryGrid() {
    return (
        <section id="categories" className="bg-earth-sand py-14 sm:py-20">
            <div className="mx-auto max-w-site px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        title="Find it by category"
                        subtitle="From lodges to coffee, tours to nightlife."
                    />
                </Reveal>
                <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {cards.map((card) => {
                        const Icon = card.Icon;
                        return (
                            <Link
                                key={card.key}
                                href={card.href}
                                prefetch
                                className="group flex min-h-[5.25rem] flex-col items-center justify-center gap-2 border border-olive-200/70 bg-white px-1.5 py-3.5 text-center transition hover:border-olive-500 hover:bg-olive-600 sm:min-h-[7.5rem] sm:gap-3.5 sm:px-3 sm:py-8"
                            >
                                <Icon className="h-7 w-7 shrink-0 text-olive-700 transition group-hover:text-mustard sm:h-9 sm:w-9" />
                                <span className="font-display text-[11px] font-semibold leading-tight text-earth-dusk transition group-hover:text-white sm:text-base sm:leading-snug">
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
