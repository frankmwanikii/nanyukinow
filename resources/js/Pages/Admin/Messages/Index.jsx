import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminSelect,
    Pagination,
} from '@/Components/Admin/ui';
import RichTextEditor from '@/Components/listing-form/RichTextEditor';
import { Head, router, useForm } from '@inertiajs/react';
import { SendArrowMark } from '@/Components/site/Mark';
import {
    AtSign,
    BookUser,
    Check,
    ChevronDown,
    FileText,
    Inbox,
    MailOpen,
    Newspaper,
    Plus,
    Search,
    Send,
    Star,
    Trash2,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

function visitMail(params = {}) {
    router.get(route('admin.messages.index'), params, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
    });
}

function statusDotClass(status) {
    if (status === 'new') return 'bg-mustard';
    if (status === 'closed' || status === 'failed') return 'bg-rose-500';
    if (status === 'draft') return 'bg-olive-300';
    return 'bg-mint-deep';
}

function looksLikeHtml(value) {
    return /<[a-z][\s\S]*>/i.test(String(value || ''));
}

function MessageBody({ body, className = '' }) {
    if (!body) return null;

    if (looksLikeHtml(body)) {
        return (
            <div
                className={`nn-editor text-sm leading-relaxed text-olive-800 dark:text-olive-100 ${className}`}
                dangerouslySetInnerHTML={{ __html: body }}
            />
        );
    }

    return (
        <p
            className={`whitespace-pre-wrap text-sm leading-relaxed text-olive-800 dark:text-olive-100 ${className}`}
        >
            {body}
        </p>
    );
}

function FolderLink({ active, icon: Icon, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition ${
                active
                    ? 'bg-olive-100 font-semibold text-olive-950 dark:bg-olive-900 dark:text-olive-50'
                    : 'font-medium text-olive-600 hover:bg-olive-50 dark:text-olive-200 dark:hover:bg-olive-800/50'
            }`}
        >
            <Icon
                className={`h-4 w-4 shrink-0 ${
                    active ? 'text-mustard-deep' : 'text-olive-400'
                }`}
            />
            <span className="min-w-0 flex-1">{label}</span>
            {count > 0 ? (
                <span className="shrink-0 text-sm font-semibold tabular-nums text-olive-900 dark:text-olive-100">
                    {count}
                </span>
            ) : null}
        </button>
    );
}

function LabelLink({ active, tone, label, count, onClick }) {
    const dot =
        tone === 'unread'
            ? 'bg-mustard'
            : tone === 'closed'
              ? 'bg-rose-500'
              : 'bg-mint-deep';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-sm transition ${
                active
                    ? 'bg-olive-100 font-semibold text-olive-950 dark:bg-olive-800/60 dark:text-olive-50'
                    : 'font-medium text-olive-600 hover:bg-olive-50 dark:text-olive-200 dark:hover:bg-olive-800/40'
            }`}
        >
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
            <span className="min-w-0 flex-1">{label}</span>
            {count > 0 ? (
                <span className="text-xs font-semibold tabular-nums text-olive-500">
                    {count}
                </span>
            ) : null}
        </button>
    );
}

function ComposeMenu({ open, onClose }) {
    if (!open) return null;

    const items = [
        {
            mode: 'group',
            icon: Users,
            title: 'Message a group',
            sub: 'Members, plans, or newsletter',
        },
        {
            mode: 'contact',
            icon: BookUser,
            title: 'Pick from contacts',
            sub: 'Someone already registered',
        },
        {
            mode: 'email',
            icon: AtSign,
            title: 'Enter email address',
            sub: 'Type a new recipient manually',
        },
    ];

    return (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 border border-olive-200 bg-white p-1.5 dark:border-olive-700 dark:bg-olive-950">
            {items.map(({ mode, icon: Icon, title, sub }) => (
                <button
                    key={mode}
                    type="button"
                    onClick={() => {
                        onClose();
                        visitMail({ folder: 'compose', compose: mode });
                    }}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-olive-50 dark:hover:bg-olive-800/50"
                >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-olive-500" />
                    <span>
                        <strong className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                            {title}
                        </strong>
                        <small className="mt-0.5 block text-xs text-olive-500">
                            {sub}
                        </small>
                    </span>
                </button>
            ))}
        </div>
    );
}

