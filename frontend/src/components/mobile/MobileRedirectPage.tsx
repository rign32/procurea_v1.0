import { useState } from 'react';
import { Monitor, Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { isEN } from '@/i18n';

interface MobileRedirectPageProps {
  /** Called when the user chooses to continue on mobile anyway. */
  onOverride: () => void;
}

/**
 * Full-screen page shown to users who reach the authenticated app (or login)
 * on a narrow viewport. Procurea is desktop-first; mobile users are routed
 * here so they can mail themselves the link or proceed anyway if they
 * understand the UX will be cramped.
 */
export function MobileRedirectPage({ onOverride }: MobileRedirectPageProps) {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fall back silently; the link is visible in the textarea.
    }
  };

  const mailSubject = encodeURIComponent(isEN ? 'Procurea — open on your computer' : 'Procurea — otwórz na komputerze');
  const mailBody = encodeURIComponent(
    isEN
      ? `Open Procurea on your computer:\n\n${currentUrl}\n\n— sent from my phone`
      : `Otwórz Procureę na komputerze:\n\n${currentUrl}\n\n— wysłane z telefonu`,
  );

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-[8px] bg-brand text-white grid place-items-center font-mono font-bold text-[15px]">
            P
          </div>
          <span className="font-bold text-[16px] tracking-[-0.015em]">Procurea</span>
        </div>

        <div className="rounded-[12px] border border-rule bg-surface p-6 shadow-ds-sm">
          <div className="w-12 h-12 rounded-[10px] bg-brand-softer text-brand grid place-items-center mb-4">
            <Monitor className="h-6 w-6" strokeWidth={1.5} />
          </div>

          <h1 className="text-[22px] leading-[1.2] tracking-[-0.02em] font-bold mb-2">
            {isEN ? 'Best on your computer' : 'Najlepiej na komputerze'}
          </h1>

          <p className="text-[14px] text-muted-ink leading-[1.5] mb-5">
            {isEN
              ? 'Procurea is a procurement workspace built for a full-size screen. The supplier comparison, wizards, and dashboards need room to breathe — open this link on your laptop or desktop to continue.'
              : 'Procurea to narzędzie zakupowe stworzone pod duży ekran. Porównywarki ofert, kreatory i dashboardy potrzebują miejsca — otwórz ten link na laptopie lub komputerze, żeby kontynuować.'}
          </p>

          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 h-10 rounded-[8px] bg-brand text-white text-[14px] font-semibold hover:bg-brand-2 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied
                ? (isEN ? 'Link copied' : 'Link skopiowany')
                : (isEN ? 'Copy link' : 'Skopiuj link')}
            </button>
            <a
              href={`mailto:?subject=${mailSubject}&body=${mailBody}`}
              className="flex items-center justify-center gap-2 h-10 rounded-[8px] border border-rule text-ink text-[14px] font-medium hover:bg-bg-2 transition-colors"
            >
              <Mail className="h-4 w-4" />
              {isEN ? 'Email link to myself' : 'Wyślij link do siebie'}
            </a>
          </div>

          <div className="border-t border-rule pt-4 text-[12px] text-muted-ink-2 font-mono break-all select-all">
            {currentUrl}
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onOverride}
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-ink hover:text-ink underline underline-offset-2 transition-colors"
          >
            {isEN ? 'Continue on mobile anyway' : 'Kontynuuj mimo to na telefonie'}
            <ExternalLink className="h-3 w-3" />
          </button>
          <p className="text-[11px] text-muted-ink-2 mt-1.5">
            {isEN
              ? 'Some screens will be cramped and some actions may be hidden.'
              : 'Niektóre ekrany będą ciasne, część akcji może być ukryta.'}
          </p>
        </div>
      </div>
    </div>
  );
}
