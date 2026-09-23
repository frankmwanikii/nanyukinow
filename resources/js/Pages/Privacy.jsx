import { Link } from '@inertiajs/react';
import { ArrowUpRight, Mail, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';

const SECTIONS = [
    { id: 'overview', title: 'Overview' },
    { id: 'collect', title: 'Information we collect' },
    { id: 'use', title: 'How we use information' },
    { id: 'share', title: 'Sharing & disclosure' },
    { id: 'cookies', title: 'Cookies & analytics' },
    { id: 'accounts', title: 'Accounts & Google sign-in' },
    { id: 'retention', title: 'Data retention & security' },
    { id: 'rights', title: 'Your choices & rights' },
    { id: 'children', title: 'Children' },
    { id: 'updates', title: 'Updates to this policy' },
    { id: 'contact', title: 'Contact us' },
];

function Section({ id, title, children }) {
    return (
        <section id={id} className="scroll-mt-28 border-t border-olive-200/70 pt-10 first:border-t-0 first:pt-0">
            <h2 className="font-display text-xl font-semibold tracking-tight text-earth-dusk sm:text-2xl">
                {title}
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-olive-800 sm:text-base">
                {children}
            </div>
        </section>
    );
}

export default function Privacy({ page = null }) {
    const content = page?.content || {};
    const heroTitle = content.hero_title || page?.title || 'Privacy Policy';
    const heroSubtitle =
        content.hero_subtitle ||
        'How Nanyuki Now collects, uses, and protects information when you explore listings, create an account, or contact local businesses.';
    const customBody = String(content.body || '').trim();
    const [active, setActive] = useState(SECTIONS[0].id);

    useEffect(() => {
        if (customBody) return undefined;
        const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
            Boolean,
        );
        if (!nodes.length) return undefined;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target?.id) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.4, 0.7] },
        );

        nodes.forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [customBody]);

    return (
        <SiteLayout title={page?.meta_title || 'Privacy Policy'}>
            {/* Atmosphere band */}
            <div className="relative overflow-hidden border-b border-olive-200/60 bg-gradient-to-br from-olive-900 via-olive-800 to-earth-dusk">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 18% 20%, rgba(242,184,46,0.45), transparent 42%), radial-gradient(circle at 82% 70%, rgba(143,168,120,0.35), transparent 46%)',
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />

                <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-mustard/95 backdrop-blur-sm">
                        <Shield className="h-3.5 w-3.5" aria-hidden />
                        Legal
                    </div>
                    <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        {heroTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                        {heroSubtitle}
                    </p>
                    <p className="mt-6 text-sm text-white/55">
                        Last updated:{' '}
                        <time dateTime="2026-09-17">September 17, 2026</time>
                    </p>
                </div>
            </div>

            {customBody ? (
                <div className="bg-earth-sand">
                    <div className="mx-auto max-w-3xl space-y-4 px-4 py-12 text-[15px] leading-relaxed text-olive-800 sm:px-6 sm:py-16 sm:text-base">
                        {customBody.split(/\n\s*\n/).map((para) => (
                            <p key={para.slice(0, 48)}>{para}</p>
                        ))}
                    </div>
                </div>
            ) : (
            <div className="relative bg-earth-sand">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-olive-900/5 to-transparent" />

                <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:py-16">
                    {/* TOC */}
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <nav
                            aria-label="Privacy policy sections"
                            className="rounded-2xl border border-olive-200/80 bg-white/70 p-4 shadow-soft backdrop-blur-sm"
                        >
                            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-olive-500">
                                On this page
                            </p>
                            <ul className="mt-3 space-y-0.5">
                                {SECTIONS.map((section) => {
                                    const isActive = active === section.id;
                                    return (
                                        <li key={section.id}>
                                            <a
                                                href={`#${section.id}`}
                                                className={`block rounded-lg px-2.5 py-2 text-sm transition ${
                                                    isActive
                                                        ? 'bg-olive-800 font-semibold text-white'
                                                        : 'text-olive-700 hover:bg-olive-50 hover:text-earth-dusk'
                                                }`}
                                            >
                                                {section.title}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    {/* Content */}
                    <article className="min-w-0 space-y-10 rounded-2xl border border-olive-200/70 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8 lg:p-10">
                        <Section id="overview" title="Overview">
                            <p>
                                Nanyuki Now (“we”, “us”, or “our”) operates the
                                website at{' '}
                                <a
                                    href="https://nanyukinow.co.ke"
                                    className="font-medium text-olive-800 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                                >
                                    nanyukinow.co.ke
                                </a>
                                , a local discovery platform for Nanyuki and the
                                surrounding Laikipia region. This Privacy Policy
                                explains what information we collect, why we
                                collect it, and the choices you have.
                            </p>
                            <p>
                                By using Nanyuki Now, you agree to the practices
                                described here. If you do not agree, please do
                                not use the site.
                            </p>
                        </Section>

                        <Section id="collect" title="Information we collect">
                            <p>We may collect:</p>
                            <ul className="list-disc space-y-2 pl-5 marker:text-mustard">
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Account details
                                    </span>{' '}
                                    — such as name, username, email address, and
                                    password when you register.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Profile & listing information
                                    </span>{' '}
                                    — business details, photos, contact info, and
                                    other content you submit when claiming or
                                    managing a listing.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Messages & enquiries
                                    </span>{' '}
                                    — information you send when contacting us or
                                    interacting with listings.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Technical data
                                    </span>{' '}
                                    — IP address, browser type, device
                                    information, pages visited, and approximate
                                    location derived from network data, used to
                                    operate and improve the service.
                                </li>
                            </ul>
                        </Section>

                        <Section id="use" title="How we use information">
                            <p>We use information to:</p>
                            <ul className="list-disc space-y-2 pl-5 marker:text-mustard">
                                <li>Provide, maintain, and improve Nanyuki Now</li>
                                <li>
                                    Create and manage accounts, listings, and
                                    related features
                                </li>
                                <li>
                                    Respond to support requests and communicate
                                    about the platform
                                </li>
                                <li>
                                    Protect against fraud, abuse, and security
                                    risks
                                </li>
                                <li>
                                    Understand how the site is used so we can
                                    make it more useful for locals and visitors
                                </li>
                            </ul>
                            <p className="rounded-xl border border-olive-200/80 bg-olive-50/80 px-4 py-3 text-sm text-olive-800">
                                We do not sell your personal information.
                            </p>
                        </Section>

                        <Section id="share" title="Sharing & disclosure">
                            <p>
                                We may share information with service providers
                                who help us host, secure, analyse, or operate the
                                platform (for example email, hosting, or map
                                providers), under appropriate confidentiality
                                obligations.
                            </p>
                            <p>
                                We may also disclose information if required by
                                law, to protect our rights or users’ safety, or
                                in connection with a business transfer (such as
                                a merger or acquisition), where permitted.
                            </p>
                            <p>
                                Listing contact details you choose to publish
                                (phone, email, website, social links) are visible
                                to other users of the site by design.
                            </p>
                        </Section>

                        <Section id="cookies" title="Cookies & analytics">
                            <p>
                                We use cookies and similar technologies to keep
                                you signed in, remember preferences, and
                                understand site performance. You can control
                                cookies through your browser settings; disabling
                                some cookies may limit certain features.
                            </p>
                            <p>
                                Map features may load third-party map services
                                (such as Google Maps). Those providers process
                                data under their own privacy policies.
                            </p>
                        </Section>

                        <Section id="accounts" title="Accounts & Google sign-in">
                            <p>
                                If you choose “Continue with Google”, Google
                                shares basic profile information (such as name
                                and email) with us so we can create or sign in to
                                your account. You can disconnect Google access
                                from your Google account settings at any time.
                            </p>
                            <p>
                                You are responsible for keeping your account
                                credentials secure and for activity that occurs
                                under your account.
                            </p>
                        </Section>

                        <Section
                            id="retention"
                            title="Data retention & security"
                        >
                            <p>
                                We retain personal information for as long as
                                needed to provide the service, meet legal
                                obligations, resolve disputes, and enforce our
                                agreements. When information is no longer
                                required, we delete or anonymise it where
                                practicable.
                            </p>
                            <p>
                                We take reasonable technical and organisational
                                measures to protect data. No method of
                                transmission or storage is completely secure; we
                                cannot guarantee absolute security.
                            </p>
                        </Section>

                        <Section id="rights" title="Your choices & rights">
                            <p>Depending on applicable law, you may:</p>
                            <ul className="list-disc space-y-2 pl-5 marker:text-mustard">
                                <li>
                                    Request access to personal information we
                                    hold about you
                                </li>
                                <li>
                                    Ask us to correct inaccurate information
                                </li>
                                <li>
                                    Request deletion of your account and related
                                    personal data, subject to legal retention
                                    needs
                                </li>
                                <li>
                                    Opt out of non-essential marketing emails by
                                    using unsubscribe links or contacting us
                                </li>
                            </ul>
                            <p>
                                To make a request, email{' '}
                                <a
                                    href="mailto:hello@nanyukinow.co.ke"
                                    className="font-medium text-olive-800 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                                >
                                    hello@nanyukinow.co.ke
                                </a>
                                .
                            </p>
                        </Section>

                        <Section id="children" title="Children">
                            <p>
                                Nanyuki Now is not directed at children under 13
                                (or the equivalent minimum age in your
                                jurisdiction). We do not knowingly collect
                                personal information from children. If you
                                believe a child has provided us information,
                                contact us and we will take appropriate steps.
                            </p>
                        </Section>

                        <Section id="updates" title="Updates to this policy">
                            <p>
                                We may update this Privacy Policy from time to
                                time. When we do, we will revise the “Last
                                updated” date at the top of this page. Continued
                                use of Nanyuki Now after changes means you
                                accept the updated policy.
                            </p>
                            <p>
                                For our rules of use, see the{' '}
                                <Link
                                    href="/terms"
                                    className="inline-flex items-center gap-0.5 font-medium text-olive-800 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                                >
                                    Terms of Service
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                                .
                            </p>
                        </Section>

                        <Section id="contact" title="Contact us">
                            <p>
                                Questions about privacy or this policy? Reach
                                the Nanyuki Now team:
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-olive-200 bg-gradient-to-br from-olive-50 to-earth-sand/80">
                                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                    <div>
                                        <p className="font-display text-lg font-semibold text-earth-dusk">
                                            Nanyuki Now
                                        </p>
                                        <p className="mt-1 text-sm text-olive-700">
                                            Nanyuki, Laikipia, Kenya
                                        </p>
                                        <a
                                            href="mailto:hello@nanyukinow.co.ke"
                                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-olive-800 transition hover:text-mustard"
                                        >
                                            <Mail className="h-4 w-4 text-mustard" />
                                            hello@nanyukinow.co.ke
                                        </a>
                                    </div>
                                    <a
                                        href="mailto:hello@nanyukinow.co.ke?subject=Privacy%20request"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-olive-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                                    >
                                        Email privacy team
                                        <ArrowUpRight className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </Section>
                    </article>
                </div>
            </div>
            )}
        </SiteLayout>
    );
}
