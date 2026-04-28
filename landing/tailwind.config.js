/** @type {import('tailwindcss').Config} */
const tokens = require('../packages/procurea-tokens/src/tailwind-shared.cjs');

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Shared brand & signal tokens (@procurea/tokens) ─────────────
        ...tokens.colorsBase,           // brand, cta, ink, muted-ink, good, warn, bad, info, score

        // ── Warm marketing surfaces (extends/overrides tokens.surfaceColorsWarm
        //     with backward-compat keys still used in landing components) ─
        bg: {
          DEFAULT: '#fafaf7',
          2:       '#f3f3ee',
          3:       '#ebebe4',
        },
        surface: {
          DEFAULT: '#ffffff',
          2:       '#fbfbf8',
          3:       '#ebebe4',
          bg:      '#fafaf7',  // legacy alias for `bg.DEFAULT`, kept for components using bg-surface-bg
        },
        rule: {
          DEFAULT: '#e4e4dc',
          2:       '#d6d6cc',
          3:       '#c2c2b5',
        },

        // ── Shadcn legacy (HSL via CSS vars in index.css) ────────────────
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))",     foreground: "hsl(var(--primary-foreground))"     },
        secondary:   { DEFAULT: "hsl(var(--secondary))",   foreground: "hsl(var(--secondary-foreground))"   },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))",       foreground: "hsl(var(--muted-foreground))"       },
        accent:      { DEFAULT: "hsl(var(--accent))",      foreground: "hsl(var(--accent-foreground))"      },
        card:        { DEFAULT: "hsl(var(--card))",        foreground: "hsl(var(--card-foreground))"        },

        // ── Landing-only palettes (kept) ─────────────────────────────────
        sage: {
          50:  '#F4F5ED',
          100: '#E5E8D4',
          200: '#CDD1B0',
        },
        'brand-gray': {
          50:  '#F0EDF2',
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
        ...tokens.borderRadius,           // r-1 … r-5
        // shadcn legacy (CSS var)
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // shared (Manrope/JetBrains/Fraunces)
        ...tokens.fontFamily,
        // landing override: keep "Inter" fallback for legacy bundle
        sans:    ["Manrope", "Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Manrope", "Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:    ['"JetBrains Mono"', "ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      letterSpacing: {
        tightest:      "-0.04em",
        tight:         "-0.02em",
        "extra-tight": "-0.035em",
      },
      boxShadow: {
        // shared (ds-sm, ds-md, ds-lg, glow, glow-primary)
        ...tokens.boxShadow,
        // landing-specific overrides (legacy values, win on key collision)
        xs:                   "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        premium:              "0 4px 16px -2px rgb(14 22 20 / 0.05), 0 8px 32px -4px rgb(14 22 20 / 0.07)",
        "premium-lg":         "0 8px 32px -4px rgb(14 22 20 / 0.08), 0 16px 64px -8px rgb(14 22 20 / 0.10)",
        glass:                "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        "glow-primary":       "0 0 20px rgba(22, 42, 82, 0.28), 0 0 60px rgba(22, 42, 82, 0.1)",
        "glow-primary-hover": "0 0 24px rgba(22, 42, 82, 0.38), 0 0 80px rgba(22, 42, 82, 0.14)",
        "glow-emerald":       "0 0 20px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)",
        "glow-emerald-hover": "0 0 24px rgba(16, 185, 129, 0.4), 0 0 80px rgba(16, 185, 129, 0.15)",
        "inner-glow":         "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.05)",
        "hover-card":         "0 12px 40px -8px rgba(14, 22, 20, 0.10), 0 4px 16px -4px rgba(14, 22, 20, 0.06)",
      },
      backdropBlur: {
        xs:    "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      fontSize: {
        "display-xl":  ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.035em" }],
        "display-2xl": ["5.5rem", { lineHeight: "1.02", letterSpacing: "-0.04em"  }],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "mesh-gradient":   "radial-gradient(at 40% 20%, rgba(22, 42, 82, 0.09) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(39, 65, 122, 0.07) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(231, 236, 245, 0.55) 0px, transparent 50%)",
      },
      animation: {
        "gradient-x":      "gradient-x 8s ease infinite",
        "gradient-x-slow": "gradient-x 12s ease infinite",
        "float":           "float 6s ease-in-out infinite",
        "float-delayed":   "float 6s ease-in-out 2s infinite",
        "float-slow":      "float 8s ease-in-out 1s infinite",
        "shimmer":         "shimmer 2s linear infinite",
        "scroll-left":     "scroll-left 60s linear infinite",
        "scroll-right":    "scroll-right 60s linear infinite",
        "marquee":         "scroll-left 30s linear infinite",
        "gradient-border": "gradient-border 3s ease infinite",
        "fade-up":         "fade-up 0.6s ease-out both",
        "fade-in":         "fade-in 0.5s ease-out both",
        "scale-in":        "scale-in 0.4s ease-out both",
        "slide-in-left":   "slide-in-left 0.5s ease-out both",
        "slide-in-right":  "slide-in-right 0.5s ease-out both",
        "pulse-glow":      "pulse-glow 2s ease-in-out infinite",
        "ticker":          "ticker 25s linear infinite",
        "spin-slow":       "spin-slow 6s linear infinite",
        "shimmer-sweep":   "shimmer-sweep 2.5s ease-out forwards",
        "drift":           "drift 20s ease-in-out infinite",
      },
      keyframes: {
        "gradient-x":      { "0%, 100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        "float":           { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-12px)" } },
        "shimmer":         { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "scroll-left":     { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "scroll-right":    { "0%": { transform: "translateX(-50%)" }, "100%": { transform: "translateX(0)" } },
        "gradient-border": { "0%, 100%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" } },
        "fade-up":         { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "fade-in":         { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "scale-in":        { "0%": { opacity: "0", transform: "scale(0.95)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "slide-in-left":   { "0%": { opacity: "0", transform: "translateX(-20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        "slide-in-right":  { "0%": { opacity: "0", transform: "translateX(20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        "pulse-glow":      { "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(22, 42, 82, 0.2)" }, "50%": { opacity: "0.85", boxShadow: "0 0 40px rgba(22, 42, 82, 0.4)" } },
        "ticker":          { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-100%)" } },
        "spin-slow":       { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } },
        "shimmer-sweep":   { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "drift":           { "0%, 100%": { transform: "translate(0, 0)" }, "25%": { transform: "translate(8px, -6px)" }, "50%": { transform: "translate(-4px, 8px)" }, "75%": { transform: "translate(6px, 4px)" } },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
