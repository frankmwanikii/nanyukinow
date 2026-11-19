import { MessageCircle } from '@/Components/site/LucideCompat';
import { useEffect, useState } from 'react';

function loadComments(slug) {
    try {
        const raw = window.localStorage.getItem(`story-comments:${slug}`);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveComments(slug, comments) {
    try {
        window.localStorage.setItem(
            `story-comments:${slug}`,
            JSON.stringify(comments),
        );
    } catch {
        // ignore quota / private mode
    }
}

export default function StoryComments({ slug }) {
    const [comments, setComments] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [sent, setSent] = useState(false);

    useEffect(() => {
        setComments(loadComments(slug));
        setSent(false);
        setForm({ name: '', email: '', message: '' });
    }, [slug]);

    const onSubmit = (e) => {
        e.preventDefault();
        const next = [
            {
                id: `${Date.now()}`,
                name: form.name.trim(),
                email: form.email.trim(),
                message: form.message.trim(),
                createdAt: new Date().toISOString(),
            },
            ...comments,
        ];
        setComments(next);
        saveComments(slug, next);
        setForm({ name: '', email: '', message: '' });
        setSent(true);
        window.setTimeout(() => setSent(false), 3500);
    };

    return (
        <section className="rounded-2xl border border-olive-200 bg-white p-5 shadow-soft sm:p-6 md:p-8">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-700">
                    <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="font-display text-xl font-semibold text-earth-dusk sm:text-2xl">
                        Comments
                    </h2>
                    <p className="mt-1 text-sm text-olive-600">
                        {comments.length === 0
                            ? 'No comments yet — start the conversation.'
                            : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
                    </p>
                </div>
            </div>

            {comments.length > 0 ? (
                <ul className="mt-6 space-y-4 border-t border-olive-100 pt-6">
                    {comments.map((comment) => (
                        <li
                            key={comment.id}
                            className="rounded-xl bg-earth-sand/60 px-4 py-4 sm:px-5"
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="font-display text-sm font-semibold text-earth-dusk">
                                    {comment.name}
                                </p>
                                <time className="text-xs text-olive-500">
                                    {new Intl.DateTimeFormat('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    }).format(new Date(comment.createdAt))}
                                </time>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-olive-800">
                                {comment.message}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : null}

            <div className="mt-6 border-t border-olive-100 pt-6">
                <h3 className="font-display text-lg font-semibold text-earth-dusk">
                    Leave a comment
                </h3>
                {sent ? (
                    <p className="mt-3 text-sm font-medium text-olive-700">
                        Thanks — your comment has been posted.
                    </p>
                ) : null}
                <form onSubmit={onSubmit} className="mt-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-olive-800">
                                Name
                            </span>
                            <input
                                required
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                                className="w-full rounded-xl border-olive-200 bg-earth-sand/40 focus:border-olive-500 focus:ring-olive-500"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-olive-800">
                                Email
                            </span>
                            <input
                                required
                                type="email"
                                value={form.email}
                                onChange={(e) =>
                                    setForm({ ...form, email: e.target.value })
                                }
                                className="w-full rounded-xl border-olive-200 bg-earth-sand/40 focus:border-olive-500 focus:ring-olive-500"
                            />
                        </label>
                    </div>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-olive-800">
                            Message
                        </span>
                        <textarea
                            required
                            rows={4}
                            value={form.message}
                            onChange={(e) =>
                                setForm({ ...form, message: e.target.value })
                            }
                            className="w-full rounded-xl border-olive-200 bg-earth-sand/40 focus:border-olive-500 focus:ring-olive-500"
                        />
                    </label>
                    <button
                        type="submit"
                        className="inline-flex rounded-full bg-mustard px-6 py-3 text-sm font-bold text-olive-950 shadow-lift transition hover:bg-white hover:text-mustard"
                    >
                        Post comment
                    </button>
                </form>
            </div>
        </section>
    );
}
