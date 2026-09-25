import { Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import DetailSection from './DetailSection';

function youtubeId(url) {
    const m = String(url).match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i,
    );
    return m?.[1] || null;
}

function vimeoId(url) {
    const m = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    return m?.[1] || null;
}

function resolvePlayback(src) {
    if (!src) return { kind: null, url: null };
    const yt = youtubeId(src);
    if (yt) {
        return {
            kind: 'iframe',
            url: `https://www.youtube.com/embed/${yt}?autoplay=1&rel=0`,
        };
    }
    const vim = vimeoId(src);
    if (vim) {
        return {
            kind: 'iframe',
            url: `https://player.vimeo.com/video/${vim}?autoplay=1`,
        };
    }
    return { kind: 'video', url: src };
}

export default function VideoPreview({ video }) {
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);
    const playback = useMemo(
        () => resolvePlayback(video?.src),
        [video?.src],
    );

    useEffect(() => {
        if (!playing || !videoRef.current || playback.kind !== 'video') return;
        const el = videoRef.current;
        el.play().catch(() => {
            // Autoplay may be blocked; controls remain available.
        });
    }, [playing, playback.kind]);

    if (!video?.src && !video?.poster) return null;
    if (!video?.src) return null;

    return (
        <DetailSection title="Video">
            <div className="overflow-hidden rounded-lg bg-earth-dusk">
                {playing && playback.url ? (
                    playback.kind === 'iframe' ? (
                        <iframe
                            src={playback.url}
                            title={video.title || 'Listing video'}
                            className="aspect-video w-full bg-black"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={playback.url}
                            poster={video.poster}
                            controls
                            playsInline
                            className="aspect-video w-full bg-black"
                        >
                            Your browser does not support embedded video.
                        </video>
                    )
                ) : (
                    <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        className="group relative block w-full text-left"
                        aria-label={
                            video.title
                                ? `Play ${video.title}`
                                : 'Play video preview'
                        }
                    >
                        {video.poster ? (
                            <img
                                src={video.poster}
                                alt=""
                                className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                loading="lazy"
                            />
                        ) : (
                            <div className="aspect-video w-full bg-olive-900" />
                        )}
                        <div className="absolute inset-0 bg-earth-dusk/35 transition group-hover:bg-earth-dusk/45" />
                        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mustard text-olive-950 shadow-lift transition group-hover:scale-105">
                                <Play className="h-6 w-6 fill-current pl-0.5" />
                            </span>
                            <span className="text-sm font-semibold">
                                {video.title || 'Watch preview'}
                            </span>
                        </span>
                    </button>
                )}
            </div>
        </DetailSection>
    );
}
