import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminInput,
    AdminLink,
    FormPanel,
    PageHeader,
} from '@/Components/Admin/ui';
import { useConfirm } from '@/Components/ConfirmDialog';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function Form({ category }) {
    const { confirm, dialog } = useConfirm();
    const isEdit = Boolean(category?.id);

    const form = useForm({
        name: category?.name || '',
        sort_order: category?.sort_order ?? 0,
    });

    const { data, setData, processing, errors } = form;

    const save = (e) => {
        e.preventDefault();
        if (isEdit) {
            form.put(route('admin.categories.update', category.id));
        } else {
            form.post(route('admin.categories.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? `Edit · ${category.name}` : 'New category'} />
            {dialog}

            <PageHeader
                title={isEdit ? 'Edit category' : 'Add category'}
                actions={
                    <div className="flex gap-2">
                        <AdminLink href={route('admin.categories.index')} variant="secondary">
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </AdminLink>
                        {isEdit ? (
                            <AdminButton
                                variant="danger"
                                onClick={async () => {
                                    const ok = await confirm({
                                        title: 'Delete category?',
                                        message: `Delete category “${category.name}”?`,
                                        confirmLabel: 'Delete',
                                    });
                                    if (!ok) return;
                                    router.delete(route('admin.categories.destroy', category.id));
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </AdminButton>
                        ) : null}
                    </div>
                }
            />

            <form onSubmit={save} className="w-full space-y-4">
                <FormPanel title="Category details">
                    <div className="grid gap-4">
                        <AdminInput
                            label="Name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            required
                        />
                        <AdminInput
                            label="Sort order"
                            type="number"
                            value={data.sort_order}
                            onChange={(e) => setData('sort_order', e.target.value)}
                            error={errors.sort_order}
                        />
                    </div>
                </FormPanel>

                <div className="flex justify-end gap-2">
                    <AdminLink href={route('admin.categories.index')} variant="secondary">
                        Cancel
                    </AdminLink>
                    <AdminButton type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving…' : isEdit ? 'Save changes' : 'Create category'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
