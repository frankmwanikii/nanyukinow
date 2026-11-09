import AccountLayout from '@/Layouts/AccountLayout';
import { useConfirm } from '@/Components/ConfirmDialog';
import {
    AttachMark,
    BackMark,
    CheckMark,
    CloseMark,
    ForwardMark,
    MessageMark,
    SearchMark,
    SendArrowMark,
    TrashMark,
} from '@/Components/site/Mark';
import { plainText } from '@/utils/plainText';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const MESSAGE_ACCEPT =
    'image/jpeg,image/png,image/webp,image/gif,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_MESSAGE_FILES = 5;
const MAX_MESSAGE_FILE_BYTES = 8 * 1024 * 1024;

function formatBytes(bytes) {
    if (!bytes || bytes < 1024) {
        return `${bytes || 0} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentPreview({ file, mine, onClose }) {
    useEffect(() => {
        if (!file) {
            return undefined;
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previous;
        };
    }, [file, onClose]);

    if (!file || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[1400] flex items-center justify-center p-4 sm:p-6">
            <button
                type="button"
                aria-label="Close preview"
                className="absolute inset-0 bg-earth-dusk/70"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-label={file.name}
                className="relative z-[1401] flex max-h-[min(92vh,52rem)] w-full max-w-4xl flex-col overflow-hidden border border-olive-900/15 bg-white shadow-lift dark:border-olive-700 dark:bg-olive-950"
            >
                <div className="flex items-center justify-between gap-3 border-b border-olive-900/10 px-4 py-3 dark:border-olive-800">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                            {file.name}
                        </p>
                        <p className="mt-0.5 text-xs text-olive-500">
                            {[file.mime, file.size ? formatBytes(file.size) : null]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <a
                            href={file.download_url || `${file.url}?download=1`}
                            className="inline-flex items-center gap-1.5 border border-olive-900/15 px-3 py-2 text-xs font-semibold text-olive-800 transition hover:border-mustard hover:bg-mustard hover:text-olive-950 dark:border-olive-700 dark:text-olive-100"
                        >
                            Download
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-9 w-9 items-center justify-center text-olive-500 transition hover:bg-olive-50 hover:text-olive-950 dark:hover:bg-olive-900 dark:hover:text-olive-50"
                            aria-label="Close"
                        >
                            <CloseMark className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center bg-olive-50/70 p-4 dark:bg-olive-900/40">
                    {file.kind === 'image' ? (
                        <img
                            src={file.url}
                            alt={file.name}
                            className="max-h-[min(75vh,42rem)] max-w-full object-contain"
                        />
                    ) : file.kind === 'pdf' ? (
                        <iframe
                            title={file.name}
                            src={file.url}
                            className="h-[min(75vh,42rem)] w-full border-0 bg-white"
                        />
                    ) : (
                        <div className="max-w-sm px-4 py-10 text-center">
                            <AttachMark className="mx-auto h-10 w-10 text-olive-400" />
                            <p className="mt-3 text-sm font-medium text-olive-800 dark:text-olive-100">
                                Preview isn’t available for this file type.
                            </p>
                            <a
                                href={file.download_url || `${file.url}?download=1`}
                                className="mt-4 inline-flex items-center gap-1.5 border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:bg-olive-900 hover:text-white"
                            >
                                Download {file.name}
                            </a>
                        </div>
                    )}
                </div>
                {mine ? (
                    <p className="border-t border-olive-900/10 px-4 py-2 text-[11px] text-olive-400 dark:border-olive-800">
                        Sent by you
                    </p>
                ) : null}
            </div>
        </div>,
        document.body,
    );
}

function Avatar({ src, initials, size = 'md', logo = false }) {
    const [failed, setFailed] = useState(false);
    const box = size === 'sm' ? 'h-9 w-9 text-[11px]' : 'h-11 w-11 text-sm';

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (src && !failed) {
        if (logo) {
            return (
                <span
                    className={`flex ${box} shrink-0 items-center justify-center overflow-hidden rounded-full border border-olive-900/10 bg-olive-50 dark:border-olive-700 dark:bg-olive-900`}
                >
                    <img
                        src={src}
                        alt=""
                        onError={() => setFailed(true)}
                        className="h-[60%] w-[60%] object-contain"
                    />
                </span>
            );
        }

        return (
            <img
                src={src}
                alt=""
                onError={() => setFailed(true)}
                className={`${box} shrink-0 rounded-full object-cover`}
            />
        );
    }

    return (
        <span
            className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-mustard font-semibold leading-none text-earth-dusk`}
        >
            {initials || 'M'}
        </span>
    );
}

