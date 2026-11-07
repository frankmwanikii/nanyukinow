import { label as labelClass } from './fieldStyles';

/**
 * Form label with an optional required asterisk.
 */
export default function FieldLabel({
    htmlFor,
    required = false,
    children,
    className = '',
    as = 'label',
    id,
}) {
    const Tag = as;
    const props =
        Tag === 'label'
            ? { htmlFor, className: `${labelClass} ${className}`.trim() }
            : { id, className: `${labelClass} ${className}`.trim() };

    return (
        <Tag {...props}>
            {children}
            {required ? (
                <span className="text-rose-600" aria-hidden="true">
                    {' '}
                    *
                </span>
            ) : null}
            {required ? <span className="sr-only"> (required)</span> : null}
        </Tag>
    );
}
