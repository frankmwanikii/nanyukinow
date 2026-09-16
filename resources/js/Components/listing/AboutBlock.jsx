import DetailSection from './DetailSection';

export default function AboutBlock({
    about,
    docs = [],
    title = 'About',
    sectionId = 'overview',
}) {
    if (!about && !(docs && docs.length)) return null;

    return (
        <DetailSection id={sectionId || undefined} title={title}>
            {about ? (
                <p className="text-sm leading-relaxed text-olive-800 sm:text-[0.95rem] sm:leading-7">
                    {about}
                </p>
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
