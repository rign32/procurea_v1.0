/** @type {import('tailwindcss').Config} */
const tokens = require('../packages/procurea-tokens/src/tailwind-shared.cjs');
const cool = tokens.surfaceProduct;

export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                /* ─── Shadcn compatibility layer (HSL-based, legacy primitives) ─── */
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },

                /* ─── Product design system (sourced from @procurea/tokens) ─── */
                /* Surfaces flipped warm → COOL (#f8fafc family) per Option B.    */
                bg: {
                    DEFAULT: cool.bg,    // #f8fafc
                    2:       cool.bg2,   // #f1f5f9
                    3:       cool.bg3,   // #e2e8f0
                },
                surface: {
                    DEFAULT: cool.surface,    // #ffffff
                    2:       cool.surface2,   // #f8fafc
                },
                rule: {
                    DEFAULT: cool.rule,    // #cbd5e1
                    2:       cool.rule2,   // #a8bcc8
                    3:       cool.rule3,   // #94a3b8
                },
                /* Brand & signals — values match @procurea/tokens (hex). */
                ink: {
                    DEFAULT: '#0e1614',
                    2: '#2a3330',
                    3: '#4a5551',
                },
                'muted-ink': {
                    DEFAULT: '#6b7672',
                    2: '#98a19c',
                },
                brand: {
                    DEFAULT: '#162a52',
                    2: '#27417a',
                    3: '#3d5a94',
                    soft: '#e7ecf5',
                    softer: '#f1f4f9',
                    ink: '#ffffff',
                },
                cta: {
                    DEFAULT: '#f4c842',
                    hover: '#e6b82e',
                    ink: '#0e1614',
                },
                good: {
                    DEFAULT: '#2f7a4f',
                    soft: '#e6f2ec',
                    border: '#c9e3d4',
                },
                warn: {
                    DEFAULT: '#c97b1a',
                    soft: '#fbeed9',
                    border: '#ecd6ae',
                },
                bad: {
                    DEFAULT: '#b94a3a',
                    soft: '#fbe5e0',
                    border: '#f0c6be',
                },
                info: {
                    DEFAULT: '#3b6fa8',
                    soft: '#e6eef8',
                    border: '#c8d6ea',
                },
                score: {
                    hi: '#2f7a4f',
                    md: '#c97b1a',
                    lo: '#98a19c',
                },
            },
            borderRadius: {
                /* shadcn legacy */
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                /* new product scale */
                'r-1': '4px',
                'r-2': '6px',
                'r-3': '8px',
                'r-4': '10px',
                'r-5': '14px',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'soft-xl': '0 10px 40px -4px rgba(0, 0, 0, 0.08)',
                'glow': '0 0 20px rgba(22, 42, 82, 0.15)',
                'glow-primary': '0 4px 14px 0 rgba(22, 42, 82, 0.39)',
                /* new product shadows — warm ink */
                'ds-sm': '0 1px 2px rgba(14,22,20,0.04), 0 2px 4px rgba(14,22,20,0.03)',
                'ds-md': '0 4px 12px rgba(14,22,20,0.06), 0 12px 24px rgba(14,22,20,0.05)',
                'ds-lg': '0 8px 24px rgba(14,22,20,0.08), 0 24px 56px rgba(14,22,20,0.08)',
            },
            fontFamily: {
                sans: ['Manrope', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'monospace'],
                serif: ['Fraunces', '"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
            },
            fontSize: {
                /* new product scale (from redesign/tokens.css) */
                'ds-label': ['10.5px', { letterSpacing: '0.08em', lineHeight: '1.2' }],
                'ds-kpi': ['28px', { letterSpacing: '-0.03em', lineHeight: '1.1' }],
                'ds-h1': ['30px', { letterSpacing: '-0.03em', lineHeight: '1.15' }],
                'ds-h2': ['22px', { letterSpacing: '-0.025em', lineHeight: '1.2' }],
                'ds-h3': ['16px', { letterSpacing: '-0.015em', lineHeight: '1.3' }],
                'ds-h4': ['13px', { lineHeight: '1.35' }],
            },
            letterSpacing: {
                'ds-tight': '-0.03em',
                'ds-snug': '-0.022em',
                'ds-label': '0.08em',
                'ds-eyebrow': '0.1em',
            },
            transitionTimingFunction: {
                'ds': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            },
            transitionDuration: {
                'ds-fast': '120ms',
                'ds-med': '200ms',
                'ds-slow': '400ms',
            },
            keyframes: {
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(200%)' },
                },
                'steam-1': {
                    '0%, 100%': { transform: 'translateY(0) scaleY(1)', opacity: '0.5' },
                    '50%': { transform: 'translateY(-10px) scaleY(1.4)', opacity: '0' },
                },
                'steam-2': {
                    '0%, 100%': { transform: 'translateY(0) scaleY(1) translateX(0)', opacity: '0.4' },
                    '50%': { transform: 'translateY(-14px) scaleY(1.5) translateX(3px)', opacity: '0' },
                },
                'steam-3': {
                    '0%, 100%': { transform: 'translateY(0) scaleY(1) translateX(0)', opacity: '0.45' },
                    '50%': { transform: 'translateY(-8px) scaleY(1.3) translateX(-2px)', opacity: '0' },
                },
                'pulse-ring': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(22, 42, 82, 0.3)' },
                    '50%': { boxShadow: '0 0 0 8px rgba(22, 42, 82, 0)' },
                },
                'border-rotate': {
                    '0%': { '--border-angle': '0deg' },
                    '100%': { '--border-angle': '360deg' },
                },
                'ds-pulse': {
                    '0%': { opacity: '0.6', transform: 'scale(0.7)' },
                    '70%, 100%': { opacity: '0', transform: 'scale(1.8)' },
                },
                'ds-flow': {
                    '0%': { backgroundPosition: '-40px 0' },
                    '100%': { backgroundPosition: '40px 0' },
                },
            },
            animation: {
                shimmer: 'shimmer 3s ease-in-out infinite',
                'steam-1': 'steam-1 2.5s ease-in-out infinite',
                'steam-2': 'steam-2 3s ease-in-out infinite 0.3s',
                'steam-3': 'steam-3 2.8s ease-in-out infinite 0.6s',
                'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
                'border-rotate': 'border-rotate 4s linear infinite',
                'ds-pulse': 'ds-pulse 1.8s ease-in-out infinite',
                'ds-flow': 'ds-flow 2s linear infinite',
            },
        },
    },
    plugins: [],
}
