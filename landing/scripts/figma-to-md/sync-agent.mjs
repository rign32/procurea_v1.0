// Top-level orchestrator. Wires Figma client → frame extractor →
// markdown renderer → file writer. Stays small on purpose: business logic
// belongs in the modules.

import { FigmaClient } from './figma-client.mjs';
import { FrameExtractor } from './frame-extractor.mjs';
import { MarkdownRenderer } from './markdown-renderer.mjs';
import { FileWriter } from './file-writer.mjs';
import { FigmaPdfExporter } from './figma-pdf-export.mjs';
import { FIGMA_FILE_KEY, MAGNET_CONFIG } from './magnet-config.mjs';

export class SyncAgent {
  constructor(options = {}) {
    const token = options.token ?? process.env.FIGMA_TOKEN;
    if (!token) {
      throw new Error(
        'FIGMA_TOKEN env var not set. Get a personal access token from ' +
        'https://www.figma.com/developers and add it to landing/.env (FIGMA_TOKEN=...).',
      );
    }
    this.figma = new FigmaClient(token, { verbose: options.verbose });
    this.extractor = new FrameExtractor(this.figma, { verbose: options.verbose });
    this.pdfExporter = new FigmaPdfExporter(token, { verbose: options.verbose });
    this.writer = new FileWriter({ verbose: options.verbose, pdfExporter: this.pdfExporter });
    this.verbose = options.verbose ?? false;
    this.fileKey = options.fileKey ?? FIGMA_FILE_KEY;
  }

  // Returns { slug, sections, markdown, write }, where `write` is null when
  // dryRun=true.
  async sync(slug, options = {}) {
    const config = MAGNET_CONFIG[slug];
    if (!config) {
      throw new Error(
        `Unknown slug "${slug}". Known: ${Object.keys(MAGNET_CONFIG).join(', ')}`,
      );
    }

    this.#log(`Syncing ${slug} (${config.figmaPageName})…`);

    const file = await this.figma.getFile(this.fileKey);
    this.#log(`  ✓ Fetched Figma file (${this.fileKey})`);

    const page = this.figma.findPageByName(file, config.figmaPageName);
    if (!page) {
      const available = this.figma.listPageNames(file);
      throw new Error(
        `Page not found: "${config.figmaPageName}".\nAvailable pages:\n  - ${available.join('\n  - ')}`,
      );
    }
    this.#log(`  ✓ Found page: ${page.name}`);

    const sections = this.extractor.extractSpreads(page);
    this.#log(`  ✓ Extracted ${sections.length} spreads`);
    if (sections.length === 0) {
      throw new Error(
        `No spreads found on page "${page.name}". Spread frames must be ` +
        `top-level FRAMEs named like "01-cover", "02-toc", etc.`,
      );
    }

    const renderer = new MarkdownRenderer(slug, config);
    const markdown = renderer.render(sections);
    this.#log(`  ✓ Rendered markdown (${markdown.length} chars)`);

    if (options.dryRun) {
      const preview = this.writer.preview(slug, markdown);
      return { slug, sections, markdown, write: null, preview };
    }

    const write = await this.writer.write(slug, markdown, {
      skipPdf: options.skipPdf ?? false,
      updateManifest: options.updateManifest ?? true,
      skipDiff: options.skipDiff ?? false,
      // Pass the live Figma page node so the writer can pipe it into the
      // PDF exporter without re-fetching the file.
      figmaPage: page,
      figmaFileKey: this.fileKey,
    });
    return { slug, sections, markdown, write, preview: null };
  }

  #log(msg) {
    if (this.verbose) console.log(msg);
  }
}
