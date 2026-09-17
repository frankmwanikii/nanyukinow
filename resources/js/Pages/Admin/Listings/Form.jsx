import AdminLayout from '@/Layouts/AdminLayout';
import {
    AdminButton,
    AdminCheckbox,
    AdminInput,
    AdminSelect,
    AdminTextarea,
    AdminLink,
    FormPanel,
} from '@/Components/Admin/ui';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

function toLines(value) {
    if (Array.isArray(value)) return value.join('\n');
    return value || '';
}

function fromLines(value) {
    if (Array.isArray(value)) return value;
    return String(value || '')
        .split(/\r\n|\r|\n/)
        .map((line) => line.trim())
        .filter(Boolean);
}

export default function Form({ listing, categories, owners, statuses, tiers, claimStatuses }) {
    const isEdit = Boolean(listing?.id);

    const form = useForm({
        user_id: listing?.user_id || '',
        category_id: listing?.category_id || '',
        title: listing?.title || '',
        slug: listing?.slug || '',
        location: listing?.location || '',
        description: listing?.description || '',
        tagline: listing?.tagline || '',
        phone: listing?.phone || '',
        email: listing?.email || '',
        website: listing?.website || '',
        whatsapp: listing?.whatsapp || '',
        address: listing?.address || '',
        city: listing?.city || '',
        latitude: listing?.latitude ?? '',
        longitude: listing?.longitude ?? '',
        image_url: listing?.image_url || '',
        logo_url: listing?.logo_url || '',
        rating: listing?.rating ?? '',
        status: listing?.status || 'published',
        tier: listing?.tier || 'free',
        priority: listing?.priority ?? 0,
        views_count: listing?.views_count ?? 0,
        price_range: listing?.price_range || '',
        gallery: toLines(listing?.gallery),
        hours: JSON.stringify(listing?.hours || { mon: '9:00-17:00' }, null, 2),
        amenities: toLines(listing?.amenities),
        social_links: JSON.stringify(listing?.social_links || {}, null, 2),
        expires_at: listing?.expires_at || '',
        published_at: listing?.published_at || '',
        claim_status: listing?.claim_status || 'unclaimed',
        is_featured: listing?.is_featured || false,
        is_trending: listing?.is_trending || false,
        is_published: listing?.is_published ?? true,
    });

    const { data, setData, processing, errors } = form;

    const save = (e) => {
        e.preventDefault();

        form
            .transform((d) => ({
                ...d,
                gallery: fromLines(d.gallery),
                amenities: fromLines(d.amenities),
                user_id: d.user_id || null,
                category_id: d.category_id || null,
                latitude: d.latitude === '' ? null : d.latitude,
                longitude: d.longitude === '' ? null : d.longitude,
                rating: d.rating === '' ? null : d.rating,
                expires_at: d.expires_at || null,
                published_at: d.published_at || null,
                website: d.website || null,
                email: d.email || null,
            }))
            [isEdit ? 'put' : 'post'](
                isEdit
                    ? route('admin.listings.update', listing.id)
                    : route('admin.listings.store'),
            );
    };

    const remove = () => {
        if (!confirm('Delete this listing permanently?')) return;
        router.delete(route('admin.listings.destroy', listing.id));
    };

    return (
        <AdminLayout
            title={isEdit ? 'Edit listing' : 'New listing'}
            actions={
                <div className="flex items-center gap-2">
                    <AdminLink href={route('admin.listings.index')} variant="secondary">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </AdminLink>
                    {isEdit && (
                        <AdminButton variant="danger" onClick={remove}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </AdminButton>
                    )}
                </div>
            }
        >
            <Head title={isEdit ? `Edit · ${listing.title}` : 'New listing'} />

            <form onSubmit={save} className="space-y-4">
                <FormPanel title="Basics">
                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminInput label="Title" value={data.title} onChange={(e) => setData('title', e.target.value)} error={errors.title} className="md:col-span-2" required />
                        <AdminInput label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} placeholder="auto from title if empty" />
                        <AdminInput label="Tagline" value={data.tagline} onChange={(e) => setData('tagline', e.target.value)} error={errors.tagline} />
                        <AdminTextarea label="Description" value={data.description} onChange={(e) => setData('description', e.target.value)} error={errors.description} rows={4} className="md:col-span-2" />
                        <AdminSelect label="Category" value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} error={errors.category_id}>
                            <option value="">Uncategorized</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </AdminSelect>
                        <AdminSelect label="Owner" value={data.user_id} onChange={(e) => setData('user_id', e.target.value)} error={errors.user_id}>
                            <option value="">No owner</option>
                            {owners.map((o) => <option key={o.id} value={o.id}>{o.name} · {o.email}</option>)}
                        </AdminSelect>
                    </div>
                </FormPanel>

                <FormPanel title="Visibility & package">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <AdminSelect label="Status" value={data.status} onChange={(e) => setData('status', e.target.value)} error={errors.status}>
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </AdminSelect>
                        <AdminSelect label="Tier / package" value={data.tier} onChange={(e) => setData('tier', e.target.value)} error={errors.tier}>
                            {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
                        </AdminSelect>
                        <AdminInput label="Priority" type="number" min="0" value={data.priority} onChange={(e) => setData('priority', e.target.value)} error={errors.priority} />
                        <AdminSelect label="Claim status" value={data.claim_status} onChange={(e) => setData('claim_status', e.target.value)} error={errors.claim_status}>
                            {claimStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </AdminSelect>
                        <AdminInput label="Expires at" type="datetime-local" value={data.expires_at} onChange={(e) => setData('expires_at', e.target.value)} error={errors.expires_at} />
                        <AdminInput label="Published at" type="datetime-local" value={data.published_at} onChange={(e) => setData('published_at', e.target.value)} error={errors.published_at} />
                        <AdminInput label="Rating" type="number" step="0.1" min="0" max="5" value={data.rating} onChange={(e) => setData('rating', e.target.value)} error={errors.rating} />
                        <AdminInput label="Price range" value={data.price_range} onChange={(e) => setData('price_range', e.target.value)} error={errors.price_range} placeholder="$$ · mid" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-5">
                        <AdminCheckbox label="Published on site" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)} />
                        <AdminCheckbox label="Featured" checked={data.is_featured} onChange={(e) => setData('is_featured', e.target.checked)} />
                        <AdminCheckbox label="Trending" checked={data.is_trending} onChange={(e) => setData('is_trending', e.target.checked)} />
                    </div>
                </FormPanel>

                <FormPanel title="Contact & location">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <AdminInput label="Phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} error={errors.phone} />
                        <AdminInput label="WhatsApp" value={data.whatsapp} onChange={(e) => setData('whatsapp', e.target.value)} error={errors.whatsapp} />
                        <AdminInput label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                        <AdminInput label="Website" value={data.website} onChange={(e) => setData('website', e.target.value)} error={errors.website} placeholder="https://" className="xl:col-span-2" />
                        <AdminInput label="Location label" value={data.location} onChange={(e) => setData('location', e.target.value)} error={errors.location} />
                        <AdminInput label="Address" value={data.address} onChange={(e) => setData('address', e.target.value)} error={errors.address} className="md:col-span-2" />
                        <AdminInput label="City" value={data.city} onChange={(e) => setData('city', e.target.value)} error={errors.city} />
                        <AdminInput label="Latitude" value={data.latitude} onChange={(e) => setData('latitude', e.target.value)} error={errors.latitude} />
                        <AdminInput label="Longitude" value={data.longitude} onChange={(e) => setData('longitude', e.target.value)} error={errors.longitude} />
                    </div>
                </FormPanel>

                <FormPanel title="Media & details">
                    <div className="grid gap-4 md:grid-cols-2">
                        <AdminInput label="Cover image URL" value={data.image_url} onChange={(e) => setData('image_url', e.target.value)} error={errors.image_url} />
                        <AdminInput label="Logo URL" value={data.logo_url} onChange={(e) => setData('logo_url', e.target.value)} error={errors.logo_url} />
                        {(data.image_url || data.logo_url) && (
                            <div className="flex gap-3 md:col-span-2">
                                {data.image_url && <img src={data.image_url} alt="" className="h-24 w-40 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />}
                                {data.logo_url && <img src={data.logo_url} alt="" className="h-24 w-24 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-700" />}
                            </div>
                        )}
                        <AdminTextarea label="Gallery image URLs (one per line)" value={data.gallery} onChange={(e) => setData('gallery', e.target.value)} error={errors.gallery} rows={4} />
                        <AdminTextarea label="Amenities (one per line)" value={data.amenities} onChange={(e) => setData('amenities', e.target.value)} error={errors.amenities} rows={4} />
                        <AdminTextarea label="Opening hours (JSON)" value={data.hours} onChange={(e) => setData('hours', e.target.value)} error={errors.hours} rows={5} className="font-mono text-xs" />
                        <AdminTextarea label="Social links (JSON)" value={data.social_links} onChange={(e) => setData('social_links', e.target.value)} error={errors.social_links} rows={5} className="font-mono text-xs" />
                    </div>
                </FormPanel>

                <div className="flex justify-end gap-2">
                    <AdminLink href={route('admin.listings.index')} variant="secondary">
                        Cancel
                    </AdminLink>
                    <AdminButton type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving…' : 'Save listing'}
                    </AdminButton>
                </div>
            </form>
        </AdminLayout>
    );
}
