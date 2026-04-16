import { useEffect } from "react"
import { RouteMeta } from "@/lib/RouteMeta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { ProblemSection } from "@/components/sections/ProblemSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { DualTierSection } from "@/components/sections/DualTierSection"
import { DemoSection } from "@/components/sections/DemoSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { IndustriesGridSection } from "@/components/sections/IndustriesGridSection"
import { IntegrationsPreviewSection } from "@/components/sections/IntegrationsPreviewSection"
import { CtaSection } from "@/components/sections/CtaSection"
import { FaqSection } from "@/components/sections/FaqSection"
import { initSectionTracking, initScrollDepthTracking } from "@/lib/analytics"

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
        <div data-track-section="problem"><ProblemSection /></div>
        <div data-track-section="how-it-works"><HowItWorksSection /></div>
        <DualTierSection />
        <div data-track-section="demo"><DemoSection /></div>
        <div data-track-section="features"><FeaturesSection /></div>
        <div data-track-section="benefits"><BenefitsSection /></div>
        <IndustriesGridSection />
        <IntegrationsPreviewSection />
        <div data-track-section="faq"><FaqSection /></div>
        <div data-track-section="cta"><CtaSection /></div>
      </main>
      <Footer />
    </div>
  )
}
