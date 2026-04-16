import { useEffect } from "react"
import { RouteMeta } from "@/lib/RouteMeta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { IndustryTrustBar } from "@/components/sections/IndustryTrustBar"
import { ModuleOverview } from "@/components/sections/ModuleOverview"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { FeatureShowcase } from "@/components/sections/FeatureShowcase"
import { IntegrationsLogosCarousel } from "@/components/sections/IntegrationsLogosCarousel"
import { IndustriesGridSection } from "@/components/sections/IndustriesGridSection"
import { TestimonialSection } from "@/components/sections/TestimonialSection"
import { HomeFaq } from "@/components/sections/HomeFaq"
import { CtaSection } from "@/components/sections/CtaSection"
import { initSectionTracking, initScrollDepthTracking } from "@/lib/analytics"

// New section order (full redesign 2026-04-16 — Option B+C):
//   1.  Navbar
//   2.  Hero (AI-native positioning)
//   3.  IndustryTrustBar — industry icons strip
//   4.  ModuleOverview — 4 module cards
//   5.  Benefits — key metrics
//   6-10. FeatureShowcase 01-05 (wrapped in <section id="product">)
//   11. IntegrationsLogosCarousel — wrapped with heading
//   12. IndustriesGridSection
//   13. TestimonialSection
//   14. HomeFaq
//   15. CTA
//   16. Footer
// Removed from Home: DualTierSection (→ /cennik), FeaturesSection (deprecated),
//                    HowItWorksSection (replaced by FeatureShowcase 01-05),
//                    FaqSection (replaced by HomeFaq), IntegrationsPreviewSection.

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
        <div data-track-section="industry-trust"><IndustryTrustBar /></div>
        <div data-track-section="modules"><ModuleOverview /></div>
        <div data-track-section="benefits"><BenefitsSection /></div>

        <section id="product" data-track-section="product">
          <FeatureShowcase number="01" slug="ai-sourcing" reverse={false} />
          <FeatureShowcase number="02" slug="email-outreach" reverse={true} />
          <FeatureShowcase number="03" slug="supplier-portal" reverse={false} />
          <FeatureShowcase number="04" slug="offer-comparison" reverse={true} />
          <FeatureShowcase number="05" slug="ai-insights" reverse={false} />
        </section>

        <div data-track-section="integrations"><IntegrationsLogosCarousel /></div>
        <div data-track-section="industries"><IndustriesGridSection /></div>
        <div data-track-section="testimonials"><TestimonialSection /></div>
        <div data-track-section="faq"><HomeFaq /></div>
        <div data-track-section="cta"><CtaSection /></div>
      </main>
      <Footer />
    </div>
  )
}
