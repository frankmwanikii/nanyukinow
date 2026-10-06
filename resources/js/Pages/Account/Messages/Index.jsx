import AccountLayout from '@/Layouts/AccountLayout';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCheck,
    ExternalLink,
    MessageSquare,
    Search,
    Send,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

function Avatar({ src, initials, size = 'md', tone = 'mustard' }) {
    const box = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-11 w-11 text-sm';
    const tones = {
        mustard: 'bg-mustard/20 text-earth-dusk dark:bg-mustard/25 dark:text-earth-dusk',
        olive: 'bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200',
        mint: 'bg-mint/25 text-olive-800 dark:bg-mint/20 dark:text-olive-200',
    };

    if (src) {
        return (
            <img
                src={src}
                alt=""
                className={`${box} shrink-0 rounded-full object-cover ring-1 ring-olive-100 dark:ring-olive-700`}
            />
        );
    }

    return (
        <span
            className={`flex ${box} shrink-0 items-center justify-center rounded-full font-bold ${tones[tone]}`}
        >
            {initials || 'M'}
        </span>
    );
}

function ChatPane({ conversation, onDelete }) {
    const bottomRef = useRef(null);
    const form = useForm({ body: '' });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.id, conversation?.messages?.length]);

    const submit = (e) => {
        e.preventDefault();
        if (!form.data.body.trim()) return;
        form.post(route('account.messages.reply', conversation.id), {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-olive-100 bg-white px-4 py-3 dark:border-olive-800 dark:bg-olive-900">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href={route('account.messages', { tab: 'chats' })}
                        className="rounded-full p-1.5 text-olive-500 transition hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-800 dark:hover:text-olive-50 lg:hidden"
                        aria-label="Back to list"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <Avatar
                        src={conversation.counterpart?.avatar_url}
                        initials={(conversation.counterpart?.name || 'G')
                            .split(/\s+/)
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                    />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-olive-950 dark:text-olive-50">
                            {conversation.counterpart?.name || 'Conversation'}
                        </p>
                        {conversation.listing ? (
                            <p className="truncate text-xs text-olive-500 dark:text-olive-400">
                                About {conversation.listing.title}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                    {conversation.listing && (
                        <Link
                            href={conversation.listing.url}
                            className="inline-flex items-center gap-1.5 rounded-full border border-olive-200 px-3 py-1.5 text-xs font-semibold text-olive-700 transition hover:border-mustard/50 hover:bg-mustard/10 dark:border-olive-700 dark:text-olive-200 dark:hover:border-mustard/50 dark:hover:bg-mustard/15"
                        >
                            Listing
                            <ExternalLink className="h-3 w-3" />
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => onDelete?.(conversation.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-olive-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        title="Delete chat"
                        aria-label="Delete chat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#f7f4ec_0%,#f3efe6_100%)] px-4 py-4 dark:bg-olive-950">
                {(conversation.messages || []).map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-2 ${message.mine ? 'flex-row-reverse' : ''}`}
                    >
                        {!message.mine && (
                            <Avatar
                                src={message.avatar_url}
                                initials={message.initials}
                                size="sm"
                                tone="olive"
                            />
                        )}
                        <div
                            className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                                message.mine
                                    ? 'rounded-tr-md bg-olive-800 text-white dark:bg-olive-700'
                                    : 'rounded-tl-md bg-white text-olive-900 dark:bg-olive-950 dark:text-olive-100'
                            }`}
                        >
                            {!message.mine && (
                                <p className="mb-1 text-[11px] font-semibold text-olive-500 dark:text-olive-400">
                                    {message.sender_name}
                                </p>
                            )}
                            {/<[a-z][\s\S]*>/i.test(message.body || '') ? (
                                <div
                                    className={`nn-editor text-sm leading-relaxed ${
                                        message.mine ? 'text-white [&_a]:text-mustard' : ''
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: message.body }}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                    {message.body}
                                </p>
                            )}
                            <p
                                className={`mt-1 text-[10px] ${
                                    message.mine ? 'text-white/55' : 'text-olive-400 dark:text-olive-500'
                                }`}
                            >
                                {message.created_ago}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={submit} className="border-t border-olive-100 bg-white px-3 py-3 dark:border-olive-800 dark:bg-olive-900">
                {(conversation.counterpart?.email || conversation.counterpart?.phone) && (
                    <p className="mb-2 px-1 text-[11px] text-olive-500 dark:text-olive-400">
                        {[conversation.counterpart.email, conversation.counterpart.phone]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                )}
                <div className="flex items-end gap-2">
                    <textarea
                        rows={1}
                        value={form.data.body}
                        onChange={(e) => form.setData('body', e.target.value)}
                        placeholder="Type a message…"
                        className="max-h-28 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-olive-200 bg-olive-50/60 px-3.5 py-2.5 text-sm text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:bg-white focus:ring-2 focus:ring-mustard/25 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard dark:focus:bg-olive-950 dark:focus:ring-mustard/25"
                        required
                    />
                    <button
                        type="submit"
                        disabled={form.processing || !form.data.body.trim()}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mustard text-earth-dusk transition hover:bg-olive-800 hover:text-white disabled:opacity-50"
                        aria-label="Send"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                {form.errors.body && (
                    <p className="mt-1.5 text-sm text-rose-600">{form.errors.body}</p>
                )}
            </form>
        </div>
    );
}

function AlertPane({ notification, onDelete }) {
    const sender = notification.sender_name || 'Nanyuki Now';
    const avatar = notification.sender_avatar || '/images/logo.png';

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-olive-100 bg-white px-4 py-3 dark:border-olive-800 dark:bg-olive-900">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href={route('account.messages', { tab: 'alerts' })}
                        className="rounded-full p-1.5 text-olive-500 transition hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-800 dark:hover:text-olive-50 lg:hidden"
                        aria-label="Back to list"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <Avatar
                        src={avatar}
                        initials={sender
                            .split(/\s+/)
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                    />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-olive-950 dark:text-olive-50">{sender}</p>
                        <p className="text-xs text-olive-500 dark:text-olive-400">{notification.created_ago}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onDelete?.(notification.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-olive-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    title="Delete alert"
                    aria-label="Delete alert"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f7f4ec_0%,#f3efe6_100%)] px-4 py-6 dark:bg-olive-950">
                <div className="mx-auto max-w-lg space-y-3">
                    <div className="rounded-2xl rounded-tl-md bg-white p-4 shadow-sm dark:bg-olive-950 dark:shadow-none dark:ring-1 dark:ring-olive-800">
                        <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">{notification.title}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-olive-700 dark:text-olive-200">
                            {notification.body}
                        </p>
                        <p className="mt-2 text-[11px] text-olive-400 dark:text-olive-500">{notification.created_ago}</p>
                    </div>
                    {notification.action_url && (
                        <Link
                            href={notification.action_url}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk transition hover:bg-olive-800 hover:text-white"
                        >
                            {notification.action_label || 'Open'}
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyPane() {
    return (
        <div className="hidden h-full flex-col items-center justify-center bg-[linear-gradient(180deg,#f7f4ec_0%,#f3efe6_100%)] px-6 text-center dark:bg-olive-950 lg:flex">
            <MessageSquare className="h-12 w-12 text-olive-300 dark:text-olive-600" strokeWidth={1.4} />
            <p className="mt-4 font-display text-xl font-semibold text-olive-900 dark:text-olive-100">
                Select a conversation
            </p>
            <p className="mt-2 max-w-sm text-sm text-olive-500 dark:text-olive-400">
                Listing inquiries and account alerts live here — pick one from the left to open it.
            </p>
        </div>
    );
}

export default function Index({
    tab = 'all',
    q = '',
    conversations = [],
    notifications = [],
    activeType = null,
    active = null,
    unread = { chats: 0, alerts: 0, total: 0 },
}) {
    const { flash } = usePage().props;
    const { confirm, dialog } = useConfirm();
    const [query, setQuery] = useState(q || '');
    const hasActive = Boolean(activeType && active);

    useEffect(() => {
        setQuery(q || '');
    }, [q]);

    const feed = useMemo(() => {
        const chats = (conversations || []).map((item) => ({
            kind: 'chat',
            key: `chat-${item.id}`,
            id: item.id,
            title: item.from,
            subtitle: item.title,
            body: item.body,
            created_ago: item.created_ago,
            unread: item.unread,
            avatar_url: item.avatar_url,
            initials: item.initials,
            href: route('account.messages.show', item.id),
            sort: item.created_at || '',
        }));

        const alerts = (notifications || []).map((item) => {
            const sender = item.sender_name || 'Nanyuki Now';
            return {
                kind: 'alert',
                key: `alert-${item.id}`,
                id: item.id,
                title: sender,
                subtitle: item.title,
                body: item.body,
                created_ago: item.created_ago,
                unread: !item.read_at,
                avatar_url: item.sender_avatar || '/images/logo.png',
                initials: sender
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase(),
                href: route('account.messages', { tab: 'alerts', n: item.id, q: query || undefined }),
                sort: item.created_at || '',
            };
        });

        let rows = [];
        if (tab === 'chats') rows = chats;
        else if (tab === 'alerts') rows = alerts;
        else rows = [...chats, ...alerts].sort((a, b) => String(b.sort).localeCompare(String(a.sort)));

        return rows;
    }, [conversations, notifications, tab, query]);

    const switchTab = (next) => {
        router.get(
            route('account.messages'),
            { tab: next, q: query || undefined },
            { preserveState: true, replace: true },
        );
    };

    const runSearch = (e) => {
        e.preventDefault();
        router.get(
            route('account.messages'),
            { tab, q: query || undefined },
            { preserveState: true, replace: true },
        );
    };

    const markAll = () => {
        router.post(route('account.messages.read-all'), {}, { preserveScroll: true });
    };

    const deleteChat = async (id) => {
        const ok = await confirm({
            title: 'Delete this chat?',
            message: 'This conversation and its messages will be removed permanently.',
            confirmLabel: 'Delete chat',
        });
        if (!ok) return;
        router.delete(route('account.messages.destroy', id));
    };

    const deleteAlert = async (id) => {
        const ok = await confirm({
            title: 'Delete this alert?',
            message: 'This alert will be removed from your inbox permanently.',
            confirmLabel: 'Delete alert',
        });
        if (!ok) return;
        router.delete(route('account.messages.alerts.destroy', id));
    };

    const deleteItem = (item, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.kind === 'chat') deleteChat(item.id);
        else deleteAlert(item.id);
    };

    return (
        <AccountLayout title="Messages">
            {dialog}
            <Head title="Messages" />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-olive-600 dark:text-olive-400">
                        {unread.total > 0
                            ? `${unread.total} unread`
                            : 'You’re all caught up'}
                    </p>
                    {unread.total > 0 && (
                        <button
                            type="button"
                            onClick={markAll}
                            className="inline-flex items-center gap-1.5 rounded-full border border-olive-200 bg-white px-3 py-1.5 text-sm font-semibold text-olive-800 transition hover:bg-olive-50 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-200 dark:hover:bg-olive-800"
                        >
                            <CheckCheck className="h-4 w-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-mint/40 bg-mint/20 px-4 py-3 text-sm text-olive-900 dark:border-mint/30 dark:bg-mint/15 dark:text-olive-100">
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-3xl border border-olive-200/80 bg-white shadow-soft dark:border-olive-800 dark:bg-olive-900 dark:shadow-none">
                    <div className="grid h-[min(68vh,720px)] min-h-[28rem] lg:grid-cols-[20rem_minmax(0,1fr)]">
                        {/* Sidebar list */}
                        <aside
                            className={`flex min-h-0 flex-col border-olive-100 dark:border-olive-800 lg:border-r ${
                                hasActive ? 'hidden lg:flex' : 'flex'
                            }`}
                        >
                            <div className="space-y-3 border-b border-olive-100 p-3 dark:border-olive-800">
                                <form onSubmit={runSearch} className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400 dark:text-olive-500" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search messages & alerts"
                                        className="w-full rounded-xl border border-olive-200 bg-olive-50/70 py-2.5 pl-9 pr-3 text-sm text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:bg-white focus:ring-2 focus:ring-mustard/25 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500 dark:focus:border-mustard dark:focus:bg-olive-950 dark:focus:ring-mustard/25"
                                    />
                                </form>

                                <div className="grid grid-cols-3 gap-1 rounded-xl bg-olive-50 p-1 dark:bg-olive-950">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'chats', label: 'Chats' },
                                        { id: 'alerts', label: 'Alerts' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => switchTab(item.id)}
                                            className={`rounded-lg px-2 py-1.5 text-xs font-bold transition ${
                                                tab === item.id
                                                    ? 'bg-white text-olive-950 shadow-sm dark:bg-olive-900 dark:text-olive-50 dark:shadow-none dark:ring-1 dark:ring-olive-700'
                                                    : 'text-olive-600 hover:text-olive-900 dark:text-olive-400 dark:hover:text-olive-100'
                                            }`}
                                        >
                                            {item.label}
                                            {item.id === 'chats' && unread.chats > 0
                                                ? ` · ${unread.chats}`
                                                : ''}
                                            {item.id === 'alerts' && unread.alerts > 0
                                                ? ` · ${unread.alerts}`
                                                : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {feed.length === 0 ? (
                                    <div className="px-5 py-14 text-center">
                                        <MessageSquare className="mx-auto h-9 w-9 text-olive-300 dark:text-olive-600" />
                                        <p className="mt-3 text-sm font-semibold text-olive-800 dark:text-olive-200">
                                            Nothing here yet
                                        </p>
                                        <p className="mt-1 text-xs text-olive-500 dark:text-olive-400">
                                            Listing inquiries and account alerts will appear in this
                                            inbox.
                                        </p>
                                    </div>
                                ) : (
                                    <ul>
                                        {feed.map((item) => {
                                            const selected =
                                                (item.kind === 'chat' &&
                                                    activeType === 'chat' &&
                                                    active?.id === item.id) ||
                                                (item.kind === 'alert' &&
                                                    activeType === 'alert' &&
                                                    active?.id === item.id);

                                            return (
                                                <li key={item.key} className="group relative">
                                                    <Link
                                                        href={item.href}
                                                        className={`flex w-full gap-3 px-3.5 py-3 pr-10 text-left transition hover:bg-olive-50 dark:hover:bg-olive-800 ${
                                                            selected
                                                                ? 'bg-mustard/10 dark:bg-mustard/15'
                                                                : item.unread
                                                                  ? 'bg-mustard/[0.04] dark:bg-mustard/[0.08]'
                                                                  : ''
                                                        }`}
                                                    >
                                                        <Avatar
                                                            src={item.avatar_url}
                                                            initials={item.initials}
                                                        />
                                                        <span className="min-w-0 flex-1">
                                                            <span className="flex items-start justify-between gap-2">
                                                                <span className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                                    {item.title}
                                                                </span>
                                                                <span className="shrink-0 text-[10px] text-olive-400 dark:text-olive-500">
                                                                    {item.created_ago}
                                                                </span>
                                                            </span>
                                                            {item.kind === 'chat' && item.subtitle ? (
                                                                <span className="mt-0.5 block truncate text-[11px] font-medium text-olive-500 dark:text-olive-400">
                                                                    {item.subtitle}
                                                                </span>
                                                            ) : null}
                                                            <span className="mt-0.5 flex items-center gap-2">
                                                                <span className="line-clamp-1 flex-1 text-xs text-olive-600 dark:text-olive-400">
                                                                    {item.kind === 'alert' && item.subtitle
                                                                        ? item.subtitle
                                                                        : item.body}
                                                                </span>
                                                                {item.unread && (
                                                                    <span className="h-2 w-2 shrink-0 rounded-full bg-mustard" />
                                                                )}
                                                            </span>
                                                        </span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => deleteItem(item, e)}
                                                        className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-olive-300 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
                                                        title={item.kind === 'chat' ? 'Delete chat' : 'Delete alert'}
                                                        aria-label={item.kind === 'chat' ? 'Delete chat' : 'Delete alert'}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </aside>

                        {/* Detail pane */}
                        <section
                            className={`min-h-0 ${hasActive ? 'flex' : 'hidden lg:flex'} flex-col`}
                        >
                            {activeType === 'chat' && active ? (
                                <ChatPane conversation={active} onDelete={deleteChat} />
                            ) : activeType === 'alert' && active ? (
                                <AlertPane notification={active} onDelete={deleteAlert} />
                            ) : (
                                <EmptyPane />
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AccountLayout>
    );
}
