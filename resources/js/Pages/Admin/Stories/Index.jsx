import AdminLayout from '@/Layouts/AdminLayout';
import {
    ActionMenu,
    AdminInput,
    AdminLink,
    AdminSelect,
    DataCard,
    DataTable,
    EmptyState,
    FilterBar,
    MediaCell,
    PageHeader,
    Pagination,
    StatusBadge,
    Td,
    Th,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router } from '@inertiajs/react';
import { Plus } from '@/Components/site/LucideCompat';
import { useEffect, useRef, useState } from 'react';

export default function Index({ stories, categories = [], filters }) {
    const { confirm, dialog } = useConfirm();
    const [q, setQ] = useState(filters.q || '');
    const [status, setStatus] = useState(filters.status || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || 15);
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
            pushFilters({
                q,
                status,
                category_id: categoryId,
                per_page: perPage,
            });
        }, 350);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    return (
        <AdminLayout>
            <Head title="Admin stories" />
            {dialog}

            <PageHeader
                title="Stories"
                description="Newsroom for guides and editorial content."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <AdminLink
                            href={route('admin.story-categories.index')}
                            variant="secondary"
                        >
                            Categories
                        </AdminLink>
                        <AdminLink href={route('admin.stories.create')}>
                            <Plus className="h-4 w-4" />
                            New story
                        </AdminLink>
                    </div>
                }
            />

            <FilterBar>
                <AdminInput
                    label="Search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="min-w-[200px] flex-1"
                    placeholder="Search stories…"
                />
                <AdminSelect
                    label="Status"
                    value={status}
                    onChange={(e) => {
                        const next = e.target.value;
                        setStatus(next);
                        pushFilters({
                            q,
                            status: next,
                            category_id: categoryId,
                            per_page: perPage,
                        });
                    }}
                    className="w-40"
                >
                    <option value="">All statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </AdminSelect>
                <AdminSelect
                    label="Category"
                    value={categoryId}
                    onChange={(e) => {
                        const next = e.target.value;
                        setCategoryId(next);
                        pushFilters({
                            q,
                            status,
                            category_id: next,
                            per_page: perPage,
                        });
                    }}
                    className="min-w-[10rem]"
                >
                    <option value="">All categories</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
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
                    footer={
                        <Pagination
                            links={stories.links}
                            meta={stories.meta || stories}
                            perPage={perPage}
                            onPerPageChange={(n) => {
                                setPerPage(n);
                                pushFilters({
                                    q,
                                    status,
                                    category_id: categoryId,
                                    per_page: n,
                                });
                            }}
                        />
                    }
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
                                            subtitle={
                                                story.is_featured
                                                    ? `${story.slug} · Featured`
                                                    : story.slug
                                            }
                                            href={route(
                                                'admin.stories.edit',
                                                story.id,
                                            )}
                                        />
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">
                                            {story.category || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-600 dark:text-olive-300">
                                            {story.author || '—'}
                                        </span>
                                    </Td>
                                    <Td>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <StatusBadge
                                                status={
                                                    story.is_published
                                                        ? 'published'
                                                        : 'draft'
                                                }
                                            />
                                            {story.is_featured ? (
                                                <span className="inline-flex rounded-full bg-mustard/25 px-2 py-0.5 text-[0.65rem] font-semibold text-olive-900 dark:text-mustard">
                                                    Featured
                                                </span>
                                            ) : null}
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="text-sm text-olive-500 dark:text-olive-400">
                                            {story.updated_at
                                                ? new Date(
                                                      story.updated_at,
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </span>
                                    </Td>
                                    <Td align="right">
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: 'Edit',
                                                    href: route(
                                                        'admin.stories.edit',
                                                        story.id,
                                                    ),
                                                },
                                                {
                                                    label: 'View',
                                                    href: route(
                                                        'stories.show',
                                                        story.slug,
                                                    ),
                                                    external: true,
                                                },
                                                {
                                                    label: 'Delete',
                                                    danger: true,
                                                    onClick: async () => {
                                                        const ok =
                                                            await confirm({
                                                                title: 'Delete story?',
                                                                message: `Delete “${story.title}”? This cannot be undone.`,
                                                                confirmLabel:
                                                                    'Delete',
                                                            });
                                                        if (!ok) return;
                                                        router.delete(
                                                            route(
                                                                'admin.stories.destroy',
                                                                story.id,
                                                            ),
                                                        );
                                                    },
                                                },
                                            ]}
                                        />
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
