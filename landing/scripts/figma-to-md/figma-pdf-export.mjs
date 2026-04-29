// Render the actual Figma design (covers + spreads) into a multi-page PDF
// for a magnet, instead of converting markdown.
//
// Why: text-extraction → markdown → md-to-pdf loses every visual element
// the user designed in Figma — country maps, charts, stat-card layouts,
// cover artwork. The Figma Image API's `format=pdf` renders each frame
// at vector fidelity. We then merge all per-frame PDFs into one playbook
// PDF using pdf-lib.
//
// Frame selection: the first FRAME named exactly "cover" inside the
// playbook container, followed by every FRAME whose name starts with
// two digits + dash (the numbered spreads). Sorted by numeric prefix.

import { writeFileSync } from 'node:fs';
import { PDFDocument } from 'pdf-lib';

const FIGMA_IMAGES_URL = 'https://api.figma.com/v1/images';
const SPREAD_NAME_RE = /^(\d{2})[-_ ]/;
// Image API caps at 50 ids per request — chunk longer playbooks.
const MAX_IDS_PER_REQUEST = 25;

export class FigmaPdfExporter {
  constructor(token, options = {}) {
    if (!token) throw new Error('FigmaPdfExporter: token is required');
    this.token = token;
    this.verbose = options.verbose ?? false;
    this.scale = options.scale ?? 1; // PDF is vector — scale rarely matters
  }

  // Top-level: from a Figma page, produce one merged PDF and return Uint8Array.
  // `page` is a CANVAS node already fetched from /v1/files/{key}.
  async exportPage(fileKey, page) {
    const frames = this.#pickFrames(page);
    if (frames.length === 0) {
      throw new Error(`No exportable frames found on page "${page.name}".`);
    }
    if (this.verbose) {
      console.log(`  [pdf-export] ${frames.length} frames: ${frames.map((f) => f.name).join(', ')}`);
    }

    const urls = await this.#getPdfUrls(fileKey, frames.map((f) => f.id));
    const buffers = await this.#downloadAll(urls, frames);
    const merged = await this.#mergePdfs(buffers);
    return merged;
  }

  async writeToFile(fileKey, page, outputPath) {
    const bytes = await this.exportPage(fileKey, page);
    writeFileSync(outputPath, bytes);
    return bytes.length;
  }

  // ── Internals ──────────────────────────────────────────────────────────

  // Walk the whole page subtree to find every "cover" frame and every
  // numbered spread frame, regardless of nesting. Procurea magnets in
  // Figma sometimes wrap content in a container ("Nearshore Playbook")
  // and sometimes lay spreads directly on the page — we accept both.
  // Match by NAME, and once we match a frame we don't descend into it
  // (covers/spreads don't nest inside each other).
  #pickFrames(page) {
    const covers = [];
    const spreads = [];
    const walk = (node) => {
      if (!node) return;
      if (node.type === 'FRAME') {
        if (node.name === 'cover') {
          covers.push(node);
          return;
        }
        const m = (node.name ?? '').match(SPREAD_NAME_RE);
        if (m) {
          spreads.push({ ...node, _order: parseInt(m[1], 10) });
          return;
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(page);

    spreads.sort((a, b) => a._order - b._order || a.name.localeCompare(b.name));

    // Use the first cover variant (by document order) as the playbook front.
    const firstCover = covers[0];
    return firstCover ? [firstCover, ...spreads] : spreads;
  }

  // Call /v1/images endpoint in chunks; return URLs in the SAME ORDER as
  // the input ids.
  async #getPdfUrls(fileKey, ids) {
    const ordered = [];
    for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
      const chunk = ids.slice(i, i + MAX_IDS_PER_REQUEST);
      const params = new URLSearchParams({
        ids: chunk.join(','),
        format: 'pdf',
        scale: String(this.scale),
      });
      const res = await fetch(`${FIGMA_IMAGES_URL}/${fileKey}?${params}`, {
        headers: { 'X-Figma-Token': this.token },
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`Figma image API ${res.status}: ${body.slice(0, 200)}`);
      }
      const data = await res.json();
      if (data.err) throw new Error(`Figma image API error: ${data.err}`);
      for (const id of chunk) {
        const url = data.images?.[id];
        if (!url) throw new Error(`Figma did not return a PDF URL for node ${id}`);
        ordered.push(url);
      }
      if (this.verbose) {
        console.log(`  [pdf-export] rendered ${ordered.length}/${ids.length}`);
      }
    }
    return ordered;
  }

  async #downloadAll(urls, frames) {
    const out = [];
    for (let i = 0; i < urls.length; i++) {
      const res = await fetch(urls[i]);
      if (!res.ok) {
        throw new Error(`Failed to download PDF for ${frames[i].name}: ${res.status}`);
      }
      const buf = new Uint8Array(await res.arrayBuffer());
      out.push(buf);
      if (this.verbose) {
        console.log(`  [pdf-export] downloaded ${frames[i].name} (${(buf.length / 1024).toFixed(0)} KB)`);
      }
    }
    return out;
  }

  async #mergePdfs(buffers) {
    const merged = await PDFDocument.create();
    for (const buf of buffers) {
      const src = await PDFDocument.load(buf);
      const pages = await merged.copyPages(src, src.getPageIndices());
      for (const p of pages) merged.addPage(p);
    }
    return merged.save();
  }
}
