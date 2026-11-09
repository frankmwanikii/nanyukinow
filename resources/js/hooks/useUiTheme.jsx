import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nanyuki-ui-theme';
const LEGACY_ADMIN_KEY = 'nanyuki-admin-theme';
const ThemeContext = createContext(null);

function getInitialTheme() {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    const legacy = window.localStorage.getItem(LEGACY_ADMIN_KEY);
    if (legacy === 'light' || legacy === 'dark') {
        return legacy;
    }

    return 'light';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, theme);
        window.localStorage.setItem(LEGACY_ADMIN_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
    }, []);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === 'dark',
            setTheme,
            toggleTheme,
        }),
        [theme, toggleTheme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return ctx;
}

/** @deprecated Use ThemeProvider / useTheme */
export const AdminThemeProvider = ThemeProvider;
export const useAdminTheme = useTheme;
