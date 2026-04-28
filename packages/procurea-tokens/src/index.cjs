// Main entry — re-exports everything for consumers that want a single import.

const colors = require('./colors/index.cjs');
const typography = require('./typography/fonts.cjs');
const tailwindShared = require('./tailwind-shared.cjs');

module.exports = {
  ...colors,
  ...typography,
  tailwindShared,
};
