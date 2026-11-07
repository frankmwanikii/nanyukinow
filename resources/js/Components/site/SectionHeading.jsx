export default function SectionHeading({
    eyebrow,
    title,
    subtitle,
    light = false,
}) {
    return (
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
            {eyebrow ? (
                <p
                    className={`mb-2 text-sm font-medium ${
                        light ? 'text-mint' : 'text-olive-600'
                    }`}
                >
                    {eyebrow}
                </p>
            ) : null}
            <h2
                className={`font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl ${
                    light ? 'text-white' : 'text-earth-dusk'
                }`}
            >
                {title}
            </h2>
            {subtitle ? (
                <p
                    className={`mt-3 text-sm leading-relaxed sm:text-base ${
                        light ? 'text-white/75' : 'text-olive-700/80'
                    }`}
                >
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}
