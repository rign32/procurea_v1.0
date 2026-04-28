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
  extractSpreads(page) {
    const spreads = (page.children ?? [])
      .filter((n) => n.type === 'FRAME' && SPREAD_NAME_RE.test(n.name))
      .map((frame) => {
        const m = frame.name.match(SPREAD_NAME_RE);
        const order = m ? parseInt(m[1], 10) : 999;
        return { frame, order };
      })
      .sort((a, b) => a.order - b.order || a.frame.name.localeCompare(b.frame.name));

    if (this.verbose) console.log(`  [extract] ${spreads.length} spreads in page`);

    return spreads.map(({ frame, order }) => this.#parseSpread(frame, order));
  }

  #parseSpread(frame, order) {
    const texts = this.client.collectTextNodes(frame);
    const blocks = this.#classifyBlocks(texts);

    // First heading-like block is the spread heading; fallback to frame name
    // (stripped of numeric prefix) so even diagram-only spreads get a title.
    const headingBlock = blocks.find((b) => b.kind === 'heading');
    const heading = headingBlock?.text ?? this.#humanizeFrameName(frame.name);

    return {
      name:    frame.name,
      order,
      heading,
      marker:  this.#detectMarker(frame.name),
      blocks,
      raw:     texts,
    };
  }

  // Classify text nodes into block kinds using font size buckets relative to
  // the median size on the spread. Largest cluster = heading, mid = body,
  // smallest = caption/footnote.
  #classifyBlocks(texts) {
    if (texts.length === 0) return [];

    const sizes = texts.map((t) => t.fontSize ?? 0).filter((s) => s > 0);
    if (sizes.length === 0) {
      // No font-size info — treat first as heading, rest as body.
      return texts.map((t, i) => ({ kind: i === 0 ? 'heading' : 'body', text: t.text.trim() }));
    }

    const sorted = [...sizes].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const max = sorted[sorted.length - 1];

    // Heading threshold = max if max >> median, otherwise relative bumps.
    const headingMin = max > median * 1.4 ? max * 0.95 : median * 1.4;
    const captionMax = median * 0.78;

    return texts.map((t) => {
      const size = t.fontSize ?? median;
      let kind = 'body';
      if (size >= headingMin) kind = 'heading';
      else if (size <= captionMax) kind = 'caption';
      return { kind, text: t.text.trim() };
    }).filter((b) => b.text.length > 0);
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
