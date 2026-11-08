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

/**
 * Compact card label: first selected subcategory, then +N for the rest.
 * e.g. "Wildlife & Nature +1"
 */
export function subcategoryCardLabel(listing) {
    const items = listingSubcategories(listing);
    if (!items.length) return null;
    if (items.length === 1) return items[0];
    return `${items[0]} +${items.length - 1}`;
}
