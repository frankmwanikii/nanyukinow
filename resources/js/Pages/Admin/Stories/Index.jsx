import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionGroup,
    ActionIcon,
    AdminInput,
    AdminLink,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
    MediaCell,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { Head, router } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ stories, filters }) {
    const [q, setQ] = useState(filters.q || '');
    const [status, setStatus] = useState(filters.status || '');
    const skipDebounce = useRef(true);

    const pushFilters = (next) => {
        router.get(route('admin.stories.index'), next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    useEffect(() => {
        if (skipDebounce.current) {
            skipDebounce.current = false;
            return undefined;
        }

        const timer = setTimeout(() => {
            pushFilters({ q, status });
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <AdminLayout
            title="Stories"
            actions={
                <AdminLink href={route('admin.stories.create')}>
                    <Plus className="h-4 w-4" />
                    New story
                </AdminLink>
            }
        >
            <Head title="Admin stories" />

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="min-w-[200px] flex-1"
                />
                <AdminSelect
                    label="Status"
                    value={status}
                    onChange={(e) => {
                        const next = e.target.value;
                        setStatus(next);
                        pushFilters({ q, status: next });
                    }}
                    className="w-40"
                >
                    <option value="">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </AdminSelect>
            </FilterBar>

            {stories.data.length === 0 ? (
                <EmptyState
                    title="No stories yet"
                    description="Publish guides and editorial content for the Stories section."
                    action={
                        <AdminLink href={route('admin.stories.create')}>
                            Write a story
                        </AdminLink>
                    }
                />
            ) : (
                <DataCard
                    title={`${stories.meta?.total ?? stories.data.length} stories`}
                    footer={<Pagination links={stories.links} meta={stories.meta} />}
                >
                    <DataTable>
                        <thead>
                            <tr>
                                <Th>Story</Th>
                                <Th>Category</Th>
                                <Th>Author</Th>
                                <Th>Status</Th>
                                <Th>Updated</Th>
                                <Th align="right">Action</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {stories.data.map((story) => (
                                <tr key={story.id}>
                                    <Td>
                                        <MediaCell
                                            image={story.image_url}
                                            title={story.title}
                                            subtitle={story.slug}
                                            href={route('admin.stories.edit', story.id)}
                                        />
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">{story.category || '—'}</span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">{story.author || '—'}</span>
                                    </Td>
                                    <Td>
                                        <StatusBadge status={story.is_published ? 'published' : 'draft'} />
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500 dark:text-olive-400">
                                            {story.updated_at ? new Date(story.updated_at).toLocaleDateString() : '—'}
                                        </span>
                                    </Td>
                                    <Td align="right">
                                        <ActionGroup>
                                            <ActionIcon href={route('admin.stories.edit', story.id)} title="Edit">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </ActionIcon>
                                        </ActionGroup>
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
