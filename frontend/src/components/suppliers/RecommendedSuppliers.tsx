import { useState } from 'react';
import { Loader2, Star, Mail, ShieldCheck, Info, TrendingUp, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useRecommendedSuppliers } from '@/hooks/useSuppliers';
import { t } from '@/i18n';
import { normalizeCountry, getCountryFlag } from '@/utils/normalize-country';
import type { RecommendedSupplier } from '@/types/supplier.types';

interface RecommendedSuppliersProps {
  productName?: string;
  category?: string;
  country?: string;
  limit?: number;
  /** Compact mode for inline hints (e.g. wizard) */
  compact?: boolean;
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
    </div>
  );
}

function ScoreBreakdownTooltip({ supplier }: { supplier: RecommendedSupplier }) {
  const b = supplier.scoreBreakdown;
  const rec = t.dashboard.recommendations;
  const rows = [
    { label: rec.analysisScore, value: b.analysisScore, weight: '40%' },
    { label: rec.responseRate, value: b.responseRate, weight: '30%' },
    { label: rec.dataQuality, value: b.dataQuality, weight: '20%' },
    { label: rec.battleTested, value: b.battleTested, weight: '10%' },
  ];

  return (
    <div className="space-y-2 p-1 min-w-[200px]">
      <p className="font-medium text-sm">{rec.whyRecommended}</p>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">{r.label} ({r.weight})</span>
          <span className="font-medium tabular-nums">{r.value}%</span>
        </div>
      ))}
      {b.relevanceBonus > 0 && (
        <div className="flex items-center justify-between gap-3 text-xs border-t pt-1">
          <span className="text-muted-foreground">{rec.relevanceBonus}</span>
          <span className="font-medium text-green-600">+{b.relevanceBonus}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 text-xs border-t pt-1 font-semibold">
        <span>{rec.matchScore}</span>
        <span>{supplier.matchScore}%</span>
      </div>
    </div>
  );
}

function RecommendationCard({ supplier, compact }: { supplier: RecommendedSupplier; compact?: boolean }) {
  const rec = t.dashboard.recommendations;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-muted-foreground';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{supplier.name || supplier.domain}</p>
            {supplier.isVerified && (
              <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {getCountryFlag(supplier.country)} {normalizeCountry(supplier.country)}
            {supplier.specialization && ` - ${supplier.specialization}`}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`shrink-0 font-bold ${getScoreColor(supplier.matchScore)}`}>
                {supplier.matchScore}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <ScoreBreakdownTooltip supplier={supplier} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <Card className="group hover:shadow-soft-xl transition-all duration-300 hover:-translate-y-0.5 flex flex-col h-full">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        {/* Header: name + score */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm truncate">{supplier.name || supplier.domain}</h4>
              {supplier.isVerified && (
                <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getCountryFlag(supplier.country)} {normalizeCountry(supplier.country)}
              {supplier.city ? `, ${supplier.city}` : ''}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 cursor-help shrink-0">
                  <Badge
                    variant={supplier.matchScore >= 75 ? 'default' : supplier.matchScore >= 50 ? 'secondary' : 'outline'}
                    className="font-bold text-sm px-2.5 py-0.5"
                  >
                    {supplier.matchScore}%
                  </Badge>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <ScoreBreakdownTooltip supplier={supplier} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Specialization */}
        {supplier.specialization && (
          <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
            {supplier.specialization}
          </p>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap gap-1.5">
          {supplier.hasEmail && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700">
              <Mail className="mr-1 h-2.5 w-2.5" />
              {rec.hasEmail}
            </Badge>
          )}
          {supplier.stats.campaignsCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <TrendingUp className="mr-1 h-2.5 w-2.5" />
              {supplier.stats.campaignsCount} {rec.campaigns}
            </Badge>
          )}
        </div>

        {/* Response rate bar */}
        {supplier.stats.responseRate != null && (
          <div className="mt-auto pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{rec.responseRate}</span>
            </div>
            <ScoreBar value={Math.round(supplier.stats.responseRate * 100)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RecommendedSuppliers({
  productName,
  category,
  country,
  limit = 6,
  compact = false,
}: RecommendedSuppliersProps) {
  const { data, isLoading } = useRecommendedSuppliers(
    { productName, category, country, limit },
    !!(productName || category),
  );
  const [showAll, setShowAll] = useState(false);

  const rec = t.dashboard.recommendations;

  // Don't render if no search criteria
  if (!productName && !category) return null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        {rec.loading}
      </div>
    );
  }

  const recommendations = data?.recommendations || [];
  if (recommendations.length === 0) return null;

  const displayItems = showAll ? recommendations : recommendations.slice(0, compact ? 3 : 6);

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-medium">{rec.similarFound}</p>
          <Badge variant="secondary" className="text-xs">{recommendations.length}</Badge>
        </div>
        <div className="space-y-1.5">
          {displayItems.map((s) => (
            <RecommendationCard key={s.id} supplier={s} compact />
          ))}
        </div>
        {recommendations.length > 3 && !showAll && (
          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowAll(true)}>
            +{recommendations.length - 3}
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">{rec.title}</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">{rec.subtitle}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayItems.map((s) => (
            <RecommendationCard key={s.id} supplier={s} />
          ))}
        </div>
        {recommendations.length > 6 && !showAll && (
          <div className="mt-3 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
              +{recommendations.length - 6}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecommendedSuppliers;
