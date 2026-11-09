import { BackMark, ForwardMark, NyukiMark, SendArrowMark } from '@/Components/site/Mark';
import SiteLayout from '@/Layouts/SiteLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function MessageBubble({ role, children }) {
    const isUser = role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[min(92%,22rem)] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm sm:max-w-[20rem] ${
                    isUser
                        ? 'rounded-br-md bg-olive-900 text-white'
                        : 'rounded-bl-md border border-olive-900/8 bg-white text-olive-900'
                }`}
            >
                {children}
            </div>
        </div>
    );
}

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
    const [draft, setDraft] = useState('');
    const [messages, setMessages] = useState([]);
    const [viewport, setViewport] = useState(() => readVisualViewport());
    const endRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const focusScrollTimers = useRef([]);

    const scrollChatToEnd = (smooth = false) => {
        const list = listRef.current;
        if (list) {
            list.scrollTop = list.scrollHeight;
        }
        endRef.current?.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'end',
        });
    };

    const clearFocusScrollTimers = () => {
        focusScrollTimers.current.forEach((id) => window.clearTimeout(id));
        focusScrollTimers.current = [];
    };

    /** Keep the chat pinned above the keyboard while it animates open. */
    const pinAboveKeyboard = () => {
        clearFocusScrollTimers();
        setViewport(readVisualViewport());
        scrollChatToEnd(false);

        [50, 150, 300, 450, 650].forEach((ms) => {
            const id = window.setTimeout(() => {
                setViewport(readVisualViewport());
                scrollChatToEnd(ms > 200);
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
        scrollChatToEnd(true);
    }, [messages]);

    useEffect(() => {
        scrollChatToEnd(false);
    }, [viewport.height]);

    const goBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            return;
        }
        router.visit(route('home'));
    };

    const ask = (text) => {
        const q = String(text || '').trim();
        if (!q) {
            return;
        }

        setMessages((prev) => [
            ...prev,
            { id: `u-${Date.now()}`, role: 'user', body: q },
            {
                id: `n-${Date.now()}`,
                role: 'assistant',
                body: "I'm learning the town map now — eats, stays, events, and every listing on Nanyuki Now. Ask again shortly and I'll pull answers from the live directory.",
            },
        ]);
        setDraft('');
        inputRef.current?.focus();
        pinAboveKeyboard();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        ask(draft);
    };

    const canSend = Boolean(draft.trim());
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
                {/* Chat top bar — Meta AI / WhatsApp style */}
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

                {/* Messages — scroll above the keyboard */}
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
                                    what&apos;s open in Nanyuki — from the live
                                    directory.
                                </p>
                            </div>
                            <ul className="grid gap-2">
                                {prompts.map((prompt) => (
                                    <li key={prompt}>
                                        <button
                                            type="button"
                                            onClick={() => ask(prompt)}
                                            className="flex w-full items-center gap-2.5 rounded-full border border-olive-900/12 bg-white/90 px-4 py-3 text-left text-sm font-medium text-olive-800 shadow-sm transition hover:border-olive-900/25 hover:bg-white"
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
                            {messages.map((m) => (
                                <MessageBubble key={m.id} role={m.role}>
                                    {m.body}
                                </MessageBubble>
                            ))}
                            <div ref={endRef} />
                        </div>
                    )}
                </div>

                {/* Composer stays inside the visual viewport (above keyboard) */}
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        ask(draft);
                                    }
                                }}
                                placeholder="Message Nyuki…"
                                enterKeyHint="send"
                                className="max-h-28 min-h-[2.5rem] w-full resize-none border-0 bg-transparent py-2.5 text-[15px] leading-snug text-olive-950 placeholder:text-olive-400 focus:outline-none focus:ring-0"
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
