import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    EmptyState,
    Pagination,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Inbox,
    Mail,
    MessageSquareText,
    PenSquare,
    Send,
    Smartphone,
    Users,
    Newspaper,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

function formatWhen(iso) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    } catch {
        return '—';
    }
}

function FolderButton({ active, icon: Icon, label, count, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                active
                    ? 'bg-olive-900 text-white shadow-sm dark:bg-mustard dark:text-olive-950'
                    : 'text-olive-700 hover:bg-olive-100/80 dark:text-olive-200 dark:hover:bg-olive-800/60'
            }`}
        >
            <Icon className="h-4 w-4 shrink-0 opacity-90" />
            <span className="flex-1">{label}</span>
            {typeof count === 'number' ? (
                <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                        active
                            ? 'bg-white/15 text-white dark:bg-olive-950/15 dark:text-olive-950'
                            : 'bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-100'
                    }`}
                >
                    {count}
                </span>
            ) : null}
        </button>
    );
}

function StatChip({ label, value }) {
    return (
        <div className="rounded-xl border border-olive-200/80 bg-white/70 px-3 py-2 dark:border-olive-800 dark:bg-olive-900/40">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-olive-500 dark:text-olive-400">
                {label}
            </p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-olive-950 dark:text-olive-50">
                {value}
            </p>
        </div>
    );
}

function ComposePanel({ counts }) {
    const form = useForm({
        channel: 'email',
        audience: 'all_members',
        subject: '',
        body: '',
    });

    const audienceHint = {
        all_members: counts.members,
        newsletter: counts.newsletter,
        plan_free: counts.free,
        plan_featured: counts.featured,
        plan_premium: counts.premium,
    }[form.data.audience];

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.messages.store'), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="flex h-full min-h-0 flex-col">
            <div className="border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-mustard" />
                    <h2 className="text-base font-bold text-olive-950 dark:text-olive-50">
                        New broadcast
                    </h2>
                </div>
                <p className="mt-1 text-sm text-olive-600 dark:text-olive-300">
                    Email members and newsletter subscribers. SMS is ready in the UI —
                    connect a text provider to deliver.
                </p>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-olive-500">
                        Channel
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { key: 'email', label: 'Email', icon: Mail },
                            { key: 'sms', label: 'Text / SMS', icon: Smartphone },
                        ].map(({ key, label, icon: Icon }) => {
                            const active = form.data.channel === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => form.setData('channel', key)}
                                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                                        active
                                            ? 'border-olive-900 bg-olive-900 text-white dark:border-mustard dark:bg-mustard dark:text-olive-950'
                                            : 'border-olive-200 bg-white text-olive-700 hover:border-olive-400 dark:border-olive-700 dark:bg-olive-900/40 dark:text-olive-200'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {form.data.channel === 'sms' ? (
                        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                            SMS delivery isn’t connected yet — you’ll get a clear notice if you
                            try to send.
                        </p>
                    ) : null}
                </div>

                <AdminSelect
                    label="Audience"
                    value={form.data.audience}
                    onChange={(e) => form.setData('audience', e.target.value)}
                    error={form.errors.audience}
                >
                    <option value="all_members">All registered members ({counts.members})</option>
                    <option value="newsletter">
                        Newsletter subscribers ({counts.newsletter})
                    </option>
                    <option value="plan_free">Free plan ({counts.free})</option>
                    <option value="plan_featured">Standard plan ({counts.featured})</option>
                    <option value="plan_premium">Premium plan ({counts.premium})</option>
                </AdminSelect>

                <div className="rounded-xl bg-olive-50 px-3 py-2 text-sm text-olive-700 dark:bg-olive-900/50 dark:text-olive-200">
                    About <strong>{audienceHint ?? 0}</strong> people in this audience
                    {form.data.channel === 'sms' ? ' (with a phone number when available)' : ''}.
                </div>

                <AdminInput
                    label={form.data.channel === 'sms' ? 'Title (internal)' : 'Subject'}
                    value={form.data.subject}
                    onChange={(e) => form.setData('subject', e.target.value)}
                    error={form.errors.subject}
                    placeholder={
                        form.data.channel === 'sms'
                            ? 'Weekend stays near Mount Kenya'
                            : 'This weekend in Nanyuki'
                    }
                />

                <AdminTextarea
                    label="Message"
                    rows={10}
                    value={form.data.body}
                    onChange={(e) => form.setData('body', e.target.value)}
                    error={form.errors.body}
                    placeholder="Write your update, offer, or newsletter…"
                />
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-olive-100 px-5 py-4 dark:border-olive-800">
                <p className="text-xs text-olive-500 dark:text-olive-400">
                    Sends from your site contact email.
                </p>
                <AdminButton type="submit" disabled={form.processing}>
                    <Send className="h-4 w-4" />
                    {form.processing ? 'Sending…' : 'Send now'}
                </AdminButton>
            </div>
        </form>
    );
}