function MailSidebar({ folder, statusFilter, counts }) {
    const [composeOpen, setComposeOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!composeOpen) return undefined;
        const onDoc = (e) => {
            if (!wrapRef.current?.contains(e.target)) setComposeOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [composeOpen]);

    return (
        <aside className="flex flex-col gap-6 border-b border-olive-200 bg-white px-3.5 py-5 dark:border-olive-800 dark:bg-olive-950 lg:border-b-0 lg:border-r">
            <div className="relative px-0.5" ref={wrapRef}>
                <button
                    type="button"
                    onClick={() => setComposeOpen((v) => !v)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:bg-mustard-deep"
                >
                    <Plus className="h-4 w-4" />
                    Compose
                    <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
                <ComposeMenu open={composeOpen} onClose={() => setComposeOpen(false)} />
            </div>

            <nav className="space-y-0.5 px-0.5" aria-label="Folders">
                <FolderLink
                    active={folder === 'inbox' && !statusFilter}
                    icon={MailOpen}
                    label="Inbox"
                    count={counts.inbox_unread}
                    onClick={() => visitMail({ folder: 'inbox' })}
                />
                <FolderLink
                    active={folder === 'starred'}
                    icon={Star}
                    label="Starred"
                    count={counts.starred}
                    onClick={() => visitMail({ folder: 'starred' })}
                />
                <FolderLink
                    active={folder === 'sent'}
                    icon={Send}
                    label="Sent"
                    count={counts.sent}
                    onClick={() => visitMail({ folder: 'sent' })}
                />
                <FolderLink
                    active={folder === 'drafts'}
                    icon={FileText}
                    label="Drafts"
                    count={counts.drafts}
                    onClick={() => visitMail({ folder: 'drafts' })}
                />
                <FolderLink
                    active={folder === 'newsletter'}
                    icon={Newspaper}
                    label="Newsletter"
                    count={0}
                    onClick={() => visitMail({ folder: 'newsletter' })}
                />
                <FolderLink
                    active={folder === 'subscribers'}
                    icon={BookUser}
                    label="Subscribers"
                    count={counts.subscribers}
                    onClick={() => visitMail({ folder: 'subscribers' })}
                />
            </nav>

            <div className="border-t border-olive-200 px-0.5 pt-4 dark:border-olive-800">
                <p className="mb-2 px-2.5 text-xs font-medium text-olive-500">
                    Labels
                </p>
                <div className="space-y-0.5">
                    <LabelLink
                        active={statusFilter === 'new'}
                        tone="unread"
                        label="Unread"
                        count={counts.inbox_unread}
                        onClick={() => visitMail({ folder: 'inbox', status: 'new' })}
                    />
                    <LabelLink
                        active={statusFilter === 'read'}
                        tone="read"
                        label="Read"
                        count={counts.label_read}
                        onClick={() => visitMail({ folder: 'inbox', status: 'read' })}
                    />
                    <LabelLink
                        active={statusFilter === 'closed'}
                        tone="closed"
                        label="Closed"
                        count={counts.label_closed}
                        onClick={() => visitMail({ folder: 'inbox', status: 'closed' })}
                    />
                </div>
            </div>
        </aside>
    );
}

function ComposePanel({ composeMode, counts, contacts, prefillTo = '' }) {
    const prefillContact = contacts.find(
        (c) => c.email?.toLowerCase() === prefillTo.toLowerCase(),
    );

    const form = useForm({
        intent: 'send',
        mode: composeMode === 'group' ? 'audience' : 'single',
        channel: 'email',
        audience: 'all_members',
        to_email: prefillTo || '',
        to_name: prefillContact?.name || '',
        subject: '',
        body: '',
    });

    useEffect(() => {
        form.setData({
            ...form.data,
            mode: composeMode === 'group' ? 'audience' : 'single',
            to_email: prefillTo || form.data.to_email,
            to_name: prefillContact?.name || form.data.to_name,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [composeMode, prefillTo]);

    const titles = {
        group: ['Message a group', 'Send to members, plan tiers, or newsletter subscribers'],
        contact: ['Pick from contacts', 'Choose someone already registered'],
        email: ['Enter email address', 'Send to a new address manually'],
    };
    const [title, sub] = titles[composeMode] || titles.group;

    const submit = (intent) => {
        form.transform((data) => ({ ...data, intent }));
        form.post(route('admin.messages.store'), {
            preserveScroll: true,
            onFinish: () => form.transform((data) => data),
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-olive-100 px-6 py-5 dark:border-olive-800">
                <p className="text-sm text-olive-500">
                    <button
                        type="button"
                        className="font-medium text-olive-800 underline-offset-2 hover:underline dark:text-olive-200"
                        onClick={() => visitMail({ folder: 'inbox' })}
                    >
                        Mail
                    </button>{' '}
                    / Compose
                </p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-olive-950 dark:text-olive-50">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-olive-500">{sub}</p>
            </div>

            <form
                className="flex min-h-0 flex-1 flex-col"
                onSubmit={(e) => {
                    e.preventDefault();
                    submit('send');
                }}
            >
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                    {composeMode === 'group' ? (
                        <div>
                            <p className="mb-2 text-sm font-semibold text-olive-900 dark:text-olive-100">
                                Send to
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {[
                                    {
                                        value: 'all_members',
                                        label: 'All members',
                                        hint: `${counts.members} registered`,
                                    },
                                    {
                                        value: 'newsletter',
                                        label: 'Newsletter',
                                        hint: `${counts.newsletter} subscribers`,
                                    },
                                    {
                                        value: 'plan_free',
                                        label: 'Free plan',
                                        hint: `${counts.free} people`,
                                    },
                                    {
                                        value: 'plan_featured',
                                        label: 'Standard plan',
                                        hint: `${counts.featured} people`,
                                    },
                                    {
                                        value: 'plan_premium',
                                        label: 'Premium plan',
                                        hint: `${counts.premium} people`,
                                    },
                                ].map((opt) => {
                                    const active = form.data.audience === opt.value;
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => form.setData('audience', opt.value)}
                                            className={`rounded-xl border px-4 py-3 text-left transition ${
                                                active
                                                    ? 'border-mustard bg-mustard/15 dark:border-mustard dark:bg-mustard/15'
                                                    : 'border-olive-200 bg-white hover:border-olive-300 dark:border-olive-700 dark:bg-olive-900/40'
                                            }`}
                                        >
                                            <strong className="block text-sm text-olive-950 dark:text-olive-50">
                                                {opt.label}
                                            </strong>
                                            <span className="mt-0.5 block text-xs text-olive-500">
                                                {opt.hint}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {composeMode === 'contact' ? (
                        <AdminSelect
                            label="Recipient"
                            value={form.data.to_email}
                            onChange={(e) => {
                                const email = e.target.value;
                                const match = contacts.find((c) => c.email === email);
                                form.setData({
                                    ...form.data,
                                    to_email: email,
                                    to_name: match?.name || '',
                                });
                            }}
                            error={form.errors.to_email}
                        >
                            <option value="">Search contacts…</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.email}>
                                    {c.name} — {c.email}
                                </option>
                            ))}
                        </AdminSelect>
                    ) : null}

                    {composeMode === 'email' ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <AdminInput
                                label="To email"
                                type="email"
                                value={form.data.to_email}
                                onChange={(e) => form.setData('to_email', e.target.value)}
                                error={form.errors.to_email}
                                placeholder="name@example.com"
                            />
                            <AdminInput
                                label="Name (optional)"
                                value={form.data.to_name}
                                onChange={(e) => form.setData('to_name', e.target.value)}
                            />
                        </div>
                    ) : null}

                    <AdminInput
                        label="Subject"
                        value={form.data.subject}
                        onChange={(e) => form.setData('subject', e.target.value)}
                        error={form.errors.subject}
                        placeholder="Payment received — …"
                    />
                    <RichTextEditor
                        id="admin-compose-message"
                        label="Message"
                        value={form.data.body}
                        onChange={(html) => form.setData('body', html)}
                        error={form.errors.body}
                        placeholder="Write your email…"
                        allowImages={false}
                        compact
                    />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-olive-100 px-6 py-4 dark:border-olive-800">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        disabled={form.processing}
                        onClick={() => submit('draft')}
                    >
                        Save draft
                    </AdminButton>
                    <AdminButton type="submit" disabled={form.processing}>
                        {form.processing ? 'Sending…' : 'Send'}
                        {!form.processing ? (
                            <SendArrowMark className="h-4 w-4" />
                        ) : null}
                    </AdminButton>
                </div>
            </form>
        </div>
    );
}

function MessageDetail({ selected, folder }) {
    if (!selected) return null;

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-olive-100 px-6 py-4 dark:border-olive-800">
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            visitMail({
                                folder: selected.folder || folder,
                                ...(folder === 'inbox' ? {} : {}),
                            })
                        }
                        className="text-sm font-medium text-olive-500 hover:text-olive-900"
                    >
                        ← Back
                    </button>
                    <h1 className="mt-2 text-xl font-bold text-olive-950 dark:text-olive-50">
                        {selected.subject}
                    </h1>
                    <p className="mt-1 text-sm text-olive-500">
                        {selected.name}
                        {selected.email ? ` · ${selected.email}` : ''}
                    </p>
                </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
                {selected.messages ? (
                    selected.messages.map((message) => (
                        <div
                            key={message.id}
                            className="border border-olive-200 bg-white px-4 py-3 dark:border-olive-800 dark:bg-olive-900/40"
                        >
                            <div className="flex justify-between gap-3">
                                <p className="text-sm font-bold text-olive-950 dark:text-olive-50">
                                    {message.from}
                                </p>
                                <span className="text-xs text-olive-400">
                                    {message.created_at
                                        ? new Date(message.created_at).toLocaleString()
                                        : ''}
                                </span>
                            </div>
                            {(message.email || message.phone) && (
                                <p className="mt-0.5 text-xs text-olive-500">
                                    {[message.email, message.phone].filter(Boolean).join(' · ')}
                                </p>
                            )}
                            <MessageBody body={message.body} className="mt-2" />
                        </div>
                    ))
                ) : (
                    <div className="border border-olive-200 bg-white px-4 py-4 dark:border-olive-800 dark:bg-olive-900/40">
                        <MessageBody body={selected.body} />
                    </div>
                )}
            </div>
        </div>
    );
}

function MailList({
    folder,
    statusFilter,
    q,
    title,
    subtitle,
    messages,
    selectedId,
}) {
    const rows = messages?.data || [];
    const [selected, setSelected] = useState([]);
    const [query, setQuery] = useState(q || '');
    const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
    const allChecked = allIds.length > 0 && allIds.every((id) => selected.includes(id));

    useEffect(() => {
        setSelected([]);
    }, [folder, statusFilter, q]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (query === (q || '')) return;
            visitMail({
                folder,
                status: statusFilter || undefined,
                q: query || undefined,
            });
        }, 350);
        return () => clearTimeout(t);
    }, [query, folder, statusFilter, q]);

    const toggleAll = () => {
        setSelected(allChecked ? [] : allIds);
    };

    const toggleOne = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const starRow = (row, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!['inbox', 'sent'].includes(row.folder)) return;
        router.post(
            route('admin.messages.star'),
            { folder: row.folder, id: row.id },
            { preserveScroll: true, preserveState: true },
        );
    };

    const bulkDelete = () => {
        if (!selected.length) return;
        router.post(
            route('admin.messages.destroy'),
            { folder: folder === 'starred' ? 'inbox' : folder, ids: selected },
            { preserveScroll: true },
        );
    };

    const bulkLabel = (status) => {
        if (!selected.length) return;
        router.post(
            route('admin.messages.label'),
            { ids: selected, status },
            { preserveScroll: true },
        );
    };

    const openRow = (row) => {
        if (folder === 'subscribers') {
            visitMail({
                folder: 'compose',
                compose: 'email',
                to: row.email,
            });
            return;
        }
        if (folder === 'drafts') {
            visitMail({ folder: 'compose', compose: 'group' });
            return;
        }
        visitMail({
            folder: row.folder === 'sent' ? 'sent' : folder === 'starred' ? 'starred' : 'inbox',
            id: row.id,
            status: statusFilter || undefined,
            q: q || undefined,
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="px-6 pt-5 pb-3">
                <h1 className="text-2xl font-bold tracking-tight text-olive-950 dark:text-olive-50">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-olive-500">{subtitle}</p>
            </div>

            <div className="flex items-center gap-3 border-b border-olive-100 px-6 py-3 dark:border-olive-800">
                <label className="inline-flex h-8 w-8 cursor-pointer items-center justify-center">
                    <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={toggleAll}
                        className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard"
                        aria-label="Select all"
                    />
                </label>

                {selected.length > 0 ? (
                    <div className="flex flex-1 items-center gap-2">
                        <span className="text-sm font-medium text-olive-600">
                            {selected.length} selected
                        </span>
                        {folder === 'inbox' || statusFilter ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => bulkLabel('read')}
                                    className="rounded-lg p-2 text-olive-500 hover:bg-olive-50"
                                    title="Mark as read"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => bulkLabel('new')}
                                    className="rounded-lg px-2 py-1 text-xs font-semibold text-mustard-deep hover:bg-mustard/15"
                                >
                                    Unread
                                </button>
                                <button
                                    type="button"
                                    onClick={() => bulkLabel('closed')}
                                    className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                >
                                    Closed
                                </button>
                            </>
                        ) : null}
                        {['inbox', 'sent', 'drafts'].includes(folder) ? (
                            <button
                                type="button"
                                onClick={bulkDelete}
                                className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setSelected([])}
                            className="rounded-lg p-2 text-olive-400 hover:bg-olive-50"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <form
                        className="relative flex-1"
                        onSubmit={(e) => {
                            e.preventDefault();
                            visitMail({
                                folder,
                                status: statusFilter || undefined,
                                q: query || undefined,
                            });
                        }}
                    >
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -tranolive-y-1/2 text-olive-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search emails…"
                            className="w-full rounded-md border border-olive-200 bg-white py-2 pl-10 pr-4 text-sm text-olive-950 outline-none placeholder:text-olive-400 focus:border-olive-600 focus:ring-1 focus:ring-olive-600/30 dark:border-olive-700 dark:bg-olive-900/40 dark:text-olive-50"
                        />
                    </form>
                )}
            </div>

            {rows.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                    <Inbox className="mb-3 h-8 w-8 text-olive-300" />
                    <p className="max-w-md text-sm text-olive-500">
                        {folder === 'sent'
                            ? 'No sent emails logged yet. Compose a message to get started.'
                            : folder === 'drafts'
                              ? 'No drafts saved yet.'
                              : folder === 'starred'
                                ? 'No starred messages yet.'
                                : folder === 'subscribers'
                                  ? 'No newsletter subscribers yet.'
                                  : statusFilter === 'new'
                                    ? 'No unread messages. All caught up.'
                                    : 'No messages here yet.'}
                    </p>
                </div>
            ) : (
                <>
                    <ul className="min-h-0 flex-1 overflow-y-auto">
                        {rows.map((row) => {
                            const isSelected = selected.includes(row.id);
                            const isOpen = selectedId === row.id;
                            return (
                                <li
                                    key={`${row.folder}-${row.id}`}
                                    className="border-b border-olive-100 dark:border-olive-800"
                                >
                                    <div
                                        className={`grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 transition ${
                                            isSelected || isOpen
                                                ? 'bg-mustard/15 dark:bg-mustard/15'
                                                : row.unread
                                                  ? 'bg-mustard/[0.04] hover:bg-mustard/[0.08]'
                                                  : 'hover:bg-olive-50 dark:hover:bg-olive-800/30'
                                        }`}
                                    >
                                        <label
                                            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleOne(row.id)}
                                                className="h-4 w-4 rounded border-olive-300 text-mustard focus:ring-mustard"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={(e) => starRow(row, e)}
                                            className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                                                row.starred
                                                    ? 'text-mustard'
                                                    : 'text-olive-300 hover:text-mustard'
                                            }`}
                                            aria-label={row.starred ? 'Unstar' : 'Star'}
                                        >
                                            <Star
                                                className="h-4 w-4"
                                                fill={row.starred ? 'currentColor' : 'none'}
                                            />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => openRow(row)}
                                            className="flex min-w-0 items-center gap-2 text-left"
                                        >
                                            <span
                                                className={`shrink-0 text-sm ${
                                                    row.unread
                                                        ? 'font-bold text-olive-950 dark:text-olive-50'
                                                        : 'font-semibold text-olive-900 dark:text-olive-100'
                                                }`}
                                            >
                                                {row.name}
                                            </span>
                                            <span
                                                className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(row.status)}`}
                                            />
                                            <span className="min-w-0 truncate text-sm">
                                                <span
                                                    className={
                                                        row.unread
                                                            ? 'font-bold text-olive-950 dark:text-olive-50'
                                                            : 'font-semibold text-olive-900 dark:text-olive-100'
                                                    }
                                                >
                                                    {row.subject}
                                                </span>
                                                {row.snippet ? (
                                                    <span className="font-normal text-olive-500">
                                                        {' '}
                                                        — {row.snippet}
                                                    </span>
                                                ) : null}
                                            </span>
                                        </button>
                                        <time className="shrink-0 text-[0.78rem] text-olive-500">
                                            {row.date_short}
                                        </time>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="border-t border-olive-100 px-4 py-2 dark:border-olive-800">
                        <Pagination links={messages.links} meta={messages.meta || messages} />
                    </div>
                </>
            )}
        </div>
    );
}

