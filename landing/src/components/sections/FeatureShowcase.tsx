import { Check } from "lucide-react"
import { type ComponentType } from "react"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { BrowserChrome } from "@/components/ui/BrowserChrome"
import { AiSourcingMockup } from "@/components/feature-mockups/AiSourcingMockup"
import { EmailOutreachMockup } from "@/components/feature-mockups/EmailOutreachMockup"
import { SupplierPortalMockup } from "@/components/feature-mockups/SupplierPortalMockup"
import { OfferComparisonMockup } from "@/components/feature-mockups/OfferComparisonMockup"
import { t } from "@/i18n"

export type FeatureShowcaseSlug =
  | "ai-sourcing"
  | "email-outreach"
  | "supplier-portal"
  | "offer-comparison"
  | "ai-insights"

interface FeatureShowcaseProps {
  number: string
  slug: FeatureShowcaseSlug
  reverse?: boolean
}

interface FeatureCopy {
  sectionLabel: string
  title: string
  subtitle: string
  bullets: readonly string[]
}

const MOCKUP_MAP: Record<FeatureShowcaseSlug, ComponentType> = {
  "ai-sourcing": AiSourcingMockup,
  "email-outreach": EmailOutreachMockup,
  "supplier-portal": SupplierPortalMockup,
  "offer-comparison": OfferComparisonMockup,
  // Placeholder: reuse OfferComparisonMockup until a dedicated AI Insights mockup ships
  "ai-insights": OfferComparisonMockup,
}

const URL_MAP: Record<FeatureShowcaseSlug, string> = {
  "ai-sourcing": "app.procurea.pl/campaigns",
  "email-outreach": "app.procurea.pl/rfqs",
  "supplier-portal": "app.procurea.pl/portal",
  "offer-comparison": "app.procurea.pl/offers",
  "ai-insights": "app.procurea.pl/insights",
}

// Fallback copy if i18n payload hasn't shipped yet.
const FALLBACK_COPY: Record<FeatureShowcaseSlug, FeatureCopy> = {
  "ai-sourcing": {
    sectionLabel: "AI SOURCING",
    title: "Find 250 vendors in 20 minutes",
    subtitle:
      "Describe what you need in plain language. Our 4-agent AI pipeline searches 26 languages and delivers a verified shortlist.",
    bullets: [
      "50–250 verified vendors per campaign",
      "26-language search across EU + global",
      "One-click Excel export with full data",
    ],
  },
  "email-outreach": {
    sectionLabel: "EMAIL OUTREACH",
    title: "RFQ to 200 suppliers, one click",
    subtitle:
      "Bulk outreach localized per supplier country. Track deliveries, opens, and responses in real-time.",
    bullets: [
      "Localized per country (26 languages)",
      "Auto follow-up (+3d, +7d, +14d)",
      "Real-time delivery tracking",
    ],
  },
  "supplier-portal": {
    sectionLabel: "SUPPLIER PORTAL",
    title: "Magic-link offers, no login needed",
    subtitle:
      "Suppliers submit structured quotes via personalized link. No account creation required.",
    bullets: [
      "Magic link, 30-day validity",
      "Auto-translated supplier UI",
      "Mobile-responsive submissions",
    ],
  },
  "offer-comparison": {
    sectionLabel: "OFFER COMPARISON",
    title: "End spreadsheet comparison forever",
    subtitle:
      "Side-by-side ranked offers. Weighted criteria, one-click PDF/PPTX export for board meetings.",
    bullets: [
      "Weighted ranking by your priorities",
      "Quantity-break price comparison",
      "PDF / PPTX board-ready export",
    ],
  },
  "ai-insights": {
    sectionLabel: "AI INSIGHTS",
    title: "Procurement reports that write themselves",
    subtitle:
      "Gemini analyzes every campaign: spend breakdown, vendor concentration risk, negotiation leverage.",
    bullets: [
      "Gemini 2.0 Flash analysis per campaign",
      "Vendor concentration + risk scoring",
      "Negotiation leverage identification",
    ],
  },
}

function resolveCopy(slug: FeatureShowcaseSlug): FeatureCopy {
  const features = (t as unknown as {
    homeFeatures?: Partial<Record<FeatureShowcaseSlug, FeatureCopy>>
  }).homeFeatures
  const fromI18n = features?.[slug]
  if (
    fromI18n &&
    fromI18n.sectionLabel &&
    fromI18n.title &&
    fromI18n.subtitle &&
    Array.isArray(fromI18n.bullets)
  ) {
    return fromI18n
  }
  return FALLBACK_COPY[slug]
}

export function FeatureShowcase({
  number,
  slug,
  reverse = false,
}: FeatureShowcaseProps) {
  const copy = resolveCopy(slug)
  const MockupComponent = MOCKUP_MAP[slug]
  const url = URL_MAP[slug]

  return (
    <section className="relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center ${
            reverse ? "lg:grid-flow-col-dense" : ""
          }`}
        >
          {/* Text column */}
          <div className={reverse ? "lg:col-start-2" : ""}>
            <RevealOnScroll>
              <div className="inline-flex items-center gap-3 mb-5">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {number}
                </span>
                <span className="h-px w-12 bg-border" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                  {copy.sectionLabel}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-extra-tight leading-[1.1] mb-5">
                {copy.title}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                {copy.subtitle}
              </p>
              <ul className="space-y-3 max-w-md">
                {copy.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-sm">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </RevealOnScroll>
          </div>

          {/* Mockup column */}
          <div className={reverse ? "lg:col-start-1 lg:row-start-1" : ""}>
            <RevealOnScroll direction={reverse ? "left" : "right"}>
              <BrowserChrome url={url}>
                <div className="scale-[0.85] lg:scale-100 origin-top">
                  <MockupComponent />
                </div>
              </BrowserChrome>
            </RevealOnScroll>
          </div>
        </div>
      </div>
    </section>
  )
}
