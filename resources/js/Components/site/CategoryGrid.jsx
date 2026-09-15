import {
    BedDouble,
    Briefcase,
    CalendarDays,
    Camera,
    Coffee,
    Home,
    ShoppingCart,
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleContext';
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

export default function CategoryGrid() {
    const { t } = useLocale();

    return (
        <section id="categories" className="bg-earth-sand py-14 sm:py-20">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <SectionHeading
                        eyebrow={t.categories.eyebrow}
                        title={t.categories.title}
                        subtitle={t.categories.subtitle}
                    />
                </Reveal>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
                    {mainCategories.map((cat, index) => {
                        const Icon = icons[cat.key];
                        return (
                            <Reveal key={cat.key} delay={index * 0.05}>
                                <motion.div whileHover={{ y: -4 }}>
                                    <Link
                                        href={explorePath({
                                            category: cat.key,
                                        })}
                                        className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-3 py-6 text-center shadow-soft ring-1 ring-olive-200/60 transition hover:bg-white hover:shadow-lift sm:py-8"
                                    >
                                        <span className="flex h-12 w-12 items-center justify-center text-olive-700">
                                            <Icon
                                                className="h-8 w-8"
                                                strokeWidth={1.5}
                                            />
                                        </span>
                                        <span className="font-display text-sm font-semibold text-earth-dusk sm:text-base">
                                            {t.categories.items[cat.key] ??
                                                cat.label}
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
