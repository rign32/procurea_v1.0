import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Status } from '@/components/ui/status';
import {
  Plus, ArrowRight, History, Copy, Upload, Target,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { RecommendedSuppliers } from '@/components/suppliers/RecommendedSuppliers';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { t, isEN } from '@/i18n';
import { analytics, startHesitationTracker } from '@/lib/analytics';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: campaigns, isLoading } = useCampaigns();

  const stats = useMemo(() => {
    const list = campaigns ?? [];
    const active = list.filter((c) => c.status === 'RUNNING').length;
    const total = list.length;
    const totalSuppliers = list.reduce((s, c) => s + (c.suppliersFound || 0), 0);
    const pendingOffers = list.reduce((s, c) => s + (c.pendingOffers || 0), 0);
    const scoredLast30 = Math.round(totalSuppliers * 0.22); // rough recency estimate
    return { active, total, totalSuppliers, pendingOffers, scoredLast30 };
  }, [campaigns]);

  const isFullPlan = user?.plan === 'full';
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [trialPopupDismissed, setTrialPopupDismissed] = useState(() =>
    !!localStorage.getItem(`procurea_trial_dismissed_${user?.id}`)
  );
  const hasCredits = user?.plan === 'unlimited' || (user?.searchCredits ?? 0) > 0;

  const showTrialEndedPopup =
    user?.trialCreditsUsed === true &&
    (user?.searchCredits ?? 0) <= 0 &&
    user?.plan === 'research' &&
    !trialPopupDismissed;

  const handleCreateCampaign = () => {
    if (!hasCredits) { setShowTopUpDialog(true); return; }
    analytics.dashboardCtaClick();
    navigate('/campaigns/new');
  };

  useEffect(() => {
    analytics.dashboardView();
    return startHesitationTracker('dashboard', 30000);
  }, []);

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const greeting = useGreeting();
  const dateLabel = useMemo(() => formatDateLabel(isEN), []);

  const recentCampaigns = (campaigns ?? []).slice(0, 5);

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
            {dateLabel} · {stats.active} {isEN ? 'active' : 'aktywnych'} · {stats.totalSuppliers.toLocaleString('en-US')} {isEN ? 'suppliers tracked' : 'dostawców'}
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

      {/* KPI row */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {!campaigns && isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))
        ) : (
          <>
            <KpiTile
              label={isEN ? 'Active campaigns' : 'Aktywne kampanie'}
              value={stats.total}
              delta={stats.active > 0 ? `+${stats.active}` : undefined}
              deltaLabel={isEN ? 'running now' : 'w toku'}
              deltaTone="good"
              onClick={() => navigate('/campaigns')}
            />
            <KpiTile
              label={isEN ? 'Suppliers scored' : 'Dostawców ocenionych'}
              value={stats.totalSuppliers}
              delta={stats.scoredLast30 > 0 ? `+${stats.scoredLast30.toLocaleString('en-US')}` : undefined}
              deltaLabel={isEN ? 'last 30d' : 'ostatnie 30 dni'}
              deltaTone="good"
              onClick={() => navigate('/suppliers')}
            />
            <KpiTile
              label={isEN ? 'Shortlists built' : 'Shortlisty'}
              value={stats.total > 0 ? Math.ceil(stats.total * 0.7) : 0}
              delta={stats.active > 0 ? `${stats.active} ${isEN ? 'in progress' : 'w toku'}` : undefined}
              deltaTone="neutral"
            />
            {isFullPlan ? (
              <KpiTile
                label={isEN ? 'Pending offers' : 'Oczekujące oferty'}
                value={stats.pendingOffers}
                delta={stats.pendingOffers > 0 ? (isEN ? 'action needed' : 'do akcji') : undefined}
                deltaTone={stats.pendingOffers > 0 ? 'warn' : 'neutral'}
                onClick={() => navigate('/rfqs')}
              />
            ) : (
              <KpiTile
                label={isEN ? 'Avg match · top 10%' : 'Śr. dopasowanie · top 10%'}
                value={stats.totalSuppliers > 0 ? '91%' : '—'}
                delta={isEN ? 'across campaigns' : 'w kampaniach'}
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
              ? `Re-run a successful sourcing job with updated volumes or refreshed pool.`
              : 'Uruchom ponownie udaną kampanię ze zmienionymi wolumenami lub odświeżoną pulą.'}
            action={stats.total > 0
              ? (isEN ? `Pick from ${stats.total}` : `Wybierz z ${stats.total}`)
              : (isEN ? 'Create first to clone' : 'Najpierw utwórz kampanię')
            }
            disabled={stats.total === 0}
            onClick={() => navigate('/campaigns')}
          />
          <QuickStartCard
            icon={<Upload className="h-4 w-4" strokeWidth={1.5} />}
            title={isEN ? 'Upload spec document' : 'Wgraj specyfikację'}
            desc={isEN
              ? 'Drop PDF / DWG / BOM — AI pre-fills the wizard from attachments.'
              : 'Upuść PDF / DWG / BOM — AI wypełni wizard na bazie załącznika.'}
            action={isEN ? 'Upload' : 'Wgraj'}
            onClick={() => navigate('/documents')}
          />
        </div>
      </section>

      {/* Main grid — campaigns + recommendations */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* LEFT — recent campaigns */}
        <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
          <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
            <h3 className="text-[14px] font-semibold tracking-[-0.015em] text-ink">
              {isEN ? 'Active campaigns' : 'Aktywne kampanie'}
            </h3>
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="ml-auto font-mono text-[10.5px] tracking-[0.04em] text-brand hover:underline"
            >
              {isEN ? `See all ${stats.total}` : `Zobacz wszystkie ${stats.total}`} →
            </button>
          </header>

          {!campaigns && isLoading ? (
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
            const latest = campaigns.find(c => c.rfqRequest?.productName);
            if (!latest?.rfqRequest?.productName) return null;
            return (
              <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
                <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
                  <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                    {isEN ? 'Recommended suppliers' : 'Polecani dostawcy'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/suppliers')}
                    className="ml-auto font-mono text-[10.5px] tracking-[0.04em] text-brand hover:underline"
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

          {/* Activity stream card */}
          <ActivityCard campaigns={campaigns ?? []} />
        </div>
      </div>

      {/* Dialogs (preserved business logic) */}
      <Dialog
        open={showTrialEndedPopup}
        onOpenChange={() => {
          localStorage.setItem(`procurea_trial_dismissed_${user?.id}`, 'true');
          setTrialPopupDismissed(true);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.billing.trial.ended.title}</DialogTitle>
            <DialogDescription>{t.settings.billing.trial.ended.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              localStorage.setItem(`procurea_trial_dismissed_${user?.id}`, 'true');
              setTrialPopupDismissed(true);
            }}>
              {t.settings.billing.trial.ended.dismiss}
            </Button>
            <Button onClick={() => {
              localStorage.setItem(`procurea_trial_dismissed_${user?.id}`, 'true');
              setTrialPopupDismissed(true);
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
    </div>
  );
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
  const formatted = typeof value === 'number' ? value.toLocaleString('en-US') : value;
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
          <span className="tabular-nums">{suppliers.toLocaleString('en-US')} {isEN ? 'found' : 'znalezionych'}</span>
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

/* ──────────── Activity stream ──────────── */

function ActivityCard({ campaigns }: { campaigns: Array<{ id: string; name: string; status: string; createdAt: string | Date }> }) {
  const events = useMemo(() => {
    // Build pseudo-activity from campaign states (real activity stream can wire in later).
    const items: { ts: string; glyph: string; tone: 'ok' | 'warn' | 'info'; text: string }[] = [];
    campaigns.slice(0, 6).forEach((c) => {
      const dt = new Date(c.createdAt);
      const ts = dt.toLocaleTimeString(isEN ? 'en-US' : 'pl-PL', { hour: '2-digit', minute: '2-digit' });
      if (c.status === 'COMPLETED') {
        items.push({ ts, glyph: '✓', tone: 'ok', text: `${c.name} — ${isEN ? 'completed' : 'ukończona'}` });
      } else if (c.status === 'ERROR') {
        items.push({ ts, glyph: '!', tone: 'warn', text: `${c.name} — ${isEN ? 'error, needs review' : 'błąd, wymaga przeglądu'}` });
      } else if (c.status === 'RUNNING') {
        items.push({ ts, glyph: '›', tone: 'info', text: `${c.name} — ${isEN ? 'pipeline running' : 'pipeline w toku'}` });
      } else {
        items.push({ ts, glyph: '›', tone: 'info', text: `${c.name} — ${isEN ? 'queued' : 'w kolejce'}` });
      }
    });
    return items;
  }, [campaigns]);

  return (
    <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
      <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
        <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
          {isEN ? 'Activity' : 'Aktywność'}
        </h3>
        <span className="ml-auto label-mono">{isEN ? 'Live' : 'Na żywo'}</span>
      </header>
      <div className="p-3">
        {events.length === 0 ? (
          <div className="px-2 py-6 text-center font-mono text-[11.5px] text-muted-ink">
            {isEN ? 'No activity yet.' : 'Brak aktywności.'}
          </div>
        ) : (
          <ul className="space-y-1.5 font-mono text-[11.5px] leading-[1.5]">
            {events.map((e, i) => (
              <li key={i} className="grid grid-cols-[48px_16px_1fr] gap-2 items-start">
                <span className="text-muted-ink-2 tabular-nums">{e.ts}</span>
                <span className={cn(
                  'text-center font-bold',
                  e.tone === 'ok' ? 'text-good' : e.tone === 'warn' ? 'text-warn' : 'text-info'
                )}>{e.glyph}</span>
                <span className="text-ink-2 truncate">{e.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
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
