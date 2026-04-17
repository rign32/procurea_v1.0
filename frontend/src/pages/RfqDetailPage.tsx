/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Star,
  BarChart3,
  Clock,
  Eye,
  Send as SendIcon,
  Layers,
  Link2,
  Mail,
  Repeat,
  FileSignature,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useRfq, useOffers, useAcceptOffer, useRejectOffer, useShortlistOffer, useCompareOffers, useCounterOffer } from '@/hooks/useRfqs';
import { offersService } from '@/services/rfqs.service';
import { contractsService, type ContractDraft, type ContractDraftSource } from '@/services/contracts.service';
import { t, isEN } from '@/i18n';
import type { Offer, OfferPriceTier } from '@/types/campaign.types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { CommentThread } from '@/components/collaboration/CommentThread';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const STATUS_BADGE: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  PENDING: { variant: 'secondary', label: t.rfqs.offer.pending },
  VIEWED: { variant: 'outline', label: t.rfqs.offer.viewed },
  SUBMITTED: { variant: 'default', label: t.rfqs.offer.submitted },
  SHORTLISTED: { variant: 'default', label: t.rfqs.offer.shortlisted },
  ACCEPTED: { variant: 'default', label: t.rfqs.offer.accepted },
  REJECTED: { variant: 'destructive', label: t.rfqs.offer.rejected },
  COUNTER_OFFERED: { variant: 'outline', label: t.rfqs.offer.counterOffered },
};

// Find the price for a specific quantity from tiers
function getPriceForQty(tiers: OfferPriceTier[], qty: number): number | null {
  for (const tier of tiers) {
    if (qty >= tier.minQty && (tier.maxQty == null || qty <= tier.maxQty)) {
      return tier.unitPrice;
    }
  }
  // Fallback to last tier if qty exceeds all
  if (tiers.length > 0) {
    const last = tiers[tiers.length - 1];
    if (last.maxQty == null && qty >= last.minQty) return last.unitPrice;
  }
  return null;
}

// Format a tier range
function formatTierRange(tier: OfferPriceTier, unit: string): string {
  if (tier.maxQty == null) {
    return `${tier.minQty}+ ${unit}`;
  }
  return `${tier.minQty}–${tier.maxQty} ${unit}`;
}

// Price tiers inline display
function PriceTiersDisplay({ tiers, currency, unit }: { tiers: OfferPriceTier[]; currency: string; unit: string }) {
  if (!tiers || tiers.length === 0) return null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(isEN ? 'en-US' : 'pl-PL', { style: 'currency', currency: currency || 'EUR' }).format(price);

  return (
    <div className="space-y-1">
      {tiers.map((tier) => (
        <div key={tier.id} className="flex justify-between text-xs">
          <span className="text-muted-foreground">{formatTierRange(tier, unit)}</span>
          <span className="font-medium">{formatPrice(tier.unitPrice)}</span>
        </div>
      ))}
    </div>
  );
}

