import SiteLayout from '@/Layouts/SiteLayout';

export default function Terms() {
    return (
        <SiteLayout title="Terms of Service">
            <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
                <h1 className="font-display text-3xl font-semibold text-earth-dusk sm:text-4xl">
                    Terms of Service
                </h1>
                <p className="mt-2 text-sm text-olive-600">
                    Last updated: September 15, 2026
                </p>
                <div className="mt-8 space-y-4 text-sm leading-relaxed text-olive-800 sm:text-base">
                    <p>
                        Welcome to Nanyuki Now. By accessing or using this
                        website, you agree to these Terms of Service.
                    </p>
                    <p>
                        Nanyuki Now provides local listings, guides, and related
                        information for Nanyuki and the surrounding Laikipia
                        region. Content is provided for general information and
                        may change without notice.
                    </p>
                    <p>
                        Business owners are responsible for the accuracy of
                        information they submit. You agree not to misuse the
                        platform, attempt unauthorized access, or post unlawful
                        or misleading content.
                    </p>
                    <p>
                        We may update these terms from time to time. Continued
                        use of the site after changes means you accept the
                        updated terms. For questions, contact{' '}
                        <a
                            href="mailto:hello@nanyukinow.co.ke"
                            className="font-medium text-olive-700 underline-offset-2 hover:underline"
                        >
                            hello@nanyukinow.co.ke
                        </a>
                        .
                    </p>
                </div>
            </article>
        </SiteLayout>
    );
}
