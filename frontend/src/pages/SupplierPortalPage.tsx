import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  Plus,
  X,
  Download,
  FileText,
  ChevronRight,
  Globe,
  Upload,
  FileIcon,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePortalOffer, useSubmitPortalOffer, usePortalTranslations } from '@/hooks/usePortal';
import portalService from '@/services/portal.service';
import type { OfferAttachment } from '@/services/portal.service';
import {
  getPortalTranslations,
  SUPPORTED_PORTAL_LANGUAGES,
  type PortalTranslations,
} from '@/i18n/portal-translations';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortalBranding } from '@/hooks/useBranding';

const INPUT_CLASS =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface TierRow {
  minQty: string;
  maxQty: string;
  unitPrice: string;
}

interface AltFormData {
  enabled: boolean;
  altDescription: string;
  altMaterial: string;
  moq: string;
  leadTime: string;
  validityDate: string;
  comments: string;
  tiers: TierRow[];
}

const API_BASE = import.meta.env.VITE_API_URL || '';

function emptyTier(rfqQty?: number): TierRow {
  return { minQty: rfqQty ? String(rfqQty) : '1', maxQty: '', unitPrice: '' };
}

// --- Step indicator ---
function StepIndicator({ current, steps, t }: { current: number; steps: string[]; t: PortalTranslations }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {steps.map((label, i) => {
        const isActive = i === current;
        const isDone = i < current;
        return (
          <div key={i} className="flex items-center gap-1 sm:gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive
                ? 'bg-primary text-white'
                : isDone
                  ? 'bg-[#D4E6E7] text-[#2A5C5D]'
                  : 'bg-slate-100 text-slate-400'
                }`}
            >
              <span className="hidden sm:inline">{t.common.step} {i + 1}:</span>
              <span>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- Price tiers table ---
function PriceTiersTable({
  tiers,
  setTiers,
  t,
  rfqUnit,
}: {
  tiers: TierRow[];
  setTiers: (tiers: TierRow[]) => void;
  t: PortalTranslations;
  rfqUnit: string;
}) {
  const updateTier = (index: number, field: keyof TierRow, value: string) => {
    const next = [...tiers];
    next[index] = { ...next[index], [field]: value };
    setTiers(next);
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const nextMin = lastTier?.maxQty ? String(parseInt(lastTier.maxQty) + 1) : '';
    setTiers([...tiers, { minQty: nextMin, maxQty: '', unitPrice: '' }]);
  };

  const removeTier = (index: number) => {
    if (tiers.length <= 1) return;
    setTiers(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
        <span>{t.pricing.from} ({rfqUnit})</span>
        <span>{t.pricing.to} ({rfqUnit})</span>
        <span>{t.pricing.unitPrice}</span>
        <span />
      </div>

      {tiers.map((tier, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 items-center">
          <input
            type="number"
            min="1"
            value={tier.minQty}
            onChange={(e) => updateTier(i, 'minQty', e.target.value)}
            placeholder="1"
            className={INPUT_CLASS}
          />
          <input
            type="number"
            min="0"
            value={tier.maxQty}
            onChange={(e) => updateTier(i, 'maxQty', e.target.value)}
            placeholder={i === tiers.length - 1 ? t.pricing.andAbove : ''}
            className={INPUT_CLASS}
          />
          <input
            type="number"
            step="0.01"
            min="0"
            value={tier.unitPrice}
            onChange={(e) => updateTier(i, 'unitPrice', e.target.value)}
            placeholder="0.00"
            className={INPUT_CLASS}
          />
          <button
            type="button"
            onClick={() => removeTier(i)}
            disabled={tiers.length <= 1}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title={t.pricing.removeTier}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addTier} className="mt-1">
        <Plus className="mr-1 h-3.5 w-3.5" />
        {t.pricing.addTier}
      </Button>
    </div>
  );
}

// ==========================================================================

export function SupplierPortalPage() {
  const { accessToken } = useParams<{ accessToken: string }>();
  const { data, isLoading, error } = usePortalOffer(accessToken || '');
  const submitMutation = useSubmitPortalOffer();

  // Apply organization branding (colors) to portal
  usePortalBranding(data?.organization);

  // Language
  const [langCode, setLangCode] = useState<string | null>(null);
  const effectiveLang = langCode || data?.portalLanguage || 'en';

  // Fetch translations from API (with fallback to static)
  const { data: translationData } = usePortalTranslations(effectiveLang);
  const t: PortalTranslations = useMemo(() => {
    // Use API translations if available
    if (translationData?.translations) {
      return translationData.translations;
    }
    // Fallback to static translations (for offline or error cases)
    return getPortalTranslations(effectiveLang);
  }, [translationData, effectiveLang]);

  // Step state
  const [step, setStep] = useState(0);

  // Pricing form
  const [currency, setCurrency] = useState('EUR');
  const [moq, setMoq] = useState('');
  const [leadTime, setLeadTime] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [tiers, setTiers] = useState<TierRow[]>([emptyTier()]);

  // Alternative form
  const [alt, setAlt] = useState<AltFormData>({
    enabled: false,
    altDescription: '',
    altMaterial: '',
    moq: '',
    leadTime: '',
    validityDate: '',
    comments: '',
    tiers: [emptyTier()],
  });

  // File attachments
  const [attachments, setAttachments] = useState<OfferAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Confirm form
  const [specsConfirmed, setSpecsConfirmed] = useState(false);
  const [incotermsConfirmed, setIncotermsConfirmed] = useState(false);
  const [comments, setComments] = useState('');
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Init currency and tiers from RFQ data (once)
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current || !data) return;
    initializedRef.current = true;

    const rfqCurrency = data.rfq?.currency;
    if (rfqCurrency && rfqCurrency !== 'EUR') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrency(rfqCurrency);
    }

    const rfqQty = data.rfq?.quantity;
    if (rfqQty) {
       
      setTiers([{ minQty: '1', maxQty: String(rfqQty), unitPrice: '' }]);
    }
  }, [data]);

  const STEPS = [t.steps.rfqReview, t.steps.pricing, t.steps.alternative, t.steps.confirm];

  // ---- Validation per step ----
  const validatePricing = (): string | null => {
    for (const tier of tiers) {
      if (!tier.minQty || parseInt(tier.minQty) < 1) return t.errors.minQtyRequired;
      if (!tier.unitPrice || parseFloat(tier.unitPrice) <= 0) return t.errors.invalidPrice;
    }
    return null;
  };

  const validateAlternative = (): string | null => {
    if (!alt.enabled) return null;
    if (!alt.altDescription.trim()) return t.errors.altDescriptionRequired;
    if (alt.tiers.length === 0) return t.errors.altTiersRequired;
    for (const tier of alt.tiers) {
      if (!tier.minQty || parseInt(tier.minQty) < 1) return t.errors.minQtyRequired;
      if (!tier.unitPrice || parseFloat(tier.unitPrice) <= 0) return t.errors.invalidPrice;
    }
    return null;
  };

  const canNext = (): boolean => {
    if (step === 1) return !validatePricing();
    if (step === 2) return !validateAlternative();
    return true;
  };

  const handleNext = () => {
    setFormError('');
    if (step === 1) {
      const err = validatePricing();
      if (err) { setFormError(err); return; }
    }
    if (step === 2) {
      const err = validateAlternative();
      if (err) { setFormError(err); return; }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setFormError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  const MAX_ATTACHMENTS = 5;
  const ALLOWED_EXTENSIONS = '.pdf,.dxf,.step,.stp,.jpg,.jpeg,.png';
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!accessToken) return;
    setUploadError('');
    const arr = Array.from(files);
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (arr.length > remaining) {
      setUploadError(t.upload.maxFiles.replace('{remaining}', String(remaining)));
      return;
    }

    setUploading(true);
    for (const file of arr) {
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(t.upload.fileTooLarge.replace('{name}', file.name));
        continue;
      }
      try {
        const result = await portalService.uploadFile(accessToken, file);
        setAttachments((prev) => [
          ...prev,
          { filename: result.storedFilename, originalName: result.filename, url: result.url },
        ]);
      } catch {
        setUploadError(t.upload.uploadError.replace('{name}', file.name));
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setFormError('');
    if (!accessToken) return;

    const priceTiers = tiers.map((t) => ({
      minQty: parseInt(t.minQty),
      maxQty: t.maxQty ? parseInt(t.maxQty) : undefined,
      unitPrice: parseFloat(t.unitPrice),
    }));

    const alternative = alt.enabled
      ? {
        altDescription: alt.altDescription,
        altMaterial: alt.altMaterial || undefined,
        moq: alt.moq ? parseInt(alt.moq) : undefined,
        leadTime: alt.leadTime ? parseInt(alt.leadTime) : undefined,
        validityDate: alt.validityDate || undefined,
        comments: alt.comments || undefined,
        priceTiers: alt.tiers.map((t) => ({
          minQty: parseInt(t.minQty),
          maxQty: t.maxQty ? parseInt(t.maxQty) : undefined,
          unitPrice: parseFloat(t.unitPrice),
        })),
      }
      : undefined;

    try {
      await submitMutation.mutateAsync({
        accessToken,
        dto: {
          currency,
          moq: moq ? parseInt(moq) : undefined,
          leadTime: leadTime ? parseInt(leadTime) : undefined,
          validityDate: validityDate || undefined,
          comments: comments || undefined,
          specsConfirmed,
          incotermsConfirmed,
          priceTiers,
          alternative,
          submissionLanguage: effectiveLang,
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setFormError(e?.response?.data?.message || e?.message || t.errors.submitFailed);
    }
  };

  // Helper for formatting
  const formatDate = (d: string | null) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString(effectiveLang === 'pl' ? 'pl-PL' : effectiveLang === 'de' ? 'de-DE' : 'en-GB');
  };

  // ---------- Loading / Error / Already Submitted states ----------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.errors.notFound}</h2>
            <p className="text-muted-foreground text-center">{t.errors.notFoundMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { offer, rfq, organization, supplier } = data;

  if (['SUBMITTED', 'ACCEPTED', 'REJECTED', 'SHORTLISTED'].includes(offer.status) && !submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.errors.alreadySubmitted}</h2>
            <p className="text-muted-foreground text-center">{t.errors.alreadySubmittedMessage}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------- Success state ----------
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            {organization?.logoUrl && (
              <img src={organization.logoUrl} alt={organization.name} className="h-8 w-8 object-contain rounded" />
            )}
            <h1 className="text-2xl font-bold text-primary">{organization?.name || 'Procurea'}</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-6" />
              <h2 className="text-2xl font-bold mb-3">{t.success.title}</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-md">{t.success.message}</p>

              {/* Summary */}
              <div className="w-full max-w-md space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">{t.success.offerSummary}</h3>
                <Card className="bg-slate-50">
                  <CardContent className="pt-4 text-sm space-y-2">
                    <p><span className="text-muted-foreground">{t.rfq.product}:</span> {rfq.productName}</p>
                    <p><span className="text-muted-foreground">{t.pricing.currency}:</span> {currency}</p>
                    {tiers.map((tier, i) => (
                      <p key={i}>
                        {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} {rfq.unit}: <span className="font-medium">{tier.unitPrice} {currency}</span>
                      </p>
                    ))}
                    {alt.enabled && (
                      <div className="pt-2 border-t mt-2">
                        <Badge variant="secondary" className="mb-1">{t.confirm.alternativeOffer}</Badge>
                        <p className="text-xs">{alt.altDescription}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ---------- Main Wizard ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Procurea</h1>
            {organization && (
              <span className="text-muted-foreground text-sm hidden sm:inline">
                &middot; {organization.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {supplier.name && (
              <Badge variant="outline" className="hidden sm:inline-flex">{supplier.name}</Badge>
            )}
            {/* Language picker */}
            <div className="relative">
              <select
                value={effectiveLang}
                onChange={(e) => setLangCode(e.target.value)}
                className="appearance-none bg-slate-100 rounded-md px-2 py-1.5 pr-7 text-xs font-medium border border-slate-200 cursor-pointer"
              >
                {SUPPORTED_PORTAL_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <Globe className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <StepIndicator current={step} steps={STEPS} t={t} />

        <AnimatePresence mode="wait">
          {/* ===== STEP 0: RFQ Review ===== */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t.rfq.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t.rfq.product}</p>
                      <p className="font-semibold text-base">{rfq.productName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.rfq.quantity}</p>
                      <p className="font-medium">{rfq.quantity.toLocaleString()} {rfq.unit}</p>
                    </div>
                    {rfq.material && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.material}</p>
                        <p className="font-medium">{rfq.material}</p>
                      </div>
                    )}
                    {rfq.category && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.category}</p>
                        <p className="font-medium">{rfq.category}</p>
                      </div>
                    )}
                    {rfq.partNumber && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.partNumber}</p>
                        <p className="font-medium">{rfq.partNumber}</p>
                      </div>
                    )}
                    {rfq.eau && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.eau}</p>
                        <p className="font-medium">{rfq.eau.toLocaleString()} / yr</p>
                      </div>
                    )}
                    {rfq.incoterms && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.incoterms}</p>
                        <p className="font-medium">{rfq.incoterms}</p>
                      </div>
                    )}
                    {rfq.desiredDeliveryDate && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.deliveryDate}</p>
                        <p className="font-medium">{formatDate(rfq.desiredDeliveryDate)}</p>
                      </div>
                    )}
                    {rfq.deliveryLocation && (
                      <div>
                        <p className="text-muted-foreground">{t.rfq.deliveryLocation}</p>
                        <p className="font-medium">{rfq.deliveryLocation.name}</p>
                        <p className="text-xs text-muted-foreground">{rfq.deliveryLocation.address}</p>
                      </div>
                    )}
                  </div>

                  {rfq.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-muted-foreground text-sm mb-1">{t.rfq.description}</p>
                      <p className="text-sm whitespace-pre-wrap">{rfq.description}</p>
                    </div>
                  )}

                  {/* Attachments */}
                  {rfq.attachments && rfq.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-muted-foreground text-sm mb-2">{t.rfq.attachments}</p>
                      <div className="space-y-1.5">
                        {rfq.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={`${API_BASE}/uploads/${att.storedFilename}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:text-[#2A5C5D] hover:bg-[#EDF4F4] rounded-md px-2 py-1.5 transition-colors"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate">{att.filename}</span>
                            <Download className="h-3.5 w-3.5 shrink-0 ml-auto" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleNext} size="lg">
                  {t.common.next}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 1: Pricing ===== */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t.pricing.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.pricing.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PriceTiersTable
                    tiers={tiers}
                    setTiers={setTiers}
                    t={t}
                    rfqUnit={rfq.unit}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.pricing.currency}</label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className={INPUT_CLASS}
                      >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="PLN">PLN</option>
                        <option value="GBP">GBP</option>
                        <option value="CHF">CHF</option>
                        <option value="CNY">CNY</option>
                      </select>
                    </div>

                    {/* MOQ */}
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.pricing.moq}</label>
                      <input
                        type="number"
                        min="0"
                        value={moq}
                        onChange={(e) => setMoq(e.target.value)}
                        placeholder={t.pricing.moqPlaceholder}
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Lead Time */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t.pricing.leadTime} ({t.pricing.leadTimeUnit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={leadTime}
                        onChange={(e) => setLeadTime(e.target.value)}
                        placeholder={t.pricing.leadTimePlaceholder}
                        className={INPUT_CLASS}
                      />
                    </div>

                    {/* Validity Date */}
                    <div>
                      <label className="block text-sm font-medium mb-1">{t.pricing.validityDate}</label>
                      <input
                        type="date"
                        value={validityDate}
                        onChange={(e) => setValidityDate(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {formError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>{t.common.back}</Button>
                <Button onClick={handleNext} disabled={!canNext()}>
                  {t.common.next}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 2: Alternative ===== */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t.alternative.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.alternative.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Toggle */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors ${alt.enabled ? 'bg-primary' : 'bg-slate-200'
                        }`}
                      onClick={() => setAlt((a) => ({ ...a, enabled: !a.enabled }))}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${alt.enabled ? 'translate-x-5' : ''
                          }`}
                      />
                    </div>
                    <span className="text-sm font-medium">{t.alternative.toggle}</span>
                  </label>

                  {alt.enabled && (
                    <div className="space-y-4 pt-2">
                      {/* Alt description */}
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          {t.alternative.description} <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={alt.altDescription}
                          onChange={(e) => setAlt((a) => ({ ...a, altDescription: e.target.value }))}
                          placeholder={t.alternative.descriptionPlaceholder}
                          className={`${INPUT_CLASS} resize-none`}
                        />
                      </div>

                      {/* Alt material */}
                      <div>
                        <label className="block text-sm font-medium mb-1">{t.alternative.material}</label>
                        <input
                          type="text"
                          value={alt.altMaterial}
                          onChange={(e) => setAlt((a) => ({ ...a, altMaterial: e.target.value }))}
                          placeholder={t.alternative.materialPlaceholder}
                          className={INPUT_CLASS}
                        />
                      </div>

                      {/* Alt price tiers */}
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.pricing.title}</label>
                        <PriceTiersTable
                          tiers={alt.tiers}
                          setTiers={(newTiers) => setAlt((a) => ({ ...a, tiers: newTiers }))}
                          t={t}
                          rfqUnit={rfq.unit}
                        />
                      </div>

                      {/* Alt MOQ + Lead Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium mb-1">{t.pricing.moq}</label>
                          <input
                            type="number"
                            min="0"
                            value={alt.moq}
                            onChange={(e) => setAlt((a) => ({ ...a, moq: e.target.value }))}
                            placeholder={t.pricing.moqPlaceholder}
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            {t.pricing.leadTime} ({t.pricing.leadTimeUnit})
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={alt.leadTime}
                            onChange={(e) => setAlt((a) => ({ ...a, leadTime: e.target.value }))}
                            placeholder={t.pricing.leadTimePlaceholder}
                            className={INPUT_CLASS}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">{t.pricing.validityDate}</label>
                          <input
                            type="date"
                            value={alt.validityDate}
                            onChange={(e) => setAlt((a) => ({ ...a, validityDate: e.target.value }))}
                            className={INPUT_CLASS}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {formError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>{t.common.back}</Button>
                <Button onClick={handleNext} disabled={!canNext()}>
                  {t.common.next}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 3: Confirm & Submit ===== */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.confirm.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{t.confirm.subtitle}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main offer summary */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3">{t.confirm.mainOffer}</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1">
                        {tiers.map((tier, i) => (
                          <div key={i} className="contents">
                            <span className="text-muted-foreground">
                              {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} {rfq.unit}
                            </span>
                            <span className="border-b border-dotted border-slate-300" />
                            <span className="font-medium text-right">{tier.unitPrice} {currency}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        {moq && <span>MOQ: {moq}</span>}
                        {leadTime && <span>{t.pricing.leadTime}: {leadTime} {t.pricing.leadTimeUnit}</span>}
                        {validityDate && <span>{t.pricing.validityDate}: {validityDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Alt offer summary */}
                  {alt.enabled && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        {t.confirm.alternativeOffer}
                        <Badge variant="secondary">Alt</Badge>
                      </h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2 text-sm">
                        <p className="text-xs italic">{alt.altDescription}</p>
                        {alt.altMaterial && (
                          <p className="text-xs"><span className="text-muted-foreground">{t.alternative.material}:</span> {alt.altMaterial}</p>
                        )}
                        <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 pt-2">
                          {alt.tiers.map((tier, i) => (
                            <div key={i} className="contents">
                              <span className="text-muted-foreground">
                                {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} {rfq.unit}
                              </span>
                              <span className="border-b border-dotted border-amber-300" />
                              <span className="font-medium text-right">{tier.unitPrice} {currency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-4 border-t">
                    <label className="flex items-start gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={specsConfirmed}
                        onChange={(e) => setSpecsConfirmed(e.target.checked)}
                        className="rounded border-input mt-0.5"
                      />
                      {t.confirm.specsConfirmed}
                    </label>
                    {rfq.incoterms && (
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={incotermsConfirmed}
                          onChange={(e) => setIncotermsConfirmed(e.target.checked)}
                          className="rounded border-input mt-0.5"
                        />
                        {t.confirm.incotermsConfirmed} ({rfq.incoterms})
                      </label>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium mb-1">{t.confirm.comments}</label>
                    <textarea
                      rows={3}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder={t.confirm.commentsPlaceholder}
                      className={`${INPUT_CLASS} resize-none`}
                    />
                  </div>

                  {/* File Attachments */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-1">
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">{t.upload.title}</label>
                      <Badge variant="outline" className="text-xs font-normal">{t.common.optional}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{t.upload.subtitle}</p>

                    {attachments.length < MAX_ATTACHMENTS && (
                      <div
                        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 cursor-pointer transition-colors hover:border-primary/50 ${
                          uploading ? 'opacity-50 pointer-events-none' : 'border-input'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (e.dataTransfer.files.length) handleFileUpload(e.dataTransfer.files);
                        }}
                      >
                        {uploading ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {uploading ? t.upload.uploading : t.upload.dropzone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, DXF, STEP, JPG, PNG — max 10MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ALLOWED_EXTENSIONS}
                          multiple
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-sm text-destructive mt-2">{uploadError}</p>
                    )}

                    {attachments.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-md border p-2 text-sm bg-slate-50">
                            <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{att.originalName}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(i)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              title={t.upload.remove}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {attachments.length >= MAX_ATTACHMENTS && (
                          <p className="text-xs text-muted-foreground">{t.upload.maxFiles.replace('{remaining}', '0')}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {formError && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>{t.common.back}</Button>
                <Button
                  onClick={handleSubmit}
                  size="lg"
                  disabled={submitMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 shadow-soft hover:shadow-glow transition-all duration-300"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t.confirm.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t.confirm.submit}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organization Footer */}
        {organization?.footerEnabled && (
          <div className="text-center text-sm text-muted-foreground py-6 mt-8 border-t">
            <p className="font-medium">
              {organization.footerFirstName} {organization.footerLastName}
            </p>
            {organization.footerPosition && <p>{organization.footerPosition}</p>}
            {organization.footerCompany && <p>{organization.footerCompany}</p>}
            {organization.footerEmail && <p>{organization.footerEmail}</p>}
            {organization.footerPhone && <p>{organization.footerPhone}</p>}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 pb-6 mt-4">{t.common.poweredBy}</p>
      </main>
    </div>
  );
}

export default SupplierPortalPage;
