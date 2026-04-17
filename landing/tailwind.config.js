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
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
