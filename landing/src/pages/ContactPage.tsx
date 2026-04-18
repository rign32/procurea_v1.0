import { useEffect, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { Confetti } from "@/components/ui/Confetti"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { CalEmbed } from "@/components/ui/CalEmbed"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { trackCtaClick, trackEvent } from "@/lib/analytics"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

// Where to POST — defaults to /api/leads which is rewritten to Cloud Function
const API_URL = import.meta.env.VITE_API_URL || '/api'

// Sales inbox (single source of truth for both UI mailto + the contact form fallback).
// Currently routed to r.ignaczak1@gmail.com because the @procurea.pl / @procurea.io
// inboxes are temporarily not functional.
const SALES_EMAIL = 'r.ignaczak1@gmail.com'

const INTEREST_OPTIONS: { value: string; labelEn: string; labelPl: string }[] = [
  { value: 'ai_sourcing', labelEn: 'AI Sourcing (self-serve credits — from $89)', labelPl: 'AI Sourcing (self-serve credits — od $89)' },
  { value: 'ai_procurement', labelEn: 'AI Procurement (outreach + offers + insights)', labelPl: 'AI Procurement (outreach + oferty + insights)' },
  { value: 'bundle', labelEn: 'Bundle (Sourcing + Procurement — save 15%)', labelPl: 'Bundle (Sourcing + Procurement — oszczędność 15%)' },
  { value: 'enterprise_custom', labelEn: 'Enterprise Custom (from $25k / year)', labelPl: 'Enterprise Custom (od $25k / rok)' },
  { value: 'integration_sap', labelEn: 'SAP integration', labelPl: 'Integracja SAP' },
  { value: 'integration_oracle', labelEn: 'Oracle integration (NetSuite / Fusion)', labelPl: 'Integracja Oracle (NetSuite / Fusion)' },
  { value: 'integration_dynamics', labelEn: 'Microsoft Dynamics integration', labelPl: 'Integracja Microsoft Dynamics' },
  { value: 'integration_salesforce', labelEn: 'Salesforce integration', labelPl: 'Integracja Salesforce' },
  { value: 'integration_other', labelEn: 'Other ERP / CRM integration', labelPl: 'Inna integracja ERP / CRM' },
  { value: 'general_demo', labelEn: 'General product demo', labelPl: 'Ogólne demo produktu' },
  { value: 'other', labelEn: 'Other', labelPl: 'Inne' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'submitting' | 'success' | 'error'

export function ContactPage() {
  const [searchParams] = useSearchParams()
  const prefilledInterest = searchParams.get('interest') || 'general_demo'

  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [interest, setInterest] = useState(prefilledInterest)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Sync interest if URL changes
  useEffect(() => {
    if (prefilledInterest) setInterest(prefilledInterest)
  }, [prefilledInterest])

  // Auto-clear error when user edits any field
  useEffect(() => {
    if (errorMsg) setErrorMsg('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, email, interest, company, phone, message])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    // Client-side validation
    if (name.trim().length < 2) {
      setErrorMsg(isEN ? 'Please enter your name' : 'Podaj swoje imię')
      return
    }
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg(isEN ? 'Please enter a valid email' : 'Podaj prawidłowy e-mail')
      return
    }
    if (!interest) {
      setErrorMsg(isEN ? 'Please select your interest' : 'Wybierz obszar zainteresowania')
      return
    }

    setStatus('submitting')
    trackCtaClick('contact_form_submit')

    try {
      const urlParams = new URLSearchParams(window.location.search)
      const payload = {
        name: name.trim(),
        company: company.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        interest,
        message: message.trim() || undefined,
        source: 'contact_page',
        language: LANG,
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined,
        utmCampaign: urlParams.get('utm_campaign') || undefined,
      }

      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || `HTTP ${res.status}`)
      }

      setStatus('success')
      trackEvent('lead_submitted', { interest, source: 'contact_page' })
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err?.message || (isEN ? `Something went wrong. Please email us at ${SALES_EMAIL}` : `Coś poszło nie tak. Napisz do nas na ${SALES_EMAIL}`))
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen">
        <Confetti />
        <RouteMeta />
        <Navbar />
        <main id="main-content" className="pt-32 pb-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6 animate-pulse-glow">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {isEN ? 'Thanks — we got it' : 'Dzięki — mamy to'}
              </h1>
              <p className="text-lg text-muted-foreground mb-2 leading-relaxed">
                {isEN
                  ? 'We sent a confirmation to your inbox. Expect a personal reply within 24 hours.'
                  : 'Wysłaliśmy potwierdzenie na Twój e-mail. Odezwiemy się osobiście w ciągu 24 godzin.'}
              </p>
              <p className="text-base text-foreground font-semibold">
                {isEN ? 'Skip the wait — book a 15-min call below.' : 'Nie czekaj — umów 15-minutowe spotkanie poniżej.'}
              </p>
            </div>

            <CalEmbed />

            <div className="text-sm text-muted-foreground text-center mt-6">
              {isEN ? 'Prefer email? ' : 'Wolisz mail? '}
              <a href={`mailto:${SALES_EMAIL}`} className="text-primary hover:underline">
                {SALES_EMAIL}
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh-gradient">
      <RouteMeta />
      <Navbar />
      <main id="main-content" className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute top-32 -right-40 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <RevealOnScroll>
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              {isEN ? 'Talk to us' : 'Porozmawiajmy'}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {isEN
                ? 'Enterprise demo, Procurement add-on, or ERP integrations — we reply within 24 hours.'
                : 'Demo enterprise, plan Procurement, lub integracje ERP — odpowiadamy w ciągu 24 godzin.'}
            </p>
          </div>
          </RevealOnScroll>

          {/* Cal.com embed — right under the header */}
          <RevealOnScroll>
          <div id="calendar" className="mb-12">
            <CalEmbed />
          </div>
          </RevealOnScroll>

          {/* Separator */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-black/[0.06]" />
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Mail className="h-4 w-4" />
              {isEN ? 'Or give us a heads up' : 'Albo napisz do nas'}
            </span>
            <div className="h-px flex-1 bg-black/[0.06]" />
          </div>

          <RevealOnScroll scale>
          <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-6 md:p-8 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-400 via-emerald-400 to-teal-400" />
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-5" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                <label className="block text-sm font-medium mb-1.5">{isEN ? 'Full name' : 'Imię i nazwisko'} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(90,140,143,0.08)] transition-all"
                  placeholder={isEN ? 'Jane Doe' : 'Jan Kowalski'}
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                <label className="block text-sm font-medium mb-1.5">{isEN ? 'Company' : 'Firma'}</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(90,140,143,0.08)] transition-all"
                  placeholder={isEN ? 'Acme Corp' : 'Acme sp. z o.o.'}
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                <label className="block text-sm font-medium mb-1.5">{isEN ? 'Work email' : 'E-mail służbowy'} *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(90,140,143,0.08)] transition-all"
                  placeholder="you@company.com"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}>
                <label className="block text-sm font-medium mb-1.5">{isEN ? 'Phone (optional)' : 'Telefon (opcjonalnie)'}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(90,140,143,0.08)] transition-all"
                  placeholder="+1 555 123 4567"
                />
              </motion.div>
            </motion.div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-1.5">{isEN ? 'What are you interested in' : 'Czym jesteś zainteresowany'} *</label>
              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(90,140,143,0.08)] transition-all bg-white"
              >
                {INTEREST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {isEN ? opt.labelEn : opt.labelPl}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-medium mb-1.5">{isEN ? 'Message (optional)' : 'Wiadomość (opcjonalnie)'}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 text-sm border border-black/[0.1] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-[0_0_0_4px_rgba(90,140,143,0.08)] transition-all resize-none"
                placeholder={isEN
                  ? 'Tell us about your team size, current tools, and what you\'re trying to solve.'
                  : 'Opisz swój zespół, obecne narzędzia i problem, który chcesz rozwiązać.'}
              />
            </div>

            {errorMsg && (
              <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98] shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === 'submitting'
                  ? (isEN ? 'Sending…' : 'Wysyłanie…')
                  : (isEN ? 'Send message' : 'Wyślij wiadomość')}
              </button>
              <p className="text-xs text-muted-foreground">
                {isEN
                  ? 'By submitting, you agree to our privacy policy.'
                  : 'Wysyłając formularz, akceptujesz naszą politykę prywatności.'}
              </p>
            </div>
          </form>
          </RevealOnScroll>

          {/* Alt contact method */}
          <div className="mt-10 text-sm text-muted-foreground text-center">
            <Mail className="inline h-4 w-4 mr-1.5 text-primary" />
            {isEN ? 'Prefer email? ' : 'Wolisz mail? '}
            <a href={`mailto:${SALES_EMAIL}`} className="text-primary hover:underline underline-slide font-medium">
              {SALES_EMAIL}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
