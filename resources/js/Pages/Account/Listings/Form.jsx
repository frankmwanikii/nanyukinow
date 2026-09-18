import SiteLayout from '@/Layouts/SiteLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const field =
    'w-full rounded-xl border border-olive-200 bg-white px-3.5 py-3 text-base text-olive-900 outline-none transition placeholder:text-olive-400 focus:border-mustard focus:ring-2 focus:ring-mustard/30';
const label = 'mb-1.5 block text-sm font-semibold text-olive-600';

const tierHelp = {
    free: 'Free listing — basic placement',
    featured: 'Featured badge on cards (Standard plan)',
    premium: 'Premium badge & top placement',
};

export default function Form({ listing = null, categories = [], plan, allowedTiers = ['free'] }) {
    const isEdit = Boolean(listing?.id);

    const form = useForm({
        title: listing?.title || '',
        category_id: listing?.category_id || categories[0]?.id || '',
        location: listing?.location || 'Nanyuki',
        tagline: listing?.tagline || '',
        description: listing?.description || '',
        phone: listing?.phone || '',
        whatsapp: listing?.whatsapp || '',
        email: listing?.email || '',
        website: listing?.website || '',
        address: listing?.address || '',
        image_url: listing?.image_url || '',
        tier: listing?.tier || plan?.key || 'free',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            form.put(route('account.listings.update', listing.id));
        } else {
            form.post(route('account.listings.store'));
        }
    };

    return (
        <SiteLayout>
            <Head title={isEdit ? 'Edit listing' : 'New listing'} />

            <div className="bg-olive-900">
                <div className="mx-auto max-w-3xl px-4 pb-8 pt-28 sm:px-6 sm:pt-32">
                    <Link
                        href={route('account.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-mustard"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to account
                    </Link>
                    <h1 className="mt-3 font-display text-3xl font-bold text-white">
                        {isEdit ? 'Edit listing' : 'Add a listing'}
                    </h1>
                    <p className="mt-2 text-sm text-white/65">
                        Plan: {plan.label} · {plan.listings_remaining} slot
                        {plan.listings_remaining === 1 ? '' : 's'} remaining
                        {!isEdit && ' · submitted listings go to review before going live'}
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <form
                    onSubmit={submit}
                    className="space-y-5 rounded-2xl border border-olive-200/80 bg-white p-6 shadow-soft sm:p-8"
                >
                    <div>
                        <label className={label} htmlFor="title">
                            Business / place name
                        </label>
                        <input
                            id="title"
                            className={field}
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            required
                        />
                        {form.errors.title && (
                            <p className="mt-1.5 text-sm text-rose-600">{form.errors.title}</p>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={label} htmlFor="category_id">
                                Category
                            </label>
                            <select
                                id="category_id"
                                className={field}
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                required
                            >
                                <option value="">Select…</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {form.errors.category_id && (
                                <p className="mt-1.5 text-sm text-rose-600">{form.errors.category_id}</p>
                            )}
                        </div>
                        <div>
                            <label className={label} htmlFor="tier">
                                Listing tier
                            </label>
                            <select
                                id="tier"
                                className={field}
                                value={form.data.tier}
                                onChange={(e) => form.setData('tier', e.target.value)}
                            >
                                {allowedTiers.map((t) => (
                                    <option key={t} value={t}>
                                        {tierHelp[t] || t}
                                    </option>
                                ))}
                            </select>
                            {form.errors.tier && (
                                <p className="mt-1.5 text-sm text-rose-600">{form.errors.tier}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={label} htmlFor="tagline">
                            Short tagline
                        </label>
                        <input
                            id="tagline"
                            className={field}
                            value={form.data.tagline}
                            onChange={(e) => form.setData('tagline', e.target.value)}
                            placeholder="What makes this place special?"
                        />
                    </div>

                    <div>
                        <label className={label} htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={5}
                            className={field}
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={label} htmlFor="location">
                                Location
                            </label>
                            <input
                                id="location"
                                className={field}
                                value={form.data.location}
                                onChange={(e) => form.setData('location', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="address">
                                Address
                            </label>
                            <input
                                id="address"
                                className={field}
                                value={form.data.address}
                                onChange={(e) => form.setData('address', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className={label} htmlFor="phone">
                                Phone
                            </label>
                            <input
                                id="phone"
                                className={field}
                                value={form.data.phone}
                                onChange={(e) => form.setData('phone', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="whatsapp">
                                WhatsApp
                            </label>
                            <input
                                id="whatsapp"
                                className={field}
                                value={form.data.whatsapp}
                                onChange={(e) => form.setData('whatsapp', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className={field}
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={label} htmlFor="website">
                                Website
                            </label>
                            <input
                                id="website"
                                className={field}
                                value={form.data.website}
                                onChange={(e) => form.setData('website', e.target.value)}
                                placeholder="https://"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={label} htmlFor="image_url">
                            Cover image URL
                        </label>
                        <input
                            id="image_url"
                            className={field}
                            value={form.data.image_url}
                            onChange={(e) => form.setData('image_url', e.target.value)}
                            placeholder="https://…"
                        />
                        <p className="mt-1.5 text-xs text-olive-500">
                            Paste a direct image link for now. Upload support can be added later.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <Link
                            href={route('account.index')}
                            className="rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-semibold text-olive-700"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-mustard px-4 py-2.5 text-sm font-bold text-earth-dusk disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {form.processing ? 'Saving…' : isEdit ? 'Save changes' : 'Submit for review'}
                        </button>
                    </div>
                </form>
            </div>
        </SiteLayout>
    );
}
