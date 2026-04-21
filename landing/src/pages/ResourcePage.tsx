import { useState, FormEvent } from "react"
import { useParams, Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { RouteMeta } from "@/lib/RouteMeta"
import { RevealOnScroll } from "@/components/ui/RevealOnScroll"
import { BookCover3D } from "@/components/content/BookCover3D"
import { TcoCalculatorWidget } from "@/components/content/TcoCalculatorWidget"
import { RiskChecklistWidget } from "@/components/content/RiskChecklistWidget"
import { getBookCoverConfig } from "@/content/bookCoverConfig"
import { getResource } from "@/content/resources"
import { pathMappings } from "@/i18n/paths"
import { Download, CheckCircle2, ArrowLeft, Shield, BookOpen, Sparkles, FileText } from "lucide-react"

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
            <Link to={pathMappings.resourcesHub[LANG]} className="text-[#162a52] hover:underline">
              {isEN ? "← Back to the Library" : "← Wróć do Biblioteki"}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const cfg = getBookCoverConfig(resource.slug)
  const isComingSoon = resource.status === "coming-soon"
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

      if (!isComingSoon && resource.gatedDownloadUrl) {
        window.open(resource.gatedDownloadUrl, "_blank", "noopener,noreferrer")
      }
    } catch {
      setState("error")
      setError(isEN ? "Something went wrong. Please try again." : "Coś poszło nie tak. Spróbuj ponownie.")
    }
  }

  // Category crumb derivation
  const categoryCrumb = (() => {
    switch (resource.format) {
      case "pdf": return isEN ? "Handbooks" : "Handbooki"
      case "xlsx": return isEN ? "Templates & Calculators" : "Szablony i kalkulatory"
      case "notion": return isEN ? "Templates" : "Szablony"
      case "calculator": return isEN ? "Calculators" : "Kalkulatory"
      default: return isEN ? "Library" : "Biblioteka"
    }
  })()

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
        {/* ═══════ HERO ═══════ */}
        <section className="pt-28 sm:pt-32 pb-6 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-slate-500 mb-6">
              <Link
                to={resourcesBase}
                className="hover:text-[#162a52] border-b border-dotted border-black/[0.15] pb-0.5"
              >
                {isEN ? "Library" : "Biblioteka"}
              </Link>
              <span className="text-black/[0.2]">›</span>
              <Link
                to={resourcesBase}
                className="hover:text-[#162a52] border-b border-dotted border-black/[0.15] pb-0.5"
              >
                {categoryCrumb}
              </Link>
              <span className="text-black/[0.2]">›</span>
              <span className="text-slate-700 font-semibold normal-case tracking-normal truncate">
                {resource.title}
              </span>
            </div>

            <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-start">
              {/* Left: content intro (3 cols) */}
              <div className="lg:col-span-3">
                <RevealOnScroll>
                  {/* Free-to-read / coming-soon banner */}
                  <span
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full border text-[11px] font-mono font-bold uppercase tracking-[0.08em] mb-4 ${
                      isComingSoon
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-[#def3e7] text-[#0f7a4f] border-[rgba(15,122,79,0.24)]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isComingSoon ? "bg-amber-500 shadow-[0_0_0_4px_rgba(244,200,66,0.18)]" : "bg-[#0f7a4f] shadow-[0_0_0_4px_rgba(15,122,79,0.15)]"
                      }`}
                    />
                    {isComingSoon
                      ? isEN ? "Coming soon · get early access" : "Wkrótce · wczesny dostęp"
                      : isEN ? "Free to read · printable PDF included" : "Za darmo · PDF do druku w zestawie"}
                  </span>

                  <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#162a52] mb-3">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    {resource.formatLabel}
                    {resource.pageCount && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">
                          {resource.pageCount} {isEN ? "pages" : "stron"}
                        </span>
                      </>
                    )}
                  </span>

                  <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold font-display tracking-tight mb-5 text-slate-900 leading-[1.06]">
                    {resource.title}
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed mb-7 max-w-[58ch]">
                    {resource.excerpt}
                  </p>

                  {/* Meta strip */}
                  <div className="flex gap-5 flex-wrap mb-7 p-4 bg-white border border-black/[0.06] rounded-lg">
                    <MetaCell label={isEN ? "Format" : "Format"} value={resource.formatLabel} />
                    {resource.pageCount && (
                      <MetaCell
                        label={isEN ? "Length" : "Długość"}
                        value={`${resource.pageCount} ${isEN ? "pages" : "stron"}`}
                      />
                    )}
                    {resource.fileSize && <MetaCell label={isEN ? "Size" : "Rozmiar"} value={resource.fileSize} />}
                    <MetaCell
                      label={isEN ? "Updated" : "Aktualizacja"}
                      value={isEN ? "Apr 2026" : "kwi 2026"}
                      accent
                    />
                  </div>

                  {/* Value props */}
                  <h2 className="text-xl font-bold font-display tracking-tight mb-4 text-slate-900">
                    {isEN ? (
                      <>What's <em className="italic text-[#162a52]">inside.</em></>
                    ) : (
                      <>Co znajdziesz <em className="italic text-[#162a52]">w środku.</em></>
                    )}
                  </h2>
                  <ul className="space-y-3 mb-8">
                    {resource.valueProps.map((prop, i) => (
                      <li key={i} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#162a52] flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="text-sm sm:text-base text-slate-700 leading-relaxed">{prop}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Who it's for */}
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 mb-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      {isEN ? "Who this is for" : "Dla kogo to jest"}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{resource.whoItsFor}</p>
                  </div>
                </RevealOnScroll>
              </div>

              {/* Right: cover-stand + download panel (2 cols) */}
              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24">
                  {/* 3D cover stand */}
                  <div className="relative flex justify-center items-center min-h-[380px] mb-4">
                    <div className="w-full max-w-[340px]">
                      <BookCover3D
                        variant={cfg.variant}
                        coverBg={cfg.coverBg}
                        spineBg={cfg.spineBg}
                        spineText={cfg.spineText}
                        kicker={cfg.kicker}
                        title={resource.title}
                        dek={resource.excerpt}
                        footLabel={cfg.footLabel}
                        pageCount={cfg.pageCount}
                        pageUnit={cfg.pageUnit}
                        motif={cfg.motif}
                        pill={cfg.pill}
                      />
                    </div>
                  </div>

                  {/* Download / sign-up panel */}
                  <div className="rounded-2xl bg-white border border-black/[0.08] overflow-hidden shadow-[0_4px_14px_rgba(11,18,32,0.06),0_14px_40px_rgba(11,18,32,0.07)]">
                    <div className="bg-[linear-gradient(135deg,#162a52_0%,#0b1a3d_100%)] p-6 text-white relative overflow-hidden">
                      <div
                        className="absolute -right-10 -top-10 w-[160px] h-[160px] rounded-full bg-[radial-gradient(circle,rgba(244,200,66,0.18),transparent_70%)] pointer-events-none"
                        aria-hidden="true"
                      />
                      <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#f4c842] font-bold relative">
                        {isComingSoon
                          ? isEN ? "Early access · free" : "Wczesny dostęp · za darmo"
                          : isEN ? "Free · No credit card" : "Za darmo · bez karty"}
                      </div>
                      <h2 className="text-xl font-bold font-display tracking-tight mt-2 text-white relative leading-tight">
                        {isComingSoon ? (
                          isEN ? (
                            <>Get <em className="italic text-[#f4c842]">first access.</em></>
                          ) : (
                            <>Zgarnij <em className="italic text-[#f4c842]">pierwszeństwo.</em></>
                          )
                        ) : (
                          isEN ? (
                            <>Get the <em className="italic text-[#f4c842]">download.</em></>
                          ) : (
                            <>Pobierz <em className="italic text-[#f4c842]">plik.</em></>
                          )
                        )}
                      </h2>
                      <p className="text-sm text-white/72 mt-2 relative">
                        {isComingSoon
                          ? isEN
                            ? "We'll email you the moment this is live. Zero drip campaigns."
                            : "Wyślemy email gdy tylko będzie dostępne. Zero spamu."
                          : isEN
                            ? "PDF in your inbox in under 60 seconds. One-click unsubscribe."
                            : "PDF na mailu w mniej niż 60 sekund. Wypisz się jednym kliknięciem."}
                      </p>
                    </div>

                    <div className="p-6">
                      {state === "success" ? (
                        <div className="text-center py-2">
                          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-3" aria-hidden="true" />
                          <h3 className="font-bold text-emerald-900 mb-1.5 text-lg">
                            {isComingSoon
                              ? isEN ? "You are on the list" : "Jesteś na liście"
                              : isEN ? "Download ready" : "Plik gotowy"}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {isComingSoon
                              ? isEN
                                ? `We'll email you as soon as the ${resource.formatLabel} drops.`
                                : `Wyślemy email gdy ${resource.formatLabel} będzie gotowe.`
                              : isEN
                                ? "The file should have opened in a new tab."
                                : "Plik powinien otworzyć się w nowej karcie."}
                          </p>
                          {!isComingSoon && resource.gatedDownloadUrl && (
                            <a
                              href={resource.gatedDownloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 text-sm mt-4 transition-colors"
                            >
                              <Download className="h-4 w-4" aria-hidden="true" />
                              {isEN ? `Download ${resource.formatLabel}` : `Pobierz ${resource.formatLabel}`}
                            </a>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                          <FormField
                            id="resource-name"
                            label={isEN ? "Your name" : "Imię i nazwisko"}
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
                            label={
                              isEN
                                ? "Company (optional)"
                                : "Firma (opcjonalne)"
                            }
                            value={formData.company}
                            onChange={v => setFormData({ ...formData, company: v })}
                            disabled={state === "loading"}
                            autoComplete="organization"
                          />

                          <button
                            type="submit"
                            disabled={state === "loading"}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#f4c842] hover:bg-[#e6b82e] text-[#0e1614] font-semibold py-3.5 text-sm transition-colors shadow-[0_2px_0_#d9a82a,0_4px_14px_rgba(244,200,66,0.35)] disabled:opacity-70"
                          >
                            {state === "loading" ? (
                              <span>{isEN ? "Sending…" : "Wysyłanie…"}</span>
                            ) : (
                              <>
                                {isComingSoon ? (
                                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                                ) : (
                                  <Download className="h-4 w-4" aria-hidden="true" />
                                )}
                                {isComingSoon
                                  ? isEN ? "Notify me first" : "Powiadom mnie"
                                  : isEN ? "Get download link" : "Wyślij link do pobrania"}
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
                              ? "One-click unsubscribe. GDPR compliant. See Privacy Policy."
                              : "Wypisujesz się jednym kliknięciem. RODO. Zobacz Politykę Prywatności."}
                          </p>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Secondary action — preview */}
                  {!isComingSoon && (
                    <div className="mt-3 rounded-xl bg-slate-50 border border-black/[0.04] p-4 flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-[#162a52] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 mb-0.5">
                          {isEN ? "Prefer to read online?" : "Wolisz czytać online?"}
                        </div>
                        <div className="text-xs text-slate-600 leading-relaxed">
                          {isEN
                            ? "Full document is available in your browser — no gate, no email."
                            : "Cały dokument dostępny w przeglądarce — bez bramki, bez maila."}
                        </div>
                      </div>
                    </div>
                  )}
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
                <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500 font-bold">
                  {isEN ? "Free preview · no signup" : "Darmowy podgląd · bez rejestracji"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-900 mt-2 max-w-[28ch]">
                  {isEN ? (
                    <>Try a slice of the {resource.formatLabel} <em className="italic text-[#162a52]">right now.</em></>
                  ) : (
                    <>Wypróbuj kawałek {resource.formatLabel} <em className="italic text-[#162a52]">tu i teraz.</em></>
                  )}
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-[60ch]">
                  {isEN
                    ? "A live slice of the real tool. Full version with all inputs, formulas and printable outputs drops to your inbox after signup."
                    : "Żywy wycinek prawdziwego narzędzia. Pełna wersja ze wszystkimi wejściami, formułami i wydrukami trafi na maila po zapisie."}
                </p>
              </div>

              {resource.slug === "tco-calculator" && <TcoCalculatorWidget />}
              {resource.slug === "supplier-risk-checklist-2026" && <RiskChecklistWidget />}
            </div>
          </section>
        )}

        {/* ═══════ BACK TO LIBRARY ═══════ */}
        <section className="py-12 border-t border-black/[0.06]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              to={resourcesBase}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#162a52] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {isEN ? "Browse the full library" : "Przeglądaj całą bibliotekę"}
              <FileText className="h-4 w-4 opacity-60" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Helper components                                                    */
/* ------------------------------------------------------------------ */

function MetaCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500 font-bold">{label}</span>
      <span className={`text-sm font-semibold ${accent ? "text-[#162a52]" : "text-slate-900"}`}>{value}</span>
    </div>
  )
}

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
      <label htmlFor={id} className="block text-[10.5px] font-mono font-bold uppercase tracking-[0.1em] text-slate-700 mb-1.5">
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
        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-black/[0.1] bg-white outline-none focus:ring-2 focus:ring-[#3b5ba0]/30 focus:border-[#3b5ba0]/50 transition-all disabled:opacity-60"
      />
    </div>
  )
}

export default ResourcePage
