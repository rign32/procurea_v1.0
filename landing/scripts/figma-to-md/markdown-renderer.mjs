// Render extracted sections to a Procurea-shape lead magnet markdown.
//
// Reconciliation strategy: when a v2 source markdown exists in
// figma-pipeline/lead-magnets-v2/, we use it as the authority for design
// markers (> [!STAT], > [!CALLOUT], etc.) — they live in markdown but
// originate in design intent and are easy to lose during text-only sync.
// Heading text from Figma always wins (that's what we're syncing).

import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Resolve v2 source path relative to landing/ (the script CWD).
const V2_SOURCE_DIR_ABS = join(__dirname, '..', '..', '..', 'figma-pipeline', 'lead-magnets-v2');

export class MarkdownRenderer {
  constructor(slug, magnetConfig) {
    this.slug = slug;
    this.config = magnetConfig;
    this.markersBySection = this.#loadV2Markers();
  }

  render(sections) {
    const reconciled = this.#applyV2Markers(sections);
    return [
      this.#renderFrontmatter(),
      '',
      this.#renderBody(reconciled),
    ].join('\n');
  }

  #renderFrontmatter() {
    const today = new Date().toISOString().slice(0, 10);
    const lines = [
      '---',
      `title: ${quote(this.config.title)}`,
    ];
    if (this.config.subtitle) lines.push(`subtitle: ${quote(this.config.subtitle)}`);
    lines.push(
      `slug: ${quote(this.slug)}`,
      `audience: ${quote(this.config.audience ?? 'P2')}`,
      `category: ${quote(this.config.category ?? 'procurement')}`,
      `format: pdf`,
      `updatedAt: ${quote(today)}`,
      '---',
    );
    return lines.join('\n');
  }

  #renderBody(sections) {
    const out = [];
    for (const section of sections) {
      // Skip cover/TOC pages — they don't carry text the reader needs in markdown.
      if (/^\d{2}[-_](cover|toc)$/i.test(section.name)) continue;
      if (!section.heading && section.blocks.length === 0) continue;

      out.push('', `## ${section.heading}`, '');

      if (section.marker) {
        out.push(section.marker);
      }

      // Body blocks → paragraphs (blank-line separated).
      // Feature blocks (stat numbers, pull quotes) → bold lines.
      // Caption blocks → buffered then flushed as a single italic line.
      let captionBuffer = [];
      const flushCaption = () => {
        if (captionBuffer.length) {
          out.push(`*${captionBuffer.join(' ').trim()}*`, '');
          captionBuffer = [];
        }
      };

      for (const block of section.blocks) {
        if (block.kind === 'caption') {
          captionBuffer.push(block.text);
          continue;
        }
        flushCaption();
        if (block.kind === 'feature') {
          out.push(`**${block.text}**`, '');
        } else {
          out.push(block.text, '');
        }
      }
      flushCaption();
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }

  // ── V2 reconciliation ──────────────────────────────────────────────────

  #loadV2Markers() {
    if (!this.config.v2Source) return new Map();
    const path = join(V2_SOURCE_DIR_ABS, this.config.v2Source);
    if (!existsSync(path)) return new Map();
    const raw = readFileSync(path, 'utf-8');
    return parseMarkersByHeading(raw);
  }

  #applyV2Markers(sections) {
    if (this.markersBySection.size === 0) return sections;
    return sections.map((section) => {
      if (section.marker) return section; // Figma already declared a marker — keep it.
      const fromV2 = this.markersBySection.get(normalizeHeading(section.heading));
      return fromV2 ? { ...section, marker: fromV2 } : section;
    });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

function quote(s) {
  return `"${String(s).replace(/"/g, '\\"')}"`;
}

function normalizeHeading(s) {
  return String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// Parse a markdown file → { normalizedHeading → marker } map. Looks for any
// Obsidian-style admonition callout (`> [!ANY-NAME]`) appearing within ~5
// lines after a heading. The Procurea v2 sources use a wide vocabulary:
// STAT, CALLOUT, TIP, WARNING, NOTE, INFO, CHECKLIST, CHECK-CARD,
// TABLE-COMPARISON, QUOTE-PULL, etc. — we accept all and preserve verbatim.
//
// Note: this only catches markers placed RIGHT after a heading. Markers
// embedded mid-section are intentionally ignored — they don't have a stable
// anchor for reconciliation.
const CALLOUT_RE = /^>\s*\[!([A-Z][A-Z0-9_-]*)\]/i;

export function parseMarkersByHeading(markdown) {
  const lines = markdown.split(/\r?\n/);
  const markers = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^#{1,6}\s+(.+?)\s*$/);
    if (!m) continue;
    const heading = normalizeHeading(m[1]);
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      const line = lines[j].trim();
      if (line === '') continue;
      const cm = line.match(CALLOUT_RE);
      if (cm) {
        markers.set(heading, `> [!${cm[1].toUpperCase()}]`);
      }
      break; // first non-empty line decides
    }
  }
  return markers;
}
