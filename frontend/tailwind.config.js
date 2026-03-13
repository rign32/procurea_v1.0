/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
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
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'soft-xl': '0 10px 40px -4px rgba(0, 0, 0, 0.08)',
                'glow': '0 0 20px rgba(79, 70, 229, 0.15)',
                'glow-primary': '0 4px 14px 0 rgba(0, 85, 255, 0.39)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
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
                    '0%, 100%': { boxShadow: '0 0 0 0 hsl(226 100% 55% / 0.3)' },
                    '50%': { boxShadow: '0 0 0 8px hsl(226 100% 55% / 0)' },
                },
                'border-rotate': {
                    '0%': { '--border-angle': '0deg' },
                    '100%': { '--border-angle': '360deg' },
                },
            },
            animation: {
                shimmer: 'shimmer 3s ease-in-out infinite',
                'steam-1': 'steam-1 2.5s ease-in-out infinite',
                'steam-2': 'steam-2 3s ease-in-out infinite 0.3s',
                'steam-3': 'steam-3 2.8s ease-in-out infinite 0.6s',
                'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
                'border-rotate': 'border-rotate 4s linear infinite',
            },
        },
    },
    plugins: [],
}
