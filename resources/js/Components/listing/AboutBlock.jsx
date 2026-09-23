import DetailSection from './DetailSection';

function looksLikeHtml(value) {
    return /<[a-z][\s\S]*>/i.test(String(value || ''));
}

export default function AboutBlock({
    about,
    docs = [],
    title = 'About',
    sectionId = 'overview',
}) {
    if (!about && !(docs && docs.length)) return null;

    const isHtml = about && looksLikeHtml(about);

    return (
        <DetailSection id={sectionId || undefined} title={title}>
            {about ? (
                isHtml ? (
                    <div
                        className="nn-editor text-sm leading-relaxed text-olive-800 sm:text-[0.95rem] sm:leading-7"
                        dangerouslySetInnerHTML={{ __html: about }}
                    />
                ) : (
                    <div className="space-y-3 text-sm leading-relaxed text-olive-800 sm:text-[0.95rem] sm:leading-7">
                        {String(about)
                            .split(/\n\s*\n/)
                            .map((para) => para.trim())
                            .filter(Boolean)
                            .map((para) => (
                                <p key={para.slice(0, 48)}>{para}</p>
                            ))}
                    </div>
                )
            ) : null}
            {docs?.length ? (
                <div className={`${about ? 'mt-4' : ''} grid grid-cols-2 gap-3`}>
                    {docs.map((doc) => (
                        <figure
                            key={doc.title}
                            className="overflow-hidden rounded-xl bg-olive-50"
                        >
                            <img
                                src={doc.image}
                                alt=""
                                className="aspect-[3/4] w-full object-cover"
                                loading="lazy"
                            />
                            <figcaption className="px-2.5 py-2 text-xs font-semibold text-olive-800">
                                {doc.title}
                            </figcaption>
                        </figure>
                    ))}
                </div>
            ) : null}
        </DetailSection>
    );
}
