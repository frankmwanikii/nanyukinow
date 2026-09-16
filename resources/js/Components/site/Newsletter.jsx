import { useState } from 'react';
import { motion } from 'framer-motion';
import Reveal from './Reveal';

export default function Newsletter() {
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <section
            id="contact"
            className="relative z-10 overflow-hidden bg-earth-sand py-16 sm:py-20 lg:py-24"
        >
            <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-2 bg-olive-600 sm:block lg:w-2.5" />

            <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
                <Reveal>
                    <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
                        <h2 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl md:text-5xl">
                            Nanyuki Insider
                        </h2>
                        <div className="mx-auto mt-4 flex max-w-xs items-center gap-2 sm:mt-5">
                            <span className="flex gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                                <span className="h-1.5 w-1.5 rounded-full bg-olive-600" />
                            </span>
                            <span className="h-px flex-1 bg-olive-600" />
                        </div>
                        <p className="mt-3 text-base text-olive-600 sm:text-lg">
                            Stay in the loop
                        </p>
                    </div>
                </Reveal>

                <Reveal delay={0.08}>
                    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12 xl:gap-16">
                        <div className="max-w-xl">
                            <h3 className="font-display text-3xl font-semibold tracking-tight text-earth-dusk sm:text-4xl md:text-[2.75rem] md:leading-tight">
                                Get the Latest
                            </h3>
                            <p className="mt-1 font-display text-2xl font-semibold text-olive-600 sm:text-3xl md:text-4xl">
                                Mambo kwa Ground
                            </p>
                            <p className="mt-5 text-sm leading-relaxed text-olive-800 sm:text-base sm:leading-7">
                                Be the first to know about weekend offers from
                                top hotels, new menus at local eateries, and
                                essential service updates in your area.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-olive-200/70 bg-white p-6 shadow-soft sm:p-8">
                            <h3 className="font-display text-xl font-semibold text-earth-dusk sm:text-2xl">
                                Join the list
                            </h3>
                            <p className="mt-1 text-sm text-olive-500">
                                Be the first to be in the know.
                            </p>
                            <div className="mt-4 h-px bg-olive-100" />

                            {sent ? (
                                <motion.p
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 font-display text-lg text-olive-700"
                                >
                                    Thanks — you’re on the Insider list.
                                </motion.p>
                            ) : (
                                <form
                                    onSubmit={onSubmit}
                                    className="mt-6 space-y-5"
                                >
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-semibold text-earth-dusk">
                                            Email address{' '}
                                            <span className="text-mustard">
                                                *
                                            </span>
                                        </span>
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="you@email.com"
                                            className="w-full rounded-xl border-0 bg-olive-50 px-4 py-3.5 text-sm text-earth-dusk ring-1 ring-olive-200 placeholder:text-olive-400 focus:ring-2 focus:ring-mustard"
                                        />
                                        <span className="mt-1.5 block text-xs text-olive-500">
                                            Example: you@email.com
                                        </span>
                                    </label>
                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center rounded-full bg-olive-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950 sm:w-auto"
                                    >
                                        Subscribe
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
