import { useMemo } from 'react';
import DetailSection from './DetailSection';
import { resolvePlayback } from '@/utils/videoUrl';

/**
 * Listing video — embeds YouTube/Vimeo or a native player with no poster overlay.
 */
export default function VideoPreview({ video }) {
    const playback = useMemo(
        () => resolvePlayback(video?.src, { autoplay: false }),
        [video?.src],
    );

    if (!video?.src || !playback.url) return null;

    return (
        <DetailSection title="Video">
            <div className="overflow-hidden rounded-lg bg-earth-dusk">
                {playback.kind === 'iframe' ? (
                    <iframe
                        src={playback.url}
                        title={video.title || 'Listing video'}
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
        </DetailSection>
    );
}
