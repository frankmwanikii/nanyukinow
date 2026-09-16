import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DetailSection from './DetailSection';

export default function VideoPreview({ video }) {
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (!playing || !videoRef.current) return;
        const el = videoRef.current;
        el.play().catch(() => {
            // Autoplay may be blocked; controls remain available.
        });
    }, [playing]);

    if (!video?.poster && !video?.src) return null;

    return (
        <DetailSection title="Video">
            <div className="overflow-hidden rounded-lg bg-earth-dusk">
                {playing && video.src ? (
                    <video
                        ref={videoRef}
                        src={video.src}
                        poster={video.poster}
                        controls
                        playsInline
                        className="aspect-video w-full bg-black"
                    >
                        Your browser does not support embedded video.
                    </video>
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
                        <img
                            src={video.poster}
                            alt=""
                            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            loading="lazy"
                        />
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
