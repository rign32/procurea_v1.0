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
    <ul className="space-y-1.5">
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a
              href={link.external}
              className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150"
            >
              {link.label}
            </a>
          ) : link.to ? (
            <Link
              to={link.to}
              className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150"
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
      {/* Pre-footer CTA strip — newsletter signup (dark ink block) */}
      <section className="relative bg-[hsl(var(--ds-ink))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-white">
                {isEN()
                  ? "Stay updated on procurement AI"
                  : "Bądź na bieżąco z AI w procurement"}
              </h3>
              <p className="mt-1 text-sm text-white/60">
                {isEN()
                  ? "Insights, product updates, and industry trends. No spam."
                  : "Trendy, aktualizacje produktu i nowości z branży. Bez spamu."}
              </p>
            </div>
            {nlStatus === 'success' ? (
              <p className="text-sm font-medium text-[hsl(var(--ds-cta))]">
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
                    className="w-full sm:w-72 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[hsl(var(--ds-cta))] focus:ring-1 focus:ring-[hsl(var(--ds-cta))] transition-colors duration-200"
                  />
                  <button
                    type="submit"
                    disabled={nlStatus === 'loading'}
                    className="btn-ds btn-ds-primary shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {nlStatus === 'loading'
                      ? (isEN() ? "Sending…" : "Wysyłanie…")
                      : (isEN() ? "Subscribe" : "Subskrybuj")}
                  </button>
                </div>
                {nlStatus === 'error' && nlError && (
                  <p className="text-xs text-[#f59e8b]">{nlError}</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Main footer — warm off-white (matches design prototype) */}
      <footer className="relative bg-[hsl(var(--ds-bg))] border-t border-[hsl(var(--ds-rule))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-9">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-10">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
                <span
                  aria-hidden
                  className="grid place-items-center h-[26px] w-[26px] rounded-[7px] bg-[hsl(var(--ds-accent))] text-white font-mono text-[13px] font-semibold"
                >
                  P
                </span>
                <span className="text-[17px] font-bold tracking-[-0.01em] text-[hsl(var(--ds-ink))]">
                  Procurea
                </span>
              </Link>
              <p className="text-[13px] text-[hsl(var(--ds-muted))] leading-relaxed max-w-[26ch] mb-6">
                {t.footer.brand}
              </p>
              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/company/procurea-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[hsl(var(--ds-rule))] bg-[hsl(var(--ds-surface))] text-[hsl(var(--ds-muted))] hover:border-[hsl(var(--ds-ink-3))] hover:text-[hsl(var(--ds-accent))] transition-all duration-150"
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
              <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--ds-muted))] mb-3.5">
                {t.footer.product}
              </h3>
              <FooterLinks links={t.footer.productLinks} />
            </div>

            {/* Industries */}
            <div>
              <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--ds-muted))] mb-3.5">
                {t.footer.industries}
              </h3>
              <FooterLinks links={t.footer.industryLinks} />
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--ds-muted))] mb-3.5">
                {isEN() ? 'Resources' : 'Materialy'}
              </h3>
              <ul className="space-y-1.5">
                <li>
                  <Link to={isEN() ? '/resources' : '/materialy'} className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150">
                    {isEN() ? 'All resources' : 'Wszystkie materialy'}
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to={isEN() ? '/resources/library' : '/materialy/library'} className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150">
                    {isEN() ? 'Guides & Templates' : 'Przewodniki i szablony'}
                  </Link>
                </li>
                <li>
                  <Link to="/case-studies" className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150">
                    {isEN() ? 'Case Studies' : 'Case Studies'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Integrations & Company */}
            <div>
              <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--ds-muted))] mb-3.5">
                {t.footer.integrationsCompany}
              </h3>
              <FooterLinks links={t.footer.companyLinks} />
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--ds-muted))] mb-3.5">
                {t.footer.legal}
              </h3>
              <ul className="space-y-1.5">
                {t.footer.legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => CookieConsent.showPreferences()}
                    className="block py-1 text-[13.5px] text-[hsl(var(--ds-ink-2))] hover:text-[hsl(var(--ds-accent))] transition-colors duration-150"
                  >
                    {t.footer.cookieSettings}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-[hsl(var(--ds-rule))] flex flex-wrap justify-between gap-2 text-xs text-[hsl(var(--ds-muted))]">
            <p>&copy; {new Date().getFullYear()} {t.footer.copyright}</p>
            <p>SOC 2 Type II · Data residency in US, CA, UK &amp; AU</p>
          </div>
        </div>
      </footer>
    </>
  )
}
