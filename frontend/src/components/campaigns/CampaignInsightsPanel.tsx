import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Globe2,
  Tag,
  DollarSign,
  ShieldCheck,
  Mail,
  Loader2,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import apiClient from '@/services/api.client';

interface InsightsResponse {
  campaignId: string;
  totalSuppliers: number;
  certifiedCount: number;
  costs: {
    gemini: { calls: number; tokens: number; estimatedUsd: number };
    serper: { calls: number; estimatedUsd: number };
    totalUsd: number;
    errorRate: number;
  };
  funnel: {
    urlsCollected: number;
    urlsProcessed: number;
    screenerPassed: number;
    screenerFallback: number;
    auditorApproved: number;
    auditorRejected: number;
    auditorNeedsReview: number;
    screenerRate: number;
    auditorRate: number;
  } | null;
  quality: {
    high: number;
    medium: number;
    low: number;
    unscored: number;
  };
  topCountries: Array<{ country: string; count: number }>;
  topCategories: Array<{ category: string; count: number }>;
  offers: {
    total: number;
    submitted: number;
    viewed: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  generatedAt: string;
}

interface Props {
  campaignId: string;
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function usd(n: number): string {
  if (n < 0.01) return '< $0.01';
  return `$${n.toFixed(2)}`;
}

function csvCell(v: string | number | null | undefined): string {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildInsightsCsv(data: InsightsResponse): string {
  const rows: string[][] = [];
  rows.push(['Section', 'Metric', 'Value']);
  rows.push(['Summary', 'Total suppliers', data.totalSuppliers]);
  rows.push(['Summary', 'Certified', data.certifiedCount]);
  rows.push(['Summary', 'Generated at', data.generatedAt]);

  if (data.funnel) {
    rows.push(['Funnel', 'URLs collected', data.funnel.urlsCollected]);
    rows.push(['Funnel', 'URLs processed', data.funnel.urlsProcessed]);
    rows.push(['Funnel', 'Screener passed', data.funnel.screenerPassed]);
    rows.push(['Funnel', 'Screener fallback', data.funnel.screenerFallback]);
    rows.push(['Funnel', 'Auditor approved', data.funnel.auditorApproved]);
    rows.push(['Funnel', 'Auditor rejected', data.funnel.auditorRejected]);
    rows.push(['Funnel', 'Auditor needs review', data.funnel.auditorNeedsReview]);
    rows.push(['Funnel', 'Screener conversion rate', data.funnel.screenerRate.toFixed(4)]);
    rows.push(['Funnel', 'Auditor approval rate', data.funnel.auditorRate.toFixed(4)]);
  }

  rows.push(['Costs', 'Gemini calls', data.costs.gemini.calls]);
  rows.push(['Costs', 'Gemini tokens', data.costs.gemini.tokens]);
  rows.push(['Costs', 'Gemini USD', data.costs.gemini.estimatedUsd.toFixed(4)]);
  rows.push(['Costs', 'Serper calls', data.costs.serper.calls]);
  rows.push(['Costs', 'Serper USD', data.costs.serper.estimatedUsd.toFixed(4)]);
  rows.push(['Costs', 'Total USD', data.costs.totalUsd.toFixed(4)]);
  rows.push(['Costs', 'Error rate', data.costs.errorRate.toFixed(4)]);

  rows.push(['Quality', 'High (>=80)', data.quality.high]);
  rows.push(['Quality', 'Medium (50-79)', data.quality.medium]);
  rows.push(['Quality', 'Low (<50)', data.quality.low]);
  rows.push(['Quality', 'Unscored', data.quality.unscored]);

  for (const c of data.topCountries) {
    rows.push(['Country', c.country, c.count]);
  }
  for (const c of data.topCategories) {
    rows.push(['Category', c.category, c.count]);
  }

  rows.push(['Offers', 'Total', data.offers.total]);
  rows.push(['Offers', 'Submitted', data.offers.submitted]);
  rows.push(['Offers', 'Viewed', data.offers.viewed]);
  rows.push(['Offers', 'Pending', data.offers.pending]);
  rows.push(['Offers', 'Accepted', data.offers.accepted]);
  rows.push(['Offers', 'Rejected', data.offers.rejected]);

  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function CampaignInsightsPanel({ campaignId }: Props) {
  const { data, isLoading, error } = useQuery<InsightsResponse | null>({
    queryKey: ['campaign-insights', campaignId],
    queryFn: async () => {
      const { data } = await apiClient.get<InsightsResponse>(
        `/reports/campaign/${campaignId}/insights`,
      );
      return data;
    },
    enabled: !!campaignId,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Campaign Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) return null;

  const { costs, funnel, quality, topCountries, topCategories, offers, certifiedCount, totalSuppliers } = data;

  const certifiedPct = totalSuppliers > 0 ? certifiedCount / totalSuppliers : 0;
  const offerRate = totalSuppliers > 0 ? offers.submitted / totalSuppliers : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Campaign Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] bg-slate-50">
              {data.totalSuppliers} dostawców
            </Badge>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => {
                const csv = buildInsightsCsv(data);
                downloadCsv(`procurea-insights-${campaignId}.csv`, csv);
              }}
            >
              <Download className="h-3 w-3 mr-1" />
              Eksport CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Funnel */}
        {funnel && (funnel.urlsCollected > 0 || funnel.screenerPassed > 0) && (
          <section>
            <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Lejek konwersji
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <FunnelStep label="URL zebrane" value={funnel.urlsCollected} />
              <FunnelStep label="URL zbadane" value={funnel.urlsProcessed} />
              <FunnelStep
                label="Screening przeszło"
                value={funnel.screenerPassed}
                hint={funnel.urlsProcessed > 0 ? pct(funnel.screenerRate) : undefined}
              />
              <FunnelStep
                label="Audytor zatwierdził"
                value={funnel.auditorApproved}
                hint={funnel.screenerPassed > 0 ? pct(funnel.auditorRate) : undefined}
              />
            </div>
          </section>
        )}

        {/* Costs */}
        {(costs.gemini.calls > 0 || costs.serper.calls > 0) && (
          <section>
            <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Koszty AI + search
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Gemini</div>
                <div className="font-semibold">{costs.gemini.calls} wywołań</div>
                <div className="text-xs">{usd(costs.gemini.estimatedUsd)}</div>
              </div>
              <div className="rounded-md border p-2">
                <div className="text-xs text-muted-foreground">Serper.dev</div>
                <div className="font-semibold">{costs.serper.calls} zapytań</div>
                <div className="text-xs">{usd(costs.serper.estimatedUsd)}</div>
              </div>
              <div className="rounded-md border p-2 bg-slate-50">
                <div className="text-xs text-muted-foreground">Razem</div>
                <div className="font-semibold">{usd(costs.totalUsd)}</div>
                {costs.errorRate > 0 && (
                  <div className="text-xs text-rose-600">
                    błędy: {pct(costs.errorRate)}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Quality distribution */}
        {totalSuppliers > 0 && (
          <section>
            <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Dystrybucja quality score
            </div>
            <QualityBar quality={quality} total={totalSuppliers} />
          </section>
        )}

        {/* Top countries + categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topCountries.length > 0 && (
            <section>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                Top kraje
              </div>
              <ul className="space-y-1 text-sm">
                {topCountries.map((c) => (
                  <li key={c.country} className="flex justify-between">
                    <span>{c.country}</span>
                    <span className="font-mono text-muted-foreground">{c.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {topCategories.length > 0 && (
            <section>
              <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Top specjalizacje
              </div>
              <ul className="space-y-1 text-sm">
                {topCategories.map((c) => (
                  <li key={c.category} className="flex justify-between gap-2">
                    <span className="truncate">{c.category}</span>
                    <span className="font-mono text-muted-foreground shrink-0">
                      {c.count}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Engagement footer */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-3 border-t text-sm">
          <Stat
            icon={<ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
            label="Z certyfikatem"
            value={`${certifiedCount} / ${totalSuppliers}`}
            hint={totalSuppliers > 0 ? pct(certifiedPct) : undefined}
          />
          <Stat
            icon={<Mail className="h-3.5 w-3.5 text-blue-600" />}
            label="Odpowiedzi"
            value={`${offers.submitted} / ${totalSuppliers}`}
            hint={totalSuppliers > 0 ? pct(offerRate) : undefined}
          />
          <Stat
            icon={<Sparkles className="h-3.5 w-3.5 text-amber-600" />}
            label="Zaakceptowane"
            value={String(offers.accepted)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelStep({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-md border p-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-emerald-600">{hint}</div>}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground truncate">{label}</div>
        <div className="font-semibold tabular-nums">
          {value}
          {hint && <span className="text-xs text-muted-foreground ml-1">({hint})</span>}
        </div>
      </div>
    </div>
  );
}

function QualityBar({
  quality,
  total,
}: {
  quality: { high: number; medium: number; low: number; unscored: number };
  total: number;
}) {
  const high = (quality.high / total) * 100;
  const med = (quality.medium / total) * 100;
  const low = (quality.low / total) * 100;
  const unscored = (quality.unscored / total) * 100;

  return (
    <>
      <div className="h-2 w-full rounded-full overflow-hidden bg-slate-100 flex">
        {high > 0 && <div style={{ width: `${high}%` }} className="bg-emerald-500" title={`High (≥80): ${quality.high}`} />}
        {med > 0 && <div style={{ width: `${med}%` }} className="bg-amber-400" title={`Medium (50-79): ${quality.medium}`} />}
        {low > 0 && <div style={{ width: `${low}%` }} className="bg-rose-400" title={`Low (<50): ${quality.low}`} />}
        {unscored > 0 && <div style={{ width: `${unscored}%` }} className="bg-slate-300" title={`Unscored: ${quality.unscored}`} />}
      </div>
      <div className="flex gap-3 mt-2 text-xs flex-wrap">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> High: {quality.high}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-amber-400" /> Medium: {quality.medium}
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-sm bg-rose-400" /> Low: {quality.low}
        </span>
        {quality.unscored > 0 && (
          <span className="flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-slate-300" /> Unscored: {quality.unscored}
          </span>
        )}
      </div>
    </>
  );
}

export default CampaignInsightsPanel;
