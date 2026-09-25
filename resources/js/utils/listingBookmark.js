/**
 * Toggle a listing bookmark for the signed-in member.
 * @returns {Promise<{ bookmarked: boolean, listingId: number }>}
 */
export async function toggleListingBookmark(slug, bookmarked) {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=');
    const token = raw ? decodeURIComponent(raw) : null;

    let url;
    try {
        url = route('listings.bookmark', slug);
    } catch {
        url = `/listings/${encodeURIComponent(slug)}/bookmark`;
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({ bookmarked: Boolean(bookmarked) }),
    });

    if (response.status === 401 || response.status === 419) {
        const err = new Error('Unauthorized');
        err.status = 401;
        throw err;
    }

    if (!response.ok) {
        throw new Error(`Bookmark failed (${response.status})`);
    }

    return response.json();
}
