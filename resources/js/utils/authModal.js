export const AUTH_MODAL_EVENT = 'nanyuki:open-auth-modal';

export function openAuthModal(tab = 'login') {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent(AUTH_MODAL_EVENT, { detail: { tab } }),
    );
}
