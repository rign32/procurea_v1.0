// Typography tokens — unified across all repos.

const fonts = {
  sans: [
    'Manrope',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'sans-serif',
  ],
  mono: [
    '"JetBrains Mono"',
    'ui-monospace',
    '"SF Mono"',
    'Menlo',
    'monospace',
  ],
  serif: [
    'Fraunces',
    '"Instrument Serif"',
    'ui-serif',
    'Georgia',
    'serif',
  ],
};

const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
};

const radii = {
  'r-1': '4px',
  'r-2': '6px',
  'r-3': '8px',
  'r-4': '10px',
  'r-5': '14px',
};

const shadows = {
  'ds-sm':       '0 1px 2px rgba(14,22,20,0.04), 0 2px 4px rgba(14,22,20,0.03)',
  'ds-md':       '0 4px 12px rgba(14,22,20,0.06), 0 12px 24px rgba(14,22,20,0.05)',
  'ds-lg':       '0 8px 24px rgba(14,22,20,0.08), 0 24px 56px rgba(14,22,20,0.08)',
  'glow':        '0 0 20px rgba(22, 42, 82, 0.15)',
  'glow-primary':'0 4px 14px 0 rgba(22, 42, 82, 0.39)',
};

module.exports = { fonts, spacing, radii, shadows };
