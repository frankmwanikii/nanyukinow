import MediaAddDialog from './MediaAddDialog';
import { field, help, label } from './fieldStyles';
import {
    canUseEatDrinkFeature,
    eatDrinkMenuHelp,
    eatDrinkMenuLimit,
} from '@/data/eatDrinkTierFeatures';
import { ImagePlus, Plus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

const UNLIMITED_MENU_SLOTS = 100;

function Section({ title, blurb, children }) {
    return (
        <div className="space-y-3 rounded-2xl border border-olive-200 bg-white p-4 sm:p-5 dark:border-olive-800 dark:bg-olive-950/60">
            <div>
                <h3 className="font-display text-base font-semibold text-olive-950 dark:text-white sm:text-lg">
                    {title}
                </h3>
                {blurb ? <p className={help}>{blurb}</p> : null}
            </div>
            {children}
        </div>
    );
}

function RowActions({ onRemove }) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            aria-label="Remove"
        >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
        </button>
    );
}

function ImagePickButton({ image, onPick, onClear }) {
    return (
        <div className="flex items-center gap-3">
            {image ? (
                <img
                    src={image}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-olive-200"
                />
            ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-olive-50 text-olive-400 ring-1 ring-olive-200 dark:bg-olive-900 dark:text-olive-500 dark:ring-olive-700">
                    <ImagePlus className="h-5 w-5" />
                </span>
            )}
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onPick}
                    className="rounded-xl border border-olive-200 bg-white px-3 py-1.5 text-xs font-semibold text-olive-800 hover:border-mustard dark:border-olive-700 dark:bg-olive-900 dark:text-olive-100 dark:hover:border-mustard"
                >
                    {image ? 'Replace image' : 'Add image'}
                </button>
                {image ? (
                    <button
                        type="button"
                        onClick={onClear}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold text-olive-500 hover:text-rose-700 dark:text-olive-400 dark:hover:text-rose-400"
                    >
                        Clear
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function MenuDropzone({ onPick, remaining, unlimited = false }) {
    const limitLabel = unlimited
        ? 'multi-select · unlimited'
        : `multi-select · up to ${remaining} image${remaining === 1 ? '' : 's'}`;

    return (
        <button
            type="button"
            onClick={onPick}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-olive-300 bg-white/80 px-4 py-10 text-center transition hover:border-mustard hover:bg-mustard/5 dark:border-olive-700 dark:bg-olive-950/80 dark:hover:border-mustard dark:hover:bg-mustard/10"
        >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-olive-50 ring-1 ring-olive-100 dark:bg-olive-900 dark:ring-olive-700">
                <ImagePlus className="h-6 w-6 text-olive-700 dark:text-olive-300" />
            </span>
            <span>
                <span className="block text-sm font-semibold text-olive-950 dark:text-olive-50">
                    Drop menu images here
                </span>
                <span className="mt-1 block text-xs text-olive-500">
                    Or click to {limitLabel}
                </span>
            </span>
        </button>
    );
}

async function uploadEditorImage(file) {
    const csrf =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') || '';
    const body = new FormData();
    body.append('image', file);
    const res = await fetch('/account/listings/editor-media', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrf,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.url || null;
}

/**
 * Category-specific extras that appear on the public listing page
 * (menus, agenda, sponsors, schedule, products).
 */
export default function CategoryExtrasEditor({
    categoryKey,
    details = {},
    onDetailsChange,
    libraryRoute = null,
    tier = 'free',
}) {
    const [imageTarget, setImageTarget] = useState(null); // { mode:'menus' } | { list, index, key }
    const menuInputRef = useRef(null);
    const singleInputRef = useRef(null);
    const pendingSingleRef = useRef(null);

    const setList = (key, next) => {
        onDetailsChange({ ...details, [key]: next });
    };

    const updateItem = (key, index, patch) => {
        const list = Array.isArray(details[key]) ? [...details[key]] : [];
        list[index] = { ...list[index], ...patch };
        setList(key, list);
    };

    const removeItem = (key, index) => {
        const list = Array.isArray(details[key]) ? [...details[key]] : [];
        list.splice(index, 1);
        setList(key, list);
    };

    const addItem = (key, blank) => {
        const list = Array.isArray(details[key]) ? [...details[key]] : [];
        setList(key, [...list, blank]);
    };

    const menus = Array.isArray(details.menus) ? details.menus : [];
    const deals = Array.isArray(details.deals) ? details.deals : [];
    const agenda = Array.isArray(details.agenda) ? details.agenda : [];
    const sponsors = Array.isArray(details.sponsors) ? details.sponsors : [];
    const schedule = Array.isArray(details.event_schedule)
        ? details.event_schedule
        : [];
    const products = Array.isArray(details.products) ? details.products : [];
    const showMenus =
        categoryKey !== 'eatDrink' || canUseEatDrinkFeature(tier, 'menus');
    const showDeals =
        categoryKey === 'eatDrink' && canUseEatDrinkFeature(tier, 'deals');
    const showLiveMusic =
        categoryKey === 'eatDrink' && canUseEatDrinkFeature(tier, 'live_music');
    const menuLimit =
        categoryKey === 'eatDrink' ? eatDrinkMenuLimit(tier) : null;
    const menuRemaining =
        menuLimit == null
            ? UNLIMITED_MENU_SLOTS
            : Math.max(0, menuLimit - menus.length);
    const atMenuLimit = menuRemaining <= 0;
    const menusUnlimited = menuLimit == null;

    const appendMenuImages = (urls) => {
        const cleaned = (urls || [])
            .filter((u) => typeof u === 'string' && u.trim())
            .map((u) => u.trim());
        if (!cleaned.length) return;
        const room =
            menuLimit == null
                ? cleaned.length
                : Math.max(0, menuLimit - menus.length);
        if (room <= 0) return;
        const next = cleaned.slice(0, room).map((image, i) => ({
            title: `Menu ${menus.length + i + 1}`,
            image,
            pdf: '',
        }));
        setList('menus', [...menus, ...next]);
    };

    const uploadMenuFiles = async (fileList) => {
        const files = Array.from(fileList || []).filter((f) =>
            f.type?.startsWith('image/'),
        );
        if (!files.length) return;
        const room =
            menuLimit == null
                ? files.length
                : Math.max(0, menuLimit - menus.length);
        const accepted = files.slice(0, room);
        const urls = [];
        for (const file of accepted) {
            try {
                const url = await uploadEditorImage(file);
                urls.push(url || URL.createObjectURL(file));
            } catch {
                urls.push(URL.createObjectURL(file));
            }
        }
        appendMenuImages(urls);
    };

    const openMenusAdd = () => {
        if (atMenuLimit) return;
        setImageTarget({ mode: 'menus' });
    };

    return (
        <div className="space-y-5">
            {categoryKey === 'eatDrink' ? (
                <>
                {showMenus ? (
                <Section
                    title="Menus"
                    blurb={eatDrinkMenuHelp(tier)}
                >
                    {menus.length ? (
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {menus.map((item, index) => (
                                <li
                                    key={`menu-${index}`}
                                    className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                            Menu {index + 1}
                                        </span>
                                        <RowActions
                                            onRemove={() =>
                                                removeItem('menus', index)
                                            }
                                        />
                                    </div>
                                    {item.image ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImageTarget({
                                                    list: 'menus',
                                                    index,
                                                    key: 'image',
                                                })
                                            }
                                            className="group relative block w-full overflow-hidden rounded-xl bg-olive-100"
                                        >
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="aspect-[3/4] w-full object-cover"
                                            />
                                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2 text-left text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                                Replace image
                                            </span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImageTarget({
                                                    list: 'menus',
                                                    index,
                                                    key: 'image',
                                                })
                                            }
                                            className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-olive-300 bg-white/70 text-olive-600"
                                        >
                                            <ImagePlus className="h-5 w-5" />
                                            <span className="text-xs font-semibold">
                                                Add image
                                            </span>
                                        </button>
                                    )}
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('menus', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Lunch menu"
                                    />
                                    <input
                                        className={field}
                                        type="url"
                                        value={item.pdf || ''}
                                        onChange={(e) =>
                                            updateItem('menus', index, {
                                                pdf: e.target.value,
                                            })
                                        }
                                        placeholder="PDF link (optional)"
                                    />
                                </li>
                            ))}
                            {!atMenuLimit ? (
                                <li>
                                    <button
                                        type="button"
                                        onClick={openMenusAdd}
                                        className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-olive-300 bg-white/70 text-olive-600 transition hover:border-mustard hover:bg-mustard/5 hover:text-olive-900 dark:border-olive-700 dark:bg-olive-950/70 dark:text-olive-400"
                                    >
                                        <ImagePlus className="h-6 w-6" />
                                        <span className="text-xs font-semibold">
                                            Add more
                                            {menuLimit != null
                                                ? ` · ${menus.length}/${menuLimit}`
                                                : ''}
                                        </span>
                                    </button>
                                </li>
                            ) : null}
                        </ul>
                    ) : (
                        <MenuDropzone
                            onPick={openMenusAdd}
                            remaining={menuRemaining}
                            unlimited={menusUnlimited}
                        />
                    )}
                    {atMenuLimit ? (
                        <p className={help}>
                            Standard limit reached ({menuLimit} menu images).
                            Upgrade to Premium for unlimited menus.
                        </p>
                    ) : null}
                </Section>
                ) : null}

                {showDeals ? (
                <Section
                    title="Deals / offers / happy hour"
                    blurb="Highlighted specials shown in a featured block on your listing page."
                >
                    <ul className="space-y-3">
                        {deals.map((item, index) => (
                            <li
                                key={`deal-${index}`}
                                className="space-y-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Offer {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('deals', index)
                                        }
                                    />
                                </div>
                                <div>
                                    <label className={label}>Title</label>
                                    <input
                                        className={field}
                                        value={item.title || ''}
                                        onChange={(e) =>
                                            updateItem('deals', index, {
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Sunset happy hour"
                                    />
                                </div>
                                <div>
                                    <label className={label}>Details</label>
                                    <input
                                        className={field}
                                        value={item.description || ''}
                                        onChange={(e) =>
                                            updateItem('deals', index, {
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="2-for-1 cocktails · Weekdays 5–7pm"
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('deals', { title: '', description: '' })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add offer
                    </button>
                </Section>
                ) : null}

                {showLiveMusic ? (
                <Section
                    title="Events & live music"
                    blurb="Upcoming gigs and live music nights shown as a schedule on your page."
                >
                    <ul className="space-y-3">
                        {schedule.map((item, index) => (
                            <li
                                key={`live-${index}`}
                                className="grid gap-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                            >
                                <div>
                                    <label className={label}>When</label>
                                    <input
                                        className={field}
                                        value={item.label || ''}
                                        onChange={(e) =>
                                            updateItem('event_schedule', index, {
                                                label: e.target.value,
                                            })
                                        }
                                        placeholder="Fri 9 May · 8pm"
                                    />
                                </div>
                                <div>
                                    <label className={label}>What’s on</label>
                                    <input
                                        className={field}
                                        value={item.value || ''}
                                        onChange={(e) =>
                                            updateItem('event_schedule', index, {
                                                value: e.target.value,
                                            })
                                        }
                                        placeholder="Acoustic night with local artists"
                                    />
                                </div>
                                <RowActions
                                    onRemove={() =>
                                        removeItem('event_schedule', index)
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('event_schedule', {
                                label: '',
                                value: '',
                            })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add gig
                    </button>
                </Section>
                ) : null}
                </>
            ) : null}

            {categoryKey === 'events' ? (
                <>
                    <Section
                        title="Agenda / lineup"
                        blurb="Time-ordered programme shown on the event page."
                    >
                        <ul className="space-y-3">
                            {agenda.map((item, index) => (
                                <li
                                    key={`agenda-${index}`}
                                    className="grid gap-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-end"
                                >
                                    <div>
                                        <label className={label}>Time</label>
                                        <input
                                            className={field}
                                            value={item.time || ''}
                                            onChange={(e) =>
                                                updateItem('agenda', index, {
                                                    time: e.target.value,
                                                })
                                            }
                                            placeholder="19:30"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Title</label>
                                        <input
                                            className={field}
                                            value={item.title || ''}
                                            onChange={(e) =>
                                                updateItem('agenda', index, {
                                                    title: e.target.value,
                                                })
                                            }
                                            placeholder="Opening set"
                                        />
                                    </div>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('agenda', index)
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('agenda', { time: '', title: '' })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add agenda item
                        </button>
                    </Section>

                    <Section
                        title="Event schedule"
                        blurb="Sidebar schedule (doors, music, last entry…)."
                    >
                        <ul className="space-y-3">
                            {schedule.map((item, index) => (
                                <li
                                    key={`sched-${index}`}
                                    className="grid gap-2 rounded-xl border border-olive-100 bg-olive-50/40 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                                >
                                    <div>
                                        <label className={label}>Label</label>
                                        <input
                                            className={field}
                                            value={item.label || ''}
                                            onChange={(e) =>
                                                updateItem(
                                                    'event_schedule',
                                                    index,
                                                    { label: e.target.value },
                                                )
                                            }
                                            placeholder="Doors open"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Value</label>
                                        <input
                                            className={field}
                                            value={item.value || ''}
                                            onChange={(e) =>
                                                updateItem(
                                                    'event_schedule',
                                                    index,
                                                    { value: e.target.value },
                                                )
                                            }
                                            placeholder="18:30"
                                        />
                                    </div>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('event_schedule', index)
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('event_schedule', {
                                    label: '',
                                    value: '',
                                })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add schedule row
                        </button>
                    </Section>

                    <Section
                        title="Sponsors"
                        blurb="Optional logos and names shown on the event page."
                    >
                        <ul className="space-y-4">
                            {sponsors.map((item, index) => (
                                <li
                                    key={`sponsor-${index}`}
                                    className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                            Sponsor {index + 1}
                                        </span>
                                        <RowActions
                                            onRemove={() =>
                                                removeItem('sponsors', index)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Name</label>
                                        <input
                                            className={field}
                                            value={item.name || ''}
                                            onChange={(e) =>
                                                updateItem('sponsors', index, {
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Sponsor name"
                                        />
                                    </div>
                                    <ImagePickButton
                                        image={item.logo}
                                        onPick={() =>
                                            setImageTarget({
                                                list: 'sponsors',
                                                index,
                                                key: 'logo',
                                            })
                                        }
                                        onClear={() =>
                                            updateItem('sponsors', index, {
                                                logo: '',
                                            })
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            onClick={() =>
                                addItem('sponsors', { name: '', logo: '' })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add sponsor
                        </button>
                    </Section>
                </>
            ) : null}

            {categoryKey === 'shopping' ? (
                <Section
                    title="Products"
                    blurb="Items shown on the Products tab for this shop."
                >
                    <ul className="space-y-4">
                        {products.map((item, index) => (
                            <li
                                key={`product-${index}`}
                                className="space-y-3 rounded-xl border border-olive-100 bg-olive-50/40 p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-olive-500">
                                        Product {index + 1}
                                    </span>
                                    <RowActions
                                        onRemove={() =>
                                            removeItem('products', index)
                                        }
                                    />
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className={label}>Name</label>
                                        <input
                                            className={field}
                                            value={item.name || ''}
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Product name"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>
                                            Category
                                        </label>
                                        <input
                                            className={field}
                                            value={item.category || ''}
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    category: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. Dairy"
                                        />
                                    </div>
                                    <div>
                                        <label className={label}>Price</label>
                                        <input
                                            className={field}
                                            value={
                                                item.price === 0 || item.price
                                                    ? String(item.price)
                                                    : ''
                                            }
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    price: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. 450 or KES 450"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={label}>
                                            Description
                                        </label>
                                        <input
                                            className={field}
                                            value={item.description || ''}
                                            onChange={(e) =>
                                                updateItem('products', index, {
                                                    description: e.target.value,
                                                })
                                            }
                                            placeholder="Short description"
                                        />
                                    </div>
                                </div>
                                <ImagePickButton
                                    image={item.image}
                                    onPick={() =>
                                        setImageTarget({
                                            list: 'products',
                                            index,
                                            key: 'image',
                                        })
                                    }
                                    onClear={() =>
                                        updateItem('products', index, {
                                            image: '',
                                        })
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={() =>
                            addItem('products', {
                                name: '',
                                category: '',
                                price: '',
                                description: '',
                                image: '',
                            })
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-olive-900 px-3.5 py-2 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add product
                    </button>
                </Section>
            ) : null}

            <MediaAddDialog
                open={Boolean(imageTarget)}
                onClose={() => setImageTarget(null)}
                libraryRoute={libraryRoute}
                remaining={
                    imageTarget?.mode === 'menus'
                        ? menuRemaining
                        : 1
                }
                target={imageTarget?.mode === 'menus' ? 'gallery' : 'cover'}
                onUpload={() => {
                    if (imageTarget?.mode === 'menus') {
                        menuInputRef.current?.click();
                        return;
                    }
                    pendingSingleRef.current = imageTarget;
                    singleInputRef.current?.click();
                }}
                onPickUrls={(urls) => {
                    if (!imageTarget || !urls?.length) return;
                    if (imageTarget.mode === 'menus') {
                        appendMenuImages(urls);
                        setImageTarget(null);
                        return;
                    }
                    updateItem(imageTarget.list, imageTarget.index, {
                        [imageTarget.key]: urls[0],
                    });
                    setImageTarget(null);
                }}
            />
            <input
                ref={menuInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                    const files = e.target.files;
                    e.target.value = '';
                    setImageTarget(null);
                    void uploadMenuFiles(files);
                }}
            />
            <input
                ref={singleInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    const target = pendingSingleRef.current || imageTarget;
                    pendingSingleRef.current = null;
                    setImageTarget(null);
                    if (!file || !target || target.mode === 'menus') return;
                    try {
                        const url = await uploadEditorImage(file);
                        updateItem(target.list, target.index, {
                            [target.key]: url || URL.createObjectURL(file),
                        });
                    } catch {
                        updateItem(target.list, target.index, {
                            [target.key]: URL.createObjectURL(file),
                        });
                    }
                }}
            />
        </div>
    );
}
