/**
 * Format a short place line for listing maps: Town, County, Kenya.
 */

/** Town / area name → Kenyan county (highland & nearby directory coverage). */
const TOWN_COUNTY = {
    nanyuki: 'Laikipia',
    rumuruti: 'Laikipia',
    'dol dol': 'Laikipia',
    doldol: 'Laikipia',
    mukogodo: 'Laikipia',
    sikuani: 'Laikipia',
    naromoru: 'Nyeri',
    'naro moru': 'Nyeri',
    nyeri: 'Nyeri',
    karatina: 'Nyeri',
    othaya: 'Nyeri',
    mweiga: 'Nyeri',
    timau: 'Meru',
    meru: 'Meru',
    maua: 'Meru',
    nkubu: 'Meru',
    isiolo: 'Isiolo',
    nyahururu: 'Nyandarua',
    gilgil: 'Nakuru',
    nakuru: 'Nakuru',
    naivasha: 'Nakuru',
    mtwapa: 'Kilifi',
    kilifi: 'Kilifi',
    malindi: 'Kilifi',
    nairobi: 'Nairobi',
};

function normalizeTownKey(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\s*area\s*$/i, '')
        .trim();
}

/**
 * @param {string} text
 * @returns {string|null} County name without the word "County"
 */
export function countyFromText(text) {
    const raw = String(text || '').trim();
    if (!raw) {
        return null;
    }

    const withCounty = raw.match(
        /\b([A-Za-z][A-Za-z\s'-]+?)\s+County\b/i,
    );
    if (withCounty?.[1]) {
        return withCounty[1].trim();
    }

    // "..., Laikipia, Kenya" style fragments
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
        if (/^kenya$/i.test(part)) {
            continue;
        }
        const key = normalizeTownKey(part);
        if (TOWN_COUNTY[key]) {
            continue;
        }
        // Known county names appearing alone
        const asCounty = Object.values(TOWN_COUNTY).find(
            (c) => normalizeTownKey(c) === key,
        );
        if (asCounty) {
            return asCounty;
        }
    }

    return null;
}

/**
 * @param {string} town
 * @returns {string|null}
 */
export function countyForTown(town) {
    const key = normalizeTownKey(town);
    if (!key) {
        return null;
    }

    if (TOWN_COUNTY[key]) {
        return TOWN_COUNTY[key];
    }

    // Match "Naro Moru / Naromoru" style keys inside longer labels
    for (const [name, county] of Object.entries(TOWN_COUNTY)) {
        if (key === name || key.startsWith(`${name} `) || key.endsWith(` ${name}`)) {
            return county;
        }
    }

    return null;
}

/**
 * @param {{ location?: string|null, city?: string|null, address?: string|null }} listing
 * @param {{ stripPlusCodes?: (address: string) => string }} [helpers]
 * @returns {string|null}
 */
export function formatPlaceLine(listing, helpers = {}) {
    const area = String(listing?.location || listing?.city || '').trim();
    const address = helpers.stripPlusCodes
        ? helpers.stripPlusCodes(listing?.address || '')
        : String(listing?.address || '').trim();

    const town = area || firstTownFromAddress(address);
    if (!town) {
        return null;
    }

    const county =
        countyFromText(address) ||
        countyFromText(area) ||
        countyForTown(town);

    const parts = [titleCasePlace(town)];
    if (county && !townMentionsCounty(town, county)) {
        parts.push(`${titleCasePlace(county)} County`);
    }
    if (!parts.some((p) => /kenya$/i.test(p))) {
        parts.push('Kenya');
    }

    return parts.join(', ');
}

function firstTownFromAddress(address) {
    const parts = String(address || '')
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .filter((p) => !/^kenya$/i.test(p) && !/\bCounty\b/i.test(p));

    return parts[0] || '';
}

function townMentionsCounty(town, county) {
    const t = normalizeTownKey(town);
    const c = normalizeTownKey(county);
    return t === c || t.includes(`${c} county`) || t === `${c} county`;
}

function titleCasePlace(value) {
    return String(value || '')
        .split(/\s+/)
        .map((word) => {
            if (!word) {
                return word;
            }
            if (/^(and|of|the)$/i.test(word)) {
                return word.toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}
