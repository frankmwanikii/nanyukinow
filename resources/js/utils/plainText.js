/**
 * Shared helpers for turning rich-text content into plain text.
 */

const ENTITY_VALUES = {
    nbsp: ' ',
    amp: '&',
    quot: '"',
    apos: "'",
    lt: '<',
    gt: '>',
};

export function plainText(value) {
    if (value == null) return '';

    const text = String(value).replace(
        /&(nbsp|amp|quot|apos|lt|gt|#39);/gi,
        (entity, name) => {
            const key = name.toLowerCase();
            if (key === '#39') return "'";
            return ENTITY_VALUES[key] ?? entity;
        },
    );

    return text
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
