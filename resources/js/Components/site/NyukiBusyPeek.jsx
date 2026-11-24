import { NyukiMark } from '@/Components/site/Mark';

/**
 * Playful rate-limit / busy state: Nyuki peeks side to side.
 */
export default function NyukiBusyPeek({
    message = 'Nyuki peeked left, then right, and still needs a second. Try again in a moment.',
}) {
    return (
        <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
                <span
                    className="nn-nyuki-peek inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mustard/90 text-earth-dusk"
                    aria-hidden="true"
                >
                    <NyukiMark className="h-5 w-5" />
                </span>
                <span className="nn-nyuki-peek-dots flex items-center gap-1" aria-hidden="true">
                    <span className="h-1 w-1 rounded-full bg-olive-400" />
                    <span className="h-1 w-1 rounded-full bg-olive-400" />
                    <span className="h-1 w-1 rounded-full bg-olive-400" />
                </span>
            </div>
            <p className="whitespace-pre-wrap text-olive-800">{message}</p>
        </div>
    );
}
