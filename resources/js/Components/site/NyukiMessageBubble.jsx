import NyukiBusyPeek from '@/Components/site/NyukiBusyPeek';
import NyukiFollowUps from '@/Components/site/NyukiFollowUps';
import NyukiListingCard from '@/Components/site/NyukiListingCard';
import NyukiRichText from '@/Components/site/NyukiRichText';
import NyukiThinkingStatus from '@/Components/site/NyukiThinkingStatus';

export default function NyukiMessageBubble({
    role,
    body,
    citations = [],
    followUps = [],
    exploreCta = null,
    pending = false,
    error = false,
    errorKind = null,
    compact = false,
    showSuggestions = false,
    onAsk,
    suggestionsDisabled = false,
}) {
    const isUser = role === 'user';
    const cards = !isUser && Array.isArray(citations) ? citations.slice(0, 4) : [];
    const isBusyError = error && errorKind === 'busy';

    let assistantBody = null;
    if (isUser) {
        assistantBody = <p className="whitespace-pre-wrap">{body}</p>;
    } else if (pending) {
        assistantBody = <NyukiThinkingStatus />;
    } else if (isBusyError) {
        assistantBody = <NyukiBusyPeek message={body} />;
    } else {
        assistantBody = <NyukiRichText text={body} listings={citations} />;
    }

    return (
        <div
            className={`flex w-full flex-col gap-2.5 ${
                isUser ? 'items-end' : 'items-start'
            }`}
        >
            <div
                className={`${
                    compact
                        ? 'max-w-[92%] text-[14px]'
                        : 'max-w-[min(92%,22rem)] text-[15px] sm:max-w-[20rem]'
                } rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    isUser
                        ? 'rounded-br-md bg-olive-900 text-white'
                        : error
                          ? 'rounded-bl-md border border-olive-900/15 bg-white text-olive-800'
                          : pending
                            ? 'rounded-bl-md border border-olive-900/8 bg-white/80 text-olive-600'
                            : 'rounded-bl-md border border-olive-900/8 bg-white text-olive-900'
                }`}
            >
                {assistantBody}
            </div>

            {cards.length > 0 ? (
                <ul
                    className={`grid w-full gap-2 ${
                        compact
                            ? 'max-w-[min(100%,22rem)]'
                            : 'max-w-[min(100%,22rem)] sm:max-w-[20rem]'
                    }`}
                >
                    {cards.map((listing) => (
                        <li key={listing.id || listing.slug} className="min-w-0">
                            <NyukiListingCard listing={listing} />
                        </li>
                    ))}
                </ul>
            ) : null}

            {showSuggestions && !pending && !error ? (
                <NyukiFollowUps
                    followUps={followUps}
                    exploreCta={exploreCta}
                    onAsk={onAsk}
                    disabled={suggestionsDisabled}
                    compact={compact}
                />
            ) : null}
        </div>
    );
}
