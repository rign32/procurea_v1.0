# Procurea — Brand Source of Truth

This is the canonical pointer to where Procurea's current brand lives. **Every other brand reference in this repo is either derived from these sources or deprecated.**

## The two sources of truth

### 1. Production CSS tokens — `landing/src/index.css`

The live brand palette is defined as CSS custom properties in `landing/src/index.css`. Tailwind config (`landing/tailwind.config.js`) and every landing component reads from these tokens.

**Core palette:**

| Token | Value | Role |
|---|---|---|
| Navy primary (`--ds-accent`) | `#162a52` | Brand mark, headings, secondary CTA, focus rings |
| Yellow CTA (`--ds-cta`) | `#f4c842` | Primary CTA — max one per viewport |
| Off-white background | `#fafaf7` | Default page surface |
| Ink (text) | follows token in `index.css` | Body copy |

If you need an exact value, **read the file** — these tokens evolve. Do not memorize hex values from old docs.

### 2. Visual brand guideline — Figma file `0zJMnO4ceUBsBk65j3gfMf`

File name: **"Procurea — Pitch Deck v4"**.

Brand chrome (eyebrow rule, footer band, page number, typography pairing of Manrope + JetBrains Mono, slide grids) is applied on every slide of that file. Use it as the visual reference for:

- Type scale and pairing
- Eyebrow + numbering treatment
- Yellow CTA usage (max one per slide)
- Page footer + slide number layout
- Color usage rules

## What is deprecated

The following references are **deprecated and should be ignored** by both humans and AI agents:

- `Dokumenty/content hub prototyping/ds/*.jsx` — replaced by stub pointers
- `Dokumenty/procurea design prototyping/ds/*.jsx` — replaced by stub pointers
- Any reference to **evergreen accent (`#0F4D3A`)** — that was a 2026 Q1 prototyping color, never shipped to production
- Any document that pairs evergreen + warm off-white as the brand palette

If you find evergreen referenced in a doc dated before 2026-04-28, treat it as historical narrative, not as guidance.

## Rules for AI agents

1. **Never copy brand tokens from `Dokumenty/**/*.jsx` files** — they are stubs that point here.
2. **Never reintroduce `#0F4D3A` (evergreen)** into production code, sales collaterals, or pitch decks.
3. **For tokens**, read `landing/src/index.css` directly — it is the live source.
4. **For visual chrome**, open the Figma file `0zJMnO4ceUBsBk65j3gfMf`.
5. If a user asks "what is the brand color" — point them at this file, not at any `.jsx` prototype.

## Ownership

Brand changes go through the live code (CSS tokens) + the Figma file. There is no third source of truth. If you find a third source, you've found a bug — flag it.