export default function Index({
    folder,
    statusFilter,
    composeMode,
    q,
    counts,
    messages,
    selected,
    contacts,
    prefillTo = '',
}) {
    const titles = {
        inbox: ['Inbox', 'Website messages and listing inquiries'],
        starred: ['Starred', 'Messages you have starred'],
        sent: ['Sent', 'Emails logged from the admin'],
        drafts: ['Drafts', 'Saved broadcasts'],
        newsletter: ['Newsletter', 'Campaigns sent to newsletter subscribers'],
        subscribers: ['Subscribers', 'People on the public newsletter list'],
        compose: ['Compose', ''],
    };

    if (statusFilter === 'new') {
        titles.inbox = ['Unread', 'Messages labeled as unread'];
    } else if (statusFilter === 'read') {
        titles.inbox = ['Read', 'Messages labeled as read'];
    } else if (statusFilter === 'closed') {
        titles.inbox = ['Closed', 'Messages labeled as closed'];
    }

    const [title, subtitle] = titles[folder] || titles.inbox;
    const showCompose = folder === 'compose';
    const showDetail = Boolean(selected) && !showCompose;

    return (
        <AdminLayout>
            <Head title="Messages" />

            <div className="overflow-hidden border border-olive-200 bg-white dark:border-olive-800 dark:bg-olive-950">
                <div className="grid min-h-[min(70vh,44rem)] lg:grid-cols-[248px_minmax(0,1fr)]">
                    <MailSidebar
                        folder={folder}
                        statusFilter={statusFilter}
                        counts={counts}
                    />
                    <div className="min-w-0 bg-white dark:bg-olive-950">
                        {showCompose ? (
                            <ComposePanel
                                composeMode={composeMode}
                                counts={counts}
                                contacts={contacts}
                                prefillTo={prefillTo}
                            />
                        ) : showDetail ? (
                            <MessageDetail selected={selected} folder={folder} />
                        ) : (
                            <MailList
                                folder={folder}
                                statusFilter={statusFilter}
                                q={q}
                                title={title}
                                subtitle={subtitle}
                                messages={messages}
                                selectedId={selected?.id}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
