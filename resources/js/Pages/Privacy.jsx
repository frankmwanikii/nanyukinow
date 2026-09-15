import SiteLayout from '@/Layouts/SiteLayout';

export default function Privacy() {
    return (
        <SiteLayout title="Privacy Policy">
            <article className="mx-auto max-w-3xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
                <h1 className="font-display text-3xl font-semibold text-earth-dusk sm:text-4xl">
                    Privacy Policy
                </h1>
                <p className="mt-2 text-sm text-olive-600">
                    Last updated: September 15, 2026
                </p>
                <div className="mt-8 space-y-4 text-sm leading-relaxed text-olive-800 sm:text-base">
                    <p>
                        This Privacy Policy explains how Nanyuki Now collects,
                        uses, and protects information when you use our
                        website.
                    </p>
                    <p>
                        We may collect information you provide directly — such
                        as name, email, and messages — when you create an
                        account, list a business, or contact us. We also collect
                        basic technical data like browser type and pages visited
                        to improve the site.
                    </p>
                    <p>
                        We use this information to operate the platform, respond
                        to enquiries, and improve listings and services. We do
                        not sell your personal information.
                    </p>
                    <p>
                        You may request access to or deletion of your account
                        data by emailing{' '}
                        <a
                            href="mailto:hello@nanyukinow.co.ke"
                            className="font-medium text-olive-700 underline-offset-2 hover:underline"
                        >
                            hello@nanyukinow.co.ke
                        </a>
                        . We may update this policy periodically; the date above
                        reflects the latest revision.
                    </p>
                </div>
            </article>
        </SiteLayout>
    );
}
