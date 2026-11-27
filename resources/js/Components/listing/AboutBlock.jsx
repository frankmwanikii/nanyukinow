import DetailSection from './DetailSection';
import MobileFadeExpand from './MobileFadeExpand';

function looksLikeHtml(value) {
    return /<[a-z][\s\S]*>/i.test(String(value || ''));
}

export default function AboutBlock({
    about,
    docs = [],
    title = 'About us',
    sectionId = 'overview',
}) {
    const aboutText = (() => {
        if (!about) return null;
        const raw = String(about).trim();
        if (!raw) return null;
        const stripped = raw
            .replace(/<br\s*\/?>/gi, '')
            .replace(/&nbsp;/gi, ' ')
            .replace(/<[^>]+>/g, '')
            .trim();
        return stripped ? raw : null;
    })();

    if (!aboutText && !(docs && docs.length)) return null;

    const isHtml = aboutText && looksLikeHtml(aboutText);

    const body = aboutText ? (
        isHtml ? (
            <div
                className="nn-editor max-w-prose text-sm leading-relaxed text-olive-800 sm:text-[0.95rem] sm:leading-7"
                dangerouslySetInnerHTML={{ __html: aboutText }}
            />
        ) : (
            <div className="max-w-prose space-y-3 text-sm leading-relaxed text-olive-800 sm:text-[0.95rem] sm:leading-7">
                {String(aboutText)
                    .split(/\n\s*\n/)
                    .map((para) => para.trim())
                    .filter(Boolean)
                    .map((para) => (
                        <p key={para.slice(0, 48)}>{para}</p>
                    ))}
            </div>
        )
    ) : null;

    return (
        <DetailSection id={sectionId || undefined} title={title}>
            {body ? (
                <MobileFadeExpand maxHeight={520} mobileOnly={false}>
                    {body}
                </MobileFadeExpand>
            ) : null}
            {docs?.length ? (
                <div
                    className={`${aboutText ? 'mt-4' : ''} grid grid-cols-2 gap-3`}
                >
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
