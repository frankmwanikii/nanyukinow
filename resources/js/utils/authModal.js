import { router } from '@inertiajs/react';

/** @deprecated Prefer Link/router.visit to login|register routes. Kept for call sites. */
export const AUTH_MODAL_EVENT = 'nanyuki:open-auth-modal';

export function openAuthModal(tab = 'login') {
    if (typeof window === 'undefined') return;
    const href = tab === 'register' ? route('register') : route('login');
    router.visit(href);
}
