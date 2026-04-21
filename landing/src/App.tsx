import { useEffect, lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, useLocation, Navigate, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { pathMappings } from "@/i18n/paths"
import { t } from "@/i18n"
import { BackToTop } from "@/components/ui/BackToTop"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.99, filter: "blur(2px)" }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Home — eagerly loaded (above the fold)
import { HomePage } from "@/pages/HomePage"

// Lazy-loaded pages (code-split)
const PricingPage = lazy(() => import("@/pages/PricingPage").then(m => ({ default: m.PricingPage })))
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import("@/pages/ContactPage").then(m => ({ default: m.ContactPage })))
const FeaturesHubPage = lazy(() => import("@/pages/FeaturesHubPage").then(m => ({ default: m.FeaturesHubPage })))
const IndustriesHubPage = lazy(() => import("@/pages/IndustriesHubPage").then(m => ({ default: m.IndustriesHubPage })))
const IntegrationsHubPage = lazy(() => import("@/pages/IntegrationsHubPage").then(m => ({ default: m.IntegrationsHubPage })))
const IndustryPage = lazy(() => import("@/pages/IndustryPage").then(m => ({ default: m.IndustryPage })))
const FeaturePage = lazy(() => import("@/pages/FeaturePage").then(m => ({ default: m.FeaturePage })))
const RegulaminPage = lazy(() => import("@/pages/RegulaminPage").then(m => ({ default: m.RegulaminPage })))
const PolitykaPrywatnosciPage = lazy(() => import("@/pages/PolitykaPrywatnosciPage").then(m => ({ default: m.PolitykaPrywatnosciPage })))
const RodoPage = lazy(() => import("@/pages/RodoPage").then(m => ({ default: m.RodoPage })))
const TermsPage = lazy(() => import("@/pages/TermsPage").then(m => ({ default: m.TermsPage })))
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })))
const GdprPage = lazy(() => import("@/pages/GdprPage").then(m => ({ default: m.GdprPage })))
const SecurityPage = lazy(() => import("@/pages/SecurityPage").then(m => ({ default: m.SecurityPage })))
const CompliancePage = lazy(() => import("@/pages/CompliancePage").then(m => ({ default: m.CompliancePage })))
const ComparisonPage = lazy(() => import("@/pages/ComparisonPage").then(m => ({ default: m.ComparisonPage })))
const PartnerPage = lazy(() => import("@/pages/PartnerPage").then(m => ({ default: m.PartnerPage })))
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage").then(m => ({ default: m.BlogPostPage })))
const ContentHubPage = lazy(() => import("@/pages/ContentHubPage").then(m => ({ default: m.ContentHubPage })))
const ResourcePage = lazy(() => import("@/pages/ResourcePage").then(m => ({ default: m.ResourcePage })))
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })))

const isEN = t.meta.lang === 'en'
const lang = isEN ? 'en' : 'pl'

const p = (key: keyof typeof pathMappings) => pathMappings[key][lang]

const industriesHubPath = p('industriesHub')
const featuresHubPath = p('featuresHub')
const resourcesHubPath = p('resourcesHub')
const blogIndexPath = p('blogIndex')

function LegacyLibraryRedirect() {
  const { slug } = useParams<{ slug: string }>()
  return <Navigate to={`${resourcesHubPath}/${slug ?? ''}`} replace />
}

function BlogIndexRedirect() {
  return <Navigate to={`${resourcesHubPath}?type=blog`} replace />
}

function ContentHubRedirect() {
  return <Navigate to={resourcesHubPath} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <BackToTop />
      <Suspense fallback={<div className="min-h-screen" />}>
      <AnimatedRoutes>
      <Routes>
        <Route path={p('home')} element={<HomePage />} />

        <Route path={p('pricing')} element={<PricingPage />} />
        <Route path={p('about')} element={<AboutPage />} />
        <Route path={p('contact')} element={<ContactPage />} />

        <Route path={featuresHubPath} element={<FeaturesHubPage />} />
        <Route path={industriesHubPath} element={<IndustriesHubPage />} />
        <Route path={p('integrationsHub')} element={<IntegrationsHubPage />} />

        <Route path={`${featuresHubPath}/:slug`} element={<FeaturePage />} />
        <Route path={`${industriesHubPath}/:slug`} element={<IndustryPage />} />

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
        <Route path={p('security')} element={<SecurityPage />} />
        <Route path={p('compliance')} element={<CompliancePage />} />
        <Route path={p('comparison')} element={<ComparisonPage />} />
        <Route path={p('partners')} element={<PartnerPage />} />

        {/* Unified Content Hub — absorbed blog index + resources index + case studies */}
        <Route path={resourcesHubPath} element={<ContentHubPage />} />
        <Route path={`${resourcesHubPath}/:slug`} element={<ResourcePage />} />

        {/* Individual blog posts still render at /blog/:slug for link compatibility + SEO */}
        <Route path={`${blogIndexPath}/:slug`} element={<BlogPostPage />} />

        {/* Legacy redirects — the 4 content entry points consolidate into one hub */}
        <Route path={blogIndexPath} element={<BlogIndexRedirect />} />
        <Route path="/case-studies" element={<ContentHubRedirect />} />
        <Route path="/case-studies/:slug" element={<ContentHubRedirect />} />
        <Route path={`${resourcesHubPath}/${isEN ? 'all' : 'wszystko'}`} element={<ContentHubRedirect />} />

        {/* Legacy /library aliases */}
        <Route path={`${resourcesHubPath}/library`} element={<Navigate to={resourcesHubPath} replace />} />
        <Route path={`${resourcesHubPath}/library/:slug`} element={<LegacyLibraryRedirect />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </AnimatedRoutes>
      </Suspense>
    </BrowserRouter>
  )
}
