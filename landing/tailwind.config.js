/** @type {import('tailwindcss').Config} */
export default {
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          50: '#EDF4F4',
          100: '#D4E6E7',
          200: '#C5E0E2',
          300: '#A9CDD0',
          400: '#7AADAF',
          500: '#5E8C8F',
          600: '#4A7174',
          700: '#2A5C5D',
          800: '#1A3A3B',
          900: '#2B3A47',
        },
        sage: {
          50: '#F4F5ED',
          100: '#E5E8D4',
          200: '#CDD1B0',
        },
        'brand-gray': {
          50: '#F0EDF2',
          100: '#DDD9E0',
          200: '#B5ADBA',
          500: '#8E8396',
        },
        slate: {
          925: '#0F172B',
          975: '#060913',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ['"Inter Tight"', "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tight: "-0.02em",
        "extra-tight": "-0.035em",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        premium: "0 4px 16px -2px rgb(0 0 0 / 0.04), 0 8px 32px -4px rgb(0 0 0 / 0.06)",
        "premium-lg": "0 8px 32px -4px rgb(0 0 0 / 0.08), 0 16px 64px -8px rgb(0 0 0 / 0.08)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glow-primary": "0 0 20px rgba(90, 140, 143, 0.3), 0 0 60px rgba(90, 140, 143, 0.1)",
        "glow-emerald": "0 0 20px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)",
        "glow-primary-hover": "0 0 24px rgba(90, 140, 143, 0.4), 0 0 80px rgba(90, 140, 143, 0.15)",
        "glow-emerald-hover": "0 0 24px rgba(16, 185, 129, 0.4), 0 0 80px rgba(16, 185, 129, 0.15)",
        "hover-card": "0 12px 40px -8px rgba(0, 0, 0, 0.1), 0 4px 16px -4px rgba(0, 0, 0, 0.06)",
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      fontSize: {
        "display-xl": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-2xl": ["5.5rem", { lineHeight: "1.02", letterSpacing: "-0.045em" }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient": "radial-gradient(at 40% 20%, rgba(90, 140, 143, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(169, 205, 208, 0.12) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(197, 224, 226, 0.1) 0px, transparent 50%)",
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out 1s infinite",
        "shimmer": "shimmer 2s linear infinite",
        "scroll-left": "scroll-left 60s linear infinite",
        "scroll-right": "scroll-right 60s linear infinite",
        "marquee": "scroll-left 30s linear infinite",
        "gradient-border": "gradient-border 3s ease infinite",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.4s ease-out both",
        "slide-in-left": "slide-in-left 0.5s ease-out both",
        "slide-in-right": "slide-in-right 0.5s ease-out both",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "ticker": "ticker 25s linear infinite",
        "spin-slow": "spin-slow 6s linear infinite",
        "shimmer-sweep": "shimmer-sweep 2.5s ease-out forwards",
        "drift": "drift 20s ease-in-out infinite",
        "gradient-x-slow": "gradient-x 12s ease infinite",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "gradient-border": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(90, 140, 143, 0.2)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 40px rgba(90, 140, 143, 0.4)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "shimmer-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "drift": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(8px, -6px)" },
          "50%": { transform: "translate(-4px, 8px)" },
          "75%": { transform: "translate(6px, 4px)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
