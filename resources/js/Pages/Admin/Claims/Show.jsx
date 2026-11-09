import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminSelect,
    AdminTabs,
    AdminTextarea,
    FormPanel,
    PageHeader,
    StatusBadge,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    ExternalLink,
    FileText,
    RotateCcw,
    Settings2,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

function formatDate(iso) {
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

function isImageUrl(url = '') {
    return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url);
}

function ClaimTabs({ tab, onChange, docsCount }) {
    return (
        <AdminTabs
            label="Claim sections"
            value={tab}
            onChange={onChange}
            items={[
                { id: 'review', label: 'Review' },
                {
                    id: 'documents',
                    label: 'Documents',
                    badge: docsCount > 0 ? docsCount : null,
                },
                { id: 'advanced', label: 'Advanced', icon: Settings2 },
            ]}
        />
    );
}

function Field({ label, children }) {
    return (
        <div>
            <dt className="text-xs font-medium text-olive-500">
                {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-olive-950 dark:text-olive-50">
                {children}
            </dd>
        </div>
    );
}

export default function Show({ claim, suggestedOwners = [] }) {
    const { confirm, dialog } = useConfirm();
    const [tab, setTab] = useState('review');
    const [action, setAction] = useState(null); // approve | reject
    const form = useForm({
        admin_notes: '',
        assign_to_user_id: claim.user_id || suggestedOwners[0]?.id || '',
        create_account: true,
        notify_claimant: true,
    });

    const pending = claim.status === 'pending';
    const docsCount = claim.documents?.length || 0;

    const submitDecision = (e) => {
        e.preventDefault();
        if (!action) return;
        const routeName =
            action === 'approve'
                ? 'admin.claims.approve'
                : 'admin.claims.reject';
        form.post(route(routeName, claim.id), {
            preserveScroll: true,
            onSuccess: () => setAction(null),
        });
    };

    const reopenClaim = async () => {
        const ok = await confirm({
            title: 'Reopen claim?',
            message:
                'This sets the claim back to pending and marks the listing as pending review.',
            confirmLabel: 'Reopen',
            tone: 'warning',
        });
        if (!ok) return;
        router.post(route('admin.claims.reopen', claim.id), {}, {
            preserveScroll: true,
        });
    };

    const deleteClaim = async () => {
        const ok = await confirm({
            title: 'Delete claim?',
            message: `Delete the claim from “${claim.full_name}”? This cannot be undone.`,
            confirmLabel: 'Delete',
        });
        if (!ok) return;
        router.delete(route('admin.claims.destroy', claim.id));
    };

    return (
        <AdminLayout>
            <Head title={`Claim · ${claim.full_name}`} />
            {dialog}

            <PageHeader
                title="Review claim"
                description="Approve to assign the listing to this claimant, or reject with a note."
                actions={
                    <Link
                        href={route('admin.claims.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-olive-600 hover:text-olive-950 dark:text-olive-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        All claims
                    </Link>
                }
            />

            <ClaimTabs
                tab={tab}
                onChange={setTab}
                docsCount={docsCount}
            />

            {tab === 'review' ? (
                <div className="w-full space-y-5">
                    <FormPanel title="Listing">
                        <div className="flex items-start gap-4">
                            {claim.listing?.image ? (
                                <img
                                    src={claim.listing.image}
                                    alt=""
                                    className="h-20 w-20 rounded-xl object-cover ring-1 ring-olive-200"
                                />
                            ) : null}
                            <div className="min-w-0 flex-1">
                                <p className="font-display text-lg font-semibold text-olive-950 dark:text-olive-50">
                                    {claim.listing?.title || 'Listing removed'}
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {claim.listing?.slug ? (
                                        <a
                                            href={route(
                                                'listings.show',
                                                claim.listing.slug,
                                            )}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3 py-1.5 text-xs font-semibold text-olive-800 ring-1 ring-olive-200 dark:bg-olive-800 dark:text-olive-100 dark:ring-olive-700"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View listing
                                        </a>
                                    ) : null}
                                    {claim.listing?.slug ? (
                                        <Link
                                            href={route(
                                                'admin.listings.edit',
                                                claim.listing.slug,
                                            )}
                                            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-olive-700 ring-1 ring-olive-200 dark:text-olive-200 dark:ring-olive-700"
                                        >
                                            Edit in admin
                                        </Link>
                                    ) : null}
                                    <StatusBadge
                                        status={
                                            claim.listing?.claim_status ||
                                            'unclaimed'
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </FormPanel>

                    <FormPanel title="Claimant">
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Field label="Name">{claim.full_name}</Field>
                            <Field label="Email">
                                <a
                                    href={`mailto:${claim.email}`}
                                    className="hover:underline"
                                >
                                    {claim.email}
                                </a>
                            </Field>
                            <Field label="Phone">
                                <a
                                    href={`tel:${claim.phone}`}
                                    className="hover:underline"
                                >
                                    {claim.phone}
                                </a>
                            </Field>
                            <Field label="Account">
                                {claim.user ? (
                                    <Link
                                        href={route(
                                            'admin.users.show',
                                            claim.user.username ||
                                                claim.user.id,
                                        )}
                                        className="text-olive-700 underline-offset-2 hover:underline dark:text-mustard"
                                    >
                                        {claim.user.name}
                                    </Link>
                                ) : (
                                    <span className="text-olive-500">
                                        Guest / no account yet
                                    </span>
                                )}
                            </Field>
                            <div className="sm:col-span-2">
                                <Field label="Reason">
                                    <span className="whitespace-pre-wrap font-normal leading-relaxed text-olive-800 dark:text-olive-200">
                                        {claim.reason}
                                    </span>
                                </Field>
                            </div>
                        </dl>
                    </FormPanel>

                    <FormPanel title="Status">
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Field label="Claim">
                                <StatusBadge status={claim.status} />
                            </Field>
                            <Field label="Submitted">
                                {formatDate(claim.created_at)}
                            </Field>
                            {claim.reviewed_at ? (
                                <>
                                    <Field label="Reviewed">
                                        {formatDate(claim.reviewed_at)}
                                    </Field>
                                    <Field label="By">
                                        {claim.reviewer?.name || '—'}
                                    </Field>
                                </>
                            ) : null}
                            {claim.admin_notes ? (
                                <div className="sm:col-span-2">
                                    <Field label="Admin notes">
                                        <span className="whitespace-pre-wrap font-normal text-olive-800 dark:text-olive-200">
                                            {claim.admin_notes}
                                        </span>
                                    </Field>
                                </div>
                            ) : null}
                        </dl>
                        {docsCount > 0 ? (
                            <button
                                type="button"
                                onClick={() => setTab('documents')}
                                className="mt-4 text-sm font-semibold text-earth-clay hover:text-earth-dusk dark:text-mustard"
                            >
                                View {docsCount} supporting document
                                {docsCount === 1 ? '' : 's'} →
                            </button>
                        ) : null}
                    </FormPanel>

                </div>
            ) : null}

            {tab === 'documents' ? (
                <div className="w-full space-y-5">
                    <FormPanel
                        title="Supporting documents"
                        description={
                            docsCount
                                ? `${docsCount} file${docsCount === 1 ? '' : 's'} attached by the claimant`
                                : 'No documents were uploaded with this claim'
                        }
                    >
                        {docsCount ? (
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {claim.documents.map((doc) => (
                                    <li key={doc.url}>
                                        <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block overflow-hidden rounded-xl border border-olive-200 bg-olive-50 transition hover:border-mustard dark:border-olive-700 dark:bg-olive-950"
                                        >
                                            <div className="aspect-[4/3] bg-olive-100 dark:bg-olive-900">
                                                {isImageUrl(doc.url) ? (
                                                    <img
                                                        src={doc.url}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full flex-col items-center justify-center gap-2 text-olive-600">
                                                        <FileText className="h-8 w-8 text-mustard" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="truncate px-2.5 py-2 text-xs font-semibold text-olive-800 dark:text-olive-200">
                                                {doc.name || 'Document'}
                                            </p>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-olive-500">
                                Claimant did not attach documents.
                            </p>
                        )}
                    </FormPanel>
                </div>
            ) : null}

            {tab === 'advanced' ? (
                <div className="w-full space-y-5">
                    <FormPanel
                        title="Ownership on approve"
                        description="Control who receives the listing when this claim is approved."
                    >
                        <div className="space-y-4">
                            <AdminSelect
                                label="Assign listing to"
                                value={String(form.data.assign_to_user_id || '')}
                                onChange={(e) =>
                                    form.setData(
                                        'assign_to_user_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">
                                    Auto (match email / create account)
                                </option>
                                {suggestedOwners.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} · {user.email}
                                    </option>
                                ))}
                            </AdminSelect>

                            <AdminCheckbox
                                label="Create member account from claimant email if none exists"
                                checked={Boolean(form.data.create_account)}
                                onChange={(e) =>
                                    form.setData(
                                        'create_account',
                                        e.target.checked,
                                    )
                                }
                            />

                            <AdminCheckbox
                                label="Notify claimant after approve / reject (when messaging is configured)"
                                checked={Boolean(form.data.notify_claimant)}
                                onChange={(e) =>
                                    form.setData(
                                        'notify_claimant',
                                        e.target.checked,
                                    )
                                }
                            />

                            <p className="text-xs text-olive-500">
                                These options apply when you approve below.
                                Suggested owners are matched by email or phone
                                on this claim.
                            </p>
                        </div>
                    </FormPanel>

                    <FormPanel
                        title="Internal notes"
                        description="Saved with the next approve or reject decision."
                    >
                        <AdminTextarea
                            label="Admin notes"
                            value={form.data.admin_notes}
                            onChange={(e) =>
                                form.setData('admin_notes', e.target.value)
                            }
                            rows={4}
                            placeholder="Verification steps, ID checks, follow-ups…"
                        />
                    </FormPanel>

                    <FormPanel
                        title="Danger zone"
                        description="Reopen a closed claim or permanently remove it."
                    >
                        <div className="flex flex-wrap gap-2">
                            {!pending ? (
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    onClick={reopenClaim}
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reopen as pending
                                </AdminButton>
                            ) : null}
                            <AdminButton
                                type="button"
                                variant="danger"
                                onClick={deleteClaim}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete claim
                            </AdminButton>
                        </div>
                    </FormPanel>
                </div>
            ) : null}

            {pending ? (
                <div className="mt-5 w-full">
                    <FormPanel title="Decision">
                        {!action ? (
                            <div className="flex flex-wrap gap-2">
                                <AdminButton
                                    type="button"
                                    onClick={() => {
                                        setAction('approve');
                                        form.clearErrors();
                                    }}
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Approve claim
                                </AdminButton>
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setAction('reject');
                                        form.clearErrors();
                                    }}
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject claim
                                </AdminButton>
                            </div>
                        ) : (
                            <form
                                onSubmit={submitDecision}
                                className="space-y-4"
                            >
                                <p className="text-sm text-olive-600 dark:text-olive-300">
                                    {action === 'approve'
                                        ? 'Approving assigns this listing to the claimant and marks it as claimed. Ownership options under Advanced are included.'
                                        : 'Rejecting returns the listing to unclaimed if no other claims are pending.'}
                                </p>
                                <AdminTextarea
                                    label={
                                        action === 'reject'
                                            ? 'Reason for rejection'
                                            : 'Admin notes (optional)'
                                    }
                                    value={form.data.admin_notes}
                                    onChange={(e) =>
                                        form.setData(
                                            'admin_notes',
                                            e.target.value,
                                        )
                                    }
                                    rows={4}
                                    error={form.errors.admin_notes}
                                    required={action === 'reject'}
                                />
                                <div className="flex flex-wrap gap-2">
                                    <AdminButton
                                        type="submit"
                                        disabled={form.processing}
                                        variant={
                                            action === 'reject'
                                                ? 'danger'
                                                : 'primary'
                                        }
                                    >
                                        {form.processing
                                            ? 'Saving…'
                                            : action === 'approve'
                                              ? 'Confirm approve'
                                              : 'Confirm reject'}
                                    </AdminButton>
                                    <AdminButton
                                        type="button"
                                        variant="secondary"
                                        disabled={form.processing}
                                        onClick={() => setAction(null)}
                                    >
                                        Cancel
                                    </AdminButton>
                                </div>
                            </form>
                        )}
                    </FormPanel>
                </div>
            ) : null}
        </AdminLayout>
    );
}
