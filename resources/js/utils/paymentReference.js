const PALPLUSS_UUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Palpluss tracking ids are not useful to members. Prefer M-Pesa receipts. */
export function isGatewayTrackingReference(reference) {
    return typeof reference === 'string' && PALPLUSS_UUID.test(reference.trim());
}

/** Reference safe to show in member UI (receipts, typed codes). */
export function memberFacingPaymentReference(reference) {
    if (!reference || isGatewayTrackingReference(reference)) {
        return null;
    }

    return reference;
}

export function isAwaitingMpesaPrompt(upgrade) {
    if (!upgrade) {
        return false;
    }

    if (upgrade.awaiting_mpesa_prompt) {
        return true;
    }

    return (
        (upgrade.payment_method || 'mpesa') === 'mpesa' &&
        isGatewayTrackingReference(upgrade.payment_reference)
    );
}
