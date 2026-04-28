// Thin wrapper over Figma REST API. In-memory cache for the current process,
// graceful 429 handling, helpers for finding pages and walking text nodes.

const FIGMA_API = 'https://api.figma.com/v1';

export class FigmaClient {
  constructor(token, options = {}) {
    if (!token) throw new Error('FigmaClient: token is required');
    this.token = token;
    this.cache = new Map();
    this.verbose = options.verbose ?? false;
  }

  async #request(path) {
    if (this.cache.has(path)) return this.cache.get(path);
    if (this.verbose) console.log(`  [figma] GET ${path}`);

    const res = await fetch(`${FIGMA_API}${path}`, {
      headers: { 'X-Figma-Token': this.token },
    });

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '5', 10);
      throw new Error(`Figma rate limited (429). Retry after ${retryAfter}s.`);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Figma ${res.status} ${res.statusText}: ${body.slice(0, 200)}`);
    }
    const json = await res.json();
    this.cache.set(path, json);
    return json;
  }

  async getFile(fileKey) {
    return this.#request(`/files/${fileKey}`);
  }

  async getFileNodes(fileKey, nodeIds) {
    const ids = Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds;
    return this.#request(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`);
  }

  // Lookup a top-level CANVAS (page) by display name.
  findPageByName(file, pageName) {
    const pages = file?.document?.children ?? [];
    return pages.find((p) => p.type === 'CANVAS' && p.name === pageName) ?? null;
  }

  // List page names — useful for error messages when slug→page lookup fails.
  listPageNames(file) {
    return (file?.document?.children ?? [])
      .filter((p) => p.type === 'CANVAS')
      .map((p) => p.name);
  }

  // Recursive walk of a frame subtree returning all TEXT nodes in document order
  // (top-down, left-right). Each entry has the full geometry/style info we need
  // for downstream semantic classification.
  collectTextNodes(node) {
    const out = [];
    const walk = (n) => {
      if (!n) return;
      if (n.type === 'TEXT' && typeof n.characters === 'string' && n.characters.trim()) {
        const x = n.absoluteBoundingBox?.x ?? 0;
        const y = n.absoluteBoundingBox?.y ?? 0;
        const w = n.absoluteBoundingBox?.width ?? 0;
        const h = n.absoluteBoundingBox?.height ?? 0;
        out.push({
          id:        n.id,
          name:      n.name ?? '',
          text:      n.characters,
          x, y, width: w, height: h,
          fontSize:  n.style?.fontSize ?? null,
          fontWeight:n.style?.fontWeight ?? null,
          fontFamily:n.style?.fontFamily ?? null,
          textCase:  n.style?.textCase ?? null,
          lineHeight:n.style?.lineHeightPercentFontSize ?? null,
          textAlign: n.style?.textAlignHorizontal ?? null,
        });
      }
      if (Array.isArray(n.children)) n.children.forEach(walk);
    };
    walk(node);
    // Sort: top-to-bottom, then left-to-right (stable for overlapping rows).
    out.sort((a, b) => (a.y - b.y) || (a.x - b.x));
    return out;
  }
}
