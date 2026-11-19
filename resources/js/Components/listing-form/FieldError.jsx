import { errorText } from './fieldStyles';

/**
 * Inline validation message under a form control.
 */
export default function FieldError({ id, message }) {
    if (!message) return null;

    return (
        <p id={id} className={errorText} role="alert">
            {message}
        </p>
    );
}
