import AdminLayout from '@/Layouts/AdminLayout';
import { DataCard, EmptyState, PageHeader } from '@/Components/Admin/ui';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ q = '', groups = [] }) {
    const [term, setTerm] = useState(q);
    const inputRef = useRef(null);
    const total = groups.reduce((sum, group) => sum + (group.items?.length || 0), 0);

    useEffect(() => {
        setTerm(q);
    }, [q]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const submit = (e) => {
        e.preventDefault();
        router.get(
            route('admin.search'),
            { q: term.trim() || undefined },
            { preserveState: true },
        );
    };

    return (
        <AdminLayout>
            <Head title={q ? `Search: ${q}` : 'Search'} />

            <PageHeader
                title="Search"
                description="Jump to any admin page, or find listings, users, messages, claims, reports, and payments."
            />

            <form onSubmit={submit} className="mb-5 max-w-xl" role="search">
                <label className="block">
                    <span className="sr-only">Search admin</span>
                    <input
                        ref={inputRef}
                        type="search"
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        placeholder="Search everything in admin"
                        className="h-10 w-full rounded-md border border-olive-200 bg-white px-3 text-sm text-olive-900 outline-none placeholder:text-olive-400 focus:border-olive-600 focus:ring-1 focus:ring-olive-600/30 dark:border-olive-700 dark:bg-olive-950 dark:text-olive-50 dark:placeholder:text-olive-500"
                    />
                </label>
            </form>

            {!q ? (
                <EmptyState
                    title="Search the admin console"
                    description="Type a name, email, title, reference, or keyword, then press Enter."
                />
            ) : total === 0 ? (
                <EmptyState
                    title={`No results for "${q}"`}
                    description="Try a shorter keyword, or check spelling."
                />
            ) : (
                <div className="grid gap-3 xl:grid-cols-2">
                    {groups.map((group) => (
                        <DataCard
                            key={group.key}
                            title={`${group.label} (${group.items.length})`}
                        >
                            <ul className="divide-y divide-olive-100 dark:divide-olive-800">
                                {group.items.map((item) => (
                                    <li key={`${group.key}-${item.id}`}>
                                        <Link
                                            href={item.href}
                                            className="block px-4 py-3 transition hover:bg-olive-50 dark:hover:bg-olive-800/40"
                                        >
                                            <p className="text-sm font-semibold text-olive-950 dark:text-olive-50">
                                                {item.title}
                                            </p>
                                            {item.subtitle ? (
                                                <p className="mt-0.5 text-sm text-olive-500 dark:text-olive-400">
                                                    {item.subtitle}
                                                </p>
                                            ) : null}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </DataCard>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