function ChatPane({ conversation, onDelete }) {
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const form = useForm({ body: '', attachments: [] });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.id, conversation?.messages?.length]);

    useEffect(() => {
        form.reset('body', 'attachments');
        form.clearErrors();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Reset composer when switching threads.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation?.id]);

    const canSend =
        form.data.body.trim().length > 0 ||
        (Array.isArray(form.data.attachments) &&
            form.data.attachments.length > 0);

    const addFiles = (fileList) => {
        const incoming = Array.from(fileList || []);
        if (incoming.length === 0) {
            return;
        }

        const current = Array.isArray(form.data.attachments)
            ? [...form.data.attachments]
            : [];
        const next = [...current];

        for (const file of incoming) {
            if (next.length >= MAX_MESSAGE_FILES) {
                break;
            }
            if (file.size > MAX_MESSAGE_FILE_BYTES) {
                form.setError(
                    'attachments',
                    'Each file must be 8 MB or smaller.',
                );
                continue;
            }
            next.push(file);
        }

        form.setData('attachments', next);
        if (next.length > 0) {
            form.clearErrors('attachments');
        }
    };

    const removeFile = (index) => {
        const next = (form.data.attachments || []).filter((_, i) => i !== index);
        form.setData('attachments', next);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!canSend) {
            return;
        }
        form.post(route('account.messages.reply', conversation.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset('body', 'attachments');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
        });
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-olive-900/10 bg-white px-5 py-4 dark:border-olive-800 dark:bg-olive-950 sm:px-6">
                <div className="flex min-w-0 items-center gap-3.5">
                    <Link
                        href={route('account.messages', { tab: 'chats' })}
                        className="inline-flex h-9 w-9 items-center justify-center text-olive-500 transition hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-900 dark:hover:text-olive-50 lg:hidden"
                        aria-label="Back to list"
                    >
                        <BackMark className="h-4 w-4" />
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
                        <p className="truncate text-[15px] font-semibold text-olive-950 dark:text-olive-50">
                            {conversation.counterpart?.name || 'Conversation'}
                        </p>
                        {conversation.listing ? (
                            <p className="mt-0.5 truncate text-sm text-olive-500 dark:text-olive-400">
                                About {conversation.listing.title}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {conversation.listing ? (
                        <Link
                            href={conversation.listing.url}
                            className="inline-flex items-center gap-1.5 border border-olive-900/15 px-3 py-2 text-xs font-semibold text-olive-700 transition hover:border-mustard hover:bg-mustard hover:text-olive-950 dark:border-olive-700 dark:text-olive-200"
                        >
                            Listing
                            <ForwardMark className="h-3.5 w-3.5" />
                        </Link>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => onDelete?.(conversation.id)}
                        className="inline-flex h-9 w-9 items-center justify-center text-olive-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        title="Delete chat"
                        aria-label="Delete chat"
                    >
                        <TrashMark className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-olive-50/40 px-5 py-6 dark:bg-olive-950 sm:px-6">
                {(conversation.messages || []).map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.mine ? 'flex-row-reverse' : ''}`}
                    >
                        {!message.mine ? (
                            <Avatar
                                src={message.avatar_url}
                                initials={message.initials}
                                size="sm"
                            />
                        ) : null}
                        <div
                            className={`max-w-[78%] px-4 py-3 shadow-sm ${
                                message.mine
                                    ? 'rounded-2xl rounded-br-md bg-olive-900 text-white dark:bg-olive-800'
                                    : 'rounded-2xl rounded-bl-md border border-olive-900/10 bg-white text-olive-900 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100'
                            }`}
                        >
                            {!message.mine ? (
                                <p className="mb-1.5 text-xs font-semibold text-olive-500 dark:text-olive-400">
                                    {message.sender_name}
                                </p>
                            ) : null}
                            {message.body ? (
                                /<[a-z][\s\S]*>/i.test(message.body) ? (
                                    <div
                                        className={`nn-editor text-sm leading-relaxed ${
                                            message.mine
                                                ? 'text-white [&_a]:text-mustard'
                                                : ''
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: message.body,
                                        }}
                                    />
                                ) : (
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {message.body}
                                    </p>
                                )
                            ) : null}
                            {(message.attachments || []).length > 0 ? (
                                <ul
                                    className={`space-y-2 ${
                                        message.body ? 'mt-2.5' : ''
                                    }`}
                                >
                                    {message.attachments.map((file) => (
                                        <li key={`${message.id}-${file.index}`}>
                                            {file.kind === 'image' ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreview({
                                                            ...file,
                                                            mine: message.mine,
                                                        })
                                                    }
                                                    className="block max-w-full overflow-hidden border border-black/10 text-left transition hover:opacity-95"
                                                    aria-label={`Preview ${file.name}`}
                                                >
                                                    <img
                                                        src={file.url}
                                                        alt={file.name}
                                                        className="max-h-56 max-w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                    <span
                                                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-[11px] font-semibold ${
                                                            message.mine
                                                                ? 'bg-black/20 text-white'
                                                                : 'bg-olive-50 text-olive-700 dark:bg-olive-950 dark:text-olive-200'
                                                        }`}
                                                    >
                                                        <span className="truncate">
                                                            {file.name}
                                                        </span>
                                                        <span className="shrink-0 opacity-80">
                                                            Preview
                                                        </span>
                                                    </span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreview({
                                                            ...file,
                                                            mine: message.mine,
                                                        })
                                                    }
                                                    className={`inline-flex max-w-full items-center gap-2 border px-2.5 py-1.5 text-left text-xs font-semibold transition ${
                                                        message.mine
                                                            ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                                                            : 'border-olive-900/15 bg-olive-50 text-olive-800 hover:border-mustard hover:bg-mustard/20 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-100'
                                                    }`}
                                                    aria-label={
                                                        file.previewable
                                                            ? `Preview ${file.name}`
                                                            : `Open ${file.name}`
                                                    }
                                                >
                                                    <AttachMark className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">
                                                        {file.name}
                                                    </span>
                                                    {file.size ? (
                                                        <span className="shrink-0 opacity-70">
                                                            {formatBytes(file.size)}
                                                        </span>
                                                    ) : null}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                            <p
                                className={`mt-2 text-[11px] ${
                                    message.mine
                                        ? 'text-white/55'
                                        : 'text-olive-400 dark:text-olive-500'
                                }`}
                            >
                                {message.created_ago}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <form
                onSubmit={submit}
                className="border-t border-olive-900/10 bg-white px-5 py-4 dark:border-olive-800 dark:bg-olive-950 sm:px-6"
            >
                {(conversation.counterpart?.email ||
                    conversation.counterpart?.phone) && (
                    <p className="mb-3 text-xs text-olive-500 dark:text-olive-400">
                        {[
                            conversation.counterpart.email,
                            conversation.counterpart.phone,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                )}
                {(form.data.attachments || []).length > 0 ? (
                    <ul className="mb-3 flex flex-wrap gap-2">
                        {form.data.attachments.map((file, index) => (
                            <li
                                key={`${file.name}-${index}`}
                                className="inline-flex max-w-full items-center gap-2 border border-olive-900/15 bg-olive-50 px-2.5 py-1.5 text-xs font-semibold text-olive-800 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100"
                            >
                                <AttachMark className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{file.name}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-olive-500 transition hover:text-rose-600"
                                    aria-label={`Remove ${file.name}`}
                                >
                                    <CloseMark className="h-3 w-3" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative min-w-0 flex-1">
                        <textarea
                            rows={2}
                            value={form.data.body}
                            onChange={(e) => form.setData('body', e.target.value)}
                            placeholder="Write a reply"
                            className="max-h-32 min-h-[3rem] w-full resize-none rounded-[2px] border border-olive-900/15 bg-white py-3 pl-3.5 pr-14 text-sm text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-1 focus:ring-mustard dark:border-olive-700 dark:bg-olive-900 dark:text-olive-50 dark:placeholder:text-olive-500"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-olive-600 transition hover:text-olive-950 dark:text-olive-300 dark:hover:text-mustard"
                            aria-label="Attach files"
                            title="Attach files"
                        >
                            <AttachMark className="h-8 w-8" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={MESSAGE_ACCEPT}
                            className="sr-only"
                            onChange={(e) => {
                                addFiles(e.target.files);
                                e.target.value = '';
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={form.processing || !canSend}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mustard text-earth-dusk transition hover:bg-olive-900 hover:text-white disabled:opacity-50"
                        aria-label="Send"
                    >
                        <SendArrowMark className="h-5 w-5" />
                    </button>
                </div>
                {form.errors.body ? (
                    <p className="mt-2 text-sm text-rose-600">{form.errors.body}</p>
                ) : null}
                {form.errors.attachments ? (
                    <p className="mt-2 text-sm text-rose-600">
                        {form.errors.attachments}
                    </p>
                ) : null}
            </form>
            {preview ? (
                <AttachmentPreview
                    file={preview}
                    mine={Boolean(preview.mine)}
                    onClose={() => setPreview(null)}
                />
            ) : null}
        </div>
    );
}

function AlertPane({ notification, onDelete }) {
    const sender = notification.sender_name || 'Nanyuki Now';
    const avatar = notification.sender_avatar || '/images/logo.png';

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-olive-900/10 bg-white px-5 py-4 dark:border-olive-800 dark:bg-olive-950 sm:px-6">
                <div className="flex min-w-0 items-center gap-3.5">
                    <Link
                        href={route('account.messages', { tab: 'alerts' })}
                        className="inline-flex h-9 w-9 items-center justify-center text-olive-500 transition hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-900 dark:hover:text-olive-50 lg:hidden"
                        aria-label="Back to list"
                    >
                        <BackMark className="h-4 w-4" />
                    </Link>
                    <Avatar
                        src={avatar}
                        initials={sender
                            .split(/\s+/)
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        logo
                    />
                    <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-olive-950 dark:text-olive-50">
                            {sender}
                        </p>
                        <p className="mt-0.5 text-sm text-olive-500 dark:text-olive-400">
                            {notification.created_ago}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onDelete?.(notification.id)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-olive-400 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                    title="Delete alert"
                    aria-label="Delete alert"
                >
                    <TrashMark className="h-4 w-4" />
                </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-olive-50/40 px-5 py-8 dark:bg-olive-950 sm:px-8">
                <div className="mx-auto max-w-xl space-y-5">
                    <div className="border border-olive-900/10 bg-white px-6 py-6 dark:border-olive-700 dark:bg-olive-900">
                        <p className="text-base font-semibold text-olive-950 dark:text-olive-50">
                            {notification.title}
                        </p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-olive-700 dark:text-olive-200">
                            {plainText(notification.body)}
                        </p>
                        <p className="mt-4 text-xs text-olive-400 dark:text-olive-500">
                            {notification.created_ago}
                        </p>
                    </div>
                    {notification.action_url ? (
                        <Link
                            href={notification.action_url}
                            className="inline-flex items-center gap-2 border border-mustard bg-mustard px-4 py-2.5 text-sm font-semibold text-earth-dusk transition hover:border-olive-900 hover:bg-olive-900 hover:text-white"
                        >
                            {notification.action_label || 'Open'}
                            <ForwardMark className="h-3.5 w-3.5" />
                        </Link>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function EmptyPane() {
    return (
        <div className="hidden h-full flex-col items-center justify-center bg-olive-50/40 px-8 text-center dark:bg-olive-950 lg:flex">
            <MessageMark className="h-10 w-10 text-olive-300 dark:text-olive-600" />
            <p className="mt-5 text-lg font-semibold text-olive-900 dark:text-olive-100">
                Choose a message
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
            body: plainText(item.body),
            created_ago: item.created_ago,
            unread: item.unread,
            avatar_url: item.avatar_url,
            initials: item.initials,
            logo: false,
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
                body: plainText(item.body),
                created_ago: item.created_ago,
                unread: !item.read_at,
                avatar_url: item.sender_avatar || '/images/logo.png',
                initials: sender
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase(),
                logo: true,
                href: route('account.messages', {
                    tab: 'alerts',
                    n: item.id,
                    q: query || undefined,
                }),
                sort: item.created_at || '',
            };
        });

        let rows = [];
        if (tab === 'chats') {
            rows = chats;
        } else if (tab === 'alerts') {
            rows = alerts;
        } else {
            rows = [...chats, ...alerts].sort((a, b) =>
                String(b.sort).localeCompare(String(a.sort)),
            );
        }

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
        if (!ok) {
            return;
        }
        router.delete(route('account.messages.destroy', id));
    };

    const deleteAlert = async (id) => {
        const ok = await confirm({
            title: 'Delete this alert?',
            message: 'This alert will be removed from your inbox permanently.',
            confirmLabel: 'Delete alert',
        });
        if (!ok) {
            return;
        }
        router.delete(route('account.messages.alerts.destroy', id));
    };

    const deleteItem = (item, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (item.kind === 'chat') {
            deleteChat(item.id);
        } else {
            deleteAlert(item.id);
        }
    };

    return (
        <AccountLayout title="Messages">
            {dialog}
            <Head title="Messages" />

            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-olive-600 dark:text-olive-400">
                        {unread.total > 0
                            ? `${unread.total} unread`
                            : 'You’re all caught up'}
                    </p>
                    {unread.total > 0 ? (
                        <button
                            type="button"
                            onClick={markAll}
                            className="inline-flex items-center gap-1.5 border border-olive-900/15 bg-white px-3.5 py-2 text-sm font-semibold text-olive-800 transition hover:border-mustard hover:bg-mustard hover:text-olive-950 dark:border-olive-700 dark:bg-olive-900 dark:text-olive-200"
                        >
                            <CheckMark className="h-4 w-4" />
                            Mark all read
                        </button>
                    ) : null}
                </div>

                <div className="overflow-hidden border border-olive-900/15 bg-white dark:border-olive-800 dark:bg-olive-950">
                    <div className="grid h-[min(72vh,760px)] min-h-[32rem] lg:grid-cols-[24rem_minmax(0,1fr)]">
                        <aside
                            className={`flex min-h-0 flex-col border-olive-900/10 dark:border-olive-800 lg:border-r ${
                                hasActive ? 'hidden lg:flex' : 'flex'
                            }`}
                        >
                            <div className="space-y-4 border-b border-olive-900/10 px-5 py-5 dark:border-olive-800">
                                <form onSubmit={runSearch} className="relative">
                                    <SearchMark className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-olive-400 dark:text-olive-500" />
                                    <input
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search messages and alerts"
                                        className="w-full border border-olive-900/15 bg-white py-3 pl-10 pr-3 text-sm text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-1 focus:ring-mustard dark:border-olive-700 dark:bg-olive-900 dark:text-olive-50 dark:placeholder:text-olive-500"
                                    />
                                </form>

                                <div className="flex gap-1 border border-olive-900/10 p-1 dark:border-olive-700">
                                    {[
                                        { id: 'all', label: 'All' },
                                        { id: 'chats', label: 'Chats' },
                                        { id: 'alerts', label: 'Alerts' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => switchTab(item.id)}
                                            className={`flex-1 px-2 py-2.5 text-xs font-semibold transition ${
                                                tab === item.id
                                                    ? 'bg-olive-900 text-white dark:bg-mustard dark:text-earth-dusk'
                                                    : 'text-olive-600 hover:bg-olive-50 hover:text-olive-900 dark:text-olive-400 dark:hover:bg-olive-900 dark:hover:text-olive-100'
                                            }`}
                                        >
                                            {item.label}
                                            {item.id === 'chats' &&
                                            unread.chats > 0
                                                ? ` ${unread.chats}`
                                                : ''}
                                            {item.id === 'alerts' &&
                                            unread.alerts > 0
                                                ? ` ${unread.alerts}`
                                                : ''}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto">
                                {feed.length === 0 ? (
                                    <div className="px-6 py-16 text-center">
                                        <MessageMark className="mx-auto h-9 w-9 text-olive-300 dark:text-olive-600" />
                                        <p className="mt-4 text-sm font-semibold text-olive-800 dark:text-olive-200">
                                            Nothing here yet
                                        </p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-olive-900/10 dark:divide-olive-800">
                                        {feed.map((item) => {
                                            const selected =
                                                (item.kind === 'chat' &&
                                                    activeType === 'chat' &&
                                                    active?.id === item.id) ||
                                                (item.kind === 'alert' &&
                                                    activeType === 'alert' &&
                                                    active?.id === item.id);

                                            return (
                                                <li
                                                    key={item.key}
                                                    className="group relative"
                                                >
                                                    <Link
                                                        href={item.href}
                                                        className={`flex w-full gap-4 px-5 py-5 pr-12 text-left transition hover:bg-olive-50 dark:hover:bg-olive-900 ${
                                                            selected
                                                                ? 'bg-mustard/10 dark:bg-mustard/15'
                                                                : item.unread
                                                                  ? 'bg-mustard/[0.04] dark:bg-mustard/[0.08]'
                                                                  : ''
                                                        }`}
                                                    >
                                                        <Avatar
                                                            src={item.avatar_url}
                                                            initials={
                                                                item.initials
                                                            }
                                                            logo={item.logo}
                                                        />
                                                        <span className="min-w-0 flex-1 space-y-1.5">
                                                            <span className="flex items-start justify-between gap-3">
                                                                <span className="truncate text-[15px] font-semibold text-olive-950 dark:text-olive-50">
                                                                    {item.title}
                                                                </span>
                                                                <span className="shrink-0 pt-0.5 text-xs text-olive-400 dark:text-olive-500">
                                                                    {
                                                                        item.created_ago
                                                                    }
                                                                </span>
                                                            </span>
                                                            {item.kind ===
                                                                'chat' &&
                                                            item.subtitle ? (
                                                                <span className="block truncate text-sm text-olive-500 dark:text-olive-400">
                                                                    {
                                                                        item.subtitle
                                                                    }
                                                                </span>
                                                            ) : null}
                                                            <span className="flex items-center gap-2.5">
                                                                <span className="line-clamp-2 flex-1 text-sm leading-relaxed text-olive-600 dark:text-olive-400">
                                                                    {item.kind ===
                                                                        'alert' &&
                                                                    item.subtitle
                                                                        ? item.subtitle
                                                                        : item.body}
                                                                </span>
                                                                {item.unread ? (
                                                                    <span className="h-2 w-2 shrink-0 bg-mustard" />
                                                                ) : null}
                                                            </span>
                                                        </span>
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={(e) =>
                                                            deleteItem(item, e)
                                                        }
                                                        className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center text-olive-300 opacity-100 transition hover:bg-rose-50 hover:text-rose-600 dark:text-olive-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
                                                        title={
                                                            item.kind === 'chat'
                                                                ? 'Delete chat'
                                                                : 'Delete alert'
                                                        }
                                                        aria-label={
                                                            item.kind === 'chat'
                                                                ? 'Delete chat'
                                                                : 'Delete alert'
                                                        }
                                                    >
                                                        <TrashMark className="h-4 w-4" />
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </aside>

                        <section
                            className={`min-h-0 ${hasActive ? 'flex' : 'hidden lg:flex'} flex-col`}
                        >
                            {activeType === 'chat' && active ? (
                                <ChatPane
                                    conversation={active}
                                    onDelete={deleteChat}
                                />
                            ) : activeType === 'alert' && active ? (
                                <AlertPane
                                    notification={active}
                                    onDelete={deleteAlert}
                                />
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
