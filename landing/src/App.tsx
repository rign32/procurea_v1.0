import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HeroSection } from "@/components/sections/HeroSection"
import { ProblemSection } from "@/components/sections/ProblemSection"
import { HowItWorksSection } from "@/components/sections/HowItWorksSection"
import { FeaturesSection } from "@/components/sections/FeaturesSection"
import { BenefitsSection } from "@/components/sections/BenefitsSection"
import { AudienceSection } from "@/components/sections/AudienceSection"
import { PricingSection } from "@/components/sections/PricingSection"
import { CtaSection } from "@/components/sections/CtaSection"
import { FaqSection } from "@/components/sections/FaqSection"
import { RegulaminPage } from "@/pages/RegulaminPage"
import { PolitykaPrywatnosciPage } from "@/pages/PolitykaPrywatnosciPage"
import { RodoPage } from "@/pages/RodoPage"

function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <BenefitsSection />
        <AudienceSection />
        <PricingSection />
        <CtaSection />
        <FaqSection />
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
