/**
 * Prisma 5.22.0 + moduleResolution: "nodenext" workaround.
 *
 * `prisma generate` removes default.d.ts and default.js from @prisma/client,
 * but the package.json exports field references them. This script recreates
 * the files so TypeScript can resolve the types correctly.
 *
 * Can be removed after upgrading to Prisma 6.x which fixes this issue.
 */
const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
const defaultDts = path.join(clientDir, 'default.d.ts');
const defaultJs = path.join(clientDir, 'default.js');

let fixed = false;

if (!fs.existsSync(defaultDts)) {
    fs.writeFileSync(defaultDts, "export * from '.prisma/client/default'\n");
    fixed = true;
}

if (!fs.existsSync(defaultJs)) {
    fs.writeFileSync(defaultJs, "module.exports = { ...require('.prisma/client/default') }\n");
    fixed = true;
}

if (fixed) {
    console.log('Fixed missing @prisma/client/default.{d.ts,js} (Prisma 5.22 + nodenext workaround)');
}
