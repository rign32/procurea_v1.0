// Convert a Figma page → ordered sections suitable for markdown rendering.
//
// Convention: every spread/page within a magnet is a top-level FRAME on the
// page whose name starts with two digits + dash (e.g. "01-cover", "02-toc").
// Within a spread, text nodes are collected in document order, then classified
// heuristically (heading vs body) by relative font size.

const SPREAD_NAME_RE = /^(\d{2})[-_ ]/;

export class FrameExtractor {
  constructor(figmaClient, options = {}) {
    this.client = figmaClient;
    this.verbose = options.verbose ?? false;
  }

  // Top-level entry: returns array of { name, order, heading, marker, blocks, raw }.
  // `blocks` is an array of { kind: 'heading'|'body'|'caption', text } already
  // ordered as they should appear in markdown.
  //
  // Spread frames may live anywhere in the page tree — Procurea magnets in
  // Figma typically wrap all spreads inside one outer "container" frame
  // (e.g. "Nearshore Playbook"), so we walk recursively. Once we find a
  // matching frame we don't descend into it (spreads don't nest in spreads).
  extractSpreads(page) {
    const found = [];
    const walk = (node) => {
      if (!node) return;
      if (node.type === 'FRAME' && SPREAD_NAME_RE.test(node.name ?? '')) {
        const m = node.name.match(SPREAD_NAME_RE);
        const order = m ? parseInt(m[1], 10) : 999;
        found.push({ frame: node, order });
        return; // don't descend into a spread's own children
      }
      if (Array.isArray(node.children)) node.children.forEach(walk);
    };
    walk(page);

    found.sort((a, b) => a.order - b.order || a.frame.name.localeCompare(b.frame.name));

    if (this.verbose) console.log(`  [extract] ${found.length} spreads in page`);

    return found.map(({ frame, order }) => this.#parseSpread(frame, order));
  }

  #parseSpread(frame, order) {
    const texts = this.client.collectTextNodes(frame);
    const blocks = this.#classifyBlocks(texts);

    // Heading always derives from the spread frame name (stable, semantic).
    // Auto-promoting the largest text to heading produced bad output: stat
    // numbers ("73%"), running headers, and page numbers got promoted.
    const heading = this.#humanizeFrameName(frame.name);

    return {
      name:    frame.name,
      order,
      heading,
      marker:  this.#detectMarker(frame.name),
      blocks,
      raw:     texts,
    };
  }

  // Classify text nodes into body vs caption vs feature.
  // - body:    main paragraph text (most nodes)
  // - feature: large stat numbers / pull quotes (rendered bold + italic)
  // - caption: small footnote / source / label text
  // Chrome (running headers, page numbers, ALL-CAPS column eyebrows) is
  // filtered out before classification — it doesn't read well in markdown
  // and creates noise in diffs.
  #classifyBlocks(texts) {
    const filtered = texts.filter((t) => !this.#isChrome(t));
    if (filtered.length === 0) return [];

    const sizes = filtered.map((t) => t.fontSize ?? 0).filter((s) => s > 0);
    if (sizes.length === 0) {
      return filtered.map((t) => ({ kind: 'body', text: t.text.trim() }));
    }

    const sorted = [...sizes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const featureMin = median * 1.6;
    const captionMax = median * 0.78;

    return filtered.map((t) => {
      const size = t.fontSize ?? median;
      let kind = 'body';
      if (size >= featureMin) kind = 'feature';
      else if (size <= captionMax) kind = 'caption';
      return { kind, text: t.text.trim() };
    }).filter((b) => b.text.length > 0);
  }

  // Drop chrome that pollutes the markdown output. Patterns:
  //   - running header:  "Procurea · Nearshore Migration Playbook · v3"
  //   - page number:     "p. 02 / 18", "02 / 18"
  //   - section eyebrow: "01 · THE THESIS"  (kept — it's useful context)
  //   - empty / single-char fragments
  #isChrome(t) {
    const text = (t.text ?? '').trim();
    if (text.length <= 1) return true;
    if (/^Procurea\s*[·•]/i.test(text)) return true;
    if (/^p\.\s*\d+\s*\/\s*\d+$/i.test(text)) return true;
    if (/^\d+\s*\/\s*\d+$/.test(text)) return true;
    return false;
  }

  // Map "01-stat-card-execsummary" → "Stat Card Execsummary".
  #humanizeFrameName(name) {
    return name
      .replace(SPREAD_NAME_RE, '')
      .replace(/[-_]+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Frame-name based marker detection (e.g. "03-stat-roi" → STAT callout).
  // Returns one of: '> [!STAT]', '> [!CALLOUT]', '> [!TIP]', '> [!WARNING]',
  // or null. Keep aligned with Procurea markdown renderer obsidian-flavoured
  // callouts in landing/public/resources/downloads/lead-magnet.css.
  #detectMarker(frameName) {
    const lower = frameName.toLowerCase();
    if (lower.includes('stat'))    return '> [!STAT]';
    if (lower.includes('callout')) return '> [!CALLOUT]';
    if (lower.includes('tip'))     return '> [!TIP]';
    if (lower.includes('warn'))    return '> [!WARNING]';
    return null;
  }
}
