import { field, help, label } from './fieldStyles';
import {
    isLikelyVideoUrl,
    resolvePlayback,
} from '@/utils/videoUrl';
import { Film, Link2 } from '@/Components/site/LucideCompat';
import { useMemo } from 'react';

/**
 * Optional listing video — YouTube, Vimeo, or direct MP4/WebM URL.
 * Shows an embedded player preview (no poster / play-button overlay).
 */
export default function VideoFields({
    videoUrl = '',
    videoTitle = '',
    onChange,
    disabled = false,
}) {
    const url = videoUrl || '';
    const title = videoTitle || '';
    const valid = !url.trim() || isLikelyVideoUrl(url);

    const playback = useMemo(
        () => resolvePlayback(url.trim(), { autoplay: false }),
        [url],
    );

    return (
        <div className="space-y-4 rounded-2xl border border-olive-200 bg-white p-4 sm:p-5 dark:border-olive-800 dark:bg-olive-950/60">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mustard/25 text-olive-900 dark:bg-mustard/15 dark:text-mustard">
                    <Film className="h-5 w-5" />
                </span>
                <div>
                    <h3 className="font-display text-lg font-semibold text-olive-950 dark:text-white">
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
                        disabled={disabled}
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
                    disabled={disabled}
                    disabled={!url.trim()}
                />
                <p className={help}>
                    Optional label for the video section. Leave blank to use the
                    default.
                </p>
            </div>

            {url.trim() && valid && playback.url ? (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                        Preview
                    </p>
                    <div className="overflow-hidden rounded-xl bg-earth-dusk ring-1 ring-olive-200 dark:ring-olive-700">
                        {playback.kind === 'iframe' ? (
                            <iframe
                                src={playback.url}
                                title={title.trim() || 'Listing video preview'}
                                className="aspect-video w-full bg-black"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <video
                                src={playback.url}
                                controls
                                playsInline
                                className="aspect-video w-full bg-black"
                            >
                                Your browser does not support embedded video.
                            </video>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
