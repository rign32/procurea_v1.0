import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CampaignStage } from '@/types/campaign.types';
import { PL } from '@/i18n/pl';

interface StageInfo {
  stage: CampaignStage;
  label: string;
  progress: number;
  color: string;
}

interface PipelineProgressProps {
  currentStage: CampaignStage;
  progress: Record<CampaignStage, number>;
}

const STAGES: Array<{ stage: CampaignStage; label: string; color: string }> = [
  { stage: 'STRATEGY', label: PL.campaigns.stage.strategy, color: 'bg-blue-500' },
  { stage: 'SCANNING', label: PL.campaigns.stage.scanning, color: 'bg-yellow-500' },
  { stage: 'ANALYSIS', label: PL.campaigns.stage.analysis, color: 'bg-purple-500' },
  { stage: 'ENRICHMENT', label: PL.campaigns.stage.enrichment, color: 'bg-green-500' },
  { stage: 'AUDIT', label: PL.campaigns.stage.audit, color: 'bg-red-500' },
];

export function PipelineProgress({ currentStage, progress }: PipelineProgressProps) {
  const getStageStatus = (stage: CampaignStage): 'completed' | 'active' | 'pending' => {
    const stageIndex = STAGES.findIndex((s) => s.stage === stage);
    const currentIndex = STAGES.findIndex((s) => s.stage === currentStage);

    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStageIcon = (stage: CampaignStage) => {
    const status = getStageStatus(stage);

    if (status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (status === 'active') {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{PL.campaigns.detail.progress}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {STAGES.map(({ stage, label, color }) => {
          const stageProgress = progress[stage] || 0;
          const status = getStageStatus(stage);

          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStageIcon(stage)}
                  <span
                    className={`text-sm font-medium ${
                      status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    status === 'completed'
                      ? 'text-green-600'
                      : status === 'active'
                      ? 'text-blue-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {stageProgress}%
                </span>
              </div>
              <Progress
                value={stageProgress}
                className="h-2"
                indicatorClassName={status === 'completed' ? 'bg-green-500' : color}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default PipelineProgress;
