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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRfq, useOffers, useAcceptOffer, useRejectOffer, useShortlistOffer, useCompareOffers } from '@/hooks/useRfqs';
import { offersService } from '@/services/rfqs.service';
import { PL } from '@/i18n/pl';
import type { Offer, OfferPriceTier } from '@/types/campaign.types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const STATUS_BADGE: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
  PENDING: { variant: 'secondary', label: PL.rfqs.offer.pending },
  VIEWED: { variant: 'outline', label: PL.rfqs.offer.viewed },
  SUBMITTED: { variant: 'default', label: PL.rfqs.offer.submitted },
  SHORTLISTED: { variant: 'default', label: PL.rfqs.offer.shortlisted },
  ACCEPTED: { variant: 'default', label: PL.rfqs.offer.accepted },
  REJECTED: { variant: 'destructive', label: PL.rfqs.offer.rejected },
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
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency || 'EUR' }).format(price);

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
    return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: currency || 'EUR' }).format(price);
  };

  return (
    <div className="mt-3 pt-3 border-t border-dashed">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">{PL.rfqs.offer.alternativeOffer}</span>
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
          <p className="text-muted-foreground text-xs">{PL.rfqs.offer.price}</p>
          {alt.priceTiers && alt.priceTiers.length > 0 ? (
            <PriceTiersDisplay tiers={alt.priceTiers} currency={alt.currency || 'EUR'} unit={unit} />
          ) : (
            <p className="font-medium text-xs">{formatPrice(alt.price, alt.currency)}</p>
          )}
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{PL.rfqs.offer.moq}</p>
          <p className="font-medium text-xs">{alt.moq || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{PL.rfqs.offer.leadTime}</p>
          <p className="font-medium text-xs">
            {alt.leadTime ? `${alt.leadTime} ${PL.rfqs.detail.weeks}` : '—'}
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

  const [selectedOffers, setSelectedOffers] = useState<Set<string>>(new Set());
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptDialogId, setAcceptDialogId] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

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
      toast.success('Link skopiowany do schowka');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Nie udało się skopiować linku');
    }
  };

  const handleResendEmail = async (offerId: string, supplierName: string) => {
    try {
      await offersService.resendEmail(offerId);
      toast.success(`Email wysłany ponownie do ${supplierName}`);
    } catch (error) {
      console.error('Failed to resend email:', error);
      toast.error('Nie udało się wysłać emaila');
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

  const formatCurrency = (price?: number | null, currency?: string | null) => {
    if (price == null) return '—';
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(price);
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
        <p className="text-destructive">{PL.errors.notFound}</p>
      </div>
    );
  }

  const rfqUnit = rfq.unit || 'szt.';
  const rfqQty = rfq.quantity || 0;

  const getStatusBadge = (status: string) => {
    const info = STATUS_BADGE[status] || { variant: 'secondary' as const, label: status };
    const extraClass = status === 'SHORTLISTED' ? 'bg-amber-100 text-amber-800 border-amber-200' :
      status === 'ACCEPTED' ? 'bg-green-100 text-green-800 border-green-200' : '';
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
        <button onClick={() => navigate('/rfqs')} className="hover:text-foreground transition-colors">{PL.rfqs.title}</button>
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
          {PL.rfqs.detail.backToRfqs}
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{rfq.productName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {(rfq as any).publicId || rfq.id.substring(0, 8)}
            </p>
          </div>
          <Badge variant={rfq.status === 'DRAFT' ? 'secondary' : rfq.status === 'CLOSED' ? 'outline' : 'default'}>
            {PL.rfqs.status[rfq.status?.toLowerCase() as keyof typeof PL.rfqs.status] || rfq.status}
          </Badge>
        </div>
      </motion.div>

      {/* RFQ Meta */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{PL.rfqs.detail.quantity}</p>
                <p className="font-medium">{rfq.quantity} {rfqUnit}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{PL.rfqs.detail.targetPrice}</p>
                <p className="font-medium">{formatCurrency(rfq.targetPrice, rfq.currency)}</p>
              </div>
              {rfq.material && (
                <div>
                  <p className="text-muted-foreground">{PL.rfqs.detail.material}</p>
                  <p className="font-medium">{rfq.material}</p>
                </div>
              )}
              {rfq.eau && (
                <div>
                  <p className="text-muted-foreground">{PL.rfqs.detail.eau}</p>
                  <p className="font-medium">{rfq.eau} / rok</p>
                </div>
              )}
              {rfq.incoterms && (
                <div>
                  <p className="text-muted-foreground">{PL.rfqs.detail.incoterms}</p>
                  <p className="font-medium">{rfq.incoterms}</p>
                </div>
              )}
              {rfq.desiredDeliveryDate && (
                <div>
                  <p className="text-muted-foreground">{PL.rfqs.detail.delivery}</p>
                  <p className="font-medium">{new Date(rfq.desiredDeliveryDate).toLocaleDateString('pl-PL')}</p>
                </div>
              )}
              {rfq.campaignId && (
                <div>
                  <p className="text-muted-foreground">{PL.rfqs.detail.linkedCampaign}</p>
                  <button
                    onClick={() => navigate(`/campaigns/${rfq.campaignId}`)}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {rfq.campaign?.name || 'Kampania'}
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
            {PL.rfqs.detail.offers} ({offers?.length || 0})
          </h2>
          {selectedOffers.size >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              disabled={compareMutation.isPending}
            >
              <BarChart3 className="mr-1 h-4 w-4" />
              {PL.rfqs.detail.compareSelected} ({selectedOffers.size})
            </Button>
          )}
        </div>
      </motion.div>

      {/* Comparison Result */}
      {comparisonResult && (
        <motion.div variants={itemVariants}>
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Porównanie ofert</CardTitle>
              {comparisonResult.baseCurrency && (
                <p className="text-xs text-muted-foreground mt-1">
                  Ceny przeliczone na {comparisonResult.baseCurrency} dla porównania
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-4">{PL.rfqs.offer.supplier}</th>
                      <th className="text-right py-2 px-4">
                        {rfqQty > 0
                          ? PL.rfqs.offer.priceForQty.replace('{qty}', rfqQty.toLocaleString())
                          : PL.rfqs.offer.price}
                      </th>
                      <th className="text-right py-2 px-4">{PL.rfqs.offer.moq}</th>
                      <th className="text-right py-2 px-4">{PL.rfqs.offer.leadTime}</th>
                      <th className="text-right py-2 pl-4">{PL.rfqs.offer.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonResult.offers.map((offer: any) => {
                      const isLowest = comparisonResult.comparison.lowestPrice?.offerId === offer.id;
                      const isFastest = comparisonResult.comparison.fastestDelivery?.offerId === offer.id;

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
                        <tr key={offer.id} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <Link
                              to={`/suppliers/${offer.supplier?.id}`}
                              className="font-medium text-indigo-600 hover:underline"
                            >
                              {offer.supplier?.name || '—'}
                            </Link>
                          </td>
                          <td className={`py-2 px-4 text-right ${isLowest ? 'text-green-700 font-bold' : ''}`}>
                            {displayPrice}
                            {isLowest && <span className="ml-1 text-xs">min</span>}
                          </td>
                          <td className="py-2 px-4 text-right">{offer.moq || '—'}</td>
                          <td className={`py-2 px-4 text-right ${isFastest ? 'text-green-700 font-bold' : ''}`}>
                            {offer.leadTime ? `${offer.leadTime} ${PL.rfqs.detail.weeks}` : '—'}
                            {isFastest && <span className="ml-1 text-xs">min</span>}
                          </td>
                          <td className="py-2 pl-4 text-right">{getStatusBadge(offer.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => setComparisonResult(null)}>
                Zamknij porównanie
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
              <p className="text-muted-foreground">{PL.rfqs.detail.noOffers}</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer: Offer) => (
            <motion.div variants={itemVariants} key={offer.id}>
              <Card
                className={`transition-shadow ${selectedOffers.has(offer.id) ? 'ring-2 ring-indigo-300' : ''}`}
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
                            className="font-semibold text-indigo-600 hover:underline"
                          >
                            {offer.supplier?.name || 'Dostawca'}
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
                              title="Skopiuj link do portalu"
                            >
                              <Link2 className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleResendEmail(offer.id, offer.supplier?.name || 'Dostawca')}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Wyślij ponownie email"
                            >
                              <Mail className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">{PL.rfqs.offer.price}</p>
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
                          <p className="text-muted-foreground">{PL.rfqs.offer.moq}</p>
                          <p className="font-medium">{offer.moq || '—'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{PL.rfqs.offer.leadTime}</p>
                          <p className="font-medium">
                            {offer.leadTime ? `${offer.leadTime} ${PL.rfqs.detail.weeks}` : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{PL.rfqs.detail.created}</p>
                          <p className="font-medium text-xs">
                            {new Date(offer.createdAt).toLocaleDateString('pl-PL')}
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
                            Obejrzano {new Date(offer.viewedAt).toLocaleDateString('pl-PL')}
                          </span>
                        )}
                        {offer.submittedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Złożono {new Date(offer.submittedAt).toLocaleDateString('pl-PL')}
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
                          {PL.rfqs.offer.acceptOffer}
                        </Button>
                        {offer.status === 'SUBMITTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShortlist(offer.id)}
                            disabled={shortlistMutation.isPending}
                          >
                            <Star className="mr-1 h-3.5 w-3.5" />
                            {PL.rfqs.offer.shortlisted}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRejectDialogId(offer.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          {PL.rfqs.offer.reject}
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

      {/* Reject Dialog */}
      {
        rejectDialogId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>{PL.rfqs.offer.reject}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{PL.rfqs.detail.confirmReject}</p>
                <div>
                  <label className="block text-sm font-medium mb-1">{PL.rfqs.detail.rejectReason}</label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={PL.rfqs.detail.rejectReasonPlaceholder}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => { setRejectDialogId(null); setRejectReason(''); }}>
                    {PL.common.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : null}
                    {PL.rfqs.offer.reject}
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
                <CardTitle>{PL.rfqs.offer.acceptOffer}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{PL.rfqs.detail.confirmAccept}</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setAcceptDialogId(null)}>
                    {PL.common.cancel}
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAccept(acceptDialogId)}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : null}
                    {PL.rfqs.offer.acceptOffer}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      }
    </motion.div >
  );
}

export default RfqDetailPage;
