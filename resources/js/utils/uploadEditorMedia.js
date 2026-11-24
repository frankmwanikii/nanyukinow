import axios from 'axios';

/**
 * Upload an inline editor / menu image to the listings media endpoint.
 * Returns a public URL string, or null when the upload fails.
 *
 * @param {File} file
 * @param {string|null} [uploadUrl]
 * @param {{ onProgress?: (percent: number) => void }} [options]
 */
export async function uploadEditorMedia(
    file,
    uploadUrl = null,
    { onProgress } = {},
) {
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
        onProgress?.(0);
        const { data } = await axios.post(endpoint, body, {
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrf,
                'X-Requested-With': 'XMLHttpRequest',
            },
            onUploadProgress: (event) => {
                if (!onProgress) {
                    return;
                }
                if (!event.total) {
                    onProgress(event.loaded > 0 ? 50 : 0);
                    return;
                }
                onProgress(
                    Math.max(
                        0,
                        Math.min(100, Math.round((event.loaded / event.total) * 100)),
                    ),
                );
            },
        });

        onProgress?.(100);

        return typeof data?.url === 'string' && data.url.trim() !== ''
            ? data.url.trim()
            : null;
    } catch {
        return null;
    }
}
