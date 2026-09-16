import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ListingCard from '@/Components/site/ListingCard';

export default function TrendingCarousel({ items = [] }) {
    const trackRef = useRef(null);
    const pauseUntilRef = useRef(0);
    const [paused, setPaused] = useState(false);
    const loop = [...items, ...items];

    useEffect(() => {
        const track = trackRef.current;
        if (!track || items.length === 0) return undefined;

        let rafId = 0;

        const tick = () => {
            const hold =
                paused || Date.now() < pauseUntilRef.current;
            if (!hold && track) {
                track.scrollLeft += 0.6;
                const half = track.scrollWidth / 2;
                if (track.scrollLeft >= half) {
                    track.scrollLeft -= half;
                }
            }
            rafId = window.requestAnimationFrame(tick);
        };

        rafId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(rafId);
    }, [paused, items.length]);

    const scrollByCard = (direction) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.querySelector('[data-trending-card]');
        const amount = card
            ? card.getBoundingClientRect().width + 20
            : 320;
        pauseUntilRef.current = Date.now() + 900;
        track.scrollBy({ left: direction * amount, behavior: 'smooth' });
    };

    if (items.length === 0) return null;

    return (
        <div
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setPaused(false);
                }
            }}
        >
            <div
                ref={trackRef}
                className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {loop.map((listing, i) => (
                    <div
                        key={`${listing.id}-${i}`}
                        data-trending-card
                        className="w-[min(85vw,22rem)] shrink-0 sm:w-[24rem]"
                        aria-hidden={i >= items.length ? true : undefined}
                    >
                        <ListingCard listing={listing} featured />
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => scrollByCard(-1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                    aria-label="Scroll trending left"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                    type="button"
                    onClick={() => scrollByCard(1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition hover:border-mustard hover:bg-mustard hover:text-olive-950"
                    aria-label="Scroll trending right"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
