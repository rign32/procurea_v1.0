// Brand palette — identical across all repos (navy primary + yellow CTA + signals).
// Source: TOKEN-RECONCILIATION.md, Appendix §08.

const brand = {
  navy: {
    900: '#0b1834',
    800: '#102043',
    700: '#162a52',   // PRIMARY
    600: '#1d3666',
    500: '#27417a',   // ACCENT-2
    400: '#3d5a94',
    300: '#5872a7',
    200: '#b5c2dc',
    100: '#d8dfee',
    50:  '#eef1f8',
    soft:   '#e7ecf5',
    softer: '#f1f4f9',
  },
  cta: {
    DEFAULT: '#f4c842',
    hover:   '#e6b82e',
    ink:     '#0e1614',
  },
  ink: {
    DEFAULT: '#0e1614',
    2: '#2a3330',
    3: '#4a5551',
  },
  mutedInk: {
    DEFAULT: '#6b7672',
    2: '#98a19c',
  },
};

const signals = {
  good: { DEFAULT: '#2f7a4f', soft: '#e6f2ec', border: '#c9e3d4' },
  warn: { DEFAULT: '#c97b1a', soft: '#fbeed9', border: '#ecd6ae' },
  bad:  { DEFAULT: '#b94a3a', soft: '#fbe5e0', border: '#f0c6be' },
  info: { DEFAULT: '#3b6fa8', soft: '#e6eef8', border: '#c8d6ea' },
};

const scoreGrades = {
  hi: '#2f7a4f',  // ≥85
  md: '#c97b1a',  // 70-84
  lo: '#98a19c',  // <70
};

module.exports = { brand, signals, scoreGrades };
