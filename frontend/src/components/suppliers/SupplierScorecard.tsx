import { BarChart3, Clock, Mail, Trophy, Database, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSupplierPerformance } from '@/hooks/useSuppliers';
import { t } from '@/i18n';

interface SupplierScorecardProps {
  supplierId: string;
}

function PercentBar({ value, label }: { value: number; label: string }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor =
    pct >= 80
      ? 'text-green-700 dark:text-green-400'
      : pct >= 50
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-red-700 dark:text-red-400';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-semibold ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ScorecardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SupplierScorecard({ supplierId }: SupplierScorecardProps) {
  const { data: perf, isLoading } = useSupplierPerformance(supplierId);
  const sc = t.suppliers.detail.scorecard;

  if (isLoading) {
    return <ScorecardSkeleton />;
  }

  if (!perf) {
    return null;
  }

  const hasAnyData =
    perf.rfqsSent > 0 ||
    perf.totalOffers > 0 ||
    perf.dataQualityScore != null;

  if (!hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {sc.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{sc.noData}</p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (hours: number | null) => {
    if (hours == null) return '-';
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${Math.round(hours)} ${sc.hours}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {sc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Percentage Bars */}
        <div className="space-y-4">
          {perf.responseRate != null && (
            <PercentBar value={perf.responseRate} label={sc.responseRate} />
          )}
          {perf.winRate != null && (
            <PercentBar value={perf.winRate} label={sc.winRate} />
          )}
          {perf.dataQualityScore != null && (
            <PercentBar
              value={perf.dataQualityScore / 100}
              label={sc.dataQuality}
            />
          )}
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {perf.rfqsSent > 0 && (
            <StatCard
              icon={Mail}
              label={sc.rfqsSent}
              value={perf.rfqsSent}
            />
          )}
          {perf.rfqsSent > 0 && (
            <StatCard
              icon={Mail}
              label={sc.rfqsResponded}
              value={perf.rfqsResponded}
            />
          )}
          {perf.avgResponseTime != null && (
            <StatCard
              icon={Clock}
              label={sc.avgResponseTime}
              value={formatTime(perf.avgResponseTime)}
            />
          )}
          {perf.totalOffers > 0 && (
            <StatCard
              icon={FileText}
              label={sc.totalOffers}
              value={perf.totalOffers}
            />
          )}
          {perf.acceptedCount > 0 && (
            <StatCard
              icon={Trophy}
              label={sc.accepted}
              value={perf.acceptedCount}
            />
          )}
          {perf.avgPrice != null && (
            <StatCard
              icon={Database}
              label={sc.avgPrice}
              value={`${perf.avgPrice.toFixed(2)}`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SupplierScorecard;
