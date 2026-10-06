/**
 * Lets the site navbar avatar open the account sidebar drawer while
 * AccountLayout is mounted (mobile only). Desktop keeps the persistent sidebar.
 *
 * Uses globalThis so Vite chunk splits cannot duplicate the singleton.
 */

const STORE_KEY = '__nnAccountMenuOpener';

/**
 * @param {() => void} handler
 * @returns {() => void} unregister
 */
export function registerAccountMenuOpener(handler) {
    globalThis[STORE_KEY] = handler;

    return () => {
        if (globalThis[STORE_KEY] === handler) {
            globalThis[STORE_KEY] = null;
        }
    };
}

/**
 * @param {{ force?: boolean }} [options]
 * @returns {boolean} true if the account drawer was opened
 */
export function tryOpenAccountMenu(options = {}) {
    const openHandler = globalThis[STORE_KEY];

    if (typeof openHandler !== 'function') {
        return false;
    }

    if (
        !options.force &&
        typeof window !== 'undefined' &&
        window.matchMedia('(min-width: 1024px)').matches
    ) {
        return false;
    }

    openHandler();

    return true;
}
