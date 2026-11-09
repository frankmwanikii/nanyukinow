import { Link, router, usePage } from '@inertiajs/react';
import { BellMark, CheckMark } from '@/Components/site/Mark';
import { plainText } from '@/utils/plainText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function useAnchoredMenu(open, { maxWidth = 352, edgeGap = 12 } = {}) {
    const triggerRef = useRef(null);
    const [coords, setCoords] = useState(null);

    useEffect(() => {
        if (!open) {
            setCoords(null);
            return undefined;
        }

        const update = () => {
            const el = triggerRef.current;
            if (!el) {
                return;
            }
            const rect = el.getBoundingClientRect();
            const preferredRight = Math.round(window.innerWidth - rect.right);
            const width = Math.min(maxWidth, window.innerWidth - edgeGap * 2);
            const maxRight = Math.max(
                edgeGap,
                Math.round(window.innerWidth - width - edgeGap),
            );
            const right = Math.min(Math.max(preferredRight, edgeGap), maxRight);

            setCoords({
                top: Math.round(rect.bottom + 8),
                right,
            });
        };

        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open, maxWidth, edgeGap]);

    return { triggerRef, coords };
}

function userInitials(name = '') {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return 'M';
    }
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function SenderAvatar({ name, avatarUrl }) {
    const initials = useMemo(() => userInitials(name), [name]);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setFailed(false);
    }, [avatarUrl]);

    if (avatarUrl && !failed) {
        return (
            <img
                src={avatarUrl}
                alt=""
                onError={() => setFailed(true)}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-olive-900/10"
            />
        );
    }

    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-olive-100 text-[11px] font-semibold text-olive-700 ring-1 ring-olive-900/10 dark:bg-olive-800 dark:text-olive-100">
            {initials}
        </span>
    );
}