// Alternative offer card
function AlternativeOfferCard({ alt, unit }: { alt: Offer; unit: string }) {
  const formatPrice = (price?: number, currency?: string) => {
    if (price == null) return '—';
    return new Intl.NumberFormat(isEN ? 'en-US' : 'pl-PL', { style: 'currency', currency: currency || 'EUR' }).format(price);
  };

  return (
    <div className="mt-3 pt-3 border-t border-dashed">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">{t.rfqs.offer.alternativeOffer}</span>
        {alt.altMaterial && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {alt.altMaterial}
          </Badge>
        )}
      </div>
      {alt.altDescription && (
        <p className="text-xs text-muted-foreground italic mb-2">{alt.altDescription}</p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground text-xs">{t.rfqs.offer.price}</p>
          {alt.priceTiers && alt.priceTiers.length > 0 ? (
            <PriceTiersDisplay tiers={alt.priceTiers} currency={alt.currency || 'EUR'} unit={unit} />
          ) : (
            <p className="font-medium text-xs">{formatPrice(alt.price, alt.currency)}</p>
          )}
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{t.rfqs.offer.moq}</p>
          <p className="font-medium text-xs">{alt.moq || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{t.rfqs.offer.leadTime}</p>
          <p className="font-medium text-xs">
            {alt.leadTime ? `${alt.leadTime} ${t.rfqs.detail.weeks}` : '—'}
          </p>
        </div>
      </div>
      {alt.comments && (
        <p className="mt-1.5 text-xs text-muted-foreground">{alt.comments}</p>
      )}
    </div>
  );
}

export function RfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rfq, isLoading: rfqLoading } = useRfq(id || '');
  const { data: offers, isLoading: offersLoading } = useOffers(id || '');

  const acceptMutation = useAcceptOffer();
  const rejectMutation = useRejectOffer();
  const shortlistMutation = useShortlistOffer();
  const compareMutation = useCompareOffers();
  const counterOfferMutation = useCounterOffer();

  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set());
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptDialogId, setAcceptDialogId] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [counterDialogId, setCounterDialogId] = useState<string | null>(null);
  const [counterForm, setCounterForm] = useState<{ price: string; moq: string; leadTime: string; comments: string }>({ price: '', moq: '', leadTime: '', comments: '' });

  // Contract auto-fill from accepted offer (AI-powered)
  const [generatingContractOfferId, setGeneratingContractOfferId] = useState<string | null>(null);
  const [contractDraft, setContractDraft] = useState<ContractDraft | null>(null);
  const [contractDraftSource, setContractDraftSource] = useState<ContractDraftSource | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractForm, setContractForm] = useState<{ title: string; terms: string; startDate: string; endDate: string }>({ title: '', terms: '', startDate: '', endDate: '' });
  const [savingContract, setSavingContract] = useState(false);

  const toggleOfferSelection = (offerId: string) => {
    setSelectedOffers(prev => {
      const next = new Set(prev);
      if (next.has(offerId)) next.delete(offerId);
      else next.add(offerId);
      return next;
    });
  };

  const handleAccept = async (offerId: string) => {
    try {
      await acceptMutation.mutateAsync(offerId);
      setAcceptDialogId(null);
    } catch {
      // error handled by React Query
    }
  };

  const handleReject = async () => {
    if (!rejectDialogId) return;
    try {
      await rejectMutation.mutateAsync({ id: rejectDialogId, reason: rejectReason || undefined });
      setRejectDialogId(null);
      setRejectReason('');
    } catch {
      // error handled by React Query
    }
  };

  const handleShortlist = async (offerId: string) => {
    try {
      await shortlistMutation.mutateAsync(offerId);
    } catch {
      // error handled by React Query
    }
  };

  const handleCopyPortalLink = async (offerId: string) => {
    try {
      const { portalUrl } = await offersService.getPortalLink(offerId);
      await navigator.clipboard.writeText(portalUrl);
      toast.success(t.rfqs.detail.linkCopied);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error(t.rfqs.detail.linkCopyFailed);
    }
  };

  const handleResendEmail = async (offerId: string, supplierName: string) => {
    try {
      await offersService.resendEmail(offerId);
      toast.success(`${t.rfqs.detail.emailResent} ${supplierName}`);
    } catch (error) {
      console.error('Failed to resend email:', error);
      toast.error(t.rfqs.detail.emailResendFailed);
    }
  };

  const handleCompare = async () => {
    if (selectedOffers.size < 2) return;
    try {
      const result = await compareMutation.mutateAsync(Array.from(selectedOffers));
      setComparisonResult(result);
    } catch {
      // error handled by React Query
    }
  };

  const openCounterDialog = (offerId: string) => {
    setCounterDialogId(offerId);
    setCounterForm({ price: '', moq: '', leadTime: '', comments: '' });
  };

  const handleCounterOffer = async () => {
    if (!counterDialogId) return;
    const terms: { price?: number; moq?: number; leadTime?: number; comments?: string } = {};
    if (counterForm.price) terms.price = Number(counterForm.price);
    if (counterForm.moq) terms.moq = Number(counterForm.moq);
    if (counterForm.leadTime) terms.leadTime = Number(counterForm.leadTime);
    if (counterForm.comments.trim()) terms.comments = counterForm.comments.trim();

    if (Object.keys(terms).length === 0) return;

    try {
      await counterOfferMutation.mutateAsync({ id: counterDialogId, terms });
      setCounterDialogId(null);
      toast.success(t.rfqs.offer.counterOfferSuccess);
    } catch {
      toast.error(t.rfqs.offer.counterOfferError);
    }
  };

  const formatCurrency = (price?: number | null, currency?: string | null) => {
    if (price == null) return '—';
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(price);
  };

  // --- Contract auto-fill from accepted offer (AI-powered) ---
  const handleGenerateContractFromOffer = async (offerId: string) => {
    try {
      setGeneratingContractOfferId(offerId);
      const { draft, source } = await contractsService.generateFromOffer(offerId);
      setContractDraft(draft);
      setContractDraftSource(source);
      setContractForm({
        title: draft.title || '',
        terms: draft.terms || '',
        startDate: draft.startDate || '',
        endDate: draft.endDate || '',
      });
      setShowContractModal(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (isEN ? 'Failed to generate contract' : 'Nie udało się wygenerować kontraktu');
      toast.error(isEN ? `Failed to generate contract: ${msg}` : `Nie udało się wygenerować kontraktu: ${msg}`);
    } finally {
      setGeneratingContractOfferId(null);
    }
  };

  const handleSaveContract = async () => {
    if (!contractDraft) return;
    if (!contractForm.title.trim()) {
      toast.error(isEN ? 'Title is required' : 'Tytuł jest wymagany');
      return;
    }
    try {
      setSavingContract(true);
      await contractsService.create({
        offerId: contractDraft.offerId,
        title: contractForm.title.trim(),
        terms: contractForm.terms.trim() || undefined,
        startDate: contractForm.startDate || undefined,
        endDate: contractForm.endDate || undefined,
      });
      toast.success(isEN ? 'Contract created' : 'Kontrakt utworzony');
      setShowContractModal(false);
      setContractDraft(null);
      setContractDraftSource(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || (isEN ? 'Failed to save contract' : 'Nie udało się zapisać kontraktu');
      toast.error(isEN ? `Failed to save contract: ${msg}` : `Nie udało się zapisać kontraktu: ${msg}`);
    } finally {
      setSavingContract(false);
    }
  };

  if (rfqLoading || offersLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">{t.errors.notFound}</p>
      </div>
    );
  }

  const rfqUnit = rfq.unit || t.campaigns.wizard.specs.unitDefault;
  const rfqQty = rfq.quantity || 0;

  const getStatusBadge = (status: string) => {
    const info = STATUS_BADGE[status] || { variant: 'secondary' as const, label: status };
    const extraClass = status === 'SHORTLISTED' ? 'bg-amber-100 text-amber-800 border-amber-200' :
      status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' :
      status === 'COUNTER_OFFERED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : '';
    return <Badge variant={info.variant} className={extraClass}>{info.label}</Badge>;
  };

  const canAct = (offer: Offer) => ['SUBMITTED', 'SHORTLISTED'].includes(offer.status);

  // Get display price: from tiers for RFQ qty, or fallback to offer.price
  const getDisplayPrice = (offer: Offer): string => {
    if (offer.priceTiers && offer.priceTiers.length > 0 && rfqQty > 0) {
      const tierPrice = getPriceForQty(offer.priceTiers, rfqQty);
      if (tierPrice != null) return formatCurrency(tierPrice, offer.currency);
    }
    return formatCurrency(offer.price, offer.currency);
  };

  // Display price with conversion (if available)
  const getDisplayPriceWithConversion = (offer: any) => {
    const originalPrice = getDisplayPrice(offer);

    // If comparison data includes converted price and it's different from original
    if (offer.convertedPrice != null && offer.convertedPrice !== offer.price) {
      const convertedCurrency = comparisonResult?.baseCurrency || 'PLN';
      const convertedAmount = formatCurrency(offer.convertedPrice, convertedCurrency);

      return (
        <div>
          <p className="font-semibold">{originalPrice}</p>
          <p className="text-xs text-muted-foreground">
            ≈ {convertedAmount}
          </p>
        </div>
      );
    }

    return <p className="font-semibold">{originalPrice}</p>;
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/rfqs');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-[-10px]">
        <button onClick={() => navigate('/rfqs')} className="hover:text-foreground transition-colors">{t.rfqs.title}</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium line-clamp-1">{rfq.productName}</span>
      </div>

      {/* Header */}
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="mb-3"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t.rfqs.detail.backToRfqs}
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{rfq.productName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {(rfq as any).publicId || rfq.id.substring(0, 8)}
            </p>
          </div>
          <Badge variant={rfq.status === 'DRAFT' ? 'secondary' : rfq.status === 'CLOSED' ? 'outline' : 'default'}>
            {t.rfqs.status[rfq.status?.toLowerCase() as keyof typeof t.rfqs.status] || rfq.status}
          </Badge>
        </div>
      </motion.div>

      {/* RFQ Meta */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t.rfqs.detail.quantity}</p>
                <p className="font-medium">{rfq.quantity} {rfqUnit}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t.rfqs.detail.targetPrice}</p>
                <p className="font-medium">{formatCurrency(rfq.targetPrice, rfq.currency)}</p>
              </div>
              {rfq.material && (
                <div>
                  <p className="text-muted-foreground">{t.rfqs.detail.material}</p>
                  <p className="font-medium">{rfq.material}</p>
                </div>
              )}
              {rfq.eau && (
                <div>
                  <p className="text-muted-foreground">{t.rfqs.detail.eau}</p>
                  <p className="font-medium">{rfq.eau} {t.rfqs.detail.perYear}</p>
                </div>
              )}
              {rfq.incoterms && (
                <div>
                  <p className="text-muted-foreground">{t.rfqs.detail.incoterms}</p>
                  <p className="font-medium">{rfq.incoterms}</p>
                </div>
              )}
              {rfq.desiredDeliveryDate && (
                <div>
                  <p className="text-muted-foreground">{t.rfqs.detail.delivery}</p>
                  <p className="font-medium">{new Date(rfq.desiredDeliveryDate).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}</p>
                </div>
              )}
              {rfq.campaignId && (
                <div>
                  <p className="text-muted-foreground">{t.rfqs.detail.linkedCampaign}</p>
                  <button
                    onClick={() => navigate(`/campaigns/${rfq.campaignId}`)}
                    className="font-medium text-primary hover:underline"
                  >
                    {rfq.campaign?.name || t.rfqs.detail.campaign}
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Offers Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t.rfqs.detail.offers} ({offers?.length || 0})
          </h2>
          {selectedOffers.size >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              disabled={compareMutation.isPending}
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              {t.rfqs.detail.compareSelected} ({selectedOffers.size})
            </Button>
          )}
        </div>
      </motion.div>

      {/* Comparison Result */}
      {comparisonResult && (
        <motion.div variants={itemVariants}>
          {/* AI Recommendation Card */}
          {comparisonResult.aiRecommendation && (
            <Card className="border-blue-200 bg-blue-50/50 mb-3">
              <CardContent className="py-4">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <p className="font-semibold text-sm text-blue-900">
                      {t.rfqs.detail.aiRecommendation}:{' '}
                      {comparisonResult.offers.find((o: any) => o.id === comparisonResult.aiRecommendation.recommendedOfferId)?.supplier?.name || '—'}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">{comparisonResult.aiRecommendation.reasoning}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card className="border-[#C5E0E2] bg-[#EDF4F4]/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.rfqs.detail.comparison}</CardTitle>
              {comparisonResult.baseCurrency && (
                <p className="text-xs text-muted-foreground mt-1">
                  {t.rfqs.detail.comparisonCurrency.replace('{currency}', comparisonResult.baseCurrency)}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">{t.rfqs.offer.supplier}</th>
                      <th className="text-right py-2 px-4">
                        {rfqQty > 0
                          ? t.rfqs.offer.priceForQty.replace('{qty}', rfqQty.toLocaleString())
                          : t.rfqs.offer.price}
                      </th>
                      <th className="text-right py-2 px-4">{t.rfqs.offer.moq}</th>
                      <th className="text-right py-2 px-4">{t.rfqs.offer.leadTime}</th>
                      <th className="text-center py-2 px-4">{t.rfqs.detail.qualityScore}</th>
                      <th className="text-center py-2 px-4">{t.rfqs.detail.aiScore}</th>
                      <th className="text-right py-2 pl-4">{t.rfqs.offer.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResult.offers.map((offer: any) => {
                      const isLowest = comparisonResult.comparison.lowestPrice?.offerId === offer.id;
                      const isFastest = comparisonResult.comparison.fastestDelivery?.offerId === offer.id;
                      const isRecommended = comparisonResult.aiRecommendation?.recommendedOfferId === offer.id;
                      const aiScore = comparisonResult.aiRecommendation?.scores?.find((s: any) => s.offerId === offer.id);
                      const risks = offer.riskFlags || {};

                      // Use tier price for comparison if available
                      let displayPrice: string;
                      if (offer.priceTiers?.length > 0 && rfqQty > 0) {
                        const tierPrice = getPriceForQty(offer.priceTiers, rfqQty);
                        displayPrice = tierPrice != null
                          ? formatCurrency(tierPrice, offer.currency)
                          : formatCurrency(offer.price, offer.currency);
                      } else {
                        displayPrice = formatCurrency(offer.price, offer.currency);
                      }

                      return (
                        <tr key={offer.id} className={`border-b last:border-0 ${isRecommended ? 'bg-blue-50/50' : ''}`}>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1">
                              {isRecommended && <span title={t.rfqs.detail.aiRecommendation}>⭐</span>}
                              <Link
                                to={`/suppliers/${offer.supplier?.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {offer.supplier?.name || '—'}
                              </Link>
                            </div>
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {risks.isNewSupplier && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-1 rounded" title={t.rfqs.detail.newSupplier}>⚠️ {t.rfqs.detail.newSupplier}</span>
                              )}
                              {risks.leadTimeRisk && (
                                <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded" title={t.rfqs.detail.deliveryRisk}>🕐 {t.rfqs.detail.deliveryRisk}</span>
                              )}
                              {risks.priceOutlier && (
                                <span className="text-xs bg-red-100 text-red-800 px-1 rounded" title={t.rfqs.detail.priceOutlier}>💲 {t.rfqs.detail.priceOutlier}</span>
                              )}
                              {offer.compliance?.specsConfirmed && (
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓ {t.rfqs.detail.specsOk}</span>
                              )}
                              {offer.compliance?.incotermsConfirmed && (
                                <span className="text-xs bg-green-100 text-green-800 px-1 rounded">✓ {t.rfqs.detail.incotermsOk}</span>
                              )}
                            </div>
                          </td>
                          <td className={`py-2 px-4 text-right ${isLowest ? 'text-green-700 font-bold' : ''}`}>
                            {displayPrice}
                            {isLowest && <span className="ml-1 text-xs">min</span>}
                          </td>
                          <td className="py-2 px-4 text-right">{offer.moq || '—'}</td>
                          <td className={`py-2 px-4 text-right ${isFastest ? 'text-green-700 font-bold' : ''}`}>
                            {offer.leadTime ? `${offer.leadTime} ${t.rfqs.detail.weeks}` : '—'}
                            {isFastest && <span className="ml-1 text-xs">min</span>}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {offer.qualityScore != null ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                offer.qualityScore >= 80 ? 'bg-green-100 text-green-800' :
                                offer.qualityScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {Math.round(offer.qualityScore)}/100
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center">
                            {aiScore ? (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                aiScore.score >= 80 ? 'bg-blue-100 text-blue-800' :
                                aiScore.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {aiScore.score}/100
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-2 pl-4 text-right">{getStatusBadge(offer.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setComparisonResult(null)}>
                {t.rfqs.detail.closeComparison}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Offers List */}
      {(!offers || offers.length === 0) ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12">
              <SendIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t.rfqs.detail.noOffers}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer: Offer) => (
            <motion.div variants={itemVariants} key={offer.id}>
              <Card
                className={`transition-shadow ${selectedOffers.has(offer.id) ? 'ring-2 ring-[#A9CDD0]' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox for comparison */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedOffers.has(offer.id)}
                        onChange={() => toggleOfferSelection(offer.id)}
                        className="rounded border-input h-4 w-4"
                      />
                    </div>

                    {/* Offer Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/suppliers/${offer.supplier?.id}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {offer.supplier?.name || t.rfqs.offer.supplier}
                          </Link>
                          {offer.supplier?.country && (
                            <span className="text-xs text-muted-foreground">({offer.supplier.country})</span>
                          )}
                          {offer.alternatives && offer.alternatives.length > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                              +Alt
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleCopyPortalLink(offer.id)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={t.rfqs.detail.copyPortalLink}
                            >
                              <Link2 className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleResendEmail(offer.id, offer.supplier?.name || t.rfqs.offer.supplier)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={t.rfqs.detail.resendEmail}
                            >
                              <Mail className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">{t.rfqs.offer.price}</p>
                          {offer.priceTiers && offer.priceTiers.length > 0 ? (
                            <PriceTiersDisplay
                              tiers={offer.priceTiers}
                              currency={offer.currency || 'EUR'}
                              unit={rfqUnit}
                            />
                          ) : (
                            getDisplayPriceWithConversion(offer)
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t.rfqs.offer.moq}</p>
                          <p className="font-medium">{offer.moq || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t.rfqs.offer.leadTime}</p>
                          <p className="font-medium">
                            {offer.leadTime ? `${offer.leadTime} ${t.rfqs.detail.weeks}` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{t.rfqs.detail.created}</p>
                          <p className="font-medium text-xs">
                            {new Date(offer.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                          </p>
                        </div>
                      </div>

                      {offer.comments && (
                        <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
                          {offer.comments}
                        </p>
                      )}

                      {/* Status indicators */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {offer.viewedAt && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {t.rfqs.detail.viewed} {new Date(offer.viewedAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                          </span>
                        )}
                        {offer.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {t.rfqs.detail.submitted} {new Date(offer.submittedAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                          </span>
                        )}
                        {offer.specsConfirmed && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" /> Spec
                          </span>
                        )}
                        {offer.incotermsConfirmed && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" /> Incoterms
                          </span>
                        )}
                      </div>

                      {/* Alternative offers */}
                      {offer.alternatives && offer.alternatives.length > 0 && (
                        offer.alternatives.map((alt) => (
                          <AlternativeOfferCard key={alt.id} alt={alt} unit={rfqUnit} />
                        ))
                      )}

                      {/* Counter-offer terms display */}
                      {offer.status === 'COUNTER_OFFERED' && (
                        <div className="mt-3 pt-3 border-t border-dashed">
                          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Repeat className="h-3.5 w-3.5 text-yellow-700" />
                              <span className="text-xs font-semibold text-yellow-800">{t.rfqs.offer.counterTerms}</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              {offer.counterPrice != null && (
                                <div>
                                  <p className="text-muted-foreground text-xs">{t.rfqs.offer.counterPrice}</p>
                                  <p className="font-medium text-xs">{formatCurrency(offer.counterPrice, offer.currency)}</p>
                                </div>
                              )}
                              {offer.counterMoq != null && (
                                <div>
                                  <p className="text-muted-foreground text-xs">{t.rfqs.offer.counterMoq}</p>
                                  <p className="font-medium text-xs">{offer.counterMoq}</p>
                                </div>
                              )}
                              {offer.counterLeadTime != null && (
                                <div>
                                  <p className="text-muted-foreground text-xs">{t.rfqs.offer.counterLeadTime}</p>
                                  <p className="font-medium text-xs">{offer.counterLeadTime} {t.rfqs.detail.weeks}</p>
                                </div>
                              )}
                              {offer.counterComments && (
                                <div className="col-span-2 md:col-span-4">
                                  <p className="text-muted-foreground text-xs">{t.rfqs.offer.counterComments}</p>
                                  <p className="font-medium text-xs">{offer.counterComments}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-2">
                              <Clock className="h-3 w-3 text-yellow-600 animate-pulse" />
                              <span className="text-xs text-yellow-700">{t.rfqs.offer.counterWaiting}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canAct(offer) && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => setAcceptDialogId(offer.id)}
                          disabled={acceptMutation.isPending}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          {t.rfqs.offer.acceptOffer}
                        </Button>
                        {offer.status === 'SUBMITTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShortlist(offer.id)}
                            disabled={shortlistMutation.isPending}
                          >
                            <Star className="mr-1 h-3.5 w-3.5" />
                            {t.rfqs.offer.shortlisted}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCounterDialog(offer.id)}
                          disabled={counterOfferMutation.isPending}
                        >
                          <Repeat className="mr-1 h-3.5 w-3.5" />
                          {t.rfqs.offer.counterOffer}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectDialogId(offer.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          {t.rfqs.offer.reject}
                        </Button>
                      </div>
                    )}

                    {/* Accepted offer: AI contract generation */}
                    {offer.status === 'ACCEPTED' && (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => handleGenerateContractFromOffer(offer.id)}
                          disabled={generatingContractOfferId === offer.id}
                        >
                          {generatingContractOfferId === offer.id ? (
                            <>
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                              {isEN ? 'Generating…' : 'Generuję…'}
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-1 h-3.5 w-3.5" />
                              {isEN ? 'Generate contract from this offer' : 'Generuj kontrakt z tej oferty'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )
      }

      {/* Comments Section */}
      {id && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <CommentThread entityType="rfq" entityId={id} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reject Dialog */}
      {
        rejectDialogId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>{t.rfqs.offer.reject}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t.rfqs.detail.confirmReject}</p>
                <div>
                  <label className="block text-sm font-medium mb-1">{t.rfqs.detail.rejectReason}</label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t.rfqs.detail.rejectReasonPlaceholder}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setRejectDialogId(null); setRejectReason(''); }}>
                    {t.common.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : null}
                    {t.rfqs.offer.reject}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Accept Confirmation Dialog */}
      {
        acceptDialogId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>{t.rfqs.offer.acceptOffer}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t.rfqs.detail.confirmAccept}</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setAcceptDialogId(null)}>
                    {t.common.cancel}
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAccept(acceptDialogId)}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : null}
                    {t.rfqs.offer.acceptOffer}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }

      {/* Contract Auto-Fill Modal (AI-generated draft from accepted offer) */}
      <Dialog
        open={showContractModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowContractModal(false);
            setContractDraft(null);
            setContractDraftSource(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5" />
              {isEN ? 'New contract from offer' : 'Nowy kontrakt z oferty'}
            </DialogTitle>
            <DialogDescription>
              {isEN
                ? 'AI has pre-filled the contract draft. Review and edit before saving.'
                : 'AI wypełniło wstępny kontrakt. Sprawdź i edytuj przed zapisem.'}
            </DialogDescription>
          </DialogHeader>

          {contractDraftSource && (
            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide">{isEN ? 'Product' : 'Produkt'}</p>
                  <p className="font-medium text-foreground">{contractDraftSource.productName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide">{isEN ? 'Supplier' : 'Dostawca'}</p>
                  <p className="font-medium text-foreground">{contractDraftSource.supplierName}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide">{isEN ? 'Price' : 'Cena'}</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(contractDraftSource.price, contractDraftSource.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide">Incoterms</p>
                  <p className="font-medium text-foreground">{contractDraftSource.incoterms || '—'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                {isEN ? 'Title' : 'Tytuł'} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={contractForm.title}
                onChange={(e) => setContractForm((prev) => ({ ...prev, title: e.target.value }))}
                maxLength={200}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isEN ? 'Start date' : 'Data rozpoczęcia'}
                </label>
                <input
                  type="date"
                  value={contractForm.startDate}
                  onChange={(e) => setContractForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {isEN ? 'End date' : 'Data zakończenia'}
                </label>
                <input
                  type="date"
                  value={contractForm.endDate}
                  onChange={(e) => setContractForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {isEN ? 'Terms (markdown)' : 'Treść kontraktu (markdown)'}
              </label>
              <textarea
                rows={16}
                value={contractForm.terms}
                onChange={(e) => setContractForm((prev) => ({ ...prev, terms: e.target.value }))}
                maxLength={5000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isEN
                  ? 'Replace [PLACEHOLDER] markers with actual values where needed.'
                  : 'Zastąp znaczniki [PLACEHOLDER] właściwymi wartościami, gdzie to konieczne.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowContractModal(false);
                setContractDraft(null);
                setContractDraftSource(null);
              }}
              disabled={savingContract}
            >
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveContract} disabled={savingContract || !contractForm.title.trim()}>
              {savingContract ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <FileSignature className="mr-1 h-4 w-4" />
              )}
              {isEN ? 'Save contract' : 'Zapisz kontrakt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Counter-Offer Dialog */}
      <Dialog open={!!counterDialogId} onOpenChange={(open) => { if (!open) setCounterDialogId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rfqs.offer.counterOfferTitle}</DialogTitle>
            <DialogDescription>{t.rfqs.offer.counterOfferDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1">{t.rfqs.offer.counterPrice}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={counterForm.price}
                onChange={(e) => setCounterForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.rfqs.offer.counterMoq}</label>
              <input
                type="number"
                min="0"
                step="1"
                value={counterForm.moq}
                onChange={(e) => setCounterForm(prev => ({ ...prev, moq: e.target.value }))}
                placeholder="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.rfqs.offer.counterLeadTime}</label>
              <input
                type="number"
                min="0"
                step="1"
                value={counterForm.leadTime}
                onChange={(e) => setCounterForm(prev => ({ ...prev, leadTime: e.target.value }))}
                placeholder="0"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.rfqs.offer.counterComments}</label>
              <textarea
                rows={3}
                value={counterForm.comments}
                onChange={(e) => setCounterForm(prev => ({ ...prev, comments: e.target.value }))}
                placeholder={t.rfqs.offer.counterCommentsPlaceholder}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounterDialogId(null)}>
              {t.common.cancel}
            </Button>
            <Button
              onClick={handleCounterOffer}
              disabled={counterOfferMutation.isPending || (!counterForm.price && !counterForm.moq && !counterForm.leadTime && !counterForm.comments.trim())}
            >
              {counterOfferMutation.isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Repeat className="mr-1 h-4 w-4" />
              )}
              {t.rfqs.offer.counterOfferSend}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div >
  );
}

export default RfqDetailPage;
