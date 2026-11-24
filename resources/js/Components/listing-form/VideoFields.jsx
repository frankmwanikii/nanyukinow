import { field, help, label } from './fieldStyles';
import UploadProgressBar from '@/Components/site/UploadProgressBar';
import {
    isLikelyVideoUrl,
    resolvePlayback,
} from '@/utils/videoUrl';
import { uploadEditorVideo } from '@/utils/uploadEditorVideo';
import { Film, Link2, Upload } from '@/Components/site/LucideCompat';
import { useMemo, useRef, useState } from 'react';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = 'video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.ogg,.mov';

/**
 * Optional listing video — YouTube, Vimeo, direct URL, or upload (max 10MB).
 * Shows an embedded player preview (no poster / play-button overlay).
 */
export default function VideoFields({
    videoUrl = '',
    onChange,
    disabled = false,
    uploadUrl = null,
}) {
    const url = videoUrl || '';
    const valid = !url.trim() || isLikelyVideoUrl(url);
    const fileRef = useRef(null);
    const uploadingRef = useRef(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadError, setUploadError] = useState(null);

    const playback = useMemo(
        () => resolvePlayback(url.trim(), { autoplay: false }),
        [url],
    );

    const pickFile = async (file) => {
        if (!file || uploadingRef.current || disabled) {
            return;
        }
        if (!String(file.type || '').startsWith('video/')) {
            setUploadError('Choose an MP4, WebM, or OGG video.');
            return;
        }
        if (file.size > MAX_BYTES) {
            setUploadError('Videos must be 10MB or smaller.');
            return;
        }

        setUploadError(null);
        uploadingRef.current = true;
        setUploading(true);
        setUploadProgress(0);

        try {
            const nextUrl = await uploadEditorVideo(file, uploadUrl, {
                onProgress: setUploadProgress,
            });
            if (!nextUrl) {
                setUploadError(
                    'Could not upload that video. Try an MP4 or WebM under 10MB.',
                );
                return;
            }
            onChange?.({ video_url: nextUrl });
        } catch (err) {
            setUploadError(
                err?.serverMessage ||
                    err?.message ||
                    'Could not upload that video. Try an MP4 or WebM under 10MB.',
            );
        } finally {
            uploadingRef.current = false;
            setUploading(false);
            setUploadProgress(0);
            if (fileRef.current) {
                fileRef.current.value = '';
            }
        }
    };

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
                        Optional. Paste a YouTube, Vimeo, or direct video link,
                        or upload your own clip (MP4 or WebM, max 10MB). Shown
                        on the listing page as a playable preview.
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
                        onChange={(e) => {
                            setUploadError(null);
                            onChange?.({ video_url: e.target.value });
                        }}
                        placeholder="https://www.youtube.com/watch?v=… or .mp4 link"
                        autoComplete="off"
                        disabled={disabled || uploading}
                    />
                </div>
                {!valid ? (
                    <p className="mt-1.5 text-sm text-rose-600">
                        Use a YouTube, Vimeo, or direct .mp4 / .webm link.
                    </p>
                ) : null}
            </div>

            <div>
                <p className={label}>Or upload a video</p>
                <input
                    ref={fileRef}
                    type="file"
                    accept={ACCEPT}
                    className="sr-only"
                    disabled={disabled || uploading}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        void pickFile(file);
                    }}
                />
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        disabled={disabled || uploading}
                        onClick={() => fileRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-olive-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-mustard disabled:cursor-wait disabled:opacity-60 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100"
                    >
                        <Upload className="h-4 w-4" />
                        {uploading
                            ? `Uploading ${uploadProgress}%`
                            : 'Choose video'}
                    </button>
                    {url.trim() ? (
                        <button
                            type="button"
                            disabled={disabled || uploading}
                            onClick={() => {
                                setUploadError(null);
                                onChange?.({ video_url: '' });
                            }}
                            className="inline-flex items-center rounded-sm px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-950/40"
                        >
                            Clear video
                        </button>
                    ) : null}
                </div>
                <p className={`${help} mt-1.5`}>
                    MP4 or WebM works best. Max 10MB.
                </p>
            </div>

            {uploading ? (
                <UploadProgressBar
                    value={uploadProgress}
                    label="Uploading video…"
                />
            ) : null}

            {uploadError ? (
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    {uploadError}
                </p>
            ) : null}

            {url.trim() && valid && playback.url ? (
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                        Preview
                    </p>
                    <div className="overflow-hidden rounded-xl bg-earth-dusk ring-1 ring-olive-200 dark:ring-olive-700">
                        {playback.kind === 'iframe' ? (
                            <iframe
                                src={playback.url}
                                title="Listing video preview"
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
