import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { RfqWizard } from '@/components/rfqs/RfqWizard';
import { PL } from '@/i18n/pl';

export function RfqWizardPage() {
  const navigate = useNavigate();

  const handleComplete = (campaignId: string) => {
    // Navigate to the campaign detail page
    navigate(`/campaigns/${campaignId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/campaigns')}
          title={PL.campaigns.detail.backToCampaigns}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{PL.campaigns.wizard.title}</h1>
          <p className="text-muted-foreground mt-1">
            Wypełnij formularz aby uruchomić wyszukiwanie AI
          </p>
        </div>
      </div>

      {/* Wizard */}
      <RfqWizard onComplete={handleComplete} />
    </div>
  );
}

export default RfqWizardPage;
