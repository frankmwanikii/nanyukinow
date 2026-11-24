function csrfToken() {
    const raw = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')
        .slice(1)
        .join('=');
    return raw ? decodeURIComponent(raw) : null;
}

/**
 * @param {{ message: string, history?: Array<{ role: string, content: string }> }} payload
 * @returns {Promise<{
 *   reply: string,
 *   citations: Array<{ title: string, slug: string, href: string, category?: string|null }>,
 *   followUps: Array<{ label: string }>,
 *   exploreCta: { label: string, href: string }|null,
 *   model?: string
 * }>}
 */
export async function askNyuki({ message, history = [] }) {
    const token = csrfToken();
    const response = await fetch(route('nyuki.chat'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            message,
            history,
        }),
    });

    let data = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const err = new Error(
            data?.message ||
                'Nyuki could not answer right now. Try again in a moment.',
        );
        err.status = response.status;
        err.code = data?.code || (response.status === 429 ? 'busy' : null);
        throw err;
    }

    return {
        reply: String(data?.reply || '').trim(),
        citations: Array.isArray(data?.citations) ? data.citations : [],
        followUps: Array.isArray(data?.follow_ups) ? data.follow_ups : [],
        exploreCta: data?.explore_cta?.href ? data.explore_cta : null,
        model: data?.model || null,
    };
}
