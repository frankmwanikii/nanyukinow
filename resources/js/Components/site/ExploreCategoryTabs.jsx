import {
    BedDouble,
    Briefcase,
    CalendarDays,
    Camera,
    Coffee,
    Home,
    LayoutGrid,
    ShoppingCart,
} from 'lucide-react';
import { mainCategories } from '@/data/categories';

const icons = {
    eatDrink: Coffee,
    stay: BedDouble,
    thingsToDo: Camera,
    services: Briefcase,
    shopping: ShoppingCart,
    properties: Home,
    events: CalendarDays,
};

export default function ExploreCategoryTabs({
    categoryKey,
    onCategoryChange,
}) {
    return (
        <div className="shrink-0 border-b border-olive-200 bg-white pt-3 sm:pt-4">
            <div className="flex items-stretch justify-center gap-1 overflow-x-auto px-2 sm:gap-2 sm:px-4 scrollbar-none">
                <TabButton
                    active={!categoryKey}
                    label="All"
                    icon={LayoutGrid}
                    onClick={() => onCategoryChange(null)}
                />
                {mainCategories.map((cat) => {
                    const Icon = icons[cat.key] ?? LayoutGrid;
                    return (
                        <TabButton
                            key={cat.key}
                            active={categoryKey === cat.key}
                            label={cat.label}
                            icon={Icon}
                            onClick={() =>
                                onCategoryChange(
                                    categoryKey === cat.key ? null : cat.key,
                                )
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}

function TabButton({ active, label, icon: Icon, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex shrink-0 items-center gap-2 px-3.5 py-3.5 text-[13px] font-semibold transition sm:px-4 ${
                active
                    ? 'text-earth-dusk'
                    : 'text-earth-dusk/90 hover:text-earth-dusk'
            }`}
        >
            <Icon
                className={`h-5 w-5 shrink-0 ${
                    active ? 'text-mustard-deep' : 'text-earth-dusk'
                }`}
                strokeWidth={active ? 2.35 : 2.1}
            />
            <span className="whitespace-nowrap font-semibold text-earth-dusk">
                {label}
            </span>
            <span
                className={`absolute inset-x-2 bottom-0 h-[3px] rounded-full transition ${
                    active ? 'bg-mustard' : 'bg-transparent'
                }`}
            />
        </button>
    );
}
