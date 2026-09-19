import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminButton,
    AdminTextarea,
    DataCard,
    DataTable,
    EmptyState,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

function money(amount, currency = 'KES') {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
}

export default function Index({ upgrades, filters, counts }) {
    const [notes, setNotes] = useState({});
    const rows = upgrades?.data || [];

    const setNote = (id, value) => setNotes((prev) => ({ ...prev, [id]: value }));

    const approve = (upgrade) => {
        router.post(route('admin.upgrades.approve', upgrade.id), {
            admin_notes: notes[upgrade.id] || '',
            duration_days: 30,
        });
    };

    const reject = (upgrade) => {
        const admin_notes = notes[upgrade.id];
        if (!admin_notes?.trim()) {
            alert('Add a short rejection note first.');
            return;
        }
        router.post(route('admin.upgrades.reject', upgrade.id), { admin_notes });
    };

    const setFilter = (status) => {
        router.get(route('admin.upgrades.index'), { status }, { preserveState: true });
    };

    const tabs = [
        { key: 'pending', label: `Pending (${counts.pending})` },
        { key: 'approved', label: `Approved (${counts.approved})` },
        { key: 'rejected', label: `Rejected (${counts.rejected})` },
        { key: 'all', label: `All (${counts.all})` },
    ];

    return (
        <AdminLayout title="Upgrades">
            <Head title="Plan upgrades" />

            <p className="mb-5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Members pay via M-Pesa and submit a confirmation code. Approve to activate their
                Standard or Premium plan (and boost their free listings).
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => setFilter(tab.key)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                            filters.status === tab.key
                                ? 'bg-mustard text-earth-dusk'
                                : 'bg-white text-olive-700 ring-1 ring-olive-200 hover:bg-olive-50 dark:bg-olive-900 dark:text-olive-200 dark:ring-olive-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {rows.length === 0 ? (
                <EmptyState
                    title="No upgrade requests"
                    description="When members submit M-Pesa confirmations, they will appear here."
                />
            ) : (
                <DataCard title={`${rows.length} request${rows.length === 1 ? '' : 's'}`}>
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Member</Th>
                                <Th>Plan</Th>
                                <Th>Payment</Th>
                                <Th>Status</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((upgrade) => (
                                <tr key={upgrade.id}>
                                    <Td>
                                        <p className="font-medium text-olive-900 dark:text-olive-50">
                                            {upgrade.user?.name}
                                        </p>
                                        <p className="text-sm text-olive-500">{upgrade.user?.email}</p>
                                    </Td>
                                    <Td>
                                        <p className="text-sm text-olive-800 dark:text-olive-100">
                                            {upgrade.from_label} →{' '}
                                            <strong>{upgrade.to_label}</strong>
                                        </p>
                                        <p className="text-sm text-olive-500">
                                            {money(upgrade.amount, upgrade.currency)} /{' '}
                                            {upgrade.billing_period}
                                        </p>
                                    </Td>
                                    <Td>
                                        <code className="rounded bg-olive-100 px-2 py-1 text-sm dark:bg-olive-800">
                                            {upgrade.payment_reference}
                                        </code>
                                        <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-olive-500">
                                            {upgrade.payment_method || 'mpesa'}
                                        </p>
                                        {upgrade.member_notes && (
                                            <p className="mt-1.5 max-w-xs text-sm text-olive-500">
                                                {upgrade.member_notes}
                                            </p>
                                        )}
                                    </Td>
                                    <Td>
                                        <StatusBadge status={upgrade.status} />
                                    </Td>
                                    <Td align="right">
                                        {upgrade.status === 'pending' ? (
                                            <div className="ml-auto max-w-xs space-y-2 text-left">
                                                <AdminTextarea
                                                    label="Admin note"
                                                    rows={2}
                                                    value={notes[upgrade.id] || ''}
                                                    onChange={(e) =>
                                                        setNote(upgrade.id, e.target.value)
                                                    }
                                                    placeholder="Optional for approve; required to reject"
                                                />
                                                <div className="flex flex-wrap justify-end gap-2">
                                                    <AdminButton
                                                        size="sm"
                                                        type="button"
                                                        onClick={() => approve(upgrade)}
                                                    >
                                                        Approve
                                                    </AdminButton>
                                                    <AdminButton
                                                        size="sm"
                                                        variant="danger"
                                                        type="button"
                                                        onClick={() => reject(upgrade)}
                                                    >
                                                        Reject
                                                    </AdminButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <ActionMenu
                                                items={[
                                                    {
                                                        label: 'View member listings',
                                                        href: route('admin.listings.index', {
                                                            q: upgrade.user?.name,
                                                        }),
                                                    },
                                                ]}
                                            />
                                        )}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </DataTable>
                </DataCard>
            )}
        </AdminLayout>
    );
}
