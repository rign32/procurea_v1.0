import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { t } from "@/i18n"
import { CookieConsent } from "@/lib/cookieconsent"

const API_URL = import.meta.env.VITE_API_URL || '/api'
const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FooterLink = { label: string; to?: string; external?: string }

function FooterLinks({ links }: { links: readonly FooterLink[] }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a
              href={link.external}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ) : link.to ? (
            <Link
              to={link.to}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              {link.label}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

const isEN = () => t.meta.lang === "en"

export function Footer() {
  const [nlEmail, setNlEmail] = useState('')
  const [nlStatus, setNlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [nlError, setNlError] = useState('')

  async function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = nlEmail.trim()
    if (!EMAIL_RE.test(trimmed)) {
      setNlStatus('error')
      setNlError(isEN() ? 'Please enter a valid email' : 'Podaj prawidłowy adres email')
      return
    }

    setNlStatus('loading')
    setNlError('')

    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Newsletter subscriber',
          email: trimmed,
          company: '',
          interest: 'newsletter',
          message: 'Newsletter signup from landing page',
          source: 'newsletter_footer',
          language: LANG,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setNlStatus('success')
      setNlEmail('')
    } catch {
      setNlStatus('error')
      setNlError(isEN() ? 'Something went wrong. Try again.' : 'Coś poszło nie tak. Spróbuj ponownie.')
    }
  }

  return (
    <>
      {/* Pre-footer CTA strip — newsletter signup */}
      <section className="relative bg-gray-900 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white">
                {isEN()
                  ? "Stay updated on procurement AI"
                  : "Bądź na bieżąco z AI w procurement"}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {isEN()
                  ? "Insights, product updates, and industry trends. No spam."
                  : "Trendy, aktualizacje produktu i nowości z branży. Bez spamu."}
              </p>
            </div>
            {nlStatus === 'success' ? (
              <p className="text-sm font-medium text-emerald-400">
                {isEN() ? "Subscribed!" : "Zapisano!"}
              </p>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col w-full sm:w-auto gap-2"
              >
                <div className="flex w-full sm:w-auto gap-2">
                  <input
                    type="email"
                    value={nlEmail}
                    onChange={(e) => { setNlEmail(e.target.value); if (nlStatus === 'error') setNlStatus('idle') }}
                    placeholder={isEN() ? "Your email address" : "Twój adres email"}
                    className="w-full sm:w-72 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200 focus-glow"
                  />
                  <button
                    type="submit"
                    disabled={nlStatus === 'loading'}
                    className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {nlStatus === 'loading'
                      ? (isEN() ? "Sending…" : "Wysyłanie…")
                      : (isEN() ? "Subscribe" : "Subskrybuj")}
                  </button>
                </div>
                {nlStatus === 'error' && nlError && (
                  <p className="text-xs text-red-400">{nlError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Main footer */}
      <footer className="relative bg-gray-950 text-gray-300">
        {/* Gradient top line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-900">
                  <span className="text-sm font-bold">P</span>
                </div>
                <span className="text-lg font-bold text-white tracking-tight">
                  Procurea
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mb-6">
                {t.footer.brand}
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/company/procurea-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:scale-110 transition-all duration-200"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
                {t.footer.product}
              </h3>
              <FooterLinks links={t.footer.productLinks} />
            </div>

            {/* Industries */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
                {t.footer.industries}
              </h3>
              <FooterLinks links={t.footer.industryLinks} />
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
                {isEN() ? 'Resources' : 'Materialy'}
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link to={isEN() ? '/resources' : '/materialy'} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    {isEN() ? 'All resources' : 'Wszystkie materialy'}
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to={isEN() ? '/resources/library' : '/materialy/library'} className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    {isEN() ? 'Guides & Templates' : 'Przewodniki i szablony'}
                  </Link>
                </li>
                <li>
                  <Link to="/case-studies" className="text-sm text-gray-400 hover:text-white transition-colors duration-200">
                    {isEN() ? 'Case Studies' : 'Case Studies'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Integrations & Company */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
                {t.footer.integrationsCompany}
              </h3>
              <FooterLinks links={t.footer.companyLinks} />
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-gray-500">
                {t.footer.legal}
              </h3>
              <ul className="space-y-2.5">
                {t.footer.legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => CookieConsent.showPreferences()}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {t.footer.cookieSettings}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 pt-8 border-t border-white/[0.06]">
            <p className="text-xs text-gray-500 text-center">
              &copy; {new Date().getFullYear()} {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
