/**
 * Shared Google Maps JS API loader (Maps + Places).
 *
 * Supports both the classic bootstrap and the async dynamic import API.
 * Always ensures `google.maps.Map` exists before resolving so call sites can
 * keep using `new maps.Map(...)`.
 */

let googleLoader = null;
let loadedWithKey = null;
let authHookInstalled = false;
const authFailureListeners = new Set();

export const GOOGLE_MAPS_AUTH_HELP =
    'Google rejected this API key. In Google Cloud Console: enable billing, enable Maps JavaScript API and Places API, set Application restrictions to HTTP referrers (include https://nanyukinow.co.ke/* and https://www.nanyukinow.co.ke/*), and allow those APIs on the key.';

export function getMapsApiKey(explicitKey) {
    return (
        explicitKey ||
        (typeof import.meta !== 'undefined'
            ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY
            : null) ||
        ''
    );
}

function notifyAuthFailure() {
    authFailureListeners.forEach((listener) => {
        try {
            listener();
        } catch {
            // Ignore listener errors so one bad handler cannot block others.
        }
    });
}

function ensureAuthFailureHook() {
    if (typeof window === 'undefined' || authHookInstalled) {
        return;
    }

    authHookInstalled = true;
    const previous = window.gm_authFailure;
    window.gm_authFailure = () => {
        if (typeof previous === 'function') {
            try {
                previous();
            } catch {
                // Preserve prior handlers without breaking ours.
            }
        }
        notifyAuthFailure();
    };
}

/**
 * Subscribe to Google's global gm_authFailure (fires after Map construct when
 * the key/referrer/billing/API enablement is wrong). Returns an unsubscribe fn.
 */
export function onGoogleMapsAuthFailure(listener) {
    if (typeof window === 'undefined' || typeof listener !== 'function') {
        return () => {};
    }

    ensureAuthFailureHook();
    authFailureListeners.add(listener);

    return () => {
        authFailureListeners.delete(listener);
    };
}

async function ensureGoogleLibraries(libraries = ['places']) {
    const mapsNs = window.google?.maps;
    if (!mapsNs) {
        throw new Error('Google Maps failed to load');
    }

    if (typeof mapsNs.importLibrary === 'function') {
        try {
            const mapsLib = await mapsNs.importLibrary('maps');
            if (mapsLib && typeof mapsNs.Map !== 'function') {
                Object.assign(mapsNs, mapsLib);
            }
        } catch (error) {
            throw new Error(
                error?.message ||
                    'Could not load the Maps library. Check the API key, enable Maps JavaScript API, and turn on billing.',
            );
        }

        for (const lib of libraries.filter((name) => name && name !== 'maps')) {
            try {
                const loaded = await mapsNs.importLibrary(lib);
                if (lib === 'places' && loaded) {
                    mapsNs.places = {
                        ...(mapsNs.places || {}),
                        ...loaded,
                    };
                } else if (loaded && typeof loaded === 'object') {
                    Object.assign(mapsNs, loaded);
                }
            } catch (error) {
                throw new Error(
                    error?.message ||
                        `Could not load the ${lib} library. Enable it in Google Cloud for this API key.`,
                );
            }
        }
    }

    if (typeof mapsNs.Map !== 'function') {
        throw new Error(
            'Google Maps Map constructor unavailable. Check the API key, enable Maps JavaScript API, and turn on billing.',
        );
    }

    return mapsNs;
}

function injectGoogleMapsScript(key, libraries) {
    const libs = [...new Set(['places', ...libraries])].filter(Boolean).join(',');
    const callbackName = `__nnGoogleMapsReady_${Date.now()}`;

    return new Promise((resolve, reject) => {
        const existing = document.querySelector(
            `script[src^="https://maps.googleapis.com/maps/api/js"]`,
        );

        if (existing) {
            const finish = () => {
                ensureGoogleLibraries(libraries).then(resolve).catch(reject);
            };

            if (window.google?.maps) {
                finish();
                return;
            }

            existing.addEventListener('load', finish, { once: true });
            existing.addEventListener(
                'error',
                () => reject(new Error('Google Maps script failed to load')),
                { once: true },
            );
            return;
        }

        window[callbackName] = () => {
            delete window[callbackName];
            ensureGoogleLibraries(libraries).then(resolve).catch(reject);
        };

        // Classic callback bootstrap populates google.maps.Map for existing call sites.
        const src =
            `https://maps.googleapis.com/maps/api/js` +
            `?key=${encodeURIComponent(key)}` +
            `&libraries=${encodeURIComponent(libs)}` +
            `&v=weekly` +
            `&callback=${callbackName}`;

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            delete window[callbackName];
            reject(new Error('Google Maps script failed to load'));
        };
        document.head.appendChild(script);
    });
}

export function loadGoogleMaps(apiKey, { libraries = ['places'] } = {}) {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }

    const key = getMapsApiKey(apiKey);
    if (!key) {
        return Promise.reject(new Error('Missing Google Maps API key'));
    }

    if (
        typeof window.google?.maps?.Map === 'function' &&
        loadedWithKey === key
    ) {
        return ensureGoogleLibraries(libraries);
    }

    if (googleLoader && loadedWithKey === key) {
        return googleLoader.then(() => ensureGoogleLibraries(libraries));
    }

    loadedWithKey = key;
    googleLoader = injectGoogleMapsScript(key, libraries).catch((error) => {
        googleLoader = null;
        loadedWithKey = null;
        throw error;
    });

    return googleLoader;
}
