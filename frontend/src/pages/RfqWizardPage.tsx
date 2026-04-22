import { ArrowLeft, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { RfqWizard } from '@/components/rfqs/RfqWizard';
import { t } from '@/i18n';
import type { Industry, SourcingMode } from '@/types/campaign.types';

const VALID_INDUSTRIES: Industry[] = ['manufacturing', 'events', 'construction', 'horeca', 'healthcare', 'retail', 'logistics', 'mro', 'other'];
const VALID_MODES: SourcingMode[] = ['product', 'service', 'mixed'];

// Landing-page slug → wizard industry. PL slugs included so deep-links from procurea.pl work.
const SLUG_TO_INDUSTRY: Record<string, Industry> = {
  manufacturing: 'manufacturing', produkcja: 'manufacturing',
  events: 'events', eventy: 'events',
  construction: 'construction', budownictwo: 'construction',
  horeca: 'horeca', gastronomia: 'horeca',
  healthcare: 'healthcare', 'ochrona-zdrowia': 'healthcare',
  'retail-ecommerce': 'retail', retail: 'retail',
  logistics: 'logistics', logistyka: 'logistics',
  mro: 'mro', 'mro-utrzymanie-ruchu': 'mro',
};

export function RfqWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawIndustry = (searchParams.get('industry') || '').toLowerCase();
  const rawMode = searchParams.get('mode') || '';
  const prefillIndustry: Industry | undefined =
    SLUG_TO_INDUSTRY[rawIndustry] ||
    (VALID_INDUSTRIES.includes(rawIndustry as Industry) ? (rawIndustry as Industry) : undefined);
  const prefillMode: SourcingMode | undefined = VALID_MODES.includes(rawMode as SourcingMode)
    ? (rawMode as SourcingMode)
    : undefined;

  const handleComplete = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Distraction-free top bar */}
      <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-4 lg:px-6 border-b border-rule backdrop-blur-[8px] bg-bg/85">
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          title="Procurea"
        >
          <div className="w-[26px] h-[26px] rounded-[6px] bg-brand text-white grid place-items-center font-mono font-bold text-[13px] tracking-tight">
            P
          </div>
          <span className="hidden sm:inline font-bold text-[15px] tracking-[-0.015em] text-ink">
            Procurea
          </span>
        </Link>

        <span className="text-rule-3 hidden sm:inline">/</span>

        <Link
          to="/campaigns"
          className="flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-[0.08em] text-muted-ink hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          {t.campaigns.detail.backToCampaigns}
        </Link>

        <div className="ml-auto">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className="h-8 w-8 grid place-items-center rounded-[8px] text-ink-2 hover:bg-bg-2 hover:text-ink transition-colors"
            title={t.common.cancel}
            aria-label={t.common.cancel}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Wizard body */}
      <main className="flex-1">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="mb-8">
            <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold">
              {t.campaigns.wizard.title}
            </h1>
            <p className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums">
              {t.campaigns.wizard.description}
            </p>
          </div>
          <RfqWizard onComplete={handleComplete} prefillIndustry={prefillIndustry} prefillMode={prefillMode} />
        </div>
      </main>
    </div>
  );
}

export default RfqWizardPage;
