import { field, help, label } from './fieldStyles';
import { Film, Link2 } from 'lucide-react';

function isLikelyVideoUrl(value) {
    if (!value || typeof value !== 'string') return false;
    const v = value.trim();
    if (!/^https?:\/\//i.test(v)) return false;
    return (
        /\.(mp4|webm|ogg)(\?|$)/i.test(v) ||
        /youtube\.com|youtu\.be|vimeo\.com/i.test(v)
    );
}

/**
 * Optional listing video — YouTube, Vimeo, or direct MP4/WebM URL.
 */
export default function VideoFields({
    videoUrl = '',
    videoTitle = '',
    onChange,
    coverPreview = null,
}) {
    const url = videoUrl || '';
    const title = videoTitle || '';
    const valid = !url.trim() || isLikelyVideoUrl(url);

    return (
        <div className="space-y-4 rounded-2xl border border-olive-200 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mustard/25 text-olive-900">
                    <Film className="h-5 w-5" />
                </span>
                <div>
                    <h3 className="font-display text-lg font-semibold text-olive-950">
                        Video
                    </h3>
                    <p className={help}>
                        Optional. Paste a YouTube, Vimeo, or direct video link.
                        Shown on the listing page as a playable preview.
                    </p>
                </div>
            </div>

            <div>
                <label className={label} htmlFor="video_url">
                    Video URL
                </label>
                <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400" />
                    <input
                        id="video_url"
                        type="url"
                        className={`${field} pl-10`}
                        value={url}
                        onChange={(e) =>
                            onChange?.({ video_url: e.target.value })
                        }
                        placeholder="https://www.youtube.com/watch?v=… or .mp4 link"
                        autoComplete="off"
                    />
                </div>
                {!valid ? (
                    <p className="mt-1.5 text-sm text-rose-600">
                        Use a YouTube, Vimeo, or direct .mp4 / .webm link.
                    </p>
                ) : null}
            </div>

            <div>
                <label className={label} htmlFor="video_title">
                    Preview title
                </label>
                <input
                    id="video_title"
                    className={field}
                    value={title}
                    onChange={(e) =>
                        onChange?.({ video_title: e.target.value })
                    }
                    placeholder="e.g. Preview · Frayo"
                    disabled={!url.trim()}
                />
                <p className={help}>
                    Shown under the play button. Leave blank to use “Preview ·
                    listing name”.
                </p>
            </div>

            {url.trim() && valid ? (
                <div className="overflow-hidden rounded-xl bg-earth-dusk">
                    <div className="relative aspect-video">
                        {coverPreview ? (
                            <img
                                src={coverPreview}
                                alt=""
                                className="h-full w-full object-cover opacity-80"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-olive-900 text-sm text-olive-200">
                                Cover image used as poster when available
                            </div>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-earth-dusk/40 text-white">
                            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mustard text-olive-950">
                                ▶
                            </span>
                            <span className="text-sm font-semibold">
                                {title.trim() || 'Preview'}
                            </span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
