import { useState, FormEvent } from "react"
import { useParams, Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { ResourceCover } from "@/components/content/ResourceCover"
import { TcoCalculatorWidget } from "@/components/content/TcoCalculatorWidget"
import { RiskChecklistWidget } from "@/components/content/RiskChecklistWidget"
import { getResource } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { Download, CheckCircle2, ArrowLeft, Shield } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || "pl") as "pl" | "en"
const isEN = LANG === "en"

export function ResourcePage() {
  const { slug } = useParams<{ slug: string }>()
  const resource = slug ? getResource(slug) : undefined

  const [state, setState] = useState<"form" | "loading" | "success" | "error">("form")
  const [formData, setFormData] = useState({ name: "", email: "", company: "" })
  const [error, setError] = useState<string | null>(null)

  if (!resource) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {isEN ? "Resource not found" : "Nie znaleziono materiału"}
            </h1>
            <Link to={pathMappings.resourcesHub[LANG]} className="text-amber-700 hover:underline">
              {isEN ? "← All resources" : "← Wszystkie materiały"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const resourcesBase = pathMappings.resourcesHub[LANG]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!formData.email.includes("@") || !formData.name.trim()) {
      setError(isEN ? "Please fill in your name and a valid email." : "Wpisz imię i prawidłowy email.")
      return
    }
    setError(null)
    setState("loading")
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          interest: `lead_magnet:${resource.slug}`,
          source: "resource-gate",
          language: isEN ? "en" : "pl",
          resourceSlug: resource.slug,
        }),
      }).catch(() => null)

      setState("success")

      if (resource.gatedDownloadUrl) {
        window.open(resource.gatedDownloadUrl, "_blank", "noopener,noreferrer")
      }
    } catch {
      setState("error")
      setError(isEN ? "Something went wrong. Please try again." : "Coś poszło nie tak. Spróbuj ponownie.")
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
        {/* ═══════ BREADCRUMB ═══════ */}
        <div className="pt-28 sm:pt-32 pb-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              to={resourcesBase}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {isEN ? "All resources" : "Wszystkie materiały"}
            </Link>
          </div>
        </div>

        {/* ═══════ HERO — big cover + copy side-by-side ═══════ */}
        <section className="pb-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
              {/* Left: content (3 cols) */}
              <div className="lg:col-span-3">
                <RevealOnScroll>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] uppercase tracking-[0.12em] font-bold">
                      <Download className="h-3 w-3 mr-1" aria-hidden="true" />
                      {resource.formatLabel}
                    </span>
                    {resource.pageCount && (
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-slate-500 font-bold">
                        {resource.pageCount} {isEN ? "pages" : "stron"} · {resource.fileSize}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight mb-5 text-slate-900 leading-[1.1]">
                    {resource.title}
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-[58ch]">
                    {resource.excerpt}
                  </p>

                  {/* Value props */}
                  <h2 className="text-lg font-bold font-display tracking-tight mb-4 text-slate-900">
                    {isEN ? "What's inside" : "Co znajdziesz w środku"}
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
                      {isEN ? "Who this is for" : "Dla kogo to jest"}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{resource.whoItsFor}</p>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right: cover + download (2 cols) */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24 space-y-4">
                  {/* Hero cover */}
                  <ResourceCover slug={resource.slug} title={resource.title} size="hero" hover={false} />

                  {/* Download panel */}
                  <div className="rounded-2xl bg-white border border-black/[0.08] overflow-hidden shadow-[0_4px_14px_rgba(11,18,32,0.06)]">
                    {state === "success" ? (
                      <div className="p-6 text-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-3" aria-hidden="true" />
                        <h3 className="font-bold text-slate-900 mb-1.5 text-lg">
                          {isEN ? "Download started" : "Pobieranie uruchomione"}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                          {isEN
                            ? "If your browser blocked it, click below."
                            : "Jeśli przeglądarka zablokowała — kliknij poniżej."}
                        </p>
                        {resource.gatedDownloadUrl && (
                          <a
                            href={resource.gatedDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 text-sm transition-colors"
                          >
                            <Download className="h-4 w-4" aria-hidden="true" />
                            {isEN ? `Download ${resource.formatLabel}` : `Pobierz ${resource.formatLabel}`}
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="p-6">
                        <h3 className="font-bold font-display tracking-tight text-slate-900 text-lg mb-1">
                          {isEN ? "Download free" : "Pobierz za darmo"}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                          {isEN
                            ? "No credit card. Straight to your inbox."
                            : "Bez karty. Prosto na skrzynkę."}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                          <FormField
                            id="resource-name"
                            label={isEN ? "Your name" : "Imię"}
                            value={formData.name}
                            onChange={v => setFormData({ ...formData, name: v })}
                            disabled={state === "loading"}
                            required
                            autoComplete="name"
                          />
                          <FormField
                            id="resource-email"
                            label={isEN ? "Work email" : "Email służbowy"}
                            type="email"
                            value={formData.email}
                            onChange={v => setFormData({ ...formData, email: v })}
                            disabled={state === "loading"}
                            required
                            autoComplete="email"
                          />
                          <FormField
                            id="resource-company"
                            label={isEN ? "Company (optional)" : "Firma (opcjonalne)"}
                            value={formData.company}
                            onChange={v => setFormData({ ...formData, company: v })}
                            disabled={state === "loading"}
                            autoComplete="organization"
                          />

                          <button
                            type="submit"
                            disabled={state === "loading"}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 text-sm transition-colors disabled:opacity-70"
                          >
                            {state === "loading" ? (
                              <span>{isEN ? "Sending…" : "Wysyłanie…"}</span>
                            ) : (
                              <>
                                <Download className="h-4 w-4" aria-hidden="true" />
                                {isEN ? `Download ${resource.formatLabel}` : `Pobierz ${resource.formatLabel}`}
                              </>
                            )}
                          </button>

                          {error && (
                            <p role="alert" className="text-xs text-rose-600">
                              {error}
                            </p>
                          )}

                          <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5 pt-1">
                            <Shield className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            {isEN
                              ? "One-click unsubscribe. GDPR compliant."
                              : "Wypisujesz się jednym kliknięciem. RODO."}
                          </p>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════ INTERACTIVE PREVIEW (slug-specific) ═══════ */}
        {(resource.slug === "tco-calculator" || resource.slug === "supplier-risk-checklist-2026") && (
          <section className="py-12 border-t border-black/[0.06] bg-slate-50/40">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-amber-700 font-bold">
                  {isEN ? "Free preview · no signup" : "Darmowy podgląd · bez rejestracji"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 mt-2 max-w-[28ch]">
                  {isEN ? "Try a slice right now." : "Wypróbuj kawałek tu i teraz."}
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-[60ch]">
                  {isEN
                    ? "A live slice of the real tool. Full version with all inputs and formulas is in the download."
                    : "Żywy wycinek prawdziwego narzędzia. Pełna wersja ze wszystkimi wejściami i formułami jest w pliku do pobrania."}
                </p>
              </div>

              {resource.slug === "tco-calculator" && <TcoCalculatorWidget />}
              {resource.slug === "supplier-risk-checklist-2026" && <RiskChecklistWidget />}
            </div>
          </section>
        )}

        {/* ═══════ BACK TO LIBRARY ═══════ */}
        <section className="py-12 border-t border-black/[0.06]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              to={resourcesBase}
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {isEN ? "Browse all resources" : "Przeglądaj wszystkie materiały"}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Helper                                                                */
/* ------------------------------------------------------------------ */

interface FormFieldProps {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
}

function FormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
  autoComplete,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-black/[0.1] bg-white outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all disabled:opacity-60"
      />
    </div>
  )
}

export default ResourcePage
