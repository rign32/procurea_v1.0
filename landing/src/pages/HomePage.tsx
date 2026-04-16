import { useEffect } from "react"
import { RouteMeta } from "@/lib/RouteMeta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { IndustriesGridSection } from "@/components/sections/IndustriesGridSection"
import { DualTierSection } from "@/components/sections/DualTierSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { IntegrationsPreviewSection } from "@/components/sections/IntegrationsPreviewSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { CtaSection } from "@/components/sections/CtaSection"
import { FaqSection } from "@/components/sections/FaqSection"
import { initSectionTracking, initScrollDepthTracking } from "@/lib/analytics"

// New section order (per user review 2026-04-16):
//   1. Hero (compact, AI-native positioning)
//   2. Benefits — moved up (user likes the metrics, they were too low before)
//   3. IndustriesGrid — moved up (user explicitly called this out positively)
//   4. DualTier — compressed
//   5. Features preview — links into /funkcje
//   6. Integrations preview — links into /integracje
//   7. HowItWorks — still useful as stage-flow
//   8. FAQ
//   9. CTA
// Removed: ProblemSection (narrow "traditional sourcing" framing),
//          DemoSection (Loom was for beta-signup framing),
//          BetaSignupSection (duplicated by Hero + CTA).

export function HomePage() {
  useEffect(() => {
    const cleanupSections = initSectionTracking();
    const cleanupScroll = initScrollDepthTracking();
    return () => {
      cleanupSections?.();
      cleanupScroll?.();
    };
  }, []);

  return (
    <div className="min-h-screen">
      <RouteMeta />
      <Navbar />
      <main>
        <div data-track-section="hero"><HeroSection /></div>
        <div data-track-section="benefits"><BenefitsSection /></div>
        <IndustriesGridSection />
        <DualTierSection />
        <div data-track-section="features"><FeaturesSection /></div>
        <IntegrationsPreviewSection />
        <div data-track-section="how-it-works"><HowItWorksSection /></div>
        <div data-track-section="faq"><FaqSection /></div>
        <div data-track-section="cta"><CtaSection /></div>
      </main>
      <Footer />
    </div>
  )
}
