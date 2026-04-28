// Tailwind theme.extend builder — consumed by all repos' tailwind.config.js.
//
// Usage:
//   const tokens = require('../packages/procurea-tokens/src/tailwind-shared.cjs');
//   // for marketing surfaces (landing, content-os):
//   ...tokens.themeWarm
//   // for product surfaces (frontend, admin-frontend):
//   ...tokens.themeCool
//   // or pick à la carte: tokens.colorsBase, tokens.surfaceWarm, tokens.surfaceCool, tokens.fontFamily, …

const { brand, signals, scoreGrades } = require('./colors/brand.cjs');
const surfaceMarketing = require('./colors/surface-marketing.cjs');
const surfaceProduct = require('./colors/surface-product.cjs');
const { fonts, spacing, radii, shadows } = require('./typography/fonts.cjs');

// Brand + signal colors that apply to EVERY repo regardless of surface choice.
const colorsBase = {
  brand: {
    DEFAULT: brand.navy[700],
    50:  brand.navy[50],
    100: brand.navy[100],
    200: brand.navy[200],
    300: brand.navy[300],
    400: brand.navy[400],
    500: brand.navy[500],
    600: brand.navy[600],
    700: brand.navy[700],
    800: brand.navy[800],
    900: brand.navy[900],
    soft:   brand.navy.soft,
    softer: brand.navy.softer,
    ink:    '#ffffff',
  },
  cta: brand.cta,
  ink: brand.ink,
  'muted-ink': brand.mutedInk,
  good: signals.good,
  warn: signals.warn,
  bad:  signals.bad,
  info: signals.info,
  score: scoreGrades,
};

const surfaceColorsWarm = {
  bg:       { DEFAULT: surfaceMarketing.bg, 2: surfaceMarketing.bg2, 3: surfaceMarketing.bg3 },
  surface:  { DEFAULT: surfaceMarketing.surface, 2: surfaceMarketing.surface2 },
  rule:     { DEFAULT: surfaceMarketing.rule, 2: surfaceMarketing.rule2, 3: surfaceMarketing.rule3 },
};

const surfaceColorsCool = {
  bg:       { DEFAULT: surfaceProduct.bg, 2: surfaceProduct.bg2, 3: surfaceProduct.bg3 },
  surface:  { DEFAULT: surfaceProduct.surface, 2: surfaceProduct.surface2 },
  rule:     { DEFAULT: surfaceProduct.rule, 2: surfaceProduct.rule2, 3: surfaceProduct.rule3 },
};

const fontFamily = {
  sans:    fonts.sans,
  display: fonts.sans,
  mono:    fonts.mono,
  serif:   fonts.serif,
};

const borderRadius = { ...radii };
const boxShadow = { ...shadows };

// Pre-baked theme.extend bundles per surface variant.
const themeWarm = {
  colors: { ...colorsBase, ...surfaceColorsWarm },
  fontFamily,
  spacing,
  borderRadius,
  boxShadow,
};

const themeCool = {
  colors: { ...colorsBase, ...surfaceColorsCool },
  fontFamily,
  spacing,
  borderRadius,
  boxShadow,
};

module.exports = {
  // pre-baked bundles
  themeWarm,
  themeCool,
  // pieces (for repos that want fine-grained control)
  colorsBase,
  surfaceColorsWarm,
  surfaceColorsCool,
  fontFamily,
  spacing,
  borderRadius,
  boxShadow,
  // raw token references (for direct use in JS code, charts, SVG, etc.)
  brand,
  signals,
  scoreGrades,
  surfaceMarketing,
  surfaceProduct,
  fonts,
};