function InboxList({ inbox, selectedId }) {
    const rows = inbox?.data || [];

    if (rows.length === 0) {
        return (
            <EmptyState
                title="Inbox is clear"
                description="Listing inquiries and guest messages will show up here."
            />
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
                {rows.map((item) => {
                    const active = selectedId === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() =>
                                router.get(
                                    route('admin.messages.index'),
                                    { tab: 'inbox', conversation: item.id },
                                    { preserveState: true, preserveScroll: true, replace: true },
                                )
                            }
                            className={`flex w-full flex-col gap-1 border-b border-olive-100 px-4 py-3.5 text-left transition dark:border-olive-800 ${
                                active
                                    ? 'bg-mustard/15 dark:bg-mustard/20'
                                    : 'hover:bg-olive-50/80 dark:hover:bg-olive-800/40'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm font-bold text-olive-950 dark:text-olive-50">
                                    {item.from}
                                </p>
                                <span className="shrink-0 text-[11px] font-medium text-olive-500">
                                    {formatWhen(item.last_message_at)}
                                </span>
                            </div>
                            <p className="truncate text-sm font-semibold text-olive-800 dark:text-olive-100">
                                {item.subject}
                            </p>
                            <p className="line-clamp-2 text-xs text-olive-600 dark:text-olive-300">
                                {item.preview || 'No preview'}
                            </p>
                        </button>
                    );
                })}
            </div>
            <div className="border-t border-olive-100 px-3 py-2 dark:border-olive-800">
                <Pagination links={inbox.links} meta={inbox.meta || inbox} />
            </div>
        </div>
    );
}

function SentList({ sent, selectedId, onSelect }) {
    const rows = sent?.data || [];

    if (rows.length === 0) {
        return (
            <EmptyState
                title="Nothing sent yet"
                description="Your newsletters and broadcasts will appear here after you send."
            />
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
                {rows.map((item) => {
                    const active = selectedId === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item)}
                            className={`flex w-full flex-col gap-1 border-b border-olive-100 px-4 py-3.5 text-left transition dark:border-olive-800 ${
                                active
                                    ? 'bg-mustard/15 dark:bg-mustard/20'
                                    : 'hover:bg-olive-50/80 dark:hover:bg-olive-800/40'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm font-bold text-olive-950 dark:text-olive-50">
                                    {item.subject}
                                </p>
                                <span className="shrink-0 text-[11px] font-medium text-olive-500">
                                    {formatWhen(item.sent_at)}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-olive-600 dark:text-olive-300">
                                <span className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-2 py-0.5 font-semibold capitalize dark:bg-olive-800">
                                    {item.channel === 'sms' ? (
                                        <Smartphone className="h-3 w-3" />
                                    ) : (
                                        <Mail className="h-3 w-3" />
                                    )}
                                    {item.channel}
                                </span>
                                <span>{item.audience_label}</span>
                                <span>
                                    {item.sent_count}/{item.recipient_count} delivered
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <div className="border-t border-olive-100 px-3 py-2 dark:border-olive-800">
                <Pagination links={sent.links} meta={sent.meta || sent} />
            </div>
        </div>
    );
}

function InboxDetail({ selected }) {
    if (!selected) {
        return (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <MessageSquareText className="h-10 w-10 text-olive-300 dark:text-olive-600" />
                <p className="mt-3 text-sm font-semibold text-olive-700 dark:text-olive-200">
                    Select a conversation
                </p>
                <p className="mt-1 max-w-xs text-xs text-olive-500">
                    Guest inquiries from your listings land here so you can always see what was
                    sent to the site.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                <h2 className="text-base font-bold text-olive-950 dark:text-olive-50">
                    {selected.subject}
                </h2>
                {selected.listing ? (
                    <p className="mt-1 text-sm text-olive-600 dark:text-olive-300">
                        Listing:{' '}
                        <a
                            href={route('listings.show', selected.listing.slug)}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-olive-900 underline decoration-mustard/60 underline-offset-2 dark:text-mustard"
                        >
                            {selected.listing.title}
                        </a>
                    </p>
                ) : null}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
                {selected.messages.map((message) => (
                    <div
                        key={message.id}
                        className={`rounded-2xl px-4 py-3 ${
                            message.is_guest
                                ? 'bg-white shadow-sm ring-1 ring-olive-100 dark:bg-olive-900/50 dark:ring-olive-800'
                                : 'bg-olive-100/80 dark:bg-olive-800/50'
                        }`}
                    >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-olive-950 dark:text-olive-50">
                                {message.from}
                            </p>
                            <span className="text-[11px] text-olive-500">
                                {formatWhen(message.created_at)}
                            </span>
                        </div>
                        {(message.email || message.phone) && (
                            <p className="mt-0.5 text-xs text-olive-500">
                                {[message.email, message.phone].filter(Boolean).join(' · ')}
                            </p>
                        )}
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-olive-800 dark:text-olive-100">
                            {message.body}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SentDetail({ campaign }) {
    if (!campaign) {
        return (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <Send className="h-10 w-10 text-olive-300 dark:text-olive-600" />
                <p className="mt-3 text-sm font-semibold text-olive-700 dark:text-olive-200">
                    Select a sent campaign
                </p>
                <p className="mt-1 max-w-xs text-xs text-olive-500">
                    Review who you messaged, when, and how delivery went.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="border-b border-olive-100 px-5 py-4 dark:border-olive-800">
                <h2 className="text-base font-bold text-olive-950 dark:text-olive-50">
                    {campaign.subject}
                </h2>
                <p className="mt-1 text-sm text-olive-600 dark:text-olive-300">
                    {campaign.audience_label} · {formatWhen(campaign.sent_at)}
                    {campaign.author ? ` · by ${campaign.author}` : ''}
                </p>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div className="grid grid-cols-3 gap-2">
                    <StatChip label="Recipients" value={campaign.recipient_count} />
                    <StatChip label="Sent" value={campaign.sent_count} />
                    <StatChip label="Failed" value={campaign.failed_count} />
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-olive-100 dark:bg-olive-900/40 dark:ring-olive-800">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-olive-500">
                        Message
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-olive-800 dark:text-olive-100">
                        {campaign.body}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Index({ tab, counts, inbox, sent, selected }) {
    const [sentSelection, setSentSelection] = useState(null);

    const setTab = (next) => {
        router.get(
            route('admin.messages.index'),
            { tab: next },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Messages" />

            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-olive-500">
                        Communications
                    </p>
                    <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-olive-950 dark:text-olive-50">
                        Messages
                    </h1>
                    <p className="mt-1 max-w-xl text-sm text-olive-600 dark:text-olive-300">
                        Inbox for inquiries sent to your listings, plus broadcast email and text
                        to members and newsletter subscribers.
                    </p>
                </div>
                <AdminButton type="button" onClick={() => setTab('compose')}>
                    <PenSquare className="h-4 w-4" />
                    Compose
                </AdminButton>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                <StatChip label="Inbox" value={counts.inbox} />
                <StatChip label="Members" value={counts.members} />
                <StatChip label="Newsletter" value={counts.newsletter} />
                <StatChip label="Free" value={counts.free} />
                <StatChip label="Standard" value={counts.featured} />
                <StatChip label="Premium" value={counts.premium} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-olive-200/80 bg-[#f7f3ea] shadow-sm dark:border-olive-800 dark:bg-olive-950/40">
                <div className="grid min-h-[34rem] lg:grid-cols-[14rem_minmax(0,20rem)_minmax(0,1fr)]">
                    <aside className="space-y-1 border-b border-olive-200/80 bg-white/80 p-3 dark:border-olive-800 dark:bg-olive-950/60 lg:border-b-0 lg:border-r">
                        <FolderButton
                            active={tab === 'inbox'}
                            icon={Inbox}
                            label="Inbox"
                            count={counts.inbox}
                            onClick={() => setTab('inbox')}
                        />
                        <FolderButton
                            active={tab === 'sent'}
                            icon={Send}
                            label="Sent"
                            count={sent?.meta?.total ?? sent?.total ?? sent?.data?.length ?? 0}
                            onClick={() => setTab('sent')}
                        />
                        <FolderButton
                            active={tab === 'compose'}
                            icon={PenSquare}
                            label="Compose"
                            onClick={() => setTab('compose')}
                        />

                        <div className="my-3 border-t border-olive-100 dark:border-olive-800" />
                        <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-olive-400">
                            Audiences
                        </p>
                        <div className="space-y-1 px-1 text-xs text-olive-600 dark:text-olive-300">
                            <p className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <Users className="h-3.5 w-3.5" />
                                {counts.members} members
                            </p>
                            <p className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                                <Newspaper className="h-3.5 w-3.5" />
                                {counts.newsletter} newsletter
                            </p>
                        </div>
                    </aside>

                    {tab === 'compose' ? (
                        <div className="lg:col-span-2">
                            <ComposePanel counts={counts} />
                        </div>
                    ) : (
                        <>
                            <section className="flex min-h-0 flex-col border-b border-olive-200/80 bg-white/60 dark:border-olive-800 dark:bg-olive-950/30 lg:border-b-0 lg:border-r">
                                <div className="border-b border-olive-100 px-4 py-3 dark:border-olive-800">
                                    <p className="text-sm font-bold text-olive-900 dark:text-olive-50">
                                        {tab === 'inbox' ? 'Inbound' : 'Campaigns'}
                                    </p>
                                </div>
                                {tab === 'inbox' ? (
                                    <InboxList
                                        inbox={inbox}
                                        selectedId={selected?.id ?? null}
                                    />
                                ) : (
                                    <SentList
                                        sent={sent}
                                        selectedId={sentSelection?.id ?? null}
                                        onSelect={setSentSelection}
                                    />
                                )}
                            </section>
                            <section className="min-h-[18rem] bg-[#faf7f0]/70 dark:bg-olive-950/20">
                                {tab === 'inbox' ? (
                                    <InboxDetail selected={selected} />
                                ) : (
                                    <SentDetail campaign={sentSelection} />
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
