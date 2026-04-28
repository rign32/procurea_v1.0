// Persist sync output: write markdown, regenerate PDF (pandoc + wkhtmltopdf
// when available — same toolchain as scripts/build-lead-magnets.mjs), update
// the resources.ts manifest publishedAt, and surface a git diff preview.
//
// All paths are anchored to landing/ (the CWD when running via `npm run`).

import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync, spawnSync } from 'node:child_process';

import { DOWNLOADS_DIR, RESOURCES_MANIFEST } from './magnet-config.mjs';

export class FileWriter {
  constructor(options = {}) {
    this.verbose = options.verbose ?? false;
    this.pandocAvailable = pandocAvailable();
  }

  // Returns { mdPath, pdfPath, pdfBytes, manifestUpdated, diff }.
  async write(slug, markdown, options = {}) {
    const dir = join(DOWNLOADS_DIR, slug);
    const mdPath = join(dir, `${slug}.md`);
    const pdfPath = join(dir, `${slug}.pdf`);

    mkdirSync(dir, { recursive: true });
    writeFileSync(mdPath, markdown, 'utf-8');
    if (this.verbose) console.log(`  [write] ${mdPath} (${markdown.length} chars)`);

    let pdfBytes = null;
    if (!options.skipPdf) {
      pdfBytes = await this.#regeneratePdf(mdPath, pdfPath);
    }

    const manifestUpdated = options.updateManifest === false
      ? false
      : this.#updateManifest(slug);

    const diff = options.skipDiff ? '' : this.#gitDiff(dir, RESOURCES_MANIFEST);

    return { mdPath, pdfPath, pdfBytes, manifestUpdated, diff };
  }

  // Returns markdown + diff WITHOUT writing anything (--dry-run).
  preview(slug, markdown) {
    const dir = join(DOWNLOADS_DIR, slug);
    const mdPath = join(dir, `${slug}.md`);
    const existing = existsSync(mdPath) ? readFileSync(mdPath, 'utf-8') : '';
    const diff = unifiedDiff(existing, markdown, mdPath);
    return { mdPath, diff, existingLength: existing.length, newLength: markdown.length };
  }

  // ── PDF ───────────────────────────────────────────────────────────────

  async #regeneratePdf(mdPath, pdfPath) {
    if (!this.pandocAvailable) {
      console.warn(`  ⚠ pandoc not installed — skipping PDF (install: brew install pandoc wkhtmltopdf)`);
      return null;
    }
    try {
      execSync(
        [
          `pandoc "${mdPath}" -o "${pdfPath}"`,
          `--pdf-engine=wkhtmltopdf`,
          `-V margin-top=20mm -V margin-bottom=20mm`,
          `-V margin-left=20mm -V margin-right=20mm`,
        ].join(' '),
        { stdio: this.verbose ? 'inherit' : 'pipe' },
      );
      const size = statSync(pdfPath).size;
      if (size < 50_000) {
        console.warn(`  ⚠ PDF suspiciously small (${size}B) — verify content`);
      }
      if (this.verbose) console.log(`  [pdf]   ${pdfPath} (${(size / 1024).toFixed(0)} KB)`);
      return size;
    } catch (err) {
      const msg = err.message?.split('\n')[0] ?? String(err);
      console.warn(`  ⚠ PDF generation failed (continuing): ${msg}`);
      return null;
    }
  }

  // ── Manifest ──────────────────────────────────────────────────────────

  // Update the publishedAt field in resources.ts for the given slug.
  // The manifest is i18n-aware (uses isEN ternaries), but publishedAt is a
  // single string at the top level of each resource, so a localised regex
  // is sufficient and surgical.
  #updateManifest(slug) {
    if (!existsSync(RESOURCES_MANIFEST)) {
      console.warn(`  ⚠ ${RESOURCES_MANIFEST} not found — skipping manifest update`);
      return false;
    }
    const today = new Date().toISOString().slice(0, 10);
    const original = readFileSync(RESOURCES_MANIFEST, 'utf-8');

    // Match: slug: 'X', ... publishedAt: 'YYYY-MM-DD'  (within ~80 lines)
    const re = new RegExp(
      `(slug:\\s*['"]${escapeRegex(slug)}['"][^]{0,4000}?publishedAt:\\s*)['"][^'"]*['"]`,
    );
    if (!re.test(original)) {
      console.warn(`  ⚠ no publishedAt found for slug="${slug}" — skipping manifest update`);
      return false;
    }
    const updated = original.replace(re, `$1'${today}'`);
    if (updated === original) return false;
    writeFileSync(RESOURCES_MANIFEST, updated, 'utf-8');
    if (this.verbose) console.log(`  [manifest] publishedAt → ${today}`);
    return true;
  }

  // ── Diff ──────────────────────────────────────────────────────────────

  #gitDiff(magnetDir, manifestPath) {
    try {
      const result = spawnSync(
        'git',
        ['--no-pager', 'diff', '--', magnetDir, manifestPath],
        { encoding: 'utf-8' },
      );
      return result.stdout ?? '';
    } catch {
      return '';
    }
  }
}

// ── Module-local helpers ─────────────────────────────────────────────────

function pandocAvailable() {
  try {
    execSync('which pandoc', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Minimal unified-style diff for --dry-run. Not a full implementation, but
// good enough to eyeball changes before committing.
function unifiedDiff(oldText, newText, label) {
  if (oldText === newText) return '(no changes)';
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const out = [`--- a/${label}`, `+++ b/${label}`];
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    const a = oldLines[i];
    const b = newLines[i];
    if (a === b) continue;
    if (a !== undefined) out.push(`- ${a}`);
    if (b !== undefined) out.push(`+ ${b}`);
  }
  return out.join('\n');
}
