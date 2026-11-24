import { listingHref } from '@/data/listings';
import { Link } from '@inertiajs/react';

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function listingIndex(listings = []) {
    return (Array.isArray(listings) ? listings : [])
        .filter((listing) => listing?.title && (listing.slug || listing.href))
        .map((listing) => ({
            title: String(listing.title),
            href: listing.href || listingHref(listing),
            slug: listing.slug,
        }))
        .sort((a, b) => b.title.length - a.title.length);
}

/**
 * Inline renderer: listing links, bold, underline, italic.
 */
function renderInline(text, listings, keyPrefix = 'i') {
    const source = String(text || '');
    if (!source) {
        return null;
    }

    const named = listingIndex(listings);
    const byTitle = new Map(
        named.map((item) => [item.title.toLowerCase(), item]),
    );

    const listingPattern =
        named.length > 0
            ? named.map((item) => escapeRegExp(item.title)).join('|')
            : null;

    const pattern = new RegExp(
        [
            listingPattern ? `(${listingPattern})` : null,
            '(\\*\\*(.+?)\\*\\*)',
            '(__(.+?)__)',
            '(\\*(.+?)\\*)',
        ]
            .filter(Boolean)
            .join('|'),
        'gi',
    );

    const nodes = [];
    let last = 0;
    let match;
    let n = 0;

    while ((match = pattern.exec(source)) !== null) {
        if (match.index > last) {
            nodes.push(
                <span key={`${keyPrefix}-t-${n++}`}>
                    {source.slice(last, match.index)}
                </span>,
            );
        }

        const full = match[0];
        const listingHit = byTitle.get(full.toLowerCase());

        if (listingHit) {
            nodes.push(
                <Link
                    key={`${keyPrefix}-l-${listingHit.slug || n}-${n++}`}
                    href={listingHit.href}
                    prefetch
                    className="font-semibold text-olive-950 underline decoration-mustard/80 underline-offset-[3px] transition hover:text-olive-800 hover:decoration-mustard"
                >
                    {full}
                </Link>,
            );
        } else if (full.startsWith('**') && full.endsWith('**')) {
            const inner = full.slice(2, -2);
            nodes.push(
                <strong
                    key={`${keyPrefix}-b-${n++}`}
                    className="font-semibold text-olive-950"
                >
                    {renderInline(inner, listings, `${keyPrefix}-b${n}`)}
                </strong>,
            );
        } else if (full.startsWith('__') && full.endsWith('__')) {
            const inner = full.slice(2, -2);
            nodes.push(
                <span
                    key={`${keyPrefix}-u-${n++}`}
                    className="underline decoration-olive-400 underline-offset-[3px]"
                >
                    {renderInline(inner, listings, `${keyPrefix}-u${n}`)}
                </span>,
            );
        } else if (full.startsWith('*') && full.endsWith('*')) {
            const inner = full.slice(1, -1);
            nodes.push(
                <em key={`${keyPrefix}-e-${n++}`} className="italic">
                    {renderInline(inner, listings, `${keyPrefix}-e${n}`)}
                </em>,
            );
        } else {
            nodes.push(<span key={`${keyPrefix}-x-${n++}`}>{full}</span>);
        }

        last = match.index + full.length;
    }

    if (last < source.length) {
        nodes.push(
            <span key={`${keyPrefix}-end`}>{source.slice(last)}</span>,
        );
    }

    return nodes;
}

function isBulletLine(line) {
    return /^\s*[-*•]\s+/.test(line);
}

function isNumberedLine(line) {
    return /^\s*\d+[.)]\s+/.test(line);
}

function stripBullet(line) {
    return line.replace(/^\s*[-*•]\s+/, '');
}

function stripNumber(line) {
    return line.replace(/^\s*\d+[.)]\s+/, '');
}

function isHeadingLine(line) {
    return /^\s*#{1,3}\s+\S/.test(line) || /:\s*$/.test(line.trim());
}

/**
 * Render Nyuki assistant markdown: paragraphs, bullets, bold, underline, italic.
 */
export default function NyukiRichText({ text, listings = [] }) {
    const source = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!source) {
        return null;
    }

    const lines = source.split('\n');
    const blocks = [];
    let i = 0;
    let blockKey = 0;

    while (i < lines.length) {
        const line = lines[i];

        if (line.trim() === '') {
            i += 1;
            continue;
        }

        if (isBulletLine(line)) {
            const items = [];
            while (i < lines.length && isBulletLine(lines[i])) {
                items.push(stripBullet(lines[i]));
                i += 1;
            }
            blocks.push(
                <ul
                    key={`ul-${blockKey++}`}
                    className="my-2 list-disc space-y-1.5 pl-5 marker:text-mustard"
                >
                    {items.map((item, idx) => (
                        <li key={`li-${idx}`} className="pl-0.5">
                            {renderInline(item, listings, `ul-${blockKey}-${idx}`)}
                        </li>
                    ))}
                </ul>,
            );
            continue;
        }

        if (isNumberedLine(line)) {
            const items = [];
            while (i < lines.length && isNumberedLine(lines[i])) {
                items.push(stripNumber(lines[i]));
                i += 1;
            }
            blocks.push(
                <ol
                    key={`ol-${blockKey++}`}
                    className="my-2 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-olive-700"
                >
                    {items.map((item, idx) => (
                        <li key={`oi-${idx}`} className="pl-0.5">
                            {renderInline(item, listings, `ol-${blockKey}-${idx}`)}
                        </li>
                    ))}
                </ol>,
            );
            continue;
        }

        // Gather a paragraph until blank / list
        const para = [];
        while (
            i < lines.length &&
            lines[i].trim() !== '' &&
            !isBulletLine(lines[i]) &&
            !isNumberedLine(lines[i])
        ) {
            para.push(lines[i]);
            i += 1;
        }

        const joined = para.join(' ').replace(/\s+/g, ' ').trim();
        const headingish =
            para.length === 1 &&
            (isHeadingLine(para[0].replace(/^#{1,3}\s+/, '')) ||
                /^#{1,3}\s+/.test(para[0]));

        if (headingish) {
            const raw = para[0].replace(/^\s*#{1,3}\s+/, '').trim();
            blocks.push(
                <p
                    key={`h-${blockKey++}`}
                    className="mt-2.5 mb-1 font-display text-[15px] font-semibold text-olive-950 first:mt-0"
                >
                    {renderInline(raw, listings, `h-${blockKey}`)}
                </p>,
            );
        } else {
            blocks.push(
                <p key={`p-${blockKey++}`} className="mb-2 last:mb-0">
                    {renderInline(joined, listings, `p-${blockKey}`)}
                </p>,
            );
        }
    }

    return <div className="nyuki-rich text-[inherit] leading-relaxed">{blocks}</div>;
}
