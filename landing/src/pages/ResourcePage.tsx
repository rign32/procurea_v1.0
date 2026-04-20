import { useState, FormEvent } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { getResource } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { Download, CheckCircle2, ArrowLeft, Shield } from "lucide-react"
import { LEAD_MAGNET_COVERS } from "@/assets/content-hub/LeadMagnetCovers"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export function ResourcePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const resource = slug ? getResource(slug) : undefined

  const [state, setState] = useState<'form' | 'loading' | 'success' | 'error'>('form')
  const [formData, setFormData] = useState({ name: '', email: '', company: '' })
  const [error, setError] = useState<string | null>(null)

  if (!resource) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {isEN ? 'Resource not found' : 'Nie znaleziono materiału'}
            </h1>
            <Link to={pathMappings.resourcesHub[LANG]} className="text-brand-600 hover:underline">
              {isEN ? '← Back to Resources' : '← Wróć do Materiałów'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const isComingSoon = resource.status === 'coming-soon'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.email.includes('@') || !formData.name.trim()) {
      setError(isEN ? 'Please fill in your name and a valid email.' : 'Wpisz imię i prawidłowy email.')
      return
    }
    setError(null)
    setState('loading')
    try {
      // Fire lead capture (backend requires `interest` field; resource slug
      // doubles as the interest signal so sales/analytics can segment).
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          interest: `lead_magnet:${resource.slug}`,
          source: 'resource-gate',
          language: isEN ? 'en' : 'pl',
          resourceSlug: resource.slug,
        }),
      }).catch(() => null)

      setState('success')

      // Trigger immediate download — user gets the file right away,
      // the confirmation email is a secondary backup.
      if (!isComingSoon && resource.gatedDownloadUrl) {
        window.open(resource.gatedDownloadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      setState('error')
      setError(isEN ? 'Something went wrong. Please try again.' : 'Coś poszło nie tak. Spróbuj ponownie.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <RouteMeta
        override={{
          title: `${resource.title} | Procurea`,
          description: resource.excerpt,
        }}
      />
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* Breadcrumb + back link */}
        <div className="pt-28 sm:pt-32 pb-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              to={pathMappings.resourcesHub[LANG]}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? 'All resources' : 'Wszystkie materiały'}
            </Link>
          </div>
        </div>

        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
              {/* Left: value prop content (3 cols) */}
              <div className="lg:col-span-3">
                <RevealOnScroll>
                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-amber-700 mb-4">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {resource.formatLabel}
                  </span>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-5 text-slate-900 leading-tight">
                    {resource.title}
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8">{resource.excerpt}</p>

                  {/* Preview block — uses Graphic Designer's SVG cover */}
                  {(() => {
                    const Cover = LEAD_MAGNET_COVERS[resource.slug]
                    return (
                      <div className="relative rounded-xl overflow-hidden shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)] mb-8 mx-auto max-w-sm">
                        {Cover ? (
                          <Cover className="w-full" />
                        ) : (
                          <div className="aspect-[3/4] bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600" />
                        )}
                      </div>
                    )
                  })()}

                  {/* Value props */}
                  <h2 className="text-xl font-bold font-display mb-4 text-slate-900">
                    {isEN ? "What's inside" : 'Co znajdziesz w środku'}
                  </h2>
                  <ul className="space-y-3 mb-8">
                    {resource.valueProps.map((prop, i) => (
                      <li key={i} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-sm sm:text-base text-slate-700 leading-relaxed">{prop}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Who it's for */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      {isEN ? 'Who this is for' : 'Dla kogo to jest'}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{resource.whoItsFor}</p>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right: sticky gate form (2 cols) */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24">
                  <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.1)]">
                    {isComingSoon ? (
                      <div className="text-center py-4">
                        <div className="rounded-full bg-amber-100 w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                          <Download className="h-7 w-7 text-amber-600" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-bold font-display mb-2">
                          {isEN ? 'Coming soon' : 'Wkrótce'}
                        </h2>
                        <p className="text-sm text-slate-600 mb-6">
                          {isEN
                            ? 'Leave your email and we will ping you the moment this is ready.'
                            : 'Zostaw email, powiadomimy gdy będzie gotowe.'}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold font-display mb-2">
                          {isEN ? 'Get the free download' : 'Pobierz za darmo'}
                        </h2>
                        <p className="text-sm text-slate-600">
                          {isEN
                            ? 'No credit card. No sales call. Just the file.'
                            : 'Bez karty. Bez handlowca. Po prostu plik.'}
                        </p>
                      </div>
                    )}

                    {state === 'success' ? (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 sm:p-6" role="status">
                        <CheckCircle2 className="h-7 w-7 text-emerald-600 mb-3" aria-hidden="true" />
                        {isComingSoon ? (
                          <>
                            <h3 className="font-bold text-emerald-900 mb-1.5 text-lg">
                              {isEN ? 'You are on the list' : 'Jesteś na liście'}
                            </h3>
                            <p className="text-sm text-emerald-800 leading-relaxed">
                              {isEN
                                ? `We will email you as soon as the ${resource.formatLabel} is ready.`
                                : `Wyślemy email gdy ${resource.formatLabel} będzie gotowe.`}
                            </p>
                          </>
                        ) : (
                          <>
                            <h3 className="font-bold text-emerald-900 mb-1.5 text-lg">
                              {isEN ? 'Your download is ready' : 'Twój plik jest gotowy'}
                            </h3>
                            <p className="text-sm text-emerald-800 leading-relaxed mb-4">
                              {isEN
                                ? 'The file should have opened in a new tab. If the browser blocked it, click the button below.'
                                : 'Plik powinien otworzyć się w nowej karcie. Jeśli przeglądarka go zablokowała, kliknij przycisk poniżej.'}
                            </p>
                            {resource.gatedDownloadUrl && (
                              <a
                                href={resource.gatedDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 text-sm shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                              >
                                <Download className="h-4 w-4" aria-hidden="true" />
                                {isEN
                                  ? `Download ${resource.formatLabel}`
                                  : `Pobierz ${resource.formatLabel}`}
                              </a>
                            )}
                            <p className="text-xs text-emerald-700/80 mt-3">
                              {isEN
                                ? 'A confirmation email is also on its way to your inbox.'
                                : 'Email potwierdzający też jest w drodze na Twoją skrzynkę.'}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <div>
                          <label htmlFor="resource-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {isEN ? 'Name' : 'Imię'}
                          </label>
                          <input
                            id="resource-name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-black/[0.1] bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
                            disabled={state === 'loading'}
                          />
                        </div>

                        <div>
                          <label htmlFor="resource-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {isEN ? 'Work email' : 'Email służbowy'}
                          </label>
                          <input
                            id="resource-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-black/[0.1] bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
                            disabled={state === 'loading'}
                          />
                        </div>

                        <div>
                          <label htmlFor="resource-company" className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {isEN ? 'Company' : 'Firma'}{' '}
                            <span className="text-slate-400 font-normal">
                              ({isEN ? 'optional' : 'opcjonalne'})
                            </span>
                          </label>
                          <input
                            id="resource-company"
                            type="text"
                            autoComplete="organization"
                            value={formData.company}
                            onChange={e => setFormData({ ...formData, company: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm rounded-lg border border-black/[0.1] bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
                            disabled={state === 'loading'}
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={state === 'loading'}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:opacity-70"
                        >
                          {state === 'loading' ? (
                            <span>{isEN ? 'Sending…' : 'Wysyłanie…'}</span>
                          ) : (
                            <>
                              <Download className="h-4 w-4" aria-hidden="true" />
                              {isComingSoon
                                ? isEN ? 'Notify me' : 'Powiadom mnie'
                                : isEN ? 'Get download link' : 'Wyślij link do pobrania'}
                            </>
                          )}
                        </button>

                        {error && (
                          <p role="alert" className="text-xs text-rose-600">
                            {error}
                          </p>
                        )}

                        <p className="text-xs text-slate-500 leading-relaxed flex items-start gap-2">
                          <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {isEN
                            ? 'We respect your inbox. Unsubscribe anytime. See our Privacy Policy.'
                            : 'Szanujemy twoją skrzynkę. Wypisz się kiedy chcesz. Zobacz Politykę Prywatności.'}
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ResourcePage
