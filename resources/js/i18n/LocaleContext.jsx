import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
    const [locale, setLocale] = useState(() => {
        if (typeof window === 'undefined') return 'en';
        return window.localStorage.getItem('nn_locale') || 'en';
    });

    useEffect(() => {
        window.localStorage.setItem('nn_locale', locale);
        document.documentElement.lang = locale === 'sw' ? 'sw' : 'en';
    }, [locale]);

    const value = useMemo(
        () => ({
            locale,
            setLocale,
            toggleLocale: () => setLocale((prev) => (prev === 'en' ? 'sw' : 'en')),
            t: translations[locale],
        }),
        [locale],
    );

    return (
        <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    );
}

export function useLocale() {
    const ctx = useContext(LocaleContext);
    if (!ctx) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return ctx;
}
