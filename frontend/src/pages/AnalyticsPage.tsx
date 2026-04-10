import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Users, Star, DollarSign, Zap, Search } from 'lucide-react';
import { t, isEN } from '@/i18n';
import { motion } from 'framer-motion';
import apiClient from '@/services/api.client';

interface AnalyticsData {
  funnel: {
    totalCampaigns: number;
    totalUrlsCollected: number;
    totalUrlsProcessed: number;
    totalScreenerPassed: number;
    totalAuditorApproved: number;
    avgUrlsPerCampaign: number;
    avgScreenerPassRate: number;
    avgAuditorPassRate: number;
  };
  cost: {
    totalCost: number;
    avgCostPerCampaign: number;
    avgCostPerSupplier: number;
    totalGeminiCalls: number;
    totalSerperCalls: number;
  };
  quality: {
    avgCapabilityScore: number;
    avgTrustScore: number;
    totalSuppliers: number;
  };
  activityTimeline: Array<{ month: string; count: number }>;
  topCountries: Array<{ country: string; count: number }>;
}

function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/reports/analytics');
      return data;
    },
    staleTime: 60000,
  });
}

// Horizontal bar component using Tailwind divs
function HorizontalBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-36 shrink-0 truncate" title={label}>{label}</span>
      <div className="flex-1 h-7 bg-muted/30 rounded-md overflow-hidden relative">
        <motion.div
          className={`h-full rounded-md ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
          {value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// Vertical bar for timeline
function VerticalBar({ label, value, max, delay }: { label: string; value: number; max: number; delay: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className="text-xs font-medium tabular-nums">{value}</span>
      <div className="w-full h-32 bg-muted/30 rounded-md overflow-hidden flex items-end">
        <motion.div
          className="w-full bg-primary rounded-md"
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(pct, 4)}%` }}
          transition={{ duration: 0.5, delay, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, description }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-soft-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-primary opacity-80" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
        <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading) return <LoadingSkeleton />;

  if (!data || data.funnel.totalCampaigns === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.analytics.title}</h1>
          <p className="text-muted-foreground mt-1">{t.analytics.subtitle}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">{t.analytics.noData}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { funnel, cost, quality, activityTimeline, topCountries } = data;
  const maxTimeline = Math.max(...activityTimeline.map(a => a.count), 1);
  const maxCountry = topCountries.length > 0 ? topCountries[0].count : 1;

  // Format month labels
  const formatMonth = (m: string) => {
    const [year, month] = m.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(isEN ? 'en-US' : 'pl-PL', { month: 'short' });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.analytics.title}</h1>
        <p className="text-muted-foreground mt-1">{t.analytics.subtitle}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t.analytics.kpi.totalCampaigns}
          value={funnel.totalCampaigns}
          icon={Target}
          description={`${funnel.avgUrlsPerCampaign} avg URLs`}
        />
        <KpiCard
          title={t.analytics.kpi.totalSuppliers}
          value={quality.totalSuppliers}
          icon={Users}
          description={`${funnel.avgAuditorPassRate}% ${isEN ? 'pass rate' : 'przechodzi audyt'}`}
        />
        <KpiCard
          title={t.analytics.kpi.avgScore}
          value={quality.avgCapabilityScore > 0 ? quality.avgCapabilityScore.toFixed(1) : '--'}
          icon={Star}
          description={t.analytics.quality.capability}
        />
        <KpiCard
          title={t.analytics.kpi.totalCost}
          value={cost.totalCost > 0 ? `$${cost.totalCost.toFixed(2)}` : '--'}
          icon={DollarSign}
          description={cost.avgCostPerCampaign > 0 ? `$${cost.avgCostPerCampaign.toFixed(2)} / ${isEN ? 'campaign' : 'kampania'}` : undefined}
        />
      </div>

      {/* Main charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sourcing Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.analytics.funnel.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <HorizontalBar
              label={t.analytics.funnel.urlsCollected}
              value={funnel.totalUrlsCollected}
              max={funnel.totalUrlsCollected}
              color="bg-blue-500"
            />
            <HorizontalBar
              label={t.analytics.funnel.urlsProcessed}
              value={funnel.totalUrlsProcessed}
              max={funnel.totalUrlsCollected}
              color="bg-sky-500"
            />
            <HorizontalBar
              label={t.analytics.funnel.screenerPassed}
              value={funnel.totalScreenerPassed}
              max={funnel.totalUrlsCollected}
              color="bg-emerald-500"
            />
            <HorizontalBar
              label={t.analytics.funnel.auditorApproved}
              value={funnel.totalAuditorApproved}
              max={funnel.totalUrlsCollected}
              color="bg-green-600"
            />

            {/* Pass rate badges */}
            <div className="flex gap-3 pt-2">
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{isEN ? 'Screener rate' : 'Screener rate'}: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{funnel.avgScreenerPassRate}%</span>
              </div>
              <div className="rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-1.5 text-xs">
                <span className="text-muted-foreground">{isEN ? 'Auditor rate' : 'Auditor rate'}: </span>
                <span className="font-semibold text-green-600 dark:text-green-400">{funnel.avgAuditorPassRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.analytics.activity.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              {activityTimeline.map((item, i) => (
                <VerticalBar
                  key={item.month}
                  label={formatMonth(item.month)}
                  value={item.count}
                  max={maxTimeline}
                  delay={i * 0.08}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t.analytics.countries.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topCountries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t.analytics.noData}</p>
            ) : (
              topCountries.map((item, i) => (
                <HorizontalBar
                  key={item.country}
                  label={item.country}
                  value={item.count}
                  max={maxCountry}
                  color={i === 0 ? 'bg-primary' : i < 3 ? 'bg-primary/70' : 'bg-primary/40'}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Cost & Quality Cards */}
        <div className="space-y-6">
          {/* Cost breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.analytics.cost.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{t.analytics.cost.avgPerCampaign}</p>
                  <p className="text-xl font-bold mt-1">
                    {cost.avgCostPerCampaign > 0 ? `$${cost.avgCostPerCampaign.toFixed(2)}` : '--'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">{t.analytics.cost.avgPerSupplier}</p>
                  <p className="text-xl font-bold mt-1">
                    {cost.avgCostPerSupplier > 0 ? `$${cost.avgCostPerSupplier.toFixed(3)}` : '--'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.analytics.cost.geminiCalls}</p>
                    <p className="text-lg font-semibold">{cost.totalGeminiCalls.toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t.analytics.cost.serperCalls}</p>
                    <p className="text-lg font-semibold">{cost.totalSerperCalls.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.analytics.quality.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.analytics.quality.capability}</p>
                  <p className="text-3xl font-bold text-primary">
                    {quality.avgCapabilityScore > 0 ? quality.avgCapabilityScore.toFixed(1) : '--'}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/30 p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t.analytics.quality.trust}</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {quality.avgTrustScore > 0 ? quality.avgTrustScore.toFixed(1) : '--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
