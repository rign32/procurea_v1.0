import { BrowserRouter, Routes, Route } from "react-router-dom"
import { pathMappings } from "@/i18n/paths"
import { t } from "@/i18n"

// Home (migrated from inline LandingPage in this file)
import { HomePage } from "@/pages/HomePage"

// Meta pages
import { PricingPage } from "@/pages/PricingPage"
import { AboutPage } from "@/pages/AboutPage"
import { ContactPage } from "@/pages/ContactPage"

// Hub pages
import { FeaturesHubPage } from "@/pages/FeaturesHubPage"
import { IndustriesHubPage } from "@/pages/IndustriesHubPage"
import { IntegrationsHubPage } from "@/pages/IntegrationsHubPage"

// Parametrized templates
import { IndustryPage } from "@/pages/IndustryPage"
import { FeaturePage } from "@/pages/FeaturePage"

// Legal (PL)
import { RegulaminPage } from "@/pages/RegulaminPage"
import { PolitykaPrywatnosciPage } from "@/pages/PolitykaPrywatnosciPage"
import { RodoPage } from "@/pages/RodoPage"

// Legal (EN)
import { TermsPage } from "@/pages/TermsPage"
import { PrivacyPolicyPage } from "@/pages/PrivacyPolicyPage"
import { GdprPage } from "@/pages/GdprPage"

const isEN = t.meta.lang === 'en'
const lang = isEN ? 'en' : 'pl'

// Derive slugs from pathMappings (single source of truth)
const p = (key: keyof typeof pathMappings) => pathMappings[key][lang]

// Generic hub route patterns for parametric children
const industriesHubPath = p('industriesHub')
const featuresHubPath = p('featuresHub')

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home */}
        <Route path={p('home')} element={<HomePage />} />

        {/* Meta */}
        <Route path={p('pricing')} element={<PricingPage />} />
        <Route path={p('about')} element={<AboutPage />} />
        <Route path={p('contact')} element={<ContactPage />} />

        {/* Hubs */}
        <Route path={featuresHubPath} element={<FeaturesHubPage />} />
        <Route path={industriesHubPath} element={<IndustriesHubPage />} />
        <Route path={p('integrationsHub')} element={<IntegrationsHubPage />} />

        {/* Parametrized: /funkcje/:slug (or /features/:slug) */}
        <Route path={`${featuresHubPath}/:slug`} element={<FeaturePage />} />

        {/* Parametrized: /dla-kogo/:slug (or /industries/:slug) */}
        <Route path={`${industriesHubPath}/:slug`} element={<IndustryPage />} />

        {/* Legal */}
        {isEN ? (
          <>
            <Route path={p('terms')} element={<TermsPage />} />
            <Route path={p('privacy')} element={<PrivacyPolicyPage />} />
            <Route path={p('gdpr')} element={<GdprPage />} />
          </>
        ) : (
          <>
            <Route path={p('terms')} element={<RegulaminPage />} />
            <Route path={p('privacy')} element={<PolitykaPrywatnosciPage />} />
            <Route path={p('gdpr')} element={<RodoPage />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}
