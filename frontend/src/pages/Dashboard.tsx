import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Status } from '@/components/ui/status';
import {
  Plus, ArrowRight, History, Copy, Upload, Target, AlertTriangle,
  ClipboardCheck, Timer, CircleAlert, Check, Loader2,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { RecommendedSuppliers } from '@/components/suppliers/RecommendedSuppliers';
import { CloneCampaignDialog } from '@/components/campaigns/CloneCampaignDialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useDashboardStats, useDashboardActivity } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { t, isEN } from '@/i18n';
import { analytics, startHesitationTracker } from '@/lib/analytics';
import { cn, formatNumber, formatRelative, formatTime } from '@/lib/utils';
import profileService from '@/services/profile.service';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activity } = useDashboardActivity(8);

  const isFullPlan = user?.plan === 'full';
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const hasCredits = user?.plan === 'unlimited' || (user?.searchCredits ?? 0) > 0;

  const showTrialEndedPopup =
    user?.trialCreditsUsed === true &&
    (user?.searchCredits ?? 0) <= 0 &&
    user?.plan === 'research' &&
    !user?.trialEndedAcknowledgedAt;

  const acknowledgeTrial = async () => {
    try {
      await profileService.acknowledgeTrialEnded();
      if (user) setUser({ ...user, trialEndedAcknowledgedAt: new Date().toISOString() });
    } catch {
      // non-critical; popup will reappear on next refresh
    }
  };

  const handleCreateCampaign = () => {
    if (!hasCredits) { setShowTopUpDialog(true); return; }
    analytics.dashboardCtaClick();
    navigate('/campaigns/new');
  };

  const handleCloneClick = () => {
    if ((stats?.campaigns.total ?? 0) === 0) return;
    setShowCloneDialog(true);
  };

  useEffect(() => {
    analytics.dashboardView();
    return startHesitationTracker('dashboard', 30000);
  }, []);

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const greeting = useGreeting();
  const dateLabel = useMemo(() => formatDateLabel(isEN), []);

  const recentCampaigns = (campaigns ?? []).slice(0, 5);
  const attentionItems = buildAttentionItems(stats, navigate);

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule">
        <div>
          <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold">
            {greeting},{' '}
            <em className="font-serif italic font-normal text-brand">
              {firstName}
            </em>
            .
          </h1>
          <div className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums">
            {dateLabel} · {stats?.campaigns.active ?? 0} {isEN ? 'active' : 'aktywnych'} · {formatNumber(stats?.suppliers.total ?? 0)} {isEN ? 'suppliers tracked' : 'dostawców'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ds-ghost"
            size="ds"
            onClick={() => navigate('/campaigns?tab=completed')}
          >
            <History className="h-3.5 w-3.5" />
            {isEN ? 'History' : 'Historia'}
          </Button>
          <Button
            variant="cta"
            size="ds"
            onClick={handleCreateCampaign}
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            {isEN ? 'New campaign' : 'Nowa kampania'}
          </Button>
        </div>
      </div>

      {/* Needs attention — rendered only if there's something to act on */}
      {attentionItems.length > 0 && (
        <section>
          <div className="label-mono mb-3">{isEN ? 'Needs your attention' : 'Wymaga uwagi'}</div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {attentionItems.map((item) => (
              <AttentionTile key={item.id} {...item} />
            ))}
          </div>
        </section>
      )}

      {/* First-run guide — visible only for brand-new users so the dashboard isn't empty. */}
      {!statsLoading && stats && stats.campaigns.total === 0 && (
        <OnboardingGuide onStart={handleCreateCampaign} isFullPlan={isFullPlan} />
      )}

      {/* KPI row — real data only */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statsLoading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))
        ) : (
          <>
            <KpiTile
              label={isEN ? 'Active campaigns' : 'Aktywne kampanie'}
              value={stats?.campaigns.active ?? 0}
              delta={stats && stats.campaigns.total > 0
                ? `${stats.campaigns.total} ${isEN ? 'total' : 'łącznie'}`
                : undefined}
              deltaTone="neutral"
              onClick={() => navigate('/campaigns')}
            />
            <KpiTile
              label={isEN ? 'Suppliers scored' : 'Dostawców ocenionych'}
              value={stats?.suppliers.total ?? 0}
              delta={stats && stats.suppliers.last30d > 0
                ? `+${formatNumber(stats.suppliers.last30d)}`
                : undefined}
              deltaLabel={isEN ? 'last 30d' : 'ostatnie 30 dni'}
              deltaTone="good"
              onClick={() => navigate('/suppliers')}
            />
            <KpiTile
              label={isEN ? 'Shortlisted offers' : 'Shortlistowane oferty'}
              value={stats?.suppliers.shortlisted ?? 0}
              delta={stats && stats.suppliers.shortlisted > 0 ? (isEN ? 'ready to compare' : 'gotowe do porównania') : undefined}
              deltaTone="neutral"
              onClick={() => navigate('/rfqs')}
            />
            {isFullPlan ? (
              <KpiTile
                label={isEN ? 'Pending offers' : 'Oczekujące oferty'}
                value={stats?.offers.pending ?? 0}
                delta={stats && stats.offers.pending > 0 ? (isEN ? 'action needed' : 'do akcji') : undefined}
                deltaTone={stats && stats.offers.pending > 0 ? 'warn' : 'neutral'}
                onClick={() => navigate('/rfqs')}
              />
            ) : (
              <KpiTile
                label={isEN ? 'Avg match · top 10%' : 'Śr. dopasowanie · top 10%'}
                value={stats?.suppliers.avgMatchTopDecile != null
                  ? `${stats.suppliers.avgMatchTopDecile}%`
                  : '—'}
                delta={isEN ? 'across scored suppliers' : 'wśród ocenionych'}
                deltaTone="neutral"
              />
            )}
          </>
        )}
      </div>

      {/* Quick start */}
      <section>
        <div className="label-mono mb-3">{isEN ? 'Quick start' : 'Szybki start'}</div>
        <div className="grid gap-3 md:grid-cols-3">
          <QuickStartCard
            variant="cta"
            icon={<Plus className="h-4 w-4" strokeWidth={2} />}
            title={isEN ? 'Start new campaign' : 'Uruchom kampanię'}
            desc={isEN
              ? 'Describe what you need. AI drafts the spec, pulls the pool, runs analysis.'
              : 'Opisz czego potrzebujesz. AI przygotuje specyfikację, pulę dostawców i analizę.'}
            action={isEN ? 'Launch wizard' : 'Uruchom wizarda'}
            onClick={handleCreateCampaign}
          />
          <QuickStartCard
            icon={<Copy className="h-4 w-4" strokeWidth={1.5} />}
            title={isEN ? 'Clone past campaign' : 'Skopiuj kampanię'}
            desc={isEN
              ? 'Re-run a completed sourcing job with the same search criteria.'
              : 'Uruchom ponownie zakończoną kampanię z tymi samymi kryteriami.'}
            action={(stats?.campaigns.total ?? 0) > 0
              ? (isEN ? `Pick from ${stats?.campaigns.total}` : `Wybierz z ${stats?.campaigns.total}`)
              : (isEN ? 'Create first to clone' : 'Najpierw utwórz kampanię')
            }
            disabled={(stats?.campaigns.total ?? 0) === 0}
            onClick={handleCloneClick}
          />
          <QuickStartCard
            icon={<Upload className="h-4 w-4" strokeWidth={1.5} />}
            title={isEN ? 'Upload spec document' : 'Wgraj specyfikację'}
            desc={isEN
              ? 'Start the wizard with your PDF / DWG / BOM attached from step 1.'
              : 'Uruchom wizarda z załączonym plikiem PDF / DWG / BOM już od kroku 1.'}
            action={isEN ? 'Open wizard' : 'Otwórz wizarda'}
            onClick={() => navigate('/campaigns/new')}
          />
        </div>
      </section>

      {/* Main grid — campaigns + recommendations */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* LEFT — recent campaigns */}
        <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
          <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
            <h3 className="text-[14px] font-semibold tracking-[-0.015em] text-ink">
              {isEN ? 'Recent campaigns' : 'Ostatnie kampanie'}
            </h3>
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="ml-auto font-mono text-[10.5px] tracking-[0.04em] text-brand hover:underline"
            >
              {isEN ? `See all ${stats?.campaigns.total ?? 0}` : `Zobacz wszystkie ${stats?.campaigns.total ?? 0}`} →
            </button>
          </header>

          {!campaigns && campaignsLoading ? (
            <div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-[1fr_140px_120px_90px_32px] gap-3.5 items-center px-5 py-3 border-b border-rule last:border-0">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-14" />
                  <Skeleton className="h-3 w-3" />
                </div>
              ))}
            </div>
          ) : recentCampaigns.length === 0 ? (
            <EmptyCampaigns onCreate={handleCreateCampaign} />
          ) : (
            <div>
              {recentCampaigns.map((campaign) => (
                <CampaignRow
                  key={campaign.id}
                  campaign={campaign}
                  onOpen={() => navigate(`/campaigns/${campaign.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — recommended + activity */}
        <div className="flex flex-col gap-4">
          {(() => {
            if (!campaigns || campaigns.length === 0) return null;
            const latest = [...campaigns]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .find(c => c.rfqRequest?.productName);
            if (!latest?.rfqRequest?.productName) return null;
            return (
              <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
                <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
                  <div className="min-w-0">
                    <h3 className="text-[14px] font-semibold tracking-[-0.015em] truncate">
                      {isEN ? 'Recommended for' : 'Polecani dla'}: {latest.rfqRequest.productName}
                    </h3>
                    <div className="font-mono text-[10.5px] text-muted-ink-2 truncate">
                      {isEN ? 'from' : 'z'} {latest.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/suppliers')}
                    className="ml-auto font-mono text-[10.5px] tracking-[0.04em] text-brand hover:underline shrink-0"
                  >
                    {isEN ? 'Open all' : 'Otwórz wszystkie'} →
                  </button>
                </header>
                <div className="p-3.5">
                  <RecommendedSuppliers
                    productName={latest.rfqRequest.productName}
                    category={latest.rfqRequest.category}
                  />
                </div>
              </div>
            );
          })()}

          {/* Real activity stream */}
          <ActivityCard events={activity ?? []} onOpen={(href) => navigate(href)} />
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        open={showTrialEndedPopup}
        onOpenChange={(open) => {
          if (!open) void acknowledgeTrial();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.billing.trial.ended.title}</DialogTitle>
            <DialogDescription>{t.settings.billing.trial.ended.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => void acknowledgeTrial()}>
              {t.settings.billing.trial.ended.dismiss}
            </Button>
            <Button onClick={() => {
              void acknowledgeTrial();
              useUIStore.getState().openBillingModal();
            }}>
              {t.settings.billing.trial.ended.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.billing.topUp.title}</DialogTitle>
            <DialogDescription>{t.settings.billing.topUp.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={() => useUIStore.getState().openBillingModal()}>
              {t.settings.billing.topUp.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CloneCampaignDialog
        open={showCloneDialog}
        onOpenChange={setShowCloneDialog}
        campaigns={campaigns ?? []}
      />
    </div>
  );
}

/* ──────────── Onboarding (first-run) ──────────── */

function OnboardingGuide({ onStart, isFullPlan }: { onStart: () => void; isFullPlan: boolean }) {
  const steps: Array<{ index: number; title: string; body: string }> = [
    {
      index: 1,
      title: isEN ? 'Describe what you source' : 'Opisz czego szukasz',
      body: isEN
        ? 'Open the wizard, drop a PDF spec or type a product description. AI drafts the sourcing criteria and picks target markets.'
        : 'Uruchom wizarda, wgraj PDF lub opisz produkt. AI rozpisze kryteria sourcingu i wskaże rynki.',
    },
    {
      index: 2,
      title: isEN ? 'AI ranks suppliers' : 'AI oceni dostawców',
      body: isEN
        ? 'The pipeline scrapes ~500 candidates, screens them with Gemini, and returns 20–50 scored matches in ~2 minutes.'
        : 'Pipeline przeskanuje ~500 kandydatów, przesieje przez Gemini i zwróci 20–50 ocenionych dostawców w ~2 minuty.',
    },
    isFullPlan
      ? {
          index: 3,
          title: isEN ? 'Send RFQs & compare offers' : 'Wyślij RFQ i porównaj oferty',
          body: isEN
            ? 'One click sends RFQs; the supplier portal collects structured offers you can weigh and convert to a contract.'
            : 'Jeden klik wysyła RFQ; portal dostawcy zbiera ustrukturyzowane oferty, które możesz zważyć i zamienić w kontrakt.',
        }
      : {
          index: 3,
          title: isEN ? 'Review and export' : 'Przejrzyj i wyeksportuj',
          body: isEN
            ? 'Shortlist the winners and export to CSV. Upgrade to Full plan later to send RFQs and compare offers in-app.'
            : 'Wybierz finalistów i wyeksportuj do CSV. Plan Full odblokowuje wysyłkę RFQ i porównywarkę ofert w aplikacji.',
        },
  ];

  return (
    <section className="bg-gradient-to-br from-brand to-brand-2 text-white rounded-[12px] p-6 overflow-hidden relative">
      <span
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 100% 0%, rgba(244,200,66,0.3), transparent 55%)' }}
      />
      <div className="relative">
        <div className="label-mono text-white/70 mb-2">
          {isEN ? 'Welcome to Procurea' : 'Witaj w Procurea'}
        </div>
        <h2 className="text-[22px] font-bold tracking-[-0.02em] leading-[1.2] mb-1">
          {isEN ? 'Run your first sourcing campaign in 3 steps' : 'Uruchom pierwszą kampanię sourcingu w 3 krokach'}
        </h2>
        <p className="text-[13.5px] text-white/75 leading-[1.5] mb-5 max-w-2xl">
          {isEN
            ? 'The AI does the heavy lifting — you stay in the driver\'s seat. Start with a description, review what comes back, send RFQs when you\'re happy.'
            : 'AI robi żmudną robotę, Ty trzymasz kierownicę. Zacznij od opisu, przejrzyj wyniki, wyślij RFQ gdy będziesz gotowy.'}
        </p>

        <div className="grid gap-4 md:grid-cols-3 mb-5">
          {steps.map((step) => (
            <div
              key={step.index}
              className="rounded-[10px] bg-white/10 border border-white/20 backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-cta text-cta-ink font-mono text-[12px] font-bold">
                  {step.index}
                </span>
                <div className="font-semibold text-[13.5px] text-white">{step.title}</div>
              </div>
              <p className="text-[12.5px] leading-[1.5] text-white/75">{step.body}</p>
            </div>
          ))}
        </div>

        <Button variant="cta" size="ds" onClick={onStart}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {isEN ? 'Start my first campaign' : 'Uruchom pierwszą kampanię'}
        </Button>
      </div>
    </section>
  );
}

/* ──────────── Needs attention ──────────── */

type AttentionTileProps = {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description?: string;
  tone: 'warn' | 'bad' | 'info';
  onClick?: () => void;
};

function AttentionTile({ icon, label, value, description, tone, onClick }: AttentionTileProps) {
  const toneBorder =
    tone === 'bad' ? 'border-bad-border bg-bad-soft' :
    tone === 'warn' ? 'border-warn-border bg-warn-soft' :
    'border-info-border bg-info-soft';
  const toneText =
    tone === 'bad' ? 'text-bad' :
    tone === 'warn' ? 'text-warn' :
    'text-info';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative text-left rounded-[10px] border px-4 py-3 transition-all duration-150',
        toneBorder,
        onClick && 'cursor-pointer hover:shadow-ds-sm'
      )}
    >
      <div className="flex items-center gap-2">
        <span className={toneText}>{icon}</span>
        <div className="label-mono">{label}</div>
      </div>
      <div className="font-mono text-[24px] font-bold tracking-[-0.03em] mt-0.5 tabular-nums leading-none">
        {typeof value === 'number' ? formatNumber(value) : value}
      </div>
      {description && (
        <div className="mt-1 font-mono text-[11px] text-muted-ink truncate">
          {description}
        </div>
      )}
    </button>
  );
}

function buildAttentionItems(
  stats: ReturnType<typeof useDashboardStats>['data'],
  navigate: (path: string) => void,
): AttentionTileProps[] {
  if (!stats) return [];
  const items: AttentionTileProps[] = [];

  if (stats.attention.pendingApprovals > 0) {
    items.push({
      id: 'approvals',
      icon: <ClipboardCheck className="h-3.5 w-3.5" strokeWidth={1.5} />,
      label: isEN ? 'Approvals' : 'Akceptacje',
      value: stats.attention.pendingApprovals,
      description: isEN ? 'waiting for your review' : 'czeka na Twoją decyzję',
      tone: 'warn',
      onClick: () => navigate('/approvals'),
    });
  }

  if (stats.attention.stuckCampaigns.length > 0) {
    const first = stats.attention.stuckCampaigns[0];
    items.push({
      id: 'stuck',
      icon: <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />,
      label: isEN ? 'Stuck campaigns' : 'Zacięte kampanie',
      value: stats.attention.stuckCampaigns.length,
      description: first ? `${first.name} — ${first.stage}` : undefined,
      tone: 'bad',
      onClick: () => navigate(first ? `/campaigns/${first.id}` : '/campaigns'),
    });
  }

  if (stats.offers.expiringSoon > 0) {
    items.push({
      id: 'expiring',
      icon: <Timer className="h-3.5 w-3.5" strokeWidth={1.5} />,
      label: isEN ? 'Offers expiring' : 'Oferty wygasają',
      value: stats.offers.expiringSoon,
      description: isEN ? 'within 7 days' : 'w ciągu 7 dni',
      tone: 'warn',
      onClick: () => navigate('/rfqs'),
    });
  }

  if (stats.attention.zeroSupplierCampaigns7d > 0) {
    items.push({
      id: 'zero-suppliers',
      icon: <CircleAlert className="h-3.5 w-3.5" strokeWidth={1.5} />,
      label: isEN ? 'Empty campaigns' : 'Puste kampanie',
      value: stats.attention.zeroSupplierCampaigns7d,
      description: isEN ? 'last 7 days · zero suppliers' : 'ostatnie 7 dni · brak dostawców',
      tone: 'warn',
      onClick: () => navigate('/campaigns?tab=completed'),
    });
  }

  return items;
}

/* ──────────── KPI ──────────── */

type DeltaTone = 'good' | 'warn' | 'bad' | 'neutral';

function KpiTile({
  label, value, delta, deltaLabel, deltaTone = 'neutral', onClick,
}: {
  label: string;
  value: number | string;
  delta?: string;
  deltaLabel?: string;
  deltaTone?: DeltaTone;
  onClick?: () => void;
}) {
  const formatted = typeof value === 'number' ? formatNumber(value) : value;
  const toneClass =
    deltaTone === 'good' ? 'text-good' :
    deltaTone === 'warn' ? 'text-warn' :
    deltaTone === 'bad'  ? 'text-bad'  : 'text-muted-ink';

  return (
    <button
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'relative text-left rounded-[10px] border border-rule bg-surface px-4 py-3.5 transition-all duration-150',
        onClick && 'cursor-pointer hover:border-rule-3 hover:shadow-ds-sm'
      )}
    >
      <div className="label-mono">{label}</div>
      <div className="font-mono text-[28px] font-bold tracking-[-0.03em] mt-0.5 tabular-nums leading-none">
        {formatted}
      </div>
      {delta && (
        <div className="mt-1.5 font-mono text-[11.5px] text-muted-ink">
          <span className={toneClass}>{delta}</span>
          {deltaLabel && <span> {deltaLabel}</span>}
        </div>
      )}
    </button>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-[10px] border border-rule bg-surface px-4 py-3.5">
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-7 w-16 mb-1.5" />
      <Skeleton className="h-2.5 w-20" />
    </div>
  );
}

/* ──────────── Quick start ──────────── */

function QuickStartCard({
  icon, title, desc, action, onClick, variant, disabled,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  onClick?: () => void;
  variant?: 'cta';
  disabled?: boolean;
}) {
  const isCta = variant === 'cta';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative text-left overflow-hidden rounded-[10px] border p-4 min-h-[128px] flex flex-col gap-1.5 transition-all duration-150',
        isCta
          ? 'bg-gradient-to-br from-brand to-brand-2 text-white border-brand-2 hover:shadow-ds-md'
          : 'bg-surface border-rule hover:border-rule-3 hover:shadow-ds-sm',
        disabled && 'opacity-55 cursor-not-allowed',
      )}
    >
      {isCta && (
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at 100% 0%, rgba(244,200,66,0.35), transparent 60%)' }}
        />
      )}
      <div
        className={cn(
          'relative w-8 h-8 rounded-[6px] grid place-items-center',
          isCta ? 'bg-cta text-cta-ink' : 'bg-brand-softer text-brand'
        )}
      >
        {icon}
      </div>
      <div className="relative text-[14px] font-semibold tracking-[-0.01em]">
        {title}
      </div>
      <div className={cn(
        'relative text-[12px] leading-[1.4] line-clamp-2',
        isCta ? 'text-white/70' : 'text-muted-ink'
      )}>
        {desc}
      </div>
      <div className={cn(
        'relative mt-auto font-mono text-[11px] flex items-center gap-1 transition-transform group-hover:translate-x-0.5',
        isCta ? 'text-cta' : 'text-brand'
      )}>
        {action}
        <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}

/* ──────────── Campaign row ──────────── */

function CampaignRow({
  campaign, onOpen,
}: {
  campaign: {
    id: string;
    name: string;
    status: string;
    suppliersFound?: number;
    progress?: number;
    createdAt: string | Date;
  };
  onOpen: () => void;
}) {
  const isRunning = campaign.status === 'RUNNING';
  const isDone = campaign.status === 'COMPLETED';
  const isErr = campaign.status === 'ERROR';
  const progress = Math.max(0, Math.min(100, campaign.progress ?? (isDone ? 100 : isRunning ? 50 : 0)));
  const suppliers = campaign.suppliersFound ?? 0;

  const state: 'live' | 'done' | 'err' | 'idle' =
    isErr ? 'err' : isDone ? 'done' : isRunning ? 'live' : 'idle';
  const stateLabel = isErr
    ? (isEN ? 'Error' : 'Błąd')
    : isDone
      ? (isEN ? 'Done' : 'Ukończone')
      : isRunning
        ? (isEN ? 'Running' : 'W toku')
        : (isEN ? 'Queued' : 'W kolejce');

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full grid grid-cols-[1fr_140px_120px_auto_32px] gap-3.5 items-center px-5 py-3 border-b border-rule last:border-0 hover:bg-surface-2 transition-colors text-left"
    >
      <div className="min-w-0">
        <div className="text-[13.5px] font-semibold tracking-[-0.01em] truncate">
          {campaign.name}
        </div>
        <div className="mt-0.5 font-mono text-[10.5px] text-muted-ink flex gap-2">
          <span className="tabular-nums">{formatNumber(suppliers)} {isEN ? 'found' : 'znalezionych'}</span>
          <span className="text-rule-3">·</span>
          <span className="tabular-nums">{new Date(campaign.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
      <div>
        <div className={cn('h-1 rounded-full overflow-hidden', isRunning ? 'bg-bg-3' : 'bg-bg-3')}>
          <div
            className={cn(
              'h-full transition-[width] duration-500',
              isDone ? 'bg-good' : isErr ? 'bg-bad' : 'bg-brand'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div>
        <Status state={state}>{stateLabel}</Status>
      </div>
      <div className="font-mono text-[11.5px] text-muted-ink whitespace-nowrap">
        {isDone ? (isEN ? 'complete' : 'ukończono') : `${progress}%`}
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-ink-2" />
    </button>
  );
}

function EmptyCampaigns({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-6 py-10 text-center">
      <Target className="h-10 w-10 mx-auto mb-3 text-muted-ink-2" strokeWidth={1.2} />
      <div className="text-[14px] font-semibold text-ink">
        {isEN ? 'No campaigns yet' : 'Brak kampanii'}
      </div>
      <div className="mt-1 text-[12.5px] text-muted-ink">
        {isEN ? 'Start by describing what you source.' : 'Zacznij od opisania czego szukasz.'}
      </div>
      <Button variant="cta" size="ds" className="mt-4 inline-flex" onClick={onCreate}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        {isEN ? 'New campaign' : 'Nowa kampania'}
      </Button>
    </div>
  );
}

/* ──────────── Activity stream (real data from /dashboard/activity) ──────────── */

function ActivityCard({
  events,
  onOpen,
}: {
  events: Array<{ id: string; tone: 'ok' | 'warn' | 'info'; text: string; ts: string; href?: string }>;
  onOpen: (href: string) => void;
}) {
  return (
    <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
        <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
          {isEN ? 'Recent activity' : 'Ostatnia aktywność'}
        </h3>
        <span className="ml-auto label-mono" title={isEN ? 'Last 7 days' : 'Ostatnie 7 dni'}>
          {isEN ? 'Last 7d' : 'Ostatnie 7d'}
        </span>
      </header>
      <div className="p-3">
        {events.length === 0 ? (
          <div className="px-2 py-6 text-center font-mono text-[11.5px] text-muted-ink">
            {isEN ? 'No recent activity.' : 'Brak ostatniej aktywności.'}
          </div>
        ) : (
          <ul className="space-y-1.5 font-mono text-[11.5px] leading-[1.5]">
            {events.map((e) => {
              const ts = new Date(e.ts);
              const glyph = e.tone === 'ok' ? <Check className="h-3 w-3" /> : e.tone === 'warn' ? '!' : <Loader2 className="h-3 w-3" />;
              const toneClass = e.tone === 'ok' ? 'text-good' : e.tone === 'warn' ? 'text-warn' : 'text-info';
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    disabled={!e.href}
                    onClick={() => e.href && onOpen(e.href)}
                    className={cn(
                      'w-full grid grid-cols-[56px_16px_1fr] gap-2 items-start text-left rounded-[4px] px-1 py-0.5',
                      e.href && 'hover:bg-bg-2 cursor-pointer'
                    )}
                    title={ts.toLocaleString(isEN ? 'en-US' : 'pl-PL')}
                  >
                    <span className="text-muted-ink-2 tabular-nums">{formatTimeOrRelative(ts)}</span>
                    <span className={cn('text-center font-bold grid place-items-center', toneClass)}>{glyph}</span>
                    <span className="text-ink-2 truncate">{e.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function formatTimeOrRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  if (diff < 24 * 60 * 60 * 1000) return formatTime(d);
  return formatRelative(d);
}

/* ──────────── helpers ──────────── */

function useGreeting(): string {
  const h = new Date().getHours();
  if (isEN) {
    if (h < 5) return 'Good evening';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }
  if (h < 5) return 'Dobry wieczór';
  if (h < 12) return 'Dzień dobry';
  if (h < 18) return 'Miłego dnia';
  return 'Dobry wieczór';
}

function formatDateLabel(en: boolean): string {
  const d = new Date();
  if (en) {
    return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
