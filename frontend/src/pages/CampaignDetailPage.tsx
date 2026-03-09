import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Download, Loader2, AlertTriangle, Trash2, BarChart3, CheckCircle2, Mail, Clock, Send, FileDown } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AgentAnimation } from '@/components/campaigns/AgentAnimation';
import { LiveSupplierFeed } from '@/components/campaigns/LiveSupplierFeed';
import { useCampaign, useExportCampaign } from '@/hooks/useCampaigns';
import { useRealTimeMonitor } from '@/hooks/useRealTimeMonitor';
import campaignsService from '@/services/campaigns.service';
import apiClient from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';
import { PL } from '@/i18n/pl';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: campaign, isLoading: campaignLoading, refetch: refetchCampaign } = useCampaign(id || '', !!id);

  // Only activate real-time monitor for running campaigns
  const isRunning = !campaign || campaign.status === 'RUNNING';
  const { logs, suppliers: rtSuppliers, progress } = useRealTimeMonitor(id || '', !!id && isRunning);

  // For running campaigns: show real-time if available, otherwise fallback to API data
  // For completed campaigns: use persisted data from API
  const suppliers = isRunning
    ? (rtSuppliers.length > 0 ? rtSuppliers : (campaign?.suppliers || []))
    : (campaign?.suppliers || []);

  const exportMutation = useExportCampaign();
  const queryClient = useQueryClient();
  const [showDelete, setShowDelete] = useState(false);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [accepting, setAccepting] = useState(false);
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  const deleteMutation = useMutation({
    mutationFn: campaignsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate('/campaigns');
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
  }, [id, navigate]);

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/campaigns');
    }
  };

  const handleExport = () => {
    if (id) exportMutation.mutate(id);
  };

  const [report, setReport] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);

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
      downloadBlob(data, `procurea-raport-${campaign?.name || id}.pptx`);
    } catch { toast.error('Błąd generowania PowerPoint'); }
    finally { setDownloadingPptx(false); }
  };

  // Fetch report for completed/accepted/sending campaigns
  useEffect(() => {
    if (id && campaign && ['COMPLETED', 'ACCEPTED', 'SENDING', 'DONE'].includes(campaign.status)) {
      apiClient.get(`/reports/campaign/${id}`).then(({ data }) => setReport(data)).catch(() => { });
      // Fetch AI summary
      setAiSummaryLoading(true);
      apiClient.get(`/reports/campaign/${id}/ai-summary`)
        .then(({ data }) => { if (!data.error) setAiSummary(data); })
        .catch(() => { })
        .finally(() => setAiSummaryLoading(false));
    }
  }, [id, campaign?.status]);

  const handleAcceptAll = async () => {
    if (!id) return;
    const activeCount = suppliers.filter(s => !excludedIds.includes(s.id)).length;
    if (!window.confirm(`Zaakceptować ${activeCount} dostawców i rozpocząć wysyłkę sekwencji?`)) return;

    setAccepting(true);
    try {
      const result = await apiClient.post(`/campaigns/${id}/accept`, {
        excludedSupplierIds: excludedIds,
      });
      toast.success(`Zaakceptowano ${result.data.qualified} dostawców. Wysłano ${result.data.offersSent} zaproszenia.`);
      refetchCampaign();
      // Refresh report
      apiClient.get(`/reports/campaign/${id}`).then(({ data }) => setReport(data)).catch(() => { });
    } catch (err: any) {
      toast.error(`Błąd akceptacji: ${err.response?.data?.message || err.message}`);
    } finally {
      setAccepting(false);
    }
  };

  const handleExclude = (supplierId: string) => {
    setExcludedIds(prev =>
      prev.includes(supplierId) ? prev.filter(id => id !== supplierId) : [...prev, supplierId],
    );
  };

  if (campaignLoading) {
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
          <p className="text-muted-foreground">{PL.errors.notFound}</p>
          <Button onClick={() => navigate('/campaigns')} className="mt-4">
            {PL.campaigns.detail.backToCampaigns}
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = campaign.status === 'COMPLETED';
  const isAccepted = ['ACCEPTED', 'SENDING', 'DONE'].includes(campaign.status);
  const isError = campaign.status === 'ERROR';

  const getStatusBadge = () => {
    if (isError) return <Badge variant="destructive">{PL.campaigns.status.error}</Badge>;
    if (campaign.status === 'SENDING') return <Badge className="bg-blue-600">Wysyłanie sekwencji</Badge>;
    if (campaign.status === 'ACCEPTED') return <Badge className="bg-green-600">Zaakceptowana</Badge>;
    if (campaign.status === 'DONE') return <Badge className="bg-emerald-700">Zakończona</Badge>;
    if (isCompleted) return <Badge variant="default">{PL.campaigns.status.completed}</Badge>;
    return (
      <Badge variant="secondary" className="animate-pulse bg-blue-100 text-blue-700 border-blue-200">
        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
        {PL.campaigns.status.running}
      </Badge>
    );
  };

  const qualifiedCount = isAccepted ? (report?.qualifiedCount || suppliers.length) : 0;
  const excludedCount = isAccepted ? (report?.excludedCount || 0) : excludedIds.length;
  const avgScore = suppliers.length > 0
    ? Math.round((suppliers.reduce((sum, s) => sum + (s.analysisScore || 0), 0) / suppliers.length) * 10)
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-[-10px]">
        <button onClick={() => navigate('/campaigns')} className="hover:text-foreground transition-colors">{PL.campaigns.title}</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium line-clamp-1">{campaign.name}</span>
      </div>

      <motion.div variants={itemVariants}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} title={PL.campaigns.detail.backToCampaigns}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge()}
                <span className="text-sm text-muted-foreground">
                  Utworzono: {new Date(campaign.createdAt).toLocaleDateString('pl-PL')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isFullPlan && isCompleted && !isAccepted && (
              <Button
                onClick={handleAcceptAll}
                disabled={suppliers.length === 0 || accepting}
                className="bg-green-600 hover:bg-green-700"
              >
                {accepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                {accepting ? 'Akceptowanie...' : PL.campaigns.detail.acceptAllSuppliers}
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDelete(true)} className="text-destructive hover:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" />
              {PL.campaigns.deleteCampaign}
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
                  <h3 className="font-semibold text-destructive">Wystąpił błąd</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kampania zakończyła się błędem. Sprawdź konsolę przeglądarki (F12) po szczegóły.
                  </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/campaigns')} className="ml-auto shrink-0">
                  Wróć do kampanii
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* COMPLETED/ACCEPTED: Stats Cards */}
      {
        (isCompleted || isAccepted) && (
          <motion.div variants={itemVariants} className={`grid grid-cols-1 gap-4 ${isFullPlan ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{PL.campaigns.detail.suppliersFound}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold">{report?.totalSuppliers || suppliers.length}</p></CardContent>
            </Card>
            {isFullPlan && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{PL.campaigns.detail.qualified}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{qualifiedCount}</p></CardContent>
            </Card>
            )}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{PL.campaigns.detail.rejected}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold text-red-600">{excludedCount}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{PL.campaigns.detail.averageScore}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-3xl font-bold">{avgScore}%</p></CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* AI SUMMARY */}
      {
        (isCompleted || isAccepted) && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analiza AI
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
                    <span className="text-muted-foreground">Generowanie analizy AI...</span>
                  </div>
                ) : aiSummary ? (
                  <div className="space-y-6">
                    {/* Market Overview */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Przegląd rynku</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{aiSummary.marketOverview}</p>
                    </div>

                    {/* Coverage */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Pokrycie rynku</span>
                        <Badge variant={
                          aiSummary.coverageAssessment === 'HIGH' ? 'default' :
                          aiSummary.coverageAssessment === 'MEDIUM' ? 'secondary' : 'destructive'
                        }>
                          {aiSummary.coverageAssessment === 'HIGH' ? 'Wysokie' :
                           aiSummary.coverageAssessment === 'MEDIUM' ? 'Średnie' : 'Niskie'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{aiSummary.coverageNote}</p>
                    </div>

                    {/* Key Players */}
                    {aiSummary.keyPlayers?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Kluczowi gracze</h4>
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
                          <h4 className="text-sm font-semibold mb-1">Analiza geograficzna</h4>
                          <p className="text-xs text-muted-foreground">{aiSummary.geographicAnalysis}</p>
                        </div>
                      )}
                      {aiSummary.priceInsight && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Kontekst cenowy</h4>
                          <p className="text-xs text-muted-foreground">{aiSummary.priceInsight}</p>
                        </div>
                      )}
                    </div>

                    {/* Recommendations + Risks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {aiSummary.recommendations?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Rekomendacje</h4>
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
                          <h4 className="text-sm font-semibold mb-2">Czynniki ryzyka</h4>
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
                    Analiza AI niedostępna
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* REPORT: Sequence Progress + Country Breakdown */}
      {
        (isCompleted || isAccepted) && report &&
        (report.sequenceProgress?.length > 0 || report.countries?.length > 0) && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Raport kampanii
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid grid-cols-1 ${isFullPlan ? 'md:grid-cols-2' : ''} gap-6`}>
                  {/* Sequence Progress */}
                  {isFullPlan && <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Postęp sekwencji
                      {report.sequenceTemplateName && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{report.sequenceTemplateName}</span>
                      )}
                    </h4>

                    {report.sequenceProgress && report.sequenceProgress.length > 0 ? (
                      <div className="space-y-3">
                        {report.sequenceProgress.map((step: any, idx: number) => {
                          const pct = step.total > 0 ? Math.round((step.sent / step.total) * 100) : 0;
                          const stepLabel = step.type === 'INITIAL' ? 'Zaproszenie' : step.type === 'REMINDER' ? 'Przypomnienie' : step.type === 'FINAL' ? 'Ostateczne' : step.type;
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
                                    (Dzień {step.dayOffset})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isDone && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                  {isActive && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
                                  <span className="text-xs font-medium">
                                    {step.sent}/{step.total}
                                    {step.failed > 0 && (
                                      <span className="text-red-500 ml-1">({step.failed} błędów)</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-muted-foreground/20'
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
                            ? 'Zaakceptuj dostawców, aby rozpocząć sekwencję mailową'
                            : 'Brak przypisanej sekwencji mailowej'}
                        </div>
                      </div>
                    )}

                    {/* Offers summary */}
                    {isAccepted && (
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Utworzone oferty:</span>
                          <span className="font-semibold">{report.offersCreated || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Otrzymane odpowiedzi:</span>
                          <span className="font-semibold text-green-600">{report.offersReceived || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Zaakceptowane:</span>
                          <span className="font-semibold text-emerald-600">{report.accepted || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>}

                  {/* Country Breakdown */}
                  {report.countries?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Rozkład krajów</h4>
                      <div className="space-y-2">
                        {report.countries.slice(0, 10).map((c: any) => (
                          <div key={c.country} className="flex items-center justify-between text-sm">
                            <span>{c.country}</span>
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
        isFullPlan && isAccepted && report?.sequenceDetails && report.sequenceDetails.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Szczegóły wysyłki
                </CardTitle>
                {(() => {
                  const allExecs = report.sequenceDetails.flatMap((d: any) => d.executions || []);
                  const lastSent = allExecs
                    .filter((e: any) => e.sentAt)
                    .sort((a: any, b: any) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
                  return lastSent ? (
                    <p className="text-xs text-muted-foreground">
                      Ostatnia wysyłka: {new Date(lastSent.sentAt).toLocaleString('pl-PL')}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Oczekiwanie na scheduler (sprawdza co 5 min)
                    </p>
                  );
                })()}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Dostawca</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Kraj</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Email</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Krok</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Status</th>
                        <th className="py-2 pr-4 font-medium text-muted-foreground">Data</th>
                        <th className="py-2 font-medium text-muted-foreground">Następny krok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.sequenceDetails
                        .sort((a: any, b: any) => (a.supplierName || '').localeCompare(b.supplierName || ''))
                        .map((detail: any) => {
                          const stepLabel = (type: string) =>
                            type === 'INITIAL' ? 'Zaproszenie' :
                              type === 'REMINDER' ? 'Przypomnienie' :
                                type === 'FINAL' ? 'Ostateczne' : type;

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
                                    Oczekuje
                                  </span>
                                </td>
                                <td className="py-2 pr-4 text-muted-foreground">—</td>
                                <td className="py-2">
                                  {detail.nextScheduled ? (
                                    <span className="text-muted-foreground">
                                      {stepLabel(detail.nextScheduled.stepType)} — {new Date(detail.nextScheduled.dueAt).toLocaleString('pl-PL')}
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
                                    Wysłano
                                  </span>
                                ) : exec.status === 'FAILED' ? (
                                  <span className="inline-flex items-center gap-1 text-red-600">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Błąd
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">{exec.status}</span>
                                )}
                              </td>
                              <td className="py-2 pr-4">
                                {exec.sentAt ? new Date(exec.sentAt).toLocaleString('pl-PL') : '—'}
                              </td>
                              {idx === 0 ? (
                                <td className="py-2" rowSpan={executions.length}>
                                  {detail.nextScheduled ? (
                                    <span className="inline-flex items-center gap-1 text-blue-600">
                                      <Clock className="h-3.5 w-3.5" />
                                      {stepLabel(detail.nextScheduled.stepType)} — {new Date(detail.nextScheduled.dueAt).toLocaleString('pl-PL')}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Ukończono
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

      {/* RUNNING: Agent Animation + Stats sidebar */}
      {isRunning && !isError && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AgentAnimation currentStage={campaign.stage || 'STRATEGY'} progress={progress} suppliersFound={suppliers.length} />
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{PL.campaigns.detail.stats}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium text-blue-600 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Wyszukiwanie trwa...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{PL.campaigns.detail.suppliersFound}:</span>
                  <span className="font-semibold text-lg">{suppliers.length}</span>
                </div>
                {campaign.rfqRequest && (
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produkt:</span>
                      <span className="font-medium">{campaign.rfqRequest.productName}</span>
                    </div>
                    {campaign.rfqRequest.quantity != null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ilość:</span>
                        <span className="font-medium">{campaign.rfqRequest.quantity} {campaign.rfqRequest.unit || 'szt'}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-3 p-2.5 bg-muted/50 rounded-lg">
                  Możesz opuścić tę stronę — kampania działa w tle. Wyniki pojawią się automatycznie.
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Suppliers Feed */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Lista dostawców ({suppliers.length})</h2>
          {(isCompleted || isAccepted) && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
              <Download className="mr-2 h-4 w-4" />
              {PL.campaigns.detail.exportCSV}
            </Button>
          )}
        </div>
        <LiveSupplierFeed
          suppliers={suppliers}
          campaignId={id}
          rfqRequestId={isFullPlan ? campaign?.rfqRequest?.id : undefined}
          isAccepted={isFullPlan ? isAccepted : false}
          isRunning={isRunning}
          excludedIds={isFullPlan ? excludedIds : []}
          onExclude={isFullPlan ? handleExclude : undefined}
        />
      </motion.div>

      {/* Delete Confirmation Dialog */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDelete(false)}>
          <div className="bg-background rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">{PL.campaigns.deleteCampaign}</h3>
            <p className="text-muted-foreground mb-6">{PL.campaigns.deleteConfirm}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDelete(false)}>{PL.common.cancel}</Button>
              <Button
                variant="destructive"
                onClick={() => id && deleteMutation.mutate(id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {PL.common.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default CampaignDetailPage;
