/**
 * Normalize listing.subcategory whether it is a legacy string or a list.
 * @param {unknown} listingOrValue
 * @returns {string[]}
 */
export function listingSubcategories(listingOrValue) {
    const raw =
        listingOrValue &&
        typeof listingOrValue === 'object' &&
        !Array.isArray(listingOrValue)
            ? listingOrValue.subcategory
            : listingOrValue;

    if (Array.isArray(raw)) {
        return raw
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean);
    }

    if (typeof raw === 'string' && raw.trim()) {
        return [raw.trim()];
    }

    return [];
}

export function primarySubcategory(listing) {
    return listingSubcategories(listing)[0] || null;
}

export function listingHasSubcategory(listing, subcategory) {
    if (!subcategory) return true;
    return listingSubcategories(listing).includes(subcategory);
}

export function subcategoryLabel(listing, separator = ' · ') {
    const items = listingSubcategories(listing);
    return items.length ? items.join(separator) : null;
}
