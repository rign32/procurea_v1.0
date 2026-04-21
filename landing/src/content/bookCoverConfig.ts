/**
 * Per-slug 3D cover configuration for lead magnets.
 * Drives BookCover3D component rendering in library hub + resource detail pages.
 *
 * Keep in sync with slugs in content/resources.ts.
 */

import type { BookVariant, BookMotif } from "@/components/content/BookCover3D"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

export interface BookCoverConfig {
  variant: BookVariant
  coverBg: string
  spineBg: string
  spineText: string
  kicker: string        // bilingual-resolved short label
  pill?: string
  footLabel: string     // bilingual-resolved short label
  pageCount: number | string
  pageUnit: string      // bilingual-resolved unit
  motif: BookMotif
}

export const BOOK_COVERS: Record<string, BookCoverConfig> = {
  "nearshore-migration-playbook": {
    variant: "thick",
    coverBg: "linear-gradient(135deg, #1d356a 0%, #0a1535 100%)",
    spineBg: "linear-gradient(to right, #05091a, #0b1a3d)",
    spineText: "Procurea · Nearshore",
    kicker: isEN ? "Handbook · 2026 edition" : "Handbook · wydanie 2026",
    pill: isEN ? "Flagship" : "Flagowe",
    footLabel: "PDF · v3.2",
    pageCount: 56,
    pageUnit: isEN ? "pages" : "stron",
    motif: "map",
  },

  "supplier-risk-checklist-2026": {
    variant: "thin",
    coverBg: "linear-gradient(135deg, #27417a 0%, #162a52 100%)",
    spineBg: "linear-gradient(to right, #0a1430, #162a52)",
    spineText: "Procurea · Risk · 2026",
    kicker: isEN ? "Checklist · v1.0" : "Checklist · v1.0",
    pill: "2026",
    footLabel: isEN ? "PDF · print-ready" : "PDF · do druku",
    pageCount: 12,
    pageUnit: isEN ? "pages" : "stron",
    motif: "grid",
  },

  "vendor-scoring-framework": {
    variant: "hardcover",
    coverBg: "linear-gradient(135deg, #c97b1a 0%, #8f550d 100%)",
    spineBg: "linear-gradient(to right, #5a3608, #8f550d)",
    spineText: "Procurea · Scoring",
    kicker: isEN ? "Framework · 2026" : "Framework · 2026",
    pill: "v1.0",
    footLabel: isEN ? "PDF · audit-grade" : "PDF · audit-grade",
    pageCount: 14,
    pageUnit: isEN ? "pages" : "stron",
    motif: "radar",
  },

  "tco-calculator": {
    variant: "workbook",
    coverBg: "linear-gradient(135deg, #0f7a4f 0%, #0a5a3a 100%)",
    spineBg: "linear-gradient(to right, #063a25, #0a5a3a)",
    spineText: "Procurea · TCO · v2.1",
    kicker: isEN ? "Calculator · 2026" : "Kalkulator · 2026",
    pill: "v2.1",
    footLabel: isEN ? "Excel · 3 tabs" : "Excel · 3 zakładki",
    pageCount: 10,
    pageUnit: isEN ? "categories" : "kategorii",
    motif: "rows",
  },

  "rfq-comparison-template": {
    variant: "workbook",
    coverBg: "linear-gradient(135deg, #3b5ba0 0%, #27417a 100%)",
    spineBg: "linear-gradient(to right, #10214a, #27417a)",
    spineText: "Procurea · RFQ · v2.1",
    kicker: isEN ? "Template · xlsx + notion" : "Szablon · xlsx + notion",
    pill: "v2.1",
    footLabel: "XLSX · Notion",
    pageCount: 4,
    pageUnit: isEN ? "tabs" : "zakładki",
    motif: "rows",
  },
}

/** Fallback config for unknown slugs — uses brand navy */
export const DEFAULT_BOOK_COVER: BookCoverConfig = {
  variant: "hardcover",
  coverBg: "linear-gradient(135deg, #162a52 0%, #0b1a3d 100%)",
  spineBg: "linear-gradient(to right, #050c1a, #0b1a3d)",
  spineText: "Procurea",
  kicker: "Procurea",
  footLabel: "PDF",
  pageCount: "",
  pageUnit: "",
  motif: "none",
}

export function getBookCoverConfig(slug: string): BookCoverConfig {
  return BOOK_COVERS[slug] ?? DEFAULT_BOOK_COVER
}
