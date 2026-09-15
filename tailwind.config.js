import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                olive: {
                    50: '#f4f5f1',
                    100: '#e4e7dc',
                    200: '#c9d0bb',
                    300: '#a8b393',
                    400: '#889571',
                    500: '#6b7758',
                    600: '#4b533a',
                    700: '#3d4430',
                    800: '#323728',
                    900: '#2a2e23',
                    950: '#161911',
                },
                mustard: {
                    DEFAULT: '#f2b82e',
                    soft: '#f9b51e',
                    deep: '#d49a14',
                },
                mint: {
                    DEFAULT: '#a8e190',
                    soft: '#c4efb3',
                    deep: '#7bc45f',
                },
                earth: {
                    sand: '#ebe4d6',
                    clay: '#8b5a3c',
                    dusk: '#1c1712',
                    bark: '#2a221c',
                },
            },
            fontFamily: {
                display: ['Sora', ...defaultTheme.fontFamily.sans],
                sans: ['DM Sans', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                lift: '0 12px 40px -12px rgba(28, 23, 18, 0.28)',
                soft: '0 4px 24px -8px rgba(28, 23, 18, 0.12)',
            },
            backgroundImage: {
                'grain':
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
            },
            animation: {
                'fade-up': 'fadeUp 0.7s ease-out both',
                'ken-burns': 'kenBurns 28s ease-out infinite alternate',
            },
            keyframes: {
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(24px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                kenBurns: {
                    '0%': { transform: 'scale(1)' },
                    '100%': { transform: 'scale(1.08)' },
                },
            },
        },
    },

    plugins: [forms],
};
