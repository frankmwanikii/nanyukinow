const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_-]+$/;
export const MIN_PASSWORD = 8;
export const MIN_PASSWORD_STRENGTH = 80;

export function fieldFeedback(
    value,
    validate,
    serverError,
    successMessage = 'Looks good',
) {
    if (serverError) {
        return { error: serverError, success: null };
    }
    if (!String(value ?? '').length) {
        return { error: null, success: null };
    }
    const result = validate(value);
    if (result === true) {
        return { error: null, success: successMessage };
    }
    return { error: result, success: null };
}

export function validateLoginIdentifier(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Enter your email or username';
    if (trimmed.includes('@')) {
        return EMAIL_RE.test(trimmed) ? true : 'Enter a valid email address';
    }
    if (trimmed.length < 3) return 'Username must be at least 3 characters';
    if (!USERNAME_RE.test(trimmed)) {
        return 'Use letters, numbers, hyphens, or underscores';
    }
    return true;
}

export function validateLoginPassword(value) {
    if (!value) return 'Enter your password';
    return true;
}

export function validateName(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Enter your full name';
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (trimmed.length > 255) return 'Name is too long';
    return true;
}

export function validateUsername(value) {
    if (!value) return 'Choose a username';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 30) return 'Username must be 30 characters or fewer';
    if (!USERNAME_RE.test(value)) {
        return 'Use letters, numbers, hyphens, or underscores';
    }
    return true;
}

export function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) return 'Enter your email address';
    return EMAIL_RE.test(trimmed) ? true : 'Enter a valid email address';
}

export function passwordStrengthScore(value) {
    let score = 0;
    if (value.length >= MIN_PASSWORD) score += 25;
    if (value.length >= 10) score += 5;
    if (/[A-Za-z]/.test(value)) score += 20;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 5;
    if (/\d/.test(value)) score += 25;
    if (/[^A-Za-z0-9]/.test(value)) score += 25;
    return Math.min(100, score);
}

export function validatePassword(value) {
    if (!value) return 'Create a password';
    if (value.length < MIN_PASSWORD) {
        return `Password must be at least ${MIN_PASSWORD} characters`;
    }
    if (!/[A-Za-z]/.test(value)) return 'Add a letter';
    if (!/\d/.test(value)) return 'Add a number';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Add a symbol (e.g. !@#$)';
    if (passwordStrengthScore(value) < MIN_PASSWORD_STRENGTH) {
        return 'Make it stronger — mix letters, numbers, and symbols';
    }
    return true;
}

export function validatePasswordConfirm(value, password) {
    if (!value) return 'Confirm your password';
    if (value !== password) return 'Passwords do not match';
    return true;
}
