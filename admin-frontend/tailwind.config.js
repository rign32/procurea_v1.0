/** @type {import('tailwindcss').Config} */
const tokens = require('../packages/procurea-tokens/src/tailwind-shared.cjs');

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class'],
    theme: {
        extend: {
            colors: {
                // ── New brand-aligned tokens (future code) ─────────────────
                ...tokens.colorsBase,        // brand, cta, ink, muted-ink, good, warn, bad, info, score

                // ── Legacy admin namespaces (kept for backward compat) ─────
                //     Class names unchanged; values rebranded to navy + warm signals.
                surface: {
                    DEFAULT: '#0f1117',      // dark slate page bg (operator dark UI)
                    raised:  '#161922',
                    overlay: '#1c1f2e',
                    hover:   '#222639',
                },
                accent: {
                    // Was teal #5E8C8F — now navy to match brand.
                    DEFAULT: '#162a52',
                    hover:   '#27417a',
                    subtle:  '#3d5a94',
                    muted:   'rgba(22, 42, 82, 0.12)',
                },
                success: {
                    // Was bright #10b981 → warm signal good.
                    DEFAULT: '#2f7a4f',
                    muted:   'rgba(47, 122, 79, 0.12)',
                },
                warning: {
                    // Was bright #f59e0b → warm signal warn.
                    DEFAULT: '#c97b1a',
                    muted:   'rgba(201, 123, 26, 0.12)',
                },
                danger: {
                    // Was bright #ef4444 → warm signal bad.
                    DEFAULT: '#b94a3a',
                    muted:   'rgba(185, 74, 58, 0.12)',
                },
                text: {
                    primary:   '#f1f5f9',
                    secondary: '#94a3b8',
                    muted:     '#64748b',
                },
                border: {
                    DEFAULT: '#1e293b',
                    hover:   '#334155',
                },
            },
            fontFamily: {
                // Was Inter — unified to Manrope across all repos.
                ...tokens.fontFamily,
            },
            boxShadow: {
                ...tokens.boxShadow,                                // ds-sm/md/lg, glow, glow-primary
                glow: '0 0 20px rgba(22, 42, 82, 0.15)',           // navy glow (was teal)
                card: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
            },
        },
    },
    plugins: [],
}
