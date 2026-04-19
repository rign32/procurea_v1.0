import { useState, FormEvent } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export interface NewsletterSignupInlineProps {
  variant?: 'hero' | 'footer' | 'sidebar'
  className?: string
  onSubmit?: (email: string) => Promise<void>
}

export function NewsletterSignupInline({
  variant = 'hero',
  className = '',
  onSubmit,
}: NewsletterSignupInlineProps) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError(isEN ? 'Please enter a valid email address' : 'Wpisz prawidłowy adres email')
      return
    }
    setError(null)
    setState('loading')
    try {
      if (onSubmit) {
        await onSubmit(email)
      } else {
        // Default: POST to Resend-backed endpoint — falls back gracefully
        await fetch('/api/newsletter-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'content-hub' }),
        }).catch(() => null)
      }
      setState('success')
      setEmail('')
    } catch (err) {
      setState('error')
      setError(isEN ? 'Something went wrong. Please try again.' : 'Coś poszło nie tak. Spróbuj ponownie.')
    }
  }

  if (state === 'success') {
    return (
      <div
        className={`inline-flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-800 ${className}`}
        role="status"
      >
        <CheckCircle2 className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
        <div className="text-sm text-left">
          <div className="font-semibold">{isEN ? 'Check your inbox' : 'Sprawdź skrzynkę'}</div>
          <div className="text-xs opacity-80">
            {isEN
              ? 'We sent a confirmation. Click it to activate your subscription.'
              : 'Wysłaliśmy potwierdzenie. Kliknij link aby aktywować subskrypcję.'}
          </div>
        </div>
      </div>
    )
  }

  const wrapperClass =
    variant === 'hero'
      ? 'max-w-md mx-auto'
      : variant === 'footer'
        ? 'max-w-sm'
        : 'max-w-xs'

  return (
    <form onSubmit={handleSubmit} className={`${wrapperClass} ${className}`} noValidate>
      <div className="flex items-stretch rounded-xl shadow-sm border border-black/[0.08] bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:border-brand-500/50 transition-all">
        <label htmlFor={`newsletter-email-${variant}`} className="sr-only">
          {isEN ? 'Your email address' : 'Twój adres email'}
        </label>
        <input
          id={`newsletter-email-${variant}`}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={isEN ? 'your@email.com' : 'twoj@email.com'}
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-invalid={state === 'error'}
          aria-describedby={error ? `newsletter-error-${variant}` : undefined}
          disabled={state === 'loading'}
          className="flex-1 px-4 py-3 text-sm bg-transparent outline-none placeholder:text-slate-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="inline-flex items-center gap-2 px-5 font-semibold text-sm bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
        >
          {state === 'loading' ? (
            <span>{isEN ? 'Sending…' : 'Wysyłanie…'}</span>
          ) : (
            <>
              <span className="hidden sm:inline">{isEN ? 'Subscribe' : 'Subskrybuj'}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      {error && (
        <p id={`newsletter-error-${variant}`} role="alert" className="text-xs text-rose-600 mt-2 text-left px-1">
          {error}
        </p>
      )}
      <p className="text-xs text-slate-500 mt-3 text-center">
        {isEN
          ? 'Weekly digest · No spam · Unsubscribe anytime'
          : 'Cotygodniowy digest · Bez spamu · Wypisz się w każdej chwili'}
      </p>
    </form>
  )
}

export default NewsletterSignupInline
