/**
 * Upload an inline editor / menu image to the listings media endpoint.
 * Returns a public URL string, or null when the upload fails.
 */
export async function uploadEditorMedia(file, uploadUrl = null) {
    if (!file) {
        return null;
    }

    const csrf =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';

    let endpoint = uploadUrl;
    if (!endpoint) {
        try {
            endpoint = route('account.listings.editor-media');
        } catch {
            endpoint = '/account/listings/editor-media';
        }
    }

    const body = new FormData();
    body.append('image', file);

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            body,
        });

        if (!res.ok) {
            return null;
        }

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return null;
        }

        const json = await res.json();
        return typeof json?.url === 'string' && json.url.trim() !== ''
            ? json.url.trim()
            : null;
    } catch {
        return null;
    }
}
