/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: '#0f1117',
                    raised: '#161922',
                    overlay: '#1c1f2e',
                    hover: '#222639',
                },
                accent: {
                    DEFAULT: '#5E8C8F',
                    hover: '#7AADAF',
                    subtle: '#2A5C5D',
                    muted: 'rgba(94, 140, 143, 0.12)',
                },
                success: { DEFAULT: '#10b981', muted: 'rgba(16, 185, 129, 0.12)' },
                warning: { DEFAULT: '#f59e0b', muted: 'rgba(245, 158, 11, 0.12)' },
                danger: { DEFAULT: '#ef4444', muted: 'rgba(239, 68, 68, 0.12)' },
                text: {
                    primary: '#f1f5f9',
                    secondary: '#94a3b8',
                    muted: '#64748b',
                },
                border: {
                    DEFAULT: '#1e293b',
                    hover: '#334155',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            boxShadow: {
                glow: '0 0 20px rgba(94, 140, 143, 0.15)',
                card: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
            }
        },
    },
    plugins: [],
}
