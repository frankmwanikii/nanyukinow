const SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js';

let scriptLoader = null;

/**
 * Load Paystack Popup v2 (CDN). Resolves to the PaystackPop constructor.
 */
export function loadPaystackPop() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }

    if (window.PaystackPop) {
        return Promise.resolve(window.PaystackPop);
    }

    if (scriptLoader) {
        return scriptLoader;
    }

    scriptLoader = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
        if (existing) {
            existing.addEventListener('load', () => {
                if (window.PaystackPop) {
                    resolve(window.PaystackPop);
                } else {
                    reject(new Error('Paystack Popup failed to load.'));
                }
            });
            existing.addEventListener('error', () =>
                reject(new Error('Paystack Popup failed to load.')),
            );
            if (window.PaystackPop) {
                resolve(window.PaystackPop);
            }
            return;
        }

        const script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        script.onload = () => {
            if (window.PaystackPop) {
                resolve(window.PaystackPop);
            } else {
                reject(new Error('Paystack Popup failed to load.'));
            }
        };
        script.onerror = () => reject(new Error('Paystack Popup failed to load.'));
        document.body.appendChild(script);
    }).catch((error) => {
        scriptLoader = null;
        throw error;
    });

    return scriptLoader;
}

/**
 * Open Paystack card checkout on this page (no full redirect).
 *
 * @param {string} accessCode
 * @returns {Promise<{ reference: string }>}
 */
export async function openPaystackCardCheckout(accessCode) {
    const PaystackPop = await loadPaystackPop();

    return new Promise((resolve, reject) => {
        const popup = new PaystackPop();
        popup.resumeTransaction(accessCode, {
            onSuccess: (transaction) => {
                const reference =
                    transaction?.reference || transaction?.trxref || '';
                if (!reference) {
                    reject(new Error('Paystack did not return a reference.'));
                    return;
                }
                resolve({ reference });
            },
            onCancel: () => {
                reject(new Error('Payment cancelled.'));
            },
            onError: (error) => {
                reject(
                    new Error(
                        error?.message || 'Card payment failed. Please try again.',
                    ),
                );
            },
        });
    });
}
