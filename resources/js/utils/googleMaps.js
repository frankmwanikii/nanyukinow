/**
 * Shared Google Maps JS API loader (Maps + Places).
 */

let googleLoader = null;

export function getMapsApiKey(explicitKey) {
    return (
        explicitKey ||
        (typeof import.meta !== 'undefined'
            ? import.meta.env?.VITE_GOOGLE_MAPS_API_KEY
            : null) ||
        ''
    );
}

export function loadGoogleMaps(apiKey, { libraries = ['places'] } = {}) {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No window'));
    }

    const key = getMapsApiKey(apiKey);
    if (!key) {
        return Promise.reject(new Error('Missing Google Maps API key'));
    }

    // Already fully loaded with Places.
    if (window.google?.maps?.places) {
        return Promise.resolve(window.google.maps);
    }

    // Maps loaded earlier without Places — load Places library on demand.
    if (window.google?.maps && !window.google.maps.places) {
        return new Promise((resolve, reject) => {
            if (!window.google.maps.importLibrary) {
                reject(new Error('Places library unavailable'));
                return;
            }
            window.google.maps
                .importLibrary('places')
                .then(() => resolve(window.google.maps))
                .catch(reject);
        });
    }

    if (googleLoader) return googleLoader;

    googleLoader = new Promise((resolve, reject) => {
        const libs = libraries.join(',');
        const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=${encodeURIComponent(libs)}&v=weekly&loading=async`;
        const existing = document.querySelector(
            `script[src^="https://maps.googleapis.com/maps/api/js"]`,
        );

        if (existing) {
            const finish = () => {
                if (window.google?.maps?.places) {
                    resolve(window.google.maps);
                    return;
                }
                if (window.google?.maps?.importLibrary) {
                    window.google.maps
                        .importLibrary('places')
                        .then(() => resolve(window.google.maps))
                        .catch(reject);
                    return;
                }
                if (window.google?.maps) {
                    resolve(window.google.maps);
                    return;
                }
                reject(new Error('Google Maps failed to load'));
            };
            existing.addEventListener('load', finish);
            existing.addEventListener('error', reject);
            if (window.google?.maps) finish();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google?.maps) resolve(window.google.maps);
            else reject(new Error('Google Maps failed to load'));
        };
        script.onerror = () =>
            reject(new Error('Google Maps script failed to load'));
        document.head.appendChild(script);
    });

    return googleLoader;
}
