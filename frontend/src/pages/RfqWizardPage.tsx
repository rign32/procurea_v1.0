import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RfqWizard } from '@/components/rfqs/RfqWizard';
import { t } from '@/i18n';

export function RfqWizardPage() {
  const navigate = useNavigate();

  const handleComplete = (campaignId: string) => {
    // Navigate to the campaign detail page
    navigate(`/campaigns/${campaignId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule">
        <div className="flex items-center gap-4">
          <Button
            variant="ds-ghost"
            size="icon"
            onClick={() => navigate('/campaigns')}
            title={t.campaigns.detail.backToCampaigns}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold">{t.campaigns.wizard.title}</h1>
            <p className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums">
              {t.campaigns.wizard.description}
            </p>
          </div>
        </div>
      </div>

      {/* Wizard */}
      <RfqWizard onComplete={handleComplete} />
    </div>
  );
}

export default RfqWizardPage;
