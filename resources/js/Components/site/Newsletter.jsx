import { useState } from 'react';
import { motion } from 'framer-motion';
import Reveal from './Reveal';

export default function Newsletter() {
    const [sent, setSent] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const onSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <section
            id="contact"
            className="relative z-10 bg-olive-100 py-14 sm:py-20"
        >
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <div className="overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-olive-200/70 lg:grid lg:grid-cols-2">
                        <div className="relative overflow-hidden bg-olive-600 px-6 py-10 text-white sm:px-10 sm:py-14">
                            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mustard/20 blur-2xl" />
                            <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-mint/15 blur-3xl" />
                            <p className="relative font-display text-2xl font-semibold sm:text-3xl">
                                The Newsletter
                            </p>
                            <p className="relative mt-3 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">
                                Weekend picks, new openings, and local stories —
                                straight to your inbox.
                            </p>
                        </div>

                        <div className="px-6 py-8 sm:px-10 sm:py-12">
                            {sent ? (
                                <motion.p
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="font-display text-lg text-olive-700"
                                >
                                    Thanks — we will be in touch.
                                </motion.p>
                            ) : (
                                <form onSubmit={onSubmit} className="space-y-4">
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-olive-800">
                                            Name
                                        </span>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    name: e.target.value,
                                                })
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
                                                setForm({
                                                    ...form,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border-olive-200 bg-earth-sand/40 focus:border-olive-500 focus:ring-olive-500"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-olive-800">
                                            Message
                                        </span>
                                        <textarea
                                            rows={4}
                                            value={form.message}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    message: e.target.value,
                                                })
                                            }
                                            className="w-full rounded-xl border-olive-200 bg-earth-sand/40 focus:border-olive-500 focus:ring-olive-500"
                                        />
                                    </label>
                                    <button
                                        type="submit"
                                        className="inline-flex rounded-full bg-olive-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-olive-700"
                                    >
                                        Submit
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
