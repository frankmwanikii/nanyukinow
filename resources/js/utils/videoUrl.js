/**
 * Shared helpers for YouTube / Vimeo / direct video URLs.
 */

export function youtubeId(url) {
    const m = String(url || '').match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
    );
    return m?.[1] || null;
}

export function vimeoId(url) {
    const m = String(url || '').match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return m?.[1] || null;
}

export function isLikelyVideoUrl(value) {
    if (!value || typeof value !== 'string') return false;
    const v = value.trim();
    const isHttp = /^https?:\/\//i.test(v);
    const isLocalStorage = /^\/storage\//i.test(v);
    if (!isHttp && !isLocalStorage) return false;
    return (
        /\.(mp4|webm|ogg|mov)(\?|$)/i.test(v) ||
        (isHttp && /youtube\.com|youtu\.be|vimeo\.com/i.test(v))
    );
}

export function youtubeThumbnail(url, quality = 'hqdefault') {
    const id = youtubeId(url);
    if (!id) return null;
    return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

/**
 * @returns {{ kind: 'iframe'|'video'|null, url: string|null, provider: 'youtube'|'vimeo'|'file'|null }}
 */
export function resolvePlayback(src, { autoplay = false } = {}) {
    if (!src) return { kind: null, url: null, provider: null };

    const yt = youtubeId(src);
    if (yt) {
        const params = new URLSearchParams({ rel: '0' });
        if (autoplay) params.set('autoplay', '1');
        return {
            kind: 'iframe',
            url: `https://www.youtube.com/embed/${yt}?${params.toString()}`,
            provider: 'youtube',
        };
    }

    const vim = vimeoId(src);
    if (vim) {
        const params = new URLSearchParams();
        if (autoplay) params.set('autoplay', '1');
        const qs = params.toString();
        return {
            kind: 'iframe',
            url: `https://player.vimeo.com/video/${vim}${qs ? `?${qs}` : ''}`,
            provider: 'vimeo',
        };
    }

    return { kind: 'video', url: src, provider: 'file' };
}
