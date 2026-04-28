// Magnet configuration: slug → Figma page name + metadata + reconcile source.
// Single source of truth. Add a new magnet by appending an entry here.

export const FIGMA_FILE_KEY = 'EVi16MP6TUmTE9OQf6I7Ha';

// Paths are resolved relative to landing/ (script CWD).
export const DOWNLOADS_DIR = 'public/resources/downloads';
export const RESOURCES_MANIFEST = 'src/content/resources.ts';
// V2 markdown sources used as marker reconciliation reference.
export const V2_SOURCE_DIR = '../figma-pipeline/lead-magnets-v2';

export const MAGNET_CONFIG = {
  'nearshore-migration-playbook': {
    figmaPageName: '01 — Nearshore Migration Playbook',
    title:        'Nearshore Migration Playbook',
    subtitle:     'China+1 Made Practical — EU, Turkey, and Mexico',
    audience:     'P1',
    category:     'supply-chain-strategy',
    v2Source:     '01-nearshore-migration-playbook.md',
  },
  'supplier-risk-checklist-2026': {
    figmaPageName: '02 — Supplier Risk Checklist 2026',
    title:        'Supplier Risk Checklist 2026',
    subtitle:     'A field manual for procurement teams',
    audience:     'P1',
    category:     'risk-management',
    v2Source:     '02-supplier-risk-checklist-2026.md',
  },
  'ai-sourcing-buyers-guide': {
    figmaPageName: "03 — AI Sourcing Buyer's Guide",
    title:        "AI Sourcing Buyer's Guide",
    subtitle:     'How to evaluate AI sourcing platforms in 2026',
    audience:     'P2',
    category:     'ai-and-automation',
    v2Source:     '03-ai-sourcing-buyers-guide.md',
  },
  'china-plus-one-playbook-2026': {
    figmaPageName: '04 — China+1 Strategy Playbook 2026',
    title:        'China+1 Strategy Playbook 2026',
    subtitle:     'Diversification framework for procurement leaders',
    audience:     'P1',
    category:     'supply-chain-strategy',
    v2Source:     '04-china-plus-one-playbook-2026.md',
  },
};
