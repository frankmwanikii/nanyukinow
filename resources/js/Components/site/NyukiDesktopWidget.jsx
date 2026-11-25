import NyukiMessageBubble from '@/Components/site/NyukiMessageBubble';
import {
    CloseMark,
    ForwardMark,
    NyukiMark,
    SendArrowMark,
} from '@/Components/site/Mark';
import useNyukiChat from '@/hooks/useNyukiChat';
import { usePage } from '@inertiajs/react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PROMPTS = [
    'Where should I eat lunch near town?',
    'Quiet places to stay this weekend',
    "What's on this Saturday night?",
    'Tell me about a listing I saved',
];

/**
 * Desktop / laptop Nyuki AI: Intercom-style bottom-right launcher + panel.
 * Hidden below lg (phones use MobileBottomNav → full /nyuki page).
 */
export default function NyukiDesktopWidget() {
    const page = usePage();
    const path =
        typeof page?.url === 'string' ? page.url.split('?')[0] : '/';
    const onNyukiPage = path.startsWith('/nyuki');

    const { messages, draft, setDraft, busy, ask } = useNyukiChat();
    const [open, setOpen] = useState(false);
    const [teaserVisible, setTeaserVisible] = useState(true);

    const panelId = useId();
    const launcherRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

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

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        setTeaserVisible(false);
        const focusTimer = window.setTimeout(() => {
            inputRef.current?.focus();
        }, 40);

        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setOpen(false);
                launcherRef.current?.focus();
            }
        };
        document.addEventListener('keydown', onKey);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    useEffect(() => {
        if (open) {
            scrollChatToStart(false);
        }
    }, [messages, open]);

    if (onNyukiPage || typeof document === 'undefined') {
        return null;
    }

    const send = async (text) => {
        await ask(text);
        inputRef.current?.focus();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        void send(draft);
    };

    const toggle = () => {
        setOpen((prev) => {
            const next = !prev;
            if (!next) {
                window.setTimeout(() => launcherRef.current?.focus(), 0);
            }
            return next;
        });
    };

    const canSend = Boolean(draft.trim()) && !busy;

    const widget = (
        <div
            className="pointer-events-none fixed bottom-20 right-6 z-[1150] hidden flex-col items-end gap-3 lg:flex"
            data-nyuki-desktop-widget
        >
            {open ? (
                <div
                    id={panelId}
                    role="dialog"
                    aria-label="Nyuki AI"
                    className="pointer-events-auto flex h-[min(36rem,70vh)] w-[min(24rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-olive-900/10 bg-[#ebe6dc] shadow-lift animate-[nn-nyuki-panel_280ms_cubic-bezier(0.22,1,0.36,1)]"
                >
                    <header className="flex shrink-0 items-center gap-3 bg-olive-900 px-3 py-2.5 text-white">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mustard text-earth-dusk">
                            <NyukiMark className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-[15px] font-semibold leading-tight">
                                Nyuki AI
                            </p>
                            <p className="truncate text-xs text-white/70">
                                Local guide for Nanyuki
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={toggle}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
                            aria-label="Close Nyuki AI"
                        >
                            <CloseMark className="h-4 w-4" />
                        </button>
                    </header>

                    <div
                        ref={listRef}
                        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3"
                        aria-live="polite"
                    >
                        {messages.length === 0 ? (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <p className="font-display text-lg font-semibold text-olive-950">
                                        Ask Nyuki
                                    </p>
                                    <p className="mt-1.5 text-sm leading-relaxed text-olive-700">
                                        Recommendations, listing details, and
                                        what&apos;s open in town.
                                    </p>
                                </div>
                                <ul className="grid gap-2">
                                    {PROMPTS.map((prompt) => (
                                        <li key={prompt}>
                                            <button
                                                type="button"
                                                onClick={() => void send(prompt)}
                                                disabled={busy}
                                                className="flex w-full items-center gap-2.5 rounded-full border border-olive-900/12 bg-white/90 px-3.5 py-2.5 text-left text-sm font-medium text-olive-800 shadow-sm transition hover:border-olive-900/25 hover:bg-white disabled:opacity-60"
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
                            <div className="flex flex-col gap-2.5">
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
                                            compact
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={onSubmit}
                        className="flex shrink-0 items-end gap-2 border-t border-olive-900/8 bg-[#ebe6dc] px-2.5 py-2.5"
                    >
                        <label className="sr-only" htmlFor="nyuki-desktop-ask">
                            Message Nyuki
                        </label>
                        <div className="min-w-0 flex-1 rounded-full border border-olive-900/10 bg-white px-3.5 py-0.5 shadow-sm">
                            <textarea
                                id="nyuki-desktop-ask"
                                ref={inputRef}
                                rows={1}
                                value={draft}
                                disabled={busy}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        void send(draft);
                                    }
                                }}
                                placeholder="Message Nyuki…"
                                className="max-h-24 min-h-[2.35rem] w-full resize-none border-0 bg-transparent py-2 text-[14px] leading-snug text-olive-950 placeholder:text-olive-400 focus:outline-none focus:ring-0 disabled:opacity-70"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!canSend}
                            aria-label="Send"
                            className={`mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                                canSend
                                    ? 'bg-mustard text-earth-dusk shadow-sm hover:bg-olive-900 hover:text-white'
                                    : 'bg-olive-900/15 text-olive-500'
                            }`}
                        >
                            <SendArrowMark className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            ) : null}

            <div className="pointer-events-auto flex items-center gap-2.5">
                {!open && teaserVisible ? (
                    <button
                        type="button"
                        onClick={toggle}
                        className="max-w-[12rem] rounded-full border border-olive-900/10 bg-white px-3.5 py-2 text-left text-sm font-medium text-olive-900 shadow-lift transition hover:border-olive-900/20"
                    >
                        Ask Nyuki
                    </button>
                ) : null}

                <button
                    ref={launcherRef}
                    type="button"
                    onClick={toggle}
                    aria-label={open ? 'Close Nyuki AI' : 'Ask Nyuki AI'}
                    aria-expanded={open}
                    aria-controls={open ? panelId : undefined}
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-full shadow-lift transition focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard focus-visible:ring-offset-2 ${
                        open
                            ? 'bg-olive-900 text-white hover:bg-olive-800'
                            : 'bg-mustard text-earth-dusk hover:bg-olive-900 hover:text-white'
                    }`}
                >
                    {open ? (
                        <CloseMark className="h-5 w-5" />
                    ) : (
                        <NyukiMark className="h-8 w-8" />
                    )}
                </button>
            </div>
        </div>
    );

    return createPortal(widget, document.body);
}
