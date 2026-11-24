import NyukiMessageBubble from '@/Components/site/NyukiMessageBubble';
import { BackMark, ForwardMark, NyukiMark, SendArrowMark } from '@/Components/site/Mark';
import useNyukiChat from '@/hooks/useNyukiChat';
import SiteLayout from '@/Layouts/SiteLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function readVisualViewport() {
    if (typeof window === 'undefined') {
        return { height: null, offsetTop: 0 };
    }

    const vv = window.visualViewport;
    if (vv) {
        return {
            height: Math.round(vv.height),
            offsetTop: Math.round(vv.offsetTop),
        };
    }

    return {
        height: window.innerHeight,
        offsetTop: 0,
    };
}

export default function Index({ prompts = [] }) {
    const { messages, draft, setDraft, busy, ask } = useNyukiChat();
    const [viewport, setViewport] = useState(() => readVisualViewport());
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const focusScrollTimers = useRef([]);

    const scrollChatToStart = (smooth = false) => {
        const list = listRef.current;
        if (!list) {
            return;
        }
        if (smooth) {
            list.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        list.scrollTop = 0;
    };

    const clearFocusScrollTimers = () => {
        focusScrollTimers.current.forEach((id) => window.clearTimeout(id));
        focusScrollTimers.current = [];
    };

    /** Keep the composer above the keyboard while it animates open. */
    const pinAboveKeyboard = () => {
        clearFocusScrollTimers();
        setViewport(readVisualViewport());

        [50, 150, 300, 450, 650].forEach((ms) => {
            const id = window.setTimeout(() => {
                setViewport(readVisualViewport());
            }, ms);
            focusScrollTimers.current.push(id);
        });
    };

    useEffect(() => {
        const update = () => setViewport(readVisualViewport());

        update();
        window.visualViewport?.addEventListener('resize', update);
        window.visualViewport?.addEventListener('scroll', update);
        window.addEventListener('resize', update);

        return () => {
            window.visualViewport?.removeEventListener('resize', update);
            window.visualViewport?.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            clearFocusScrollTimers();
        };
    }, []);

    useEffect(() => {
        scrollChatToStart(false);
    }, [messages]);

    const goBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            return;
        }
        router.visit(route('home'));
    };

    const send = async (text) => {
        await ask(text);
        inputRef.current?.focus();
        pinAboveKeyboard();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        void send(draft);
    };

    const canSend = Boolean(draft.trim()) && !busy;
    const keyboardOpen =
        typeof window !== 'undefined' &&
        viewport.height != null &&
        viewport.height < window.innerHeight * 0.85;

    return (
        <SiteLayout
            title="Nyuki AI"
            hideFooter
            hideNav
            hideBottomNav
            hideNyukiWidget
            lockViewport
            shellClassName="bg-[#ebe6dc] text-earth-dusk"
        >
            <Head title="Nyuki AI" />

            <div
                className="fixed inset-x-0 z-[1200] flex flex-col overflow-hidden bg-[#ebe6dc]"
                style={{
                    top: viewport.offsetTop,
                    height: viewport.height
                        ? `${viewport.height}px`
                        : '100dvh',
                }}
            >
                <header className="relative z-20 flex shrink-0 items-center gap-2 border-b border-white/10 bg-olive-900 px-2 pb-2.5 pt-[max(0.5rem,env(safe-area-inset-top))] text-white shadow-md sm:px-3">
                    <button
                        type="button"
                        onClick={goBack}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10 hover:text-white"
                        aria-label="Back"
                    >
                        <BackMark className="h-5 w-5" />
                    </button>

                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mustard text-earth-dusk ring-2 ring-white/15">
                            <NyukiMark className="h-7 w-7" />
                        </span>
                        <p className="min-w-0 truncate font-display text-[17px] font-semibold leading-tight">
                            Nyuki AI
                        </p>
                    </div>
                </header>

                <div
                    ref={listRef}
                    className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
                >
                    {messages.length === 0 ? (
                        <div className="mx-auto flex min-h-full max-w-lg flex-col justify-end gap-5 pb-2">
                            <div className="text-center">
                                <span className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-olive-900 text-mustard shadow-lift">
                                    <NyukiMark className="h-10 w-10" />
                                </span>
                                <p className="font-display text-xl font-semibold text-olive-950">
                                    Ask Nyuki
                                </p>
                                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-olive-700">
                                    Recommendations, listing details, and
                                    what&apos;s open in Nanyuki, from the live
                                    directory.
                                </p>
                            </div>
                            <ul className="grid gap-2">
                                {prompts.map((prompt) => (
                                    <li key={prompt}>
                                        <button
                                            type="button"
                                            onClick={() => void send(prompt)}
                                            disabled={busy}
                                            className="flex w-full items-center gap-2.5 rounded-full border border-olive-900/12 bg-white/90 px-4 py-3 text-left text-sm font-medium text-olive-800 shadow-sm transition hover:border-olive-900/25 hover:bg-white disabled:opacity-60"
                                        >
                                            <ForwardMark className="h-3.5 w-3.5 shrink-0 text-olive-500" />
                                            <span className="min-w-0 flex-1">
                                                {prompt}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="mx-auto flex max-w-lg flex-col gap-2.5">
                            {messages.map((m, index) => {
                                const isLatestAssistant =
                                    m.role === 'assistant' &&
                                    !m.pending &&
                                    !m.error &&
                                    index ===
                                        messages.findLastIndex(
                                            (row) =>
                                                row.role === 'assistant' &&
                                                !row.pending &&
                                                !row.error,
                                        );

                                return (
                                    <NyukiMessageBubble
                                        key={m.id}
                                        role={m.role}
                                        body={m.body}
                                        citations={m.citations}
                                        followUps={m.followUps}
                                        exploreCta={m.exploreCta}
                                        pending={m.pending}
                                        error={m.error}
                                        errorKind={m.errorKind}
                                        showSuggestions={isLatestAssistant}
                                        onAsk={(text) => void send(text)}
                                        suggestionsDisabled={busy}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                <div
                    className={`shrink-0 border-t border-olive-900/8 bg-[#ebe6dc] px-2.5 pt-2 sm:px-3 ${
                        keyboardOpen
                            ? 'pb-2'
                            : 'pb-[max(0.65rem,env(safe-area-inset-bottom))]'
                    }`}
                >
                    <form
                        onSubmit={onSubmit}
                        className="mx-auto flex max-w-lg items-end gap-2"
                    >
                        <label className="sr-only" htmlFor="nyuki-ask">
                            Message Nyuki
                        </label>
                        <div className="min-w-0 flex-1 rounded-full border border-olive-900/10 bg-white px-4 py-1 shadow-sm">
                            <textarea
                                id="nyuki-ask"
                                ref={inputRef}
                                rows={1}
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onFocus={pinAboveKeyboard}
                                onClick={pinAboveKeyboard}
                                disabled={busy}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        void send(draft);
                                    }
                                }}
                                placeholder="Message Nyuki…"
                                enterKeyHint="send"
                                className="max-h-28 min-h-[2.5rem] w-full resize-none border-0 bg-transparent py-2.5 text-[15px] leading-snug text-olive-950 placeholder:text-olive-400 focus:outline-none focus:ring-0 disabled:opacity-70"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!canSend}
                            aria-label="Send"
                            className={`mb-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${
                                canSend
                                    ? 'bg-mustard text-earth-dusk shadow-sm hover:bg-olive-900 hover:text-white'
                                    : 'bg-olive-900/15 text-olive-500'
                            }`}
                        >
                            <SendArrowMark className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </SiteLayout>
    );
}
