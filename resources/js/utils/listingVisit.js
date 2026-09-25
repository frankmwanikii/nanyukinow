/**
 * Build a same-origin URL that opens an external listing website
 * inside Nanyuki Now (keeps visitors on-site).
 */
export function listingVisitUrl(slug, externalUrl = null) {
    if (!slug) return null;
    const base = route('listings.visit', slug);
    if (!externalUrl) return base;

    const trimmed = String(externalUrl).trim();
    if (!trimmed) return base;
    const absolute = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;

    return `${base}?url=${encodeURIComponent(absolute)}`;
}

export function normalizeExternalUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
}
