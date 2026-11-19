import { Link } from '@inertiajs/react';
import { ArrowUpRight, FileText, Mail } from '@/Components/site/LucideCompat';
import { useEffect, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';

const SECTIONS = [
    { id: 'agreement', title: 'Agreement to terms' },
    { id: 'service', title: 'The service' },
    { id: 'accounts', title: 'Accounts' },
    { id: 'listings', title: 'Listings & content' },
    { id: 'payments', title: 'Payments' },
    { id: 'acceptable-use', title: 'Acceptable use' },
    { id: 'ip', title: 'Intellectual property' },
    { id: 'disclaimer', title: 'Disclaimer' },
    { id: 'liability', title: 'Limitation of liability' },
    { id: 'termination', title: 'Termination' },
    { id: 'changes', title: 'Changes to these terms' },
    { id: 'contact', title: 'Contact us' },
];

function Section({ id, title, children }) {
    return (
        <section
            id={id}
            className="scroll-mt-28 border-t border-olive-200/70 pt-10 first:border-t-0 first:pt-0"
        >
            <h2 className="font-display text-xl font-semibold tracking-tight text-earth-dusk sm:text-2xl">
                {title}
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-olive-800 sm:text-base">
                {children}
            </div>
        </section>
    );
}

export default function Terms({ page = null }) {
    const content = page?.content || {};
    const heroTitle = content.hero_title || page?.title || 'Terms of Service';
    const heroSubtitle =
        content.hero_subtitle ||
        'The rules for using Nanyuki Now — browsing listings, creating an account, promoting a business, and making payments on the platform.';
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
        <SiteLayout title={page?.meta_title || 'Terms of Service'}>
            <div className="relative overflow-hidden border-b border-olive-200/60 bg-gradient-to-br from-olive-900 via-olive-800 to-earth-dusk">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 78% 18%, rgba(242,184,46,0.45), transparent 42%), radial-gradient(circle at 12% 78%, rgba(143,168,120,0.35), transparent 46%)',
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
                        <FileText className="h-3.5 w-3.5" aria-hidden />
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
            ) : null}

            {!customBody ? (
            <div className="relative bg-earth-sand">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-olive-900/5 to-transparent" />

                <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:py-16">
                    <aside className="lg:sticky lg:top-24 lg:self-start">
                        <nav
                            aria-label="Terms of service sections"
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

                    <article className="min-w-0 space-y-10 rounded-2xl border border-olive-200/70 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8 lg:p-10">
                        <Section id="agreement" title="Agreement to terms">
                            <p>
                                Welcome to Nanyuki Now. By accessing or using{' '}
                                <a
                                    href="https://nanyukinow.co.ke"
                                    className="font-medium text-olive-800 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                                >
                                    nanyukinow.co.ke
                                </a>{' '}
                                (the “Site”), you agree to these Terms of
                                Service and our{' '}
                                <Link
                                    href="/privacy"
                                    className="inline-flex items-center gap-0.5 font-medium text-olive-800 underline decoration-olive-300 underline-offset-4 transition hover:decoration-mustard"
                                >
                                    Privacy Policy
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                                .
                            </p>
                            <p>
                                If you do not agree, do not use the Site. If you
                                use Nanyuki Now on behalf of a business, you
                                confirm you have authority to bind that business
                                to these terms.
                            </p>
                        </Section>

                        <Section id="service" title="The service">
                            <p>
                                Nanyuki Now is a local discovery platform for
                                Nanyuki and the surrounding Laikipia region. We
                                publish listings, stories, maps, and related
                                information to help people find places to stay,
                                eat, explore, shop, and get services.
                            </p>
                            <p>
                                We may change, suspend, or discontinue features
                                at any time. Content on the Site is provided for
                                general information and may be updated or
                                removed without notice.
                            </p>
                        </Section>

                        <Section id="accounts" title="Accounts">
                            <p>
                                Some features require an account. You agree to
                                provide accurate information, keep your login
                                details secure, and promptly update details that
                                change. You are responsible for activity under
                                your account.
                            </p>
                            <p>
                                If you sign in with Google, you also agree to
                                Google’s applicable terms for that sign-in
                                method. We may suspend or close accounts that
                                violate these Terms or appear fraudulent or
                                abusive.
                            </p>
                        </Section>

                        <Section id="listings" title="Listings & content">
                            <p>
                                Business owners and contributors are responsible
                                for the accuracy, legality, and currency of
                                information they submit — including names,
                                photos, prices, hours, contact details, and
                                availability.
                            </p>
                            <p>
                                By submitting content, you grant Nanyuki Now a
                                non-exclusive, worldwide, royalty-free licence
                                to host, display, reproduce, and distribute that
                                content in connection with operating and
                                promoting the Site. You represent that you have
                                the rights needed to grant this licence.
                            </p>
                            <p>
                                We may edit, refuse, or remove listings or other
                                content that we believe is inaccurate,
                                misleading, unlawful, or inconsistent with these
                                Terms.
                            </p>
                        </Section>

                        <Section id="payments" title="Payments">
                            <p>
                                Nanyuki Now may offer paid products or services
                                such as featured or premium listing placement,
                                advertising, sponsored placement, event
                                promotion, or other paid upgrades. Pricing,
                                billing periods, and what’s included will be
                                shown at checkout or in the relevant order
                                confirmation.
                            </p>
                            <ul className="list-disc space-y-2 pl-5 marker:text-mustard">
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Accepted methods.
                                    </span>{' '}
                                    Where available, payments may be made by
                                    M-Pesa, card, bank transfer, or other methods
                                    we enable. Third-party payment providers
                                    process transactions under their own terms
                                    and privacy policies.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Fees & taxes.
                                    </span>{' '}
                                    Fees are generally due in advance unless we
                                    state otherwise. You are responsible for any
                                    applicable taxes. Currency and amounts shown
                                    are as displayed at purchase.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Renewals.
                                    </span>{' '}
                                    Subscription-style plans may renew
                                    automatically for successive periods until
                                    cancelled according to the instructions we
                                    provide. You remain responsible for charges
                                    incurred before cancellation takes effect.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Refunds.
                                    </span>{' '}
                                    Unless required by law or expressly stated
                                    for a specific product, paid fees are
                                    non-refundable once the paid placement or
                                    service period has started. If a payment
                                    fails or is reversed, we may pause or remove
                                    the related listing benefits.
                                </li>
                                <li>
                                    <span className="font-medium text-earth-dusk">
                                        Third-party purchases.
                                    </span>{' '}
                                    Ticket links, bookings, or purchases made
                                    directly with a listed business or another
                                    platform are between you and that party.
                                    Nanyuki Now is not the merchant of record for
                                    those transactions unless we clearly say so.
                                </li>
                            </ul>
                            <p className="rounded-xl border border-olive-200/80 bg-olive-50/80 px-4 py-3 text-sm text-olive-800">
                                For billing questions or payment receipts, email{' '}
                                <a
                                    href="mailto:hello@nanyukinow.co.ke?subject=Payments%20enquiry"
                                    className="font-semibold text-olive-900 underline decoration-olive-300 underline-offset-2 hover:decoration-mustard"
                                >
                                    hello@nanyukinow.co.ke
                                </a>
                                .
                            </p>
                        </Section>

                        <Section id="acceptable-use" title="Acceptable use">
                            <p>You agree not to:</p>
                            <ul className="list-disc space-y-2 pl-5 marker:text-mustard">
                                <li>
                                    Post unlawful, defamatory, fraudulent, or
                                    misleading content
                                </li>
                                <li>
                                    Impersonate another person or business, or
                                    claim a listing you are not authorised to
                                    manage
                                </li>
                                <li>
                                    Attempt unauthorised access, scrape the Site
                                    in a way that harms performance, or
                                    interfere with security
                                </li>
                                <li>
                                    Use the Site to spam, harass, or distribute
                                    malware
                                </li>
                                <li>
                                    Misuse payment flows or attempt to obtain
                                    paid features without payment
                                </li>
                            </ul>
                        </Section>

                        <Section id="ip" title="Intellectual property">
                            <p>
                                The Nanyuki Now name, branding, design, software,
                                and original Site content are owned by us or our
                                licensors and are protected by applicable
                                intellectual property laws. You may not copy,
                                modify, or redistribute our branding or platform
                                materials without prior written permission,
                                except as allowed by fair use or similar laws.
                            </p>
                        </Section>

                        <Section id="disclaimer" title="Disclaimer">
                            <div className="rounded-2xl border border-mustard/35 bg-gradient-to-br from-mustard/15 via-earth-sand/40 to-olive-50 px-5 py-5 sm:px-6 sm:py-6">
                                <p className="font-display text-lg font-semibold text-earth-dusk">
                                    Important — please read
                                </p>
                                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-olive-800 sm:text-base">
                                    <p>
                                        Nanyuki Now is an information and
                                        discovery platform. We do not operate,
                                        own, or control the businesses, venues,
                                        events, properties, or services listed on
                                        the Site unless we expressly state
                                        otherwise.
                                    </p>
                                    <p>
                                        Listings, reviews, ratings, maps,
                                        opening hours, prices, availability,
                                        photos, and other details are provided
                                        “as is” and “as available.” Information
                                        may be incomplete, outdated, or
                                        inaccurate. Always verify critical
                                        details directly with the business
                                        before you travel, book, or purchase.
                                    </p>
                                    <p>
                                        We do not endorse any third-party
                                        business, product, or service merely by
                                        listing it. Any dealings between you and
                                        a listed party — including bookings,
                                        payments, deliveries, quality of goods
                                        or services, and disputes — are solely
                                        between you and that party.
                                    </p>
                                    <p>
                                        To the fullest extent permitted by law,
                                        we disclaim all warranties, whether
                                        express or implied, including fitness for
                                        a particular purpose, merchantability,
                                        and non-infringement. We do not warrant
                                        that the Site will be uninterrupted,
                                        error-free, or free of harmful
                                        components.
                                    </p>
                                </div>
                            </div>
                        </Section>

                        <Section
                            id="liability"
                            title="Limitation of liability"
                        >
                            <p>
                                To the maximum extent permitted by applicable
                                law, Nanyuki Now and its owners, operators,
                                affiliates, and partners will not be liable for
                                any indirect, incidental, special,
                                consequential, or punitive damages, or for any
                                loss of profits, data, goodwill, or business
                                opportunities, arising out of or related to your
                                use of the Site or reliance on any listing
                                content.
                            </p>
                            <p>
                                Our total liability for any claim arising from
                                these Terms or the Site will not exceed the
                                greater of (a) the amount you paid us for the
                                specific paid service giving rise to the claim
                                in the three months before the claim, or (b) KES
                                5,000 — except where liability cannot be limited
                                by law.
                            </p>
                        </Section>

                        <Section id="termination" title="Termination">
                            <p>
                                You may stop using the Site at any time. We may
                                suspend or terminate access, remove content, or
                                cancel paid benefits if you breach these Terms,
                                if required by law, or if we discontinue the
                                service. Provisions that by their nature should
                                survive (including intellectual property,
                                disclaimer, limitation of liability, and payment
                                obligations already incurred) will survive
                                termination.
                            </p>
                        </Section>

                        <Section id="changes" title="Changes to these terms">
                            <p>
                                We may update these Terms from time to time.
                                When we do, we will revise the “Last updated”
                                date on this page. Continued use of the Site
                                after changes means you accept the updated
                                Terms. If you do not agree, stop using the Site.
                            </p>
                        </Section>

                        <Section id="contact" title="Contact us">
                            <p>
                                Questions about these Terms, payments, or
                                listing issues? Contact the Nanyuki Now team:
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
                                        href="mailto:hello@nanyukinow.co.ke?subject=Terms%20of%20Service"
                                        className="inline-flex items-center justify-center gap-2 rounded-full bg-olive-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-mustard hover:text-olive-950"
                                    >
                                        Email the team
                                        <ArrowUpRight className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </Section>
                    </article>
                </div>
            </div>
            ) : null}
        </SiteLayout>
    );
}
