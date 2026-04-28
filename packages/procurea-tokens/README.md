# @procurea/tokens

Procurea unified design tokens — navy brand, dual surfaces (warm for marketing, cool for product), yellow CTA, unified typography.

## Two surface variants

| | Warm (marketing) | Cool (product) |
|---|---|---|
| Repos | `landing/`, `content-os/` | `frontend/`, `admin-frontend/` |
| Page bg | `#fafaf7` warm earth | `#f8fafc` cool neutral |
| Rule | `#e4e4dc` warm | `#cbd5e1` cool |
| Goal | reading comprehension | scanning / data density |

Brand (navy `#162a52`), CTA (yellow `#f4c842`), signals (good/warn/bad/info), typography (Manrope / JetBrains Mono / Fraunces) and score grades are **identical across all repos**.

## Consumption

Each consuming repo's `tailwind.config.js` requires this package via **relative path** (no npm install / no workspace setup needed):

```js
// landing/tailwind.config.js  (warm)
const tokens = require('../packages/procurea-tokens/src/tailwind-shared.cjs');

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      ...tokens.themeWarm,
      // …repo-specific extensions (animations, keyframes, custom shadows) below
    },
  },
};
```

```js
// frontend/tailwind.config.js  (cool)
const tokens = require('../packages/procurea-tokens/src/tailwind-shared.cjs');

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      ...tokens.themeCool,
      // …shadcn legacy HSL layer + product-specific extensions
    },
  },
};
```

## Public API

`require('../packages/procurea-tokens/src/tailwind-shared.cjs')` returns:

| Export | Shape | Use |
|---|---|---|
| `themeWarm` | `{ colors, fontFamily, spacing, borderRadius, boxShadow }` | spread into `theme.extend` for landing / content-os |
| `themeCool` | same shape | spread for frontend / admin-frontend |
| `colorsBase` | `{ brand, cta, ink, 'muted-ink', good, warn, bad, info, score }` | brand-only colors (no surfaces) |
| `surfaceColorsWarm` / `surfaceColorsCool` | `{ bg, surface, rule }` | swap surfaces independently |
| `fontFamily`, `spacing`, `borderRadius`, `boxShadow` | tailwind-shaped | mix and match |
| `brand`, `signals`, `scoreGrades` | raw color objects | for JS code (chart fills, SVG, theme switchers) |
| `fonts`, `surfaceMarketing`, `surfaceProduct` | raw refs | escape hatches |

## Source of truth

- **Hex values** here mirror `landing/src/index.css` (production CSS) and Figma file `0zJMnO4ceUBsBk65j3gfMf` ("Procurea — Pitch Deck v4").
- See [BRAND.md](../../BRAND.md) for full brand rules.
- See [figma-pipeline/TOKEN-RECONCILIATION.md](../../figma-pipeline/TOKEN-RECONCILIATION.md) Option B for migration history.

## Why no npm workspaces?

This package is consumed via **relative `require()`** rather than as an npm workspace. Reasons:

1. The 4 frontends each ship their own `node_modules/` — converting to workspaces would hoist dependencies and break repo-pinned `lint-staged` / CI scripts.
2. Tokens are pure data — no build step, no transitive deps. A relative require is sufficient and zero-risk.
3. We can promote to a real workspace (or publish to a private registry) later if a use case appears (e.g. shared TS types in app code).
