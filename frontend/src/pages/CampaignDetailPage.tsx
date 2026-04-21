/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef, useCallback } from 'react';
import { formatRelative } from '@/lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, AlertTriangle, Trash2, BarChart3, CheckCircle2, Mail, Clock, Send, FileDown, StopCircle, Monitor, Circle, X, Search, Copy, RefreshCw } from 'lucide-react';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Status } from '@/components/ui/status';
import { AgentAnimation } from '@/components/campaigns/AgentAnimation';
import { LiveSupplierFeed } from '@/components/campaigns/LiveSupplierFeed';
import { CampaignInsightsPanel } from '@/components/campaigns/CampaignInsightsPanel';
import { useCampaign, useExportCampaign } from '@/hooks/useCampaigns';
import { useRealTimeMonitor } from '@/hooks/useRealTimeMonitor';
import useCampaignsStore from '@/stores/campaigns.store';
import campaignsService from '@/services/campaigns.service';
import { suppliersService } from '@/services/suppliers.service';
import apiClient from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';
import { t, isEN } from '@/i18n';
import { analytics } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { normalizeCountry } from '@/utils/normalize-country';
import { StatusTabs } from '@/components/ui/status-tabs';
import { getStatusConfig, getDisplayName, getDisplayRole } from '@/utils/contact-status';
import { Progress } from '@/components/ui/progress';
import { CommentThread } from '@/components/collaboration/CommentThread';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Variants for tab content — always animate in (not dependent on parent stagger)
const tabItemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, isLoading: campaignLoading, refetch: refetchCampaign } = useCampaign(id || '', !!id);

  // Only activate real-time monitor for running campaigns
  const isRunning = !campaign || campaign.status === 'RUNNING';
  const { logs, suppliers: rtSuppliers, progress, completedSignal, contactProgress } = useRealTimeMonitor(id || '', !!id && isRunning);

  // For running campaigns: show real-time if available, otherwise fallback to API data
  // For completed campaigns: use persisted data from API
  const suppliers = isRunning
    ? (rtSuppliers.length > 0 ? rtSuppliers : (campaign?.suppliers || []))
    : (campaign?.suppliers || []);

  const exportMutation = useExportCampaign();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();
  const [showDelete, setShowDelete] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [excludingId, setExcludingId] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [apolloContacts, setApolloContacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(() => {
    // For completed/accepted campaigns, default to suppliers tab
    if (campaign && ['COMPLETED', 'ACCEPTED', 'DONE'].includes(campaign.status)) return 'suppliers';
    return 'overview';
  });
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';
  const { activeCampaign } = useCampaignsStore();
  const rtStatus = activeCampaign?.status;

  const deleteMutation = useMutation({
    mutationFn: campaignsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate('/campaigns');
    },
  });

  const cloneMutation = useMutation({
    mutationFn: campaignsService.clone,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success(t.campaigns_clone.cloneSuccess);
      navigate(`/campaigns/${data.id}`);
    },
    onError: () => {
      toast.error(t.campaigns_clone.cloneError);
    },
  });

  // Log to browser console only (removed from UI)
  useEffect(() => {
    if (logs.length > 0) {
      const latest = logs[logs.length - 1];
      console.log(`[Campaign ${id}] ${latest.level}: ${latest.message}`);
    }
  }, [logs, id]);

  useEffect(() => {
    if (!id) navigate('/campaigns');
    else analytics.campaignDetailView();
  }, [id, navigate]);

  // Auto-refresh when campaign completes (via WebSocket → zustand store)
  const prevRtStatus = useRef(rtStatus);
  useEffect(() => {
    if (
      prevRtStatus.current === 'RUNNING' &&
      (rtStatus === 'COMPLETED' || rtStatus === 'STOPPED' || rtStatus === 'ERROR')
    ) {
      if (rtStatus === 'COMPLETED') {
        analytics.campaignCompleted(suppliers.length);
      }
      refetchCampaign();
    }
    prevRtStatus.current = rtStatus;
  }, [rtStatus, refetchCampaign, suppliers.length]);

  // Fallback: refetch when completedSignal fires (handles cases where rtStatus tracking fails)
  const prevCompletedSignal = useRef(completedSignal);
  useEffect(() => {
    if (completedSignal > prevCompletedSignal.current) {
      refetchCampaign();
    }
    prevCompletedSignal.current = completedSignal;
  }, [completedSignal, refetchCampaign]);

  const handleStopCampaign = async () => {
    if (!id || !await confirm({ title: t.campaigns.detail.stopConfirm, variant: 'destructive' })) return;
    try {
      await apiClient.post(`/campaigns/${id}/stop`);
      analytics.campaignStopped();
      toast.success(t.campaigns.detail.stoppedSuccess);
      queryClient.invalidateQueries({ queryKey: ['campaigns', id] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } catch (err: any) {
      toast.error(`${t.campaigns.detail.errorTitle}: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleExport = () => {
    if (id) {
      analytics.exportCsv();
      exportMutation.mutate(id);
    }
  };

  const [report, setReport] = useState<any>(null);
  const [reportFetchedAt, setReportFetchedAt] = useState<number | null>(null);
  const [reportReloading, setReportReloading] = useState(false);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);

  const refetchReport = useCallback(() => {
    if (!id) return;
    setReportReloading(true);
    apiClient.get(`/reports/campaign/${id}`)
      .then(({ data }) => { setReport(data); setReportFetchedAt(Date.now()); })
      .catch(() => { })
      .finally(() => setReportReloading(false));
  }, [id]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadPptx = async () => {
    if (!id) return;
    setDownloadingPptx(true);
    try {
      const { data } = await apiClient.get(`/reports/campaign/${id}/pptx`, { responseType: 'blob' });
      analytics.exportPowerpoint();
      downloadBlob(data, `procurea-raport-${campaign?.name || id}.pptx`);
    } catch { toast.error(t.campaigns.detail.pptxError); }
    finally { setDownloadingPptx(false); }
  };

  // Fetch report for completed/accepted/sending campaigns
  useEffect(() => {
    if (id && campaign && ['COMPLETED', 'ACCEPTED', 'SENDING', 'DONE'].includes(campaign.status)) {
      apiClient.get(`/reports/campaign/${id}`).then(({ data }) => { setReport(data); setReportFetchedAt(Date.now()); }).catch(() => { });
      // Fetch AI summary
      setAiSummaryLoading(true);
      apiClient.get(`/reports/campaign/${id}/ai-summary?lang=${isEN ? 'en' : 'pl'}`)
        .then(({ data }) => { if (!data.error) setAiSummary(data); })
        .catch(() => { })
        .finally(() => setAiSummaryLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, campaign?.status, completedSignal]);

  const handleAcceptAll = async () => {
    if (!id) return;
    const activeCount = suppliers.filter(s => !excludedIds.includes(s.id)).length;
    if (!await confirm({ title: t.campaigns.detail.acceptConfirm.replace('{count}', String(activeCount)), variant: 'default' })) return;

    setAccepting(true);
    try {
      const result = await apiClient.post(`/campaigns/${id}/accept`, {
        excludedSupplierIds: excludedIds,
      });
      analytics.suppliersAccepted();
      toast.success(t.campaigns.detail.acceptedResult.replace('{qualified}', String(result.data.qualified)).replace('{sent}', String(result.data.offersSent)));
      refetchCampaign();
      // Refresh report
      apiClient.get(`/reports/campaign/${id}`).then(({ data }) => { setReport(data); setReportFetchedAt(Date.now()); }).catch(() => { });
    } catch (err: any) {
      toast.error(`${t.campaigns.detail.acceptError}: ${err.response?.data?.message || err.message}`);
    } finally {
      setAccepting(false);
    }
  };

  const handleExclude = async (supplierId: string) => {
    if (excludingId) return;
    if (!await confirm({ title: t.suppliers.card.excludeConfirm, variant: 'destructive' })) return;

    setExcludingId(supplierId);
    try {
      await suppliersService.exclude(supplierId);
      setExcludedIds(prev => [...prev, supplierId]);
      toast.success(t.suppliers.card.excludeSuccess);
    } catch {
      toast.error(t.suppliers.card.excludeError);
    } finally {
      setExcludingId(null);
    }
  };

  // Auto-poll contacts when enrichment is running or fetch once when completed
  useEffect(() => {
    if (!id) return;
    const status = campaign?.apolloEnrichmentStatus;

    if (status === 'completed' || status === 'failed') {
      // Fetch contacts once
      campaignsService.getCampaignContacts(id).then(setApolloContacts).catch(() => {});
      return;
    }

    if (status === 'running') {
      // Poll every 5s while running
      const fetchContacts = () => {
        campaignsService.getCampaignContacts(id).then(setApolloContacts).catch(() => {});
        refetchCampaign();
      };
      fetchContacts(); // immediate fetch
      const interval = setInterval(fetchContacts, 5000);
      return () => clearInterval(interval);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, campaign?.apolloEnrichmentStatus]);

  if (!campaign && campaignLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">{t.errors.notFound}</p>
          <Button onClick={() => navigate('/campaigns')} className="mt-4">
            {t.campaigns.detail.backToCampaigns}
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = campaign.status === 'COMPLETED' || rtStatus === 'COMPLETED';
  const isAccepted = ['ACCEPTED', 'SENDING', 'DONE'].includes(campaign.status)
                  || ['ACCEPTED', 'SENDING', 'DONE'].includes(rtStatus || '');
  const isError = campaign.status === 'ERROR';

  const getStatusBadge = () => {
    if (isError) return <Status state="err">{t.campaigns.status.error}</Status>;
    if (campaign.status === 'SENDING') return <Status state="live">{t.campaigns.status.sending}</Status>;
    if (campaign.status === 'ACCEPTED') return <Status state="done">{t.campaigns.status.accepted}</Status>;
    if (campaign.status === 'DONE') return <Status state="done">{t.campaigns.status.done}</Status>;
    if (isCompleted) return <Status state="done">{t.campaigns.status.completed}</Status>;
    return <Status state="live" pulse>{t.campaigns.status.running}</Status>;
  };

  const qualifiedCount = isAccepted ? (report?.qualifiedCount || suppliers.length) : 0;
  const excludedCount = isAccepted ? (report?.excludedCount || 0) : excludedIds.length;
  const avgScore = suppliers.length > 0
    ? Math.round((suppliers.reduce((sum, s) => sum + (s.analysisScore || 0), 0) / suppliers.length) * 10)
    : 0;

  return (
    <>
    {ConfirmDialogElement}
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        {/* Back link */}
        <button
          onClick={() => navigate('/campaigns')}
          className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-ink hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="h-3 w-3" />
          {t.campaigns.title}
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule">
          <div className="min-w-0">
            <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold text-ink line-clamp-2">
              {campaign.name}
            </h1>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {getStatusBadge()}
              <span className="font-mono text-[12.5px] text-muted-ink tabular-nums">
                {t.campaigns.detail.created + ':'} {new Date(campaign.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                {suppliers.length > 0 && (
                  <> <span className="text-rule-2">·</span> <span className="tabular-nums">{suppliers.length}</span> {t.campaigns.detail.suppliersFoundLabel.toLowerCase()}</>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRunning && (
              <Button variant="ds-danger" size="ds" onClick={handleStopCampaign}>
                <StopCircle className="mr-1.5 h-4 w-4" />
                {t.campaigns.detail.stopButton}
              </Button>
            )}
            <Button
              variant="ds-ghost"
              size="ds"
              onClick={() => id && cloneMutation.mutate(id)}
              disabled={cloneMutation.isPending}
            >
              {cloneMutation.isPending
                ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                : <Copy className="mr-1.5 h-4 w-4" />
              }
              {t.campaigns_clone.cloneCampaign}
            </Button>
            <Button variant="ds-danger" size="ds" onClick={() => setShowDelete(true)}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              {t.campaigns.deleteCampaign}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ERROR state */}
      {
        isError && (
          <motion.div variants={itemVariants}>
            <Card className="border-destructive">
              <CardContent className="flex items-center gap-4 py-6">
                <AlertTriangle className="h-8 w-8 text-destructive shrink-0" />
                <div>
                  <h3 className="font-semibold text-destructive">{t.campaigns.detail.errorTitle}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.campaigns.detail.errorDescription}
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/campaigns')} className="ml-auto shrink-0">
                  {t.campaigns.detail.backButton}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* TABS: Show for completed/accepted campaigns */}
      {(isCompleted || isAccepted) && (
        <motion.div variants={itemVariants}>
          <StatusTabs
            tabs={[
              { key: 'overview', label: t.campaigns.detail.tabOverview },
              { key: 'suppliers', label: t.campaigns.detail.tabSuppliers, count: suppliers.length },
              { key: 'contacts', label: t.campaigns.detail.tabContacts, count: apolloContacts.filter((c: any) => c.email).length },
              { key: 'comments', label: t.collaboration.tabComments },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </motion.div>
      )}

      {/* === TAB: OVERVIEW === */}

      {/* COMPLETED/ACCEPTED: Stats Cards */}
      {
        (isCompleted || isAccepted) && activeTab === 'overview' && (
          <motion.div variants={tabItemVariants} initial="hidden" animate="show" className={`grid grid-cols-1 gap-4 ${isFullPlan ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.campaigns.detail.suppliersFound}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold">{report?.totalSuppliers || suppliers.length}</p></CardContent>
            </Card>
            {isFullPlan && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.campaigns.detail.qualified}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{qualifiedCount}</p></CardContent>
            </Card>
            )}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.campaigns.detail.rejected}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-600">{excludedCount}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t.campaigns.detail.averageScore}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold">{avgScore}%</p></CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* CAMPAIGN INSIGHTS (cost breakdown, funnel, quality dist, top countries/categories) */}
      {
        (isCompleted || isAccepted) && activeTab === 'overview' && id && (
          <motion.div variants={tabItemVariants} initial="hidden" animate="show">
            <CampaignInsightsPanel campaignId={id} />
          </motion.div>
        )
      }

      {/* AI SUMMARY */}
      {
        (isCompleted || isAccepted) && activeTab === 'overview' && (
          <motion.div variants={tabItemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t.campaigns.detail.aiAnalysis}
                  </CardTitle>
                  {aiSummary && (
                    <Button variant="outline" size="sm" onClick={handleDownloadPptx} disabled={downloadingPptx}>
                      {downloadingPptx ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileDown className="mr-1.5 h-4 w-4" />}
                      PowerPoint
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {aiSummaryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-3" />
                    <span className="text-muted-foreground">{t.campaigns.detail.generatingAi}</span>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-6">
                    {/* Market Overview */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">{t.campaigns.detail.marketOverview}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary.marketOverview}</p>
                    </div>

                    {/* Coverage */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{t.campaigns.detail.marketCoverage}</span>
                        <Badge variant={
                          aiSummary.coverageAssessment === 'HIGH' ? 'default' :
                          aiSummary.coverageAssessment === 'MEDIUM' ? 'secondary' : 'destructive'
                        }>
                          {aiSummary.coverageAssessment === 'HIGH' ? t.campaigns.detail.coverageHigh :
                           aiSummary.coverageAssessment === 'MEDIUM' ? t.campaigns.detail.coverageMedium : t.campaigns.detail.coverageLow}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{aiSummary.coverageNote}</p>
                    </div>

                    {/* Key Players */}
                    {aiSummary.keyPlayers?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">{t.campaigns.detail.keyPlayers}</h4>
                        <div className="space-y-2">
                          {aiSummary.keyPlayers.map((kp: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                              <div>
                                <span className="font-medium">{kp.name}</span>
                                <span className="text-muted-foreground"> — {kp.why}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Geographic + Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiSummary.geographicAnalysis && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">{t.campaigns.detail.geographicAnalysis}</h4>
                          <p className="text-xs text-muted-foreground">{aiSummary.geographicAnalysis}</p>
                        </div>
                      )}
                      {aiSummary.priceInsight && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">{t.campaigns.detail.priceContext}</h4>
                          <p className="text-xs text-muted-foreground">{aiSummary.priceInsight}</p>
                        </div>
                      )}
                    </div>

                    {/* Recommendations + Risks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiSummary.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">{t.campaigns.detail.recommendations}</h4>
                          <ul className="space-y-1">
                            {aiSummary.recommendations.map((r: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiSummary.riskFactors?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">{t.campaigns.detail.riskFactors}</h4>
                          <ul className="space-y-1">
                            {aiSummary.riskFactors.map((r: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {t.campaigns.detail.aiUnavailable}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* REPORT: Sequence Progress + Country Breakdown */}
      {
        (isCompleted || isAccepted) && activeTab === 'overview' && report &&
        (report.sequenceProgress?.length > 0 || report.countries?.length > 0) && (
          <motion.div variants={tabItemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t.campaigns.detail.campaignReport}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    {reportFetchedAt && (
                      <span title={new Date(reportFetchedAt).toLocaleString(isEN ? 'en-US' : 'pl-PL')}>
                        {isEN ? 'Updated' : 'Zaktualizowano'}: {formatRelative(new Date(reportFetchedAt))}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={refetchReport}
                      disabled={reportReloading}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border hover:bg-muted/40 disabled:opacity-50 transition-colors"
                    >
                      {reportReloading
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <RefreshCw className="h-3 w-3" />}
                      {isEN ? 'Refresh' : 'Odśwież'}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`grid grid-cols-1 ${isFullPlan ? 'md:grid-cols-2' : ''} gap-6`}>
                  {/* Sequence Progress */}
                  {isFullPlan && <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      {t.campaigns.detail.sequenceProgress}
                      {report.sequenceTemplateName && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{report.sequenceTemplateName}</span>
                      )}
                    </h4>

                    {report.sequenceProgress && report.sequenceProgress.length > 0 ? (
                      <div className="space-y-3">
                        {report.sequenceProgress.map((step: any, idx: number) => {
                          const pct = step.total > 0 ? Math.round((step.sent / step.total) * 100) : 0;
                          const stepLabel = step.type === 'INITIAL' ? t.campaigns.detail.invitation : step.type === 'REMINDER' ? t.campaigns.detail.reminder : step.type === 'FINAL' ? t.campaigns.detail.finalStep : step.type;
                          const isActive = step.sent > 0 && step.sent < step.total;
                          const isDone = step.total > 0 && step.sent === step.total;

                          return (
                            <div key={step.stepId} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-semibold">
                                    {idx + 1}
                                  </span>
                                  <span className="font-medium">{stepLabel}</span>
                                  <span className="text-xs text-muted-foreground">
                                    ({t.campaigns.detail.dayLabel} {step.dayOffset})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isDone && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                  {isActive && <Clock className="h-4 w-4 text-[#5E8C8F] animate-pulse" />}
                                  <span className="text-xs font-medium">
                                    {step.sent}/{step.total}
                                    {step.failed > 0 && (
                                      <span className="text-red-500 ml-1">({step.failed} {t.campaigns.detail.errorsCount})</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : isActive ? 'bg-[#5E8C8F]' : 'bg-muted-foreground/20'
                                    }`}
                                  style={{ width: `${Math.max(pct, step.sent > 0 ? 5 : 0)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                        <Mail className="h-5 w-5" />
                        <div>
                          {isCompleted && !isAccepted
                            ? t.campaigns.detail.acceptToStart
                            : t.campaigns.detail.noSequenceAssigned}
                        </div>
                      </div>
                    )}

                    {/* Offers summary */}
                    {isAccepted && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.campaigns.detail.offersCreated}:</span>
                          <span className="font-semibold">{report.offersCreated || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.campaigns.detail.offersReceived}:</span>
                          <span className="font-semibold text-green-600">{report.offersReceived || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{t.campaigns.detail.offersAccepted}:</span>
                          <span className="font-semibold text-emerald-600">{report.accepted || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>}

                  {/* Country Breakdown */}
                  {report.countries?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">{t.campaigns.detail.countryBreakdown}</h4>
                      <div className="space-y-2">
                        {report.countries.slice(0, 10).map((c: any) => (
                          <div key={c.country} className="flex items-center justify-between text-sm">
                            <span>{normalizeCountry(c.country)}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${((c.count / (report.totalSuppliers || 1)) * 100)}%` }}
                                />
                              </div>
                              <span className="font-medium w-8 text-right">{c.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* SEQUENCE DETAILS: Per-supplier email execution log */}
      {
        isFullPlan && isAccepted && activeTab === 'overview' && report?.sequenceDetails && report.sequenceDetails.length > 0 && (
          <motion.div variants={tabItemVariants} initial="hidden" animate="show">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  {t.campaigns.detail.sequenceDetails}
                </CardTitle>
                {(() => {
                  const allExecs = report.sequenceDetails.flatMap((d: any) => d.executions || []);
                  const lastSent = allExecs
                    .filter((e: any) => e.sentAt)
                    .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
                  return lastSent ? (
                    <p className="text-xs text-muted-foreground">
                      {t.campaigns.detail.lastSentLabel}: {new Date(lastSent.sentAt).toLocaleString(isEN ? 'en-US' : 'pl-PL')}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t.campaigns.detail.waitingScheduler}
                    </p>
                  );
                })()}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-4 font-medium text-muted-foreground">{t.campaigns.detail.tableSupplier}</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">{t.campaigns.detail.tableCountry}</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">{t.campaigns.detail.tableEmail}</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">{t.campaigns.detail.tableStep}</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">{t.campaigns.detail.tableStatus}</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">{t.campaigns.detail.tableDate}</th>
                        <th className="py-2 font-medium text-muted-foreground">{t.campaigns.detail.tableNextStep}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sequenceDetails
                        .sort((a: any, b: any) => (a.supplierName || '').localeCompare(b.supplierName || ''))
                        .map((detail: any) => {
                          const stepLabel = (type: string) =>
                            type === 'INITIAL' ? t.campaigns.detail.invitation :
                              type === 'REMINDER' ? t.campaigns.detail.reminder :
                                type === 'FINAL' ? t.campaigns.detail.finalStep : type;

                          const executions = detail.executions || [];
                          const hasExecs = executions.length > 0;

                          if (!hasExecs) {
                            return (
                              <tr key={detail.offerId} className="border-b last:border-0">
                                <td className="py-2 pr-4 font-medium">{detail.supplierName || '—'}</td>
                                <td className="py-2 pr-4">{detail.supplierCountry || '—'}</td>
                                <td className="py-2 pr-4 text-muted-foreground">{detail.allEmails?.[0] || '—'}</td>
                                <td className="py-2 pr-4 text-muted-foreground">—</td>
                                <td className="py-2 pr-4">
                                  <span className="inline-flex items-center gap-1 text-amber-600">
                                    <Clock className="h-3.5 w-3.5" />
                                    {t.campaigns.detail.statusWaiting}
                                  </span>
                                </td>
                                <td className="py-2 pr-4 text-muted-foreground">—</td>
                                <td className="py-2">
                                  {detail.nextScheduled ? (
                                    <span className="text-muted-foreground">
                                      {stepLabel(detail.nextScheduled.stepType)} — {new Date(detail.nextScheduled.dueAt).toLocaleString(isEN ? 'en-US' : 'pl-PL')}
                                    </span>
                                  ) : '—'}
                                </td>
                              </tr>
                            );
                          }

                          return executions.map((exec: any, idx: number) => (
                            <tr key={`${detail.offerId}-${exec.stepId}-${idx}`} className="border-b last:border-0">
                              {idx === 0 ? (
                                <>
                                  <td className="py-2 pr-4 font-medium" rowSpan={executions.length}>{detail.supplierName || '—'}</td>
                                  <td className="py-2 pr-4" rowSpan={executions.length}>{detail.supplierCountry || '—'}</td>
                                </>
                              ) : null}
                              <td className="py-2 pr-4 font-mono text-xs">{exec.recipientEmail || '—'}</td>
                              <td className="py-2 pr-4">{stepLabel(exec.stepType)}</td>
                              <td className="py-2 pr-4">
                                {exec.status === 'SENT' ? (
                                  <span className="inline-flex items-center gap-1 text-green-600">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {t.campaigns.detail.statusSent}
                                  </span>
                                ) : exec.status === 'FAILED' ? (
                                  <span className="inline-flex items-center gap-1 text-red-600">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    {t.campaigns.detail.statusError}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">{exec.status}</span>
                                )}
                              </td>
                              <td className="py-2 pr-4">
                                {exec.sentAt ? new Date(exec.sentAt).toLocaleString(isEN ? 'en-US' : 'pl-PL') : '—'}
                              </td>
                              {idx === 0 ? (
                                <td className="py-2" rowSpan={executions.length}>
                                  {detail.nextScheduled ? (
                                    <span className="inline-flex items-center gap-1 text-[#4A7174]">
                                      <Clock className="h-3.5 w-3.5" />
                                      {stepLabel(detail.nextScheduled.stepType)} — {new Date(detail.nextScheduled.dueAt).toLocaleString(isEN ? 'en-US' : 'pl-PL')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      {t.campaigns.detail.statusCompleted}
                                    </span>
                                  )}
                                </td>
                              ) : null}
                            </tr>
                          ));
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* RUNNING: Agent Animation + Info sidebar — show only after first supplier appears */}
      <AnimatePresence>
        {isRunning && !isError && suppliers.length > 0 && (
          <motion.div
            key="agent-animation"
            variants={itemVariants}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden"
          >
            <div className="lg:col-span-2">
              <AgentAnimation currentStage={campaign.stage || 'STRATEGY'} progress={progress} suppliersFound={suppliers.length} />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    {t.campaigns.detail.searchInProgress}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-muted-foreground">{t.campaigns.detail.suppliersFoundLabel}:</span>
                    <span className="font-bold text-2xl text-primary">{suppliers.length}</span>
                  </div>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Monitor className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                      <p>{t.campaigns.detail.backgroundNote}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                      <p>{t.campaigns.detail.maxTimeNote}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <FileDown className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                      <p>{t.campaigns.detail.afterCompletion}</p>
                    </div>
                    <ul className="ml-6 space-y-1.5 text-xs">
                      <li>{t.campaigns.detail.exportExcelDesc}</li>
                      <li>{t.campaigns.detail.aiReportDesc}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === TAB: SUPPLIERS (or always visible when running) === */}
      {(isRunning || activeTab === 'suppliers') && (
        <motion.div variants={isRunning ? itemVariants : tabItemVariants} initial={isRunning ? undefined : "hidden"} animate={isRunning ? undefined : "show"}>
          {(!isRunning || suppliers.length > 0) && (
            <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-ink">
                {t.campaigns.detail.suppliersList} <span className="font-mono tabular-nums text-muted-ink">({suppliers.length})</span>
              </h2>
              <div className="flex gap-2">
                {isFullPlan && isCompleted && !isAccepted && (
                  <Button
                    variant="cta"
                    size="ds"
                    onClick={handleAcceptAll}
                    disabled={suppliers.length === 0 || accepting}
                  >
                    {accepting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                    {accepting ? t.campaigns.detail.accepting : t.campaigns.detail.acceptAllSuppliers}
                  </Button>
                )}
                {(isCompleted || isAccepted) && (
                  <Button variant="ds-ghost" size="ds" onClick={handleExport} disabled={exportMutation.isPending}>
                    <Download className="mr-1.5 h-4 w-4" />
                    {t.campaigns.detail.exportCSV}
                  </Button>
                )}
              </div>
            </div>
            {suppliers.length > 5 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t.common.search + '...'}
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="w-full sm:w-72 pl-9 pr-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
            </div>
          )}
          <LiveSupplierFeed
            suppliers={supplierSearch.trim()
              ? suppliers.filter(s => {
                  const q = supplierSearch.toLowerCase();
                  return (s.name || '').toLowerCase().includes(q)
                    || (s.country || '').toLowerCase().includes(q)
                    || (s.city || '').toLowerCase().includes(q)
                    || (s.specialization || '').toLowerCase().includes(q)
                    || (s.website || '').toLowerCase().includes(q);
                })
              : suppliers}
            campaignId={id}
            rfqRequestId={isFullPlan ? campaign?.rfqRequest?.id : undefined}
            isAccepted={isFullPlan ? isAccepted : false}
            isRunning={isRunning}
            excludedIds={isFullPlan ? excludedIds : []}
            onExclude={isFullPlan ? handleExclude : undefined}
            campaignStartedAt={campaign?.createdAt}
            onStop={handleStopCampaign}
          />
        </motion.div>
      )}

      {/* === TAB: CONTACTS === */}
      {(isCompleted || isAccepted) && activeTab === 'contacts' && (() => {
        const isEnrichmentRunning = campaign?.apolloEnrichmentStatus === 'running';
        const statusConfig = getStatusConfig();
        const processedCount = contactProgress.length;
        const totalCount = suppliers.length;
        const progressPct = totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;
        const contactsWithEmail = apolloContacts.filter((c: any) => c.email);

        const levelLabel = (level?: string) => {
          if (!level) return '';
          const map: Record<string, string> = {
            L1_apollo: t.campaigns.detail.levelApollo,
            L2_website: t.campaigns.detail.levelWebsite,
            L3_google: t.campaigns.detail.levelGoogle,
            L4_generic: t.campaigns.detail.levelGeneric,
            L5_unreachable: t.campaigns.detail.levelUnreachable,
          };
          return map[level] || level;
        };

        return (
          <motion.div variants={tabItemVariants} initial="hidden" animate="show" className="space-y-4">
            {/* Progress bar when enrichment is running */}
            {isEnrichmentRunning && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">
                      {t.campaigns.detail.searchingContacts} ({processedCount}/{totalCount})
                    </span>
                  </div>
                  <Progress value={progressPct} className="h-2" />
                </CardContent>
              </Card>
            )}

            {/* Summary badges */}
            {!isEnrichmentRunning && (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  {contactsWithEmail.length} {t.campaigns.detail.filterWithEmail}
                </Badge>
                <Badge variant="secondary">
                  {suppliers.length - contactsWithEmail.length} {t.campaigns.detail.filterWithout}
                </Badge>
              </div>
            )}

            {/* Per-supplier contact cards */}
            <div className="space-y-2">
              {suppliers.map((supplier) => {
                const supplierContacts = apolloContacts.filter((c: any) => c.supplierId === supplier.id);
                const bestContact = supplierContacts.find((c: any) => c.email) || supplierContacts[0];
                const cp = contactProgress.find(p => p.supplierName === supplier.name);

                // Determine status
                let statusIcon: React.ReactNode;
                let statusLine: React.ReactNode;

                if (bestContact?.email) {
                  const displayName = getDisplayName(bestContact);
                  const displayRole = getDisplayRole(bestContact);
                  const emailStatus = statusConfig[bestContact.emailStatus] || { label: bestContact.emailStatus || '—', className: 'bg-gray-100 text-gray-600' };

                  statusIcon = <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />;
                  statusLine = (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <a href={`mailto:${bestContact.email}`} className="text-blue-600 hover:underline text-sm font-medium">
                          {bestContact.email}
                        </a>
                        <Badge className={`text-xs ${emailStatus.className}`}>{emailStatus.label}</Badge>
                        {bestContact.linkedinUrl && (
                          <a href={bestContact.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-xs">
                            LinkedIn
                          </a>
                        )}
                      </div>
                      {(displayName !== '—' || displayRole !== '—') && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {displayName !== '—' ? displayName : ''}{displayName !== '—' && displayRole !== '—' ? ' · ' : ''}{displayRole !== '—' ? displayRole : ''}
                        </p>
                      )}
                    </div>
                  );
                } else if (isEnrichmentRunning && cp && cp.level === 'L5_unreachable') {
                  statusIcon = <X className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />;
                  statusLine = <span className="text-sm text-muted-foreground">{t.campaigns.detail.levelUnreachable}</span>;
                } else if (isEnrichmentRunning && cp) {
                  statusIcon = <Loader2 className="h-5 w-5 animate-spin text-blue-400 flex-shrink-0 mt-0.5" />;
                  statusLine = <span className="text-sm text-muted-foreground">{levelLabel(cp.level) || t.campaigns.detail.contactSearching}</span>;
                } else if (isEnrichmentRunning) {
                  statusIcon = <Circle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />;
                  statusLine = <span className="text-sm text-muted-foreground">{t.campaigns.detail.contactWaiting}</span>;
                } else {
                  // Enrichment done, no contact found
                  statusIcon = <X className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />;
                  statusLine = <span className="text-sm text-muted-foreground">{isEN ? 'No contact found' : 'Nie znaleziono kontaktu'}</span>;
                }

                const otherContacts = supplierContacts.filter((c: any) => c !== bestContact && c.email);

                return (
                  <div key={supplier.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    {statusIcon}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{supplier.name}</p>
                      <div className="mt-1">{statusLine}</div>
                      {otherContacts.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground select-none">
                            {isEN
                              ? `+${otherContacts.length} more contact${otherContacts.length > 1 ? 's' : ''}`
                              : `+${otherContacts.length} ${otherContacts.length === 1 ? 'dodatkowy kontakt' : 'dodatkowych kontaktów'}`}
                          </summary>
                          <div className="mt-1.5 space-y-1 pl-2 border-l border-muted">
                            {otherContacts.map((c: any, idx: number) => {
                              const displayName = getDisplayName(c);
                              const displayRole = getDisplayRole(c);
                              const cStatus = statusConfig[c.emailStatus] || { label: c.emailStatus || '—', className: 'bg-gray-100 text-gray-600' };
                              return (
                                <div key={c.id || idx} className="flex items-center gap-2 flex-wrap text-xs">
                                  <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">
                                    {c.email}
                                  </a>
                                  <Badge className={`text-[10px] ${cStatus.className}`}>{cStatus.label}</Badge>
                                  {(displayName !== '—' || displayRole !== '—') && (
                                    <span className="text-muted-foreground">
                                      {displayName !== '—' ? displayName : ''}
                                      {displayName !== '—' && displayRole !== '—' ? ' · ' : ''}
                                      {displayRole !== '—' ? displayRole : ''}
                                    </span>
                                  )}
                                  {c.linkedinUrl && (
                                    <a href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 text-[10px]">
                                      LinkedIn
                                    </a>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })()}

      {/* === TAB: COMMENTS === */}
      {(isCompleted || isAccepted) && activeTab === 'comments' && id && (
        <motion.div variants={tabItemVariants} initial="hidden" animate="show">
          <Card>
            <CardContent className="pt-6">
              <CommentThread entityType="campaign" entityId={id} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDelete(false)}>
          <div className="bg-background rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">{t.campaigns.deleteCampaign}</h3>
            <p className="text-muted-foreground mb-6">{t.campaigns.deleteConfirm}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDelete(false)}>{t.common.cancel}</Button>
              <Button
                variant="destructive"
                onClick={() => id && deleteMutation.mutate(id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t.common.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
    </>
  );
}

export default CampaignDetailPage;
