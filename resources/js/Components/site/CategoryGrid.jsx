import {
    BedDouble,
    CalendarDays,
    Camera,
    ConciergeBell,
    Moon,
    ShoppingBag,
    Soup,
    Trees,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/i18n/LocaleContext';
import { categoryKeys } from '@/data/listings';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

const icons = {
    hotels: BedDouble,
    food: Soup,
    tours: Trees,
    shopping: ShoppingBag,
    nightlife: Moon,
    wellness: ConciergeBell,
    events: CalendarDays,
    services: Camera,
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
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {categoryKeys.map((key, index) => {
                        const Icon = icons[key];
                        return (
                            <Reveal key={key} delay={index * 0.05}>
                                <motion.a
                                    href={`#listings`}
                                    whileHover={{ y: -4 }}
                                    className="flex flex-col items-center gap-3 rounded-2xl bg-white/70 px-3 py-6 text-center shadow-soft ring-1 ring-olive-200/60 transition hover:bg-white hover:shadow-lift sm:py-8"
                                >
                                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                                    </span>
                                    <span className="font-display text-sm font-semibold text-earth-dusk sm:text-base">
                                        {t.categories.items[key]}
                                    </span>
                                </motion.a>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
