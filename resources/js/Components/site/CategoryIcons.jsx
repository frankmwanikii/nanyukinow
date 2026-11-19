/**
 * Homepage category icons — thin wrappers over Mark (IconScout Unicons).
 */
import {
    EatMark,
    StayMark,
    ExploreMark,
    ServicesMark,
    ShopMark,
    PropertyMark,
    EventMark,
    MoreMark,
} from './Mark';

export function EatCategoryIcon({ className = 'h-7 w-7' }) {
    return <EatMark className={className} />;
}

export function StayCategoryIcon({ className = 'h-7 w-7' }) {
    return <StayMark className={className} />;
}

export function ExploreCategoryIcon({ className = 'h-7 w-7' }) {
    return <ExploreMark className={className} />;
}

export function ServicesCategoryIcon({ className = 'h-7 w-7' }) {
    return <ServicesMark className={className} />;
}

export function ShopCategoryIcon({ className = 'h-7 w-7' }) {
    return <ShopMark className={className} />;
}

export function PropertyCategoryIcon({ className = 'h-7 w-7' }) {
    return <PropertyMark className={className} />;
}

export function EventCategoryIcon({ className = 'h-7 w-7' }) {
    return <EventMark className={className} />;
}

export function MoreCategoryIcon({ className = 'h-7 w-7' }) {
    return <MoreMark className={className} />;
}
