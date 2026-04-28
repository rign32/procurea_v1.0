#!/usr/bin/env node
// CLI entrypoint for syncing lead magnet content from Figma → landing repo.
//
// Usage:
//   npm run sync-magnet -- --slug=nearshore-migration-playbook
//   npm run sync-magnet -- --slug=nearshore-migration-playbook --dry-run
//   npm run sync-magnet -- --slug=nearshore-migration-playbook --no-pdf
//   npm run sync-magnet -- --all
//   npm run sync-magnet -- --slug=… --verbose
//
// Loads FIGMA_TOKEN from landing/.env if present (no dotenv dep — naive parser).
// Per CLAUDE.md, never auto-commits or pushes — that step is human-gated.

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

import { SyncAgent } from './figma-to-md/sync-agent.mjs';
import { MAGNET_CONFIG } from './figma-to-md/magnet-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LANDING_DIR = join(__dirname, '..');

loadEnv(join(LANDING_DIR, '.env'));
loadEnv(join(LANDING_DIR, '.env.local'));

const { values } = parseArgs({
  options: {
    slug:      { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    'no-pdf':  { type: 'boolean', default: false },
    all:       { type: 'boolean', default: false },
    verbose:   { type: 'boolean', short: 'v', default: false },
    help:      { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

if (values.help) {
  printHelp();
  process.exit(0);
}

const slugs = values.all
  ? Object.keys(MAGNET_CONFIG)
  : (values.slug ? [values.slug] : []);

if (slugs.length === 0) {
  console.error('Error: --slug=<slug> or --all required.\n');
  printHelp();
  process.exit(1);
}

main(slugs, values).catch((err) => {
  console.error(`\n✗ ${err.message}`);
  if (values.verbose && err.stack) console.error(err.stack);
  process.exit(1);
});

// ── main ─────────────────────────────────────────────────────────────────

async function main(slugs, opts) {
  // Important: SyncAgent constructor reads FIGMA_TOKEN. Surface a friendly
  // error before we burn a slug.
  const agent = new SyncAgent({ verbose: opts.verbose });

  let failures = 0;
  for (const slug of slugs) {
    process.stdout.write(`\n→ ${slug}\n`);
    try {
      const result = await agent.sync(slug, {
        dryRun:  opts['dry-run'],
        skipPdf: opts['no-pdf'],
      });

      if (opts['dry-run']) {
        const { preview, markdown } = result;
        console.log(`  ✓ Dry-run: would write ${markdown.length} chars`);
        console.log(`    Existing on disk: ${preview.existingLength} chars`);
        if (preview.diff && preview.diff !== '(no changes)') {
          console.log('\n--- Diff preview (first 60 lines) ---');
          console.log(preview.diff.split('\n').slice(0, 60).join('\n'));
          if (preview.diff.split('\n').length > 60) {
            console.log(`… (truncated, ${preview.diff.split('\n').length} total lines)`);
          }
        } else {
          console.log('  No changes vs current markdown.');
        }
      } else {
        const { write } = result;
        console.log(`  ✓ Wrote ${write.mdPath}`);
        if (write.pdfBytes != null) {
          console.log(`  ✓ PDF: ${(write.pdfBytes / 1024).toFixed(0)} KB`);
        }
        if (write.manifestUpdated) {
          console.log(`  ✓ Manifest: publishedAt updated`);
        }
        if (write.diff && write.diff.trim().length > 0) {
          const lines = write.diff.split('\n');
          console.log(`\n  Git diff: ${lines.length} lines (review with \`git diff\`)`);
        } else {
          console.log('  Git diff: (no changes)');
        }
      }
    } catch (err) {
      failures += 1;
      console.error(`  ✗ ${err.message}`);
      if (opts.verbose && err.stack) console.error(err.stack);
    }
  }

  console.log('');
  if (failures > 0) {
    console.error(`Sync finished with ${failures} failure(s) of ${slugs.length}.`);
    process.exit(1);
  }
  console.log(`✓ Sync OK (${slugs.length} magnet${slugs.length === 1 ? '' : 's'}).`);
  if (!opts['dry-run']) {
    console.log('\nNext steps (per CLAUDE.md):');
    console.log('  1. Review the diff:        git diff');
    console.log('  2. Stage:                  git add public/resources/downloads/<slug>/ src/content/resources.ts');
    console.log('  3. Commit + push staging:  git commit -m "content: sync <slug> from Figma" && git push origin staging');
  }
}

// ── helpers ──────────────────────────────────────────────────────────────

function loadEnv(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, 'utf-8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function printHelp() {
  console.log(`Sync lead magnet content from Figma → landing repo.

Usage:
  npm run sync-magnet -- --slug=<slug>            Sync one magnet
  npm run sync-magnet -- --all                    Sync all magnets
  npm run sync-magnet -- --slug=<slug> --dry-run  Preview diff, no writes
  npm run sync-magnet -- --slug=<slug> --no-pdf   Skip PDF regeneration
  npm run sync-magnet -- --slug=<slug> --verbose  Verbose logging

Available slugs:
${Object.keys(MAGNET_CONFIG).map((s) => `  - ${s}`).join('\n')}

Requires:
  - FIGMA_TOKEN in landing/.env (or environment)
  - pandoc + wkhtmltopdf (for PDF; without them, --no-pdf is implicit)

Per CLAUDE.md the script never commits or pushes; do that yourself after
reviewing the diff.`);
}
