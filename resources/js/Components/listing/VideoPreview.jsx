import { Play, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import DetailSection from './DetailSection';

export default function VideoPreview({ video }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!video?.poster && !video?.src) return null;

    return (
        <>
            <DetailSection title="Video preview">
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="group relative block w-full overflow-hidden rounded-xl text-left"
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
            </DetailSection>

            {open ? (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-earth-dusk/85 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Video preview"
                    onClick={() => setOpen(false)}
                >
                    <button
                        type="button"
                        className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white transition hover:bg-white hover:text-olive-950"
                        onClick={() => setOpen(false)}
                        aria-label="Close video"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div
                        className="w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-lift"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <video
                            src={video.src}
                            poster={video.poster}
                            controls
                            autoPlay
                            className="aspect-video w-full"
                        >
                            Your browser does not support embedded video.
                        </video>
                    </div>
                </div>
            ) : null}
        </>
    );
}
