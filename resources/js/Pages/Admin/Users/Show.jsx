import AdminLayout from '@/Layouts/AdminLayout';
import ImageCropModal from '@/Components/Admin/ImageCropModal';
import {
    ActionMenu,
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminPasswordInput,
    DataCard,
    DataTable,
    EmptyState,
    ExpiryCell,
    FormPanel,
    MediaCell,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { srcToDataUrl } from '@/utils/cropImage';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    CloudUpload,
    Crop,
    CreditCard,
    LayoutList,
    Save,
    Shield,
    Sparkles,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = 15 * 1024 * 1024;

function formatDate(iso, withTime = false) {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleString(undefined, {
            dateStyle: 'medium',
            ...(withTime ? { timeStyle: 'short' } : {}),
        });
    } catch {
        return '—';
    }
}

function money(amount, currency = 'KES') {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

function memberRouteKey(user) {
    return user?.username || user?.id;
}

function methodLabel(method) {
    const key = String(method || '').toLowerCase();
    const map = {
        mpesa: 'M-Pesa',
        paypal: 'PayPal',
        intasend: 'IntaSend',
        card: 'Card',
        bank: 'Bank transfer',
        unknown: 'Unknown',
    };
    if (map[key]) return map[key];
    if (!key) return '—';
    return key.charAt(0).toUpperCase() + key.slice(1);
}

function membershipTone(status) {
    if (status === 'expired') return 'rose';
    if (status === 'expiring_soon') return 'amber';
    if (status === 'active') return 'mint';
    return 'slate';
}

function MembershipPanel({ membership, stats }) {
    const tone = membershipTone(membership?.status);
    const percent = membership?.period_percent ?? 0;
    const remaining = membership?.days_remaining;

    return (
        <div className="grid gap-3 lg:grid-cols-12">
            <section className="relative overflow-hidden rounded-2xl border border-olive-200/80 bg-white p-5 shadow-soft lg:col-span-7 dark:border-olive-800 dark:bg-olive-900">
                <div
                    className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-mustard/20 blur-2xl"
                    aria-hidden
                />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500 dark:text-olive-400">
                            Listing membership
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={membership?.key || 'free'} />
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    tone === 'rose'
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-200'
                                        : tone === 'amber'
                                          ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                                          : tone === 'mint'
                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                            : 'bg-olive-100 text-olive-700 dark:bg-olive-800 dark:text-olive-200'
                                }`}
                            >
                                {membership?.status === 'expiring_soon'
                                    ? 'Due soon'
                                    : membership?.status === 'expired'
                                      ? 'Expired'
                                      : membership?.is_paid
                                        ? 'Active subscription'
                                        : 'Free plan'}
                            </span>
                        </div>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-olive-600 dark:text-olive-300">
                            {membership?.is_paid
                                ? remaining === 0
                                    ? 'This membership has reached its due date.'
                                    : `${remaining} day${remaining === 1 ? '' : 's'} left until renewal is due.`
                                : 'No paid listing plan. Assign one from Finance when they upgrade.'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-olive-100 bg-olive-50/80 px-4 py-3 text-right dark:border-olive-800 dark:bg-olive-950/50">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-olive-500">
                            Slots used
                        </p>
                        <p className="mt-1 font-display text-2xl font-bold tabular-nums text-olive-950 dark:text-white">
                            {membership?.listings_used ?? 0}
                            <span className="text-base font-semibold text-olive-400">
                                /{membership?.listing_limit ?? 0}
                            </span>
                        </p>
                    </div>
                </div>

                {membership?.is_paid ? (
                    <div className="relative mt-5">
                        <div className="mb-1.5 flex items-center justify-between text-xs text-olive-500">
                            <span>Period progress</span>
                            <span className="tabular-nums">{percent}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-olive-100 dark:bg-olive-800">
                            <div
                                className={`h-full rounded-full transition-all ${
                                    tone === 'rose'
                                        ? 'bg-rose-500'
                                        : tone === 'amber'
                                          ? 'bg-amber-500'
                                          : 'bg-mustard'
                                }`}
                                style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
                            />
                        </div>
                    </div>
                ) : null}
            </section>

            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
                <MetaTile
                    icon={CalendarClock}
                    label="Subscribed / started"
                    value={formatDate(membership?.started_at)}
                />
                <MetaTile
                    icon={Sparkles}
                    label="Due / renews"
                    value={
                        membership?.expires_at
                            ? formatDate(membership.expires_at)
                            : membership?.is_paid
                              ? '—'
                              : 'No due date'
                    }
                    emphasis={tone === 'amber' || tone === 'rose'}
                />
                <MetaTile
                    icon={CreditCard}
                    label="Approved spend"
                    value={money(stats?.approved_spend)}
                />
            </div>
        </div>
    );
}

function MetaTile({ icon: Icon, label, value, emphasis = false }) {
    return (
        <div
            className={`rounded-2xl border px-4 py-3.5 ${
                emphasis
                    ? 'border-amber-200/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30'
                    : 'border-olive-200/80 bg-white dark:border-olive-800 dark:bg-olive-900'
            }`}
        >
            <div className="flex items-center gap-2 text-olive-500 dark:text-olive-400">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-olive-950 dark:text-olive-50">{value}</p>
        </div>
    );
}

function ProfileTabs({ user, tab }) {
    const items = [
        { id: 'profile', label: 'Profile', icon: UserRound },
        {
            id: 'listings',
            label: 'Listings',
            icon: LayoutList,
            badge: user.listings_count,
        },
        {
            id: 'payments',
            label: 'Payment history',
            icon: CreditCard,
            badge: user.payments_count,
        },
    ];

    return (
        <nav
            className="mb-6 flex flex-wrap gap-1 border-b border-olive-200 dark:border-olive-800"
            aria-label="Member sections"
        >
            {items.map((item) => {
                const active = tab === item.id;
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                            router.get(
                                route('admin.users.show', memberRouteKey(user)),
                                { tab: item.id },
                                { preserveState: true },
                            )
                        }
                        className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${
                            active
                                ? 'text-olive-950 dark:text-white'
                                : 'text-olive-500 hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-100'
                        }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                        {item.badge > 0 ? (
                            <span className="rounded-full bg-olive-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-olive-700 dark:bg-olive-800 dark:text-olive-200">
                                {item.badge}
                            </span>
                        ) : null}
                        {active ? (
                            <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-mustard" />
                        ) : null}
                    </button>
                );
            })}
        </nav>
    );
}

function ProfileEditor({ user }) {
    const fileRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [cropOpen, setCropOpen] = useState(false);
    const [cropSrc, setCropSrc] = useState(null);
    const [cropLoading, setCropLoading] = useState(false);
    const [cropName, setCropName] = useState('avatar.jpg');
    const [dragOver, setDragOver] = useState(false);
    const [localError, setLocalError] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        is_admin: Boolean(user.is_admin),
        avatar: null,
        remove_avatar: false,
        _method: 'put',
    });

    useEffect(() => {
        setData({
            name: user.name || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            is_admin: Boolean(user.is_admin),
            avatar: null,
            remove_avatar: false,
            _method: 'put',
        });
        setPreview(null);
        setLocalError(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id, user.name, user.username, user.email, user.phone, user.avatar_url, user.is_admin]);

    useEffect(() => {
        if (!data.avatar) {
            setPreview(null);
            return undefined;
        }
        const url = URL.createObjectURL(data.avatar);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.avatar]);

    const displaySrc = useMemo(() => {
        if (data.remove_avatar) return null;
        if (preview) return preview;
        return user.avatar_url || null;
    }, [data.remove_avatar, preview, user.avatar_url]);

    const closeCropper = () => {
        setCropOpen(false);
        setCropSrc(null);
        setCropLoading(false);
    };

    const openCropper = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setLocalError('Please choose an image file (JPG, PNG, WEBP, or GIF).');
            return;
        }
        if (file.size > MAX_BYTES) {
            setLocalError('Image must be 15MB or smaller.');
            return;
        }
        setLocalError(null);
        const base = file.name.replace(/\.[^.]+$/, '') || 'avatar';
        setCropName(`${base}.jpg`);
        setCropOpen(true);
        setCropLoading(true);
        setCropSrc(null);

        const reader = new FileReader();
        reader.onload = () => {
            setCropSrc(String(reader.result));
            setCropLoading(false);
        };
        reader.onerror = () => {
            setCropLoading(false);
            setCropOpen(false);
            setLocalError('Could not read that image.');
        };
        reader.readAsDataURL(file);
    };

    const editCurrentPhoto = async (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if (data.avatar instanceof File) {
            openCropper(data.avatar);
            return;
        }
        const src = displaySrc;
        if (!src) return;
        setLocalError(null);
        setCropName('avatar.jpg');
        setCropOpen(true);
        setCropLoading(true);
        setCropSrc(null);
        try {
            const dataUrl = await srcToDataUrl(src);
            setCropSrc(dataUrl);
        } catch {
            setCropOpen(false);
            setLocalError('Could not open this photo for cropping. Try replacing it.');
        } finally {
            setCropLoading(false);
        }
    };

    const onPickFile = (e) => {
        openCropper(e.target.files?.[0] || null);
        e.target.value = '';
    };

    const onDrop = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setDragOver(false);
        openCropper(ev.dataTransfer.files?.[0] || null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.update', memberRouteKey(user)), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <FormPanel
                title="Account details"
                description="Update identity, contact, photo, and access for this member."
            >
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-olive-500 dark:text-olive-400">
                            Profile picture
                        </p>
                        {displaySrc ? (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                <button
                                    type="button"
                                    onClick={editCurrentPhoto}
                                    aria-label="Crop profile photo"
                                    className="group relative mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-full bg-olive-100 shadow-soft ring-2 ring-olive-200 transition hover:ring-mustard sm:mx-0 dark:bg-olive-800 dark:ring-olive-700"
                                >
                                    <img
                                        src={displaySrc}
                                        alt=""
                                        className="h-full w-full object-cover"
                                        draggable={false}
                                    />
                                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-earth-dusk/55 text-white opacity-0 transition group-hover:opacity-100">
                                        <Crop className="h-5 w-5" />
                                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                                            Crop
                                        </span>
                                    </span>
                                </button>
                                <div className="min-w-0 flex-1 space-y-3">
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        onDragOver={(ev) => {
                                            ev.preventDefault();
                                            setDragOver(true);
                                        }}
                                        onDragLeave={() => setDragOver(false)}
                                        onDrop={onDrop}
                                        className={`flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-4 text-left transition ${
                                            dragOver
                                                ? 'border-mustard bg-mustard/10'
                                                : 'border-mustard/70 bg-olive-50/50 hover:border-mustard dark:bg-olive-950/40'
                                        }`}
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mustard/15 text-mustard">
                                            <CloudUpload className="h-5 w-5" />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold text-earth-dusk dark:text-olive-50">
                                                Replace photo
                                            </span>
                                            <span className="mt-0.5 block text-xs text-olive-500">
                                                Drop or click · JPG, PNG, WEBP, GIF · max 15MB
                                            </span>
                                        </span>
                                    </button>
                                    <div className="flex flex-wrap gap-2">
                                        <AdminButton
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={editCurrentPhoto}
                                        >
                                            <Crop className="h-3.5 w-3.5" />
                                            Crop & zoom
                                        </AdminButton>
                                        <AdminButton
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                                setData('avatar', null);
                                                setData('remove_avatar', true);
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove
                                        </AdminButton>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                onDragOver={(ev) => {
                                    ev.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                                className={`flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center transition ${
                                    dragOver
                                        ? 'border-mustard bg-mustard/10'
                                        : 'border-mustard/70 bg-gradient-to-b from-white to-olive-50/40 hover:border-mustard dark:from-olive-950/50 dark:to-olive-950/20'
                                }`}
                            >
                                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mustard/15 text-mustard">
                                    <CloudUpload className="h-7 w-7" />
                                </span>
                                <span className="mt-4 text-sm font-semibold text-earth-dusk dark:text-olive-50">
                                    Drop a photo or click to upload
                                </span>
                                <span className="mt-1 text-xs text-olive-500">
                                    JPG, PNG, WEBP, GIF · max 15MB
                                </span>
                            </button>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept={ACCEPT}
                            className="sr-only"
                            onChange={onPickFile}
                        />
                        {(localError || errors.avatar) && (
                            <span className="mt-2 block text-sm text-rose-600">
                                {localError || errors.avatar}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminInput
                            label="Full name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                        <AdminInput
                            label="Username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            error={errors.username}
                            placeholder="optional"
                        />
                        <AdminInput
                            label="Email address"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            error={errors.email}
                            required
                        />
                        <AdminInput
                            label="Phone number"
                            type="tel"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            error={errors.phone}
                            placeholder="e.g. 07xx xxx xxx"
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminPasswordInput
                            label="New password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            error={errors.password}
                            placeholder="Leave blank to keep current"
                            autoComplete="new-password"
                        />
                        <div className="flex items-end pb-1">
                            <AdminCheckbox
                                label="Admin access"
                                checked={data.is_admin}
                                onChange={(e) => setData('is_admin', e.target.checked)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-olive-100 pt-5 dark:border-olive-800">
                        <p className="text-xs text-olive-500">
                            Joined {formatDate(user.created_at)}
                            {user.email_verified_at
                                ? ` · Email verified ${formatDate(user.email_verified_at)}`
                                : ' · Email not verified'}
                        </p>
                        <AdminButton type="submit" disabled={processing}>
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving…' : 'Save changes'}
                        </AdminButton>
                    </div>
                </form>
            </FormPanel>

            <ImageCropModal
                show={cropOpen}
                imageSrc={cropSrc}
                loading={cropLoading}
                filename={cropName}
                onClose={closeCropper}
                onComplete={(file) => {
                    setData('avatar', file);
                    setData('remove_avatar', false);
                    closeCropper();
                }}
            />
        </>
    );
}

function ListingsTab({ listings, filters, user }) {
    const rows = listings?.data || [];
    const perPage = filters?.per_page || 15;
    const key = memberRouteKey(user);

    if (rows.length === 0) {
        return (
            <EmptyState
                title="No listings yet"
                description="When this member creates listings, they will show up here."
            />
        );
    }

    return (
        <DataCard
            title={`${listings.meta?.total ?? rows.length} listings`}
            footer={
                <Pagination
                    links={listings.links}
                    meta={listings.meta || listings}
                    perPage={perPage}
                    onPerPageChange={(n) =>
                        router.get(
                            route('admin.users.show', key),
                            { tab: 'listings', per_page: n },
                            { preserveState: true },
                        )
                    }
                />
            }
        >
            <DataTable>
                <thead>
                    <tr>
                        <Th>Listing</Th>
                        <Th>Category</Th>
                        <Th>Status</Th>
                        <Th>Plan</Th>
                        <Th>Expires</Th>
                        <Th>Updated</Th>
                        <Th align="right">Action</Th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((listing) => {
                        const editUrl =
                            listing.edit_href ||
                            route('admin.listings.edit', listing.slug || listing.id);
                        return (
                            <tr
                                key={listing.id}
                                role="link"
                                tabIndex={0}
                                onClick={() => router.visit(editUrl)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        router.visit(editUrl);
                                    }
                                }}
                                className="cursor-pointer transition hover:bg-olive-50/80 dark:hover:bg-olive-800/40"
                            >
                                <Td>
                                    <MediaCell
                                        image={listing.image || listing.image_url}
                                        title={listing.title}
                                    />
                                </Td>
                                <Td>
                                    <span className="text-sm text-olive-600 dark:text-olive-300">
                                        {listing.category || '—'}
                                    </span>
                                </Td>
                                <Td>
                                    <StatusBadge status={listing.status} />
                                </Td>
                                <Td>
                                    <StatusBadge status={listing.tier} />
                                </Td>
                                <Td>
                                    <ExpiryCell
                                        expiresAt={listing.expires_at}
                                        label={listing.expiry_label}
                                        isExpired={listing.is_expired}
                                    />
                                </Td>
                                <Td>
                                    <span className="text-sm text-olive-500">
                                        {listing.updated_at
                                            ? new Date(listing.updated_at).toLocaleDateString()
                                            : '—'}
                                    </span>
                                </Td>
                                <Td
                                    align="right"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => e.stopPropagation()}
                                >
                                    <ActionMenu
                                        items={[
                                            { label: 'Edit', href: editUrl },
                                            {
                                                label: 'View on site',
                                                href:
                                                    listing.public_href ||
                                                    route('listings.show', listing.slug),
                                                external: true,
                                            },
                                        ]}
                                    />
                                </Td>
                            </tr>
                        );
                    })}
                </tbody>
            </DataTable>
        </DataCard>
    );
}

function PaymentsTab({ payments, filters, user }) {
    const rows = payments?.data || [];
    const perPage = filters?.per_page || 15;
    const key = memberRouteKey(user);

    if (rows.length === 0) {
        return (
            <EmptyState
                title="No payment history"
                description="Upgrade requests and approved membership payments will appear here."
            />
        );
    }

    return (
        <DataCard
            title={`${payments.meta?.total ?? rows.length} payments`}
            footer={
                <Pagination
                    links={payments.links}
                    meta={payments.meta || payments}
                    perPage={perPage}
                    onPerPageChange={(n) =>
                        router.get(
                            route('admin.users.show', key),
                            { tab: 'payments', per_page: n },
                            { preserveState: true },
                        )
                    }
                />
            }
        >
            <DataTable>
                <thead>
                    <tr>
                        <Th>Submitted</Th>
                        <Th>Plan change</Th>
                        <Th>Method</Th>
                        <Th>Reference</Th>
                        <Th align="right">Amount</Th>
                        <Th>Status</Th>
                        <Th>Paid / reviewed</Th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((payment) => (
                        <tr key={payment.id}>
                            <Td>
                                <span className="whitespace-nowrap text-sm text-olive-600">
                                    {formatDate(payment.created_at, true)}
                                </span>
                            </Td>
                            <Td>
                                <p className="text-sm font-medium text-olive-900 dark:text-olive-50">
                                    {payment.from_label} → {payment.to_label}
                                </p>
                                <p className="text-xs text-olive-500">
                                    {payment.billing_period === 'year'
                                        ? 'Yearly'
                                        : payment.billing_period === 'one_time'
                                          ? 'One-time'
                                          : 'Monthly'}
                                </p>
                            </Td>
                            <Td>
                                <span className="inline-flex whitespace-nowrap rounded-full bg-olive-100 px-2.5 py-1 text-xs font-semibold text-olive-800 dark:bg-olive-800 dark:text-olive-100">
                                    {methodLabel(payment.payment_method)}
                                </span>
                            </Td>
                            <Td>
                                <code className="rounded bg-olive-100 px-2 py-1 font-mono text-xs dark:bg-olive-800">
                                    {payment.payment_reference || '—'}
                                </code>
                            </Td>
                            <Td align="right">
                                <span className="tabular-nums text-sm font-semibold">
                                    {money(payment.amount, payment.currency)}
                                </span>
                            </Td>
                            <Td>
                                <StatusBadge status={payment.status} />
                            </Td>
                            <Td>
                                <span className="whitespace-nowrap text-sm text-olive-600">
                                    {payment.reviewed_at
                                        ? formatDate(payment.reviewed_at, true)
                                        : '—'}
                                </span>
                                {payment.reviewer?.name ? (
                                    <p className="text-xs text-olive-400">
                                        by {payment.reviewer.name}
                                    </p>
                                ) : null}
                            </Td>
                        </tr>
                    ))}
                </tbody>
            </DataTable>
        </DataCard>
    );
}

export default function Show({
    user,
    membership,
    tab = 'profile',
    listings,
    payments,
    filters = {},
    stats = {},
}) {
    const { confirm, dialog } = useConfirm();
    const initials = (user.name || '?')
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() || '')
        .join('');

    const assignPlan = (plan, days = 30) => {
        router.post(route('admin.finance.assign'), {
            user_id: user.id,
            plan,
            ...(plan === 'free' ? {} : { duration_days: days }),
        });
    };

    const removeUser = async () => {
        const ok = await confirm({
            title: 'Delete member?',
            message: `Delete ${user.name}? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.users.destroy', memberRouteKey(user)));
    };

    return (
        <AdminLayout>
            <Head title={`${user.name} · Member`} />
            {dialog}

            <div className="mb-5">
                <Link
                    href={route('admin.users.index')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 transition hover:text-olive-900 dark:text-olive-400 dark:hover:text-olive-100"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to users
                </Link>
            </div>

            <header className="relative mb-6 overflow-hidden rounded-2xl border border-olive-200/80 bg-gradient-to-br from-olive-950 via-olive-900 to-earth-dusk text-white shadow-soft dark:border-olive-800">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 12% 20%, rgba(244,196,48,0.55), transparent 42%), radial-gradient(circle at 88% 10%, rgba(255,255,255,0.18), transparent 35%), linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.25))',
                    }}
                    aria-hidden
                />
                <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
                    <div className="flex min-w-0 items-start gap-4">
                        <div className="relative shrink-0">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt=""
                                    className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/25 sm:h-24 sm:w-24"
                                />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-mustard/90 font-display text-2xl font-bold text-earth-dusk ring-2 ring-white/25 sm:h-24 sm:w-24">
                                    {initials}
                                </div>
                            )}
                            {user.is_admin ? (
                                <span className="absolute -bottom-1.5 -right-1.5 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-olive-900 shadow">
                                    <Shield className="h-3 w-3" />
                                    Admin
                                </span>
                            ) : null}
                        </div>
                        <div className="min-w-0 pt-1">
                            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                                {user.name}
                            </h1>
                            <p className="mt-1 truncate text-sm text-white/70">
                                {user.username ? `@${user.username} · ` : ''}
                                {user.email}
                                {user.phone ? ` · ${user.phone}` : ''}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                                    {stats.listings ?? user.listings_count ?? 0} listings
                                </span>
                                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                                    {stats.payments ?? user.payments_count ?? 0} payments
                                </span>
                                <StatusBadge status={membership?.key || 'free'} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <AdminButton
                            size="sm"
                            variant="secondary"
                            type="button"
                            onClick={() =>
                                router.get(route('admin.finance.index'), {
                                    tab: 'payments',
                                    q: user.email || user.name,
                                })
                            }
                        >
                            Finance
                        </AdminButton>
                        <ActionMenu
                            items={[
                                {
                                    label: 'Set Free plan',
                                    onClick: () => assignPlan('free'),
                                },
                                {
                                    label: 'Set Standard (30 days)',
                                    onClick: () => assignPlan('featured', 30),
                                },
                                {
                                    label: 'Set Premium (30 days)',
                                    onClick: () => assignPlan('premium', 30),
                                },
                                {
                                    label: 'Delete member',
                                    danger: true,
                                    onClick: removeUser,
                                },
                            ]}
                        />
                    </div>
                </div>
            </header>

            <div className="mb-6">
                <MembershipPanel membership={membership} stats={stats} />
            </div>

            <ProfileTabs user={user} tab={tab} />

            {tab === 'profile' ? <ProfileEditor user={user} /> : null}
            {tab === 'listings' ? (
                <ListingsTab listings={listings} filters={filters} user={user} />
            ) : null}
            {tab === 'payments' ? (
                <PaymentsTab payments={payments} filters={filters} user={user} />
            ) : null}
        </AdminLayout>
    );
}
