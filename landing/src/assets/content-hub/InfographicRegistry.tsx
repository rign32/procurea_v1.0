import type { ComponentType } from "react"
import {
  AiFeaturesMatrix,
  BuyersGuideQuestions,
  ComplianceShield,
  ContentPillarsDiagram,
  DatabaseDecayChart,
  ErpComparisonGrid,
  GermanSourcingMap,
  NearshoreCountryComparison,
  RfqAutomationFlow,
  SourcingFunnel,
  SupplierRiskRadar,
  TcoIceberg,
  ThirtyHourBreakdown,
  VatViesVerificationSteps,
  VendorScoringScorecard,
} from "./Infographics"

/**
 * Common shape for infographic components. All accept an optional `className`
 * for sizing and an optional `ariaLabel` (some ignore it).
 */
export type InfographicComponent = ComponentType<{
  className?: string
  ariaLabel?: string
}>

/**
 * Registry of string keys → infographic components.
 * Blog sections reference these by `infographicKey` (see BlogSection type).
 * If a key is missing from this registry, BlogPostPage silently skips the render.
 */
export const INFOGRAPHIC_REGISTRY: Record<string, InfographicComponent> = {
  // Original 5
  "thirty-hour-breakdown": ThirtyHourBreakdown,
  "sourcing-funnel": SourcingFunnel,
  "nearshore-country-comparison": NearshoreCountryComparison,
  "content-pillars": ContentPillarsDiagram,
  "compliance-shield": ComplianceShield,

  // New 10
  "rfq-automation-flow": RfqAutomationFlow,
  "vat-vies-verification-steps": VatViesVerificationSteps,
  "supplier-risk-radar": SupplierRiskRadar,
  "ai-features-matrix": AiFeaturesMatrix,
  "vendor-scoring-scorecard": VendorScoringScorecard,
  "tco-iceberg": TcoIceberg,
  "database-decay-chart": DatabaseDecayChart,
  "erp-comparison-grid": ErpComparisonGrid,
  "buyers-guide-questions": BuyersGuideQuestions,
  "german-sourcing-map": GermanSourcingMap,
}

export type InfographicKey = keyof typeof INFOGRAPHIC_REGISTRY

export function getInfographic(key: string | undefined): InfographicComponent | undefined {
  if (!key) return undefined
  return INFOGRAPHIC_REGISTRY[key]
}
