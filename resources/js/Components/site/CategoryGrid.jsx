import {
    BedDouble,
    Briefcase,
    CalendarDays,
    Camera,
    Coffee,
    Home,
    MoreHorizontal,
    ShoppingCart,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { explorePath, mainCategories } from '@/data/categories';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const icons = {
    eatDrink: Coffee,
    stay: BedDouble,
    shopping: ShoppingCart,
    thingsToDo: Camera,
    events: CalendarDays,
    properties: Home,
    services: Briefcase,
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
        href: '/explore',
        Icon: MoreHorizontal,
    },
];

export default function CategoryGrid() {
    return (
        <section id="categories" className="bg-earth-sand py-14 sm:py-20">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        eyebrow="Browse"
                        title="Find it by category"
                        subtitle="From lodges to coffee, tours to nightlife."
                    />
                </Reveal>
                <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {cards.map((card, index) => {
                        const Icon = card.Icon;
                        return (
                            <Reveal key={card.key} delay={index * 0.05}>
                                <motion.div whileHover={{ y: -4 }}>
                                    <Link
                                        href={card.href}
                                        className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-3 py-6 text-center shadow-soft ring-1 ring-olive-200/60 transition hover:bg-white hover:shadow-lift sm:py-8"
                                    >
                                        <span className="flex h-12 w-12 items-center justify-center text-olive-700">
                                            <Icon
                                                className="h-8 w-8"
                                                strokeWidth={1.5}
                                            />
                                        </span>
                                        <span className="font-display text-sm font-semibold text-earth-dusk sm:text-base">
                                            {card.label}
                                        </span>
                                    </Link>
                                </motion.div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
