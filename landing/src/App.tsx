import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { ProblemSection } from "@/components/sections/ProblemSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { AudienceSection } from "@/components/sections/AudienceSection"
import { BetaSignupSection } from "@/components/sections/BetaSignupSection"
import { CtaSection } from "@/components/sections/CtaSection"
import { FaqSection } from "@/components/sections/FaqSection"
import { initSectionTracking } from "@/lib/analytics"
import { RegulaminPage } from "@/pages/RegulaminPage"
import { PolitykaPrywatnosciPage } from "@/pages/PolitykaPrywatnosciPage"
import { RodoPage } from "@/pages/RodoPage"

function LandingPage() {
  useEffect(() => {
    const cleanup = initSectionTracking();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <div data-track-section="hero"><HeroSection /></div>
        <div data-track-section="problem"><ProblemSection /></div>
        <div data-track-section="how-it-works"><HowItWorksSection /></div>
        <div data-track-section="features"><FeaturesSection /></div>
        <div data-track-section="benefits"><BenefitsSection /></div>
        <div data-track-section="audience"><AudienceSection /></div>
        <div data-track-section="beta-signup"><BetaSignupSection /></div>
        <div data-track-section="faq"><FaqSection /></div>
        <div data-track-section="cta"><CtaSection /></div>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/regulamin" element={<RegulaminPage />} />
        <Route path="/polityka-prywatnosci" element={<PolitykaPrywatnosciPage />} />
        <Route path="/rodo" element={<RodoPage />} />
      </Routes>
    </BrowserRouter>
  )
}