export default function AdminNotificationsBell() {
    const { adminInbox } = usePage().props;
    const [open, setOpen] = useState(false);
    const { triggerRef, coords } = useAnchoredMenu(open, {
        maxWidth: 352,
        edgeGap: 12,
    });

    const messages = adminInbox?.messages || [];
    const alerts = adminInbox?.alerts || [];
    const messageUnread = adminInbox?.message_unread || 0;
    const unread = adminInbox?.unread_count || 0;

    const markAll = () => {
        router.post(route('admin.messages.read-all'), {}, { preserveScroll: true });
    };

    const menu =
        open && coords && typeof document !== 'undefined'
            ? createPortal(
                  <>
                      <button
                          type="button"
                          aria-label="Close messages"
                          className="fixed inset-0 z-[1300] cursor-default"
                          onClick={() => setOpen(false)}
                      />
                      <div
                          role="menu"
                          style={{ top: coords.top, right: coords.right }}
                          className="fixed z-[1301] w-[min(22rem,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] overflow-hidden border border-olive-200 bg-white shadow-sm dark:border-olive-700 dark:bg-olive-950"
                      >
                          <div className="flex items-center justify-between gap-3 border-b border-olive-100 px-4 py-3.5 dark:border-olive-800">
                              <div className="min-w-0">
                                  <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                      Messages
                                  </p>
                                  <p className="mt-0.5 text-xs text-olive-500 dark:text-olive-400">
                                      {unread > 0
                                          ? `${unread} need${unread === 1 ? 's' : ''} attention`
                                          : 'You’re all caught up'}
                                  </p>
                              </div>
                              {messageUnread > 0 ? (
                                  <button
                                      type="button"
                                      onClick={markAll}
                                      className="inline-flex shrink-0 items-center gap-1 border border-olive-200 px-2.5 py-1.5 text-xs font-semibold text-olive-700 transition hover:bg-olive-50 dark:border-olive-700 dark:text-olive-200 dark:hover:bg-olive-900"
                                  >
                                      <CheckMark className="h-3.5 w-3.5" />
                                      Mark all
                                  </button>
                              ) : null}
                          </div>

                          <div className="max-h-[min(22rem,calc(100vh-6rem))] overflow-y-auto">
                              {messages.length === 0 && alerts.length === 0 ? (
                                  <div className="px-4 py-10 text-center">
                                      <BellMark className="mx-auto h-8 w-8 text-olive-300" />
                                      <p className="mt-3 text-sm font-medium text-olive-800 dark:text-olive-200">
                                          No messages yet
                                      </p>
                                      <p className="mt-1 text-xs text-olive-500">
                                          Inbox messages and review alerts show up here.
                                      </p>
                                  </div>
                              ) : (
                                  <ul className="divide-y divide-olive-100 dark:divide-olive-800">
                                      {messages.slice(0, 4).map((item) => (
                                          <li key={`m-${item.id}`}>
                                              <Link
                                                  href={item.url}
                                                  onClick={() => setOpen(false)}
                                                  className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-olive-50 dark:hover:bg-olive-900 ${
                                                      item.unread ? 'bg-mustard/5' : ''
                                                  }`}
                                              >
                                                  <SenderAvatar
                                                      name={item.from}
                                                      avatarUrl={item.avatar_url}
                                                  />
                                                  <span className="min-w-0 flex-1">
                                                      <span className="flex items-center justify-between gap-2">
                                                          <span className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                              {item.from}
                                                          </span>
                                                          {item.unread ? (
                                                              <span className="h-2 w-2 shrink-0 bg-mustard" />
                                                          ) : null}
                                                      </span>
                                                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600 dark:text-olive-300">
                                                          {plainText(item.body || item.title)}
                                                      </span>
                                                      <span className="mt-1.5 block text-[11px] text-olive-400">
                                                          {item.created_ago}
                                                      </span>
                                                  </span>
                                              </Link>
                                          </li>
                                      ))}
                                      {alerts.map((item) => (
                                          <li key={`a-${item.id}`}>
                                              <Link
                                                  href={item.url}
                                                  onClick={() => setOpen(false)}
                                                  className="flex w-full items-start gap-3 bg-mustard/5 px-4 py-3.5 text-left transition hover:bg-olive-50 dark:hover:bg-olive-900"
                                              >
                                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-olive-50 ring-1 ring-olive-900/10 dark:bg-olive-800">
                                                      <img
                                                          src="/images/logo.png"
                                                          alt=""
                                                          className="h-5 w-5 object-contain"
                                                      />
                                                  </span>
                                                  <span className="min-w-0 flex-1">
                                                      <span className="flex items-center justify-between gap-2">
                                                          <span className="truncate text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                              {item.title}
                                                          </span>
                                                          <span className="h-2 w-2 shrink-0 bg-mustard" />
                                                      </span>
                                                      <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-olive-600 dark:text-olive-300">
                                                          {item.body}
                                                      </span>
                                                      <span className="mt-1.5 block text-[11px] text-olive-400">
                                                          {item.created_ago}
                                                      </span>
                                                  </span>
                                              </Link>
                                          </li>
                                      ))}
                                  </ul>
                              )}
                          </div>

                          <div className="border-t border-olive-100 p-2.5 dark:border-olive-800">
                              <Link
                                  href={route('admin.messages.index')}
                                  onClick={() => setOpen(false)}
                                  className="flex w-full items-center justify-center border border-olive-200 px-3 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-mustard hover:bg-mustard hover:text-olive-950 dark:border-olive-700 dark:text-olive-100 dark:hover:text-olive-950"
                              >
                                  View all messages
                              </Link>
                          </div>
                      </div>
                  </>,
                  document.body,
              )
            : null;

    return (
        <div className="relative inline-flex shrink-0">
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={unread ? `${unread} need attention` : 'Messages'}
                title="Messages"
                className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-olive-700 transition hover:bg-olive-100 hover:text-olive-950 dark:text-olive-200 dark:hover:bg-olive-800 dark:hover:text-mustard"
            >
                <BellMark className="h-8 w-8 translate-y-px" />
                {unread > 0 ? (
                    <span className="absolute right-0 top-0 flex h-4 min-w-4 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-mustard px-1 text-[10px] font-bold leading-none text-earth-dusk ring-2 ring-white dark:ring-olive-900">
                        {unread > 9 ? '9+' : unread}
                    </span>
                ) : null}
            </button>
            {menu}
        </div>
    );
}
