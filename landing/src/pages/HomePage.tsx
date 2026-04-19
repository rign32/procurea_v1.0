import { useEffect } from "react"
import { RouteMeta } from "@/lib/RouteMeta"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { IndustryTrustBar } from "@/components/sections/IndustryTrustBar"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { FeaturesSneakPeek } from "@/components/sections/FeaturesSneakPeek"
import { ModuleOverview } from "@/components/sections/ModuleOverview"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { SavingsCalculator } from "@/components/sections/SavingsCalculator"
import { TestimonialSection } from "@/components/sections/TestimonialSection"
import { DemoSection } from "@/components/sections/DemoSection"
import { LatestContentSection } from "@/components/sections/LatestContentSection"
import { CtaSection } from "@/components/sections/CtaSection"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
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
      <main id="main-content">
        <div data-track-section="hero"><HeroSection /></div>
        <div data-track-section="industry-trust"><IndustryTrustBar /></div>
        <div data-track-section="how-it-works"><HowItWorksSection /></div>
        <div data-track-section="features-preview"><FeaturesSneakPeek /></div>
        <div data-track-section="modules"><ModuleOverview /></div>
        <div data-track-section="benefits"><BenefitsSection /></div>
        <div data-track-section="calculator" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 md:py-16"><RevealOnScroll scale><SavingsCalculator /></RevealOnScroll></div>
        <div data-track-section="testimonials"><TestimonialSection /></div>
        <div data-track-section="demo"><DemoSection /></div>
        <div data-track-section="latest-content"><LatestContentSection /></div>
        <div data-track-section="cta"><CtaSection /></div>
      </main>
      <Footer />
    </div>
  )
}
