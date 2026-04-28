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
        // Shared brand & signal tokens (@procurea/tokens)
        ...tokens.colorsBase,           // brand, cta, ink, muted-ink, good, warn, bad, info, score

        // Warm marketing surfaces (extends tokens.surfaceColorsWarm with backward-compat keys)
        bg: {
          DEFAULT: '#fafaf7',
          2:       '#f3f3ee',
          3:       '#ebebe4',
        },
        surface: {
          DEFAULT: '#ffffff',
          2:       '#f3f3ee',  // legacy: components use bg-surface-2 / from-surface-2
          3:       '#ebebe4',  // legacy: bg-surface-3 / to-surface-3 / border-surface-3
          bg:      '#fafaf7',  // legacy: bg-surface-bg
        },
        rule: {
          DEFAULT: '#e4e4dc',
          2:       '#d6d6cc',
          3:       '#c2c2b5',
        },
      },
      fontFamily: {
        ...tokens.fontFamily,            // Manrope, JetBrains Mono, Fraunces
      },
      borderRadius: {
        ...tokens.borderRadius,          // r-1 … r-5
      },
      boxShadow: {
        ...tokens.boxShadow,             // ds-sm/md/lg, glow, glow-primary
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
