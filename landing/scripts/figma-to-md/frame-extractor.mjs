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

  // Classify text nodes into body / feature / eyebrow / caption, then run
  // two post-processing passes that capture how Procurea spreads are laid
  // out: pull quotes split across multiple text nodes get merged, and stat
  // numbers get paired with their nearby labels.
  //
  // Block kinds (output):
  //   body:    main paragraph text
  //   feature: large stat numbers ("73%") and pull quotes (merged)
  //   eyebrow: ALL-CAPS short labels — only emitted when not consumed as
  //            a stat-card label
  //   caption: small footnote / source / column-header text
  //   pair:    feature + label combined into one rendered line
  //
  // x/y coordinates are kept on each block through the pipeline so the
  // post-processing passes can reason about spatial relationships.
  #classifyBlocks(texts) {
    const filtered = texts.filter((t) => !this.#isChrome(t));
    if (filtered.length === 0) return [];

    const sizes = filtered.map((t) => t.fontSize ?? 0).filter((s) => s > 0);
    const median = sizes.length
      ? [...sizes].sort((a, b) => a - b)[Math.floor(sizes.length / 2)]
      : 12;
    const featureMin = median * 1.6;
    const captionMax = median * 0.78;

    const initial = filtered.map((t) => {
      const size = t.fontSize ?? median;
      let kind = 'body';
      if (size >= featureMin) kind = 'feature';
      else if (size <= captionMax) kind = 'caption';
      else if (this.#isAllCapsShort(t.text)) kind = 'eyebrow';
      return {
        kind,
        text:   t.text.trim(),
        x:      t.x ?? 0,
        y:      t.y ?? 0,
        height: t.height ?? 0,
        size,
      };
    }).filter((b) => b.text.length > 0);

    const merged = this.#mergePullQuotes(initial);
    const paired = this.#pairStatLabels(merged);
    return paired;
  }

  // Detect ALL-CAPS short phrases (eyebrow labels): "WESTERN BUYERS TRIED",
  // "TIME PERIOD", "THE DIAGNOSTIC". Allow digits/punctuation, demand at
  // least one letter, reject anything with a lowercase letter. Cap at ~60
  // chars so we don't flag short ALL-CAPS sentences as eyebrows.
  #isAllCapsShort(s) {
    const text = (s ?? '').trim();
    if (text.length === 0 || text.length > 60) return false;
    if (!/[A-Z]/.test(text)) return false;
    if (/[a-z]/.test(text)) return false;
    return true;
  }

  // Merge consecutive feature text nodes that look like fragments of the
  // same pull quote (similar X column, small Y gap). Procurea pull quotes
  // in Figma are typically 3–5 separate TEXT layers stacked on top of each
  // other to control line breaks visually.
  #mergePullQuotes(blocks) {
    const out = [];
    let i = 0;
    while (i < blocks.length) {
      const head = blocks[i];
      if (head.kind !== 'feature') { out.push(head); i++; continue; }

      let j = i;
      const parts = [head.text];
      while (j + 1 < blocks.length) {
        const next = blocks[j + 1];
        if (next.kind !== 'feature') break;
        const xDelta = Math.abs(next.x - head.x);
        const yGap   = next.y - blocks[j].y;
        // Same column (X aligned) AND small vertical gap (next line down).
        if (xDelta > 40) break;
        if (yGap < 0 || yGap > Math.max(80, head.size * 1.6)) break;
        parts.push(next.text);
        j++;
      }
      out.push({
        ...head,
        text: parts.join(' ').replace(/\s+/g, ' ').trim(),
      });
      i = j + 1;
    }
    return out;
  }

  // Pair short feature blocks (stat numbers) with their nearest label below
  // them in the same X column. The label is the next eyebrow OR short body
  // block whose X overlaps and whose Y sits within ~250px.
  //
  // We restrict pairing to "stat-shaped" features: short text (<= 25 chars)
  // OR text that begins with a digit (like "73%", "2020", "1,847"). Pull
  // quotes (long prose features) are never paired.
  #pairStatLabels(blocks) {
    const isStatFeature = (b) =>
      b.kind === 'feature' && (b.text.length <= 25 || /^\d/.test(b.text));
    const isCandidateLabel = (b) =>
      (b.kind === 'eyebrow') ||
      (b.kind === 'body' && b.text.length <= 60);

    const consumed = new Set();
    const out = [];
    for (let i = 0; i < blocks.length; i++) {
      if (consumed.has(i)) continue;
      const b = blocks[i];
      if (!isStatFeature(b)) { out.push(b); continue; }

      let labelIdx = -1;
      for (let j = i + 1; j < blocks.length; j++) {
        if (consumed.has(j)) continue;
        const c = blocks[j];
        const dy = c.y - b.y;
        if (dy < 0 || dy > 250) continue;
        if (Math.abs(c.x - b.x) > 90) continue;
        if (!isCandidateLabel(c)) {
          // Don't skip features above the candidate; they're a different stat.
          // But we can pass over a caption-class node in between (sources,
          // footnotes drift around stat cards).
          if (c.kind === 'caption') continue;
          break;
        }
        labelIdx = j;
        break;
      }

      if (labelIdx >= 0) {
        consumed.add(labelIdx);
        out.push({
          kind:  'pair',
          text:  b.text,
          label: blocks[labelIdx].text,
          x:     b.x,
          y:     b.y,
          size:  b.size,
        });
      } else {
        out.push(b);
      }
    }
    return out;
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
