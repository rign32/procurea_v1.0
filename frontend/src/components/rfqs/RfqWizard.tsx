import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Loader2, Mail, HelpCircle, Globe2, X, Search, FileText, Check, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TagInput } from '@/components/ui/tag-input';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { t, isEN } from '@/i18n';
import { toast } from 'sonner';
import { RecommendedSuppliers } from '@/components/suppliers/RecommendedSuppliers';
import { EmailPreview } from '@/components/email/EmailPreview';
import { sequencesService, type SequenceTemplate } from '@/services/sequences.service';
import { organizationService } from '@/services/organization.service';
import { documentsService } from '@/services/documents.service';
import type { DocumentRecord } from '@/services/documents.service';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { analytics, startHesitationTracker } from '@/lib/analytics';
import type { CreateCampaignDto, OrganizationLocation, Region, Industry, SourcingMode, ParsedBrief } from '@/types/campaign.types';
import { AVAILABLE_COUNTRIES } from '@/constants/countries';
import { campaignsService } from '@/services/campaigns.service';
import { Sparkles } from 'lucide-react';

// Country codes per predefined region (for exclusion UI)
const REGION_COUNTRY_CODES: Record<string, string[]> = {
  EU: ['DE', 'PL', 'CZ', 'SK', 'HU', 'AT', 'FR', 'IT', 'ES', 'PT', 'NL', 'BE', 'SE', 'RO', 'DK', 'FI', 'IE', 'HR', 'SI', 'BG', 'LT', 'LV', 'EE', 'LU', 'GR', 'CY', 'MT'],
  GLOBAL: ['US', 'DE', 'JP', 'CN', 'KR', 'IN', 'MX', 'BR', 'GB', 'FR', 'IT', 'PL', 'TW', 'VN', 'TH', 'MY', 'TR', 'CZ', 'NL', 'SE', 'CH', 'AT', 'ID', 'ES', 'PT', 'CA', 'AU', 'HU', 'RO', 'DK', 'FI'],
  GLOBAL_NO_CN: ['US', 'DE', 'JP', 'KR', 'IN', 'MX', 'BR', 'GB', 'FR', 'IT', 'PL', 'TW', 'VN', 'TH', 'MY', 'TR', 'CZ', 'NL', 'SE', 'CH', 'AT', 'ID', 'ES', 'PT', 'CA', 'AU', 'HU', 'RO', 'DK', 'FI'],
};

// Zod schemas — 4 steps
const optionalNumber = z.preprocess(
  (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
  z.number().optional()
);

const INDUSTRY_OPTIONS: Industry[] = ['manufacturing', 'events', 'construction', 'horeca', 'healthcare', 'retail', 'logistics', 'mro', 'other'];

// PL voivodeships — used for Construction campaigns to tighten locality from the
// whole country to a single (or a few) regions where the site is located.
export const PL_VOIVODESHIPS: { code: string; labelPl: string; labelEn: string }[] = [
  { code: 'DS', labelPl: 'Dolnośląskie', labelEn: 'Lower Silesia' },
  { code: 'KP', labelPl: 'Kujawsko-pomorskie', labelEn: 'Kuyavia-Pomerania' },
  { code: 'LU', labelPl: 'Lubelskie', labelEn: 'Lublin' },
  { code: 'LB', labelPl: 'Lubuskie', labelEn: 'Lubusz' },
  { code: 'LD', labelPl: 'Łódzkie', labelEn: 'Łódź' },
  { code: 'MA', labelPl: 'Małopolskie', labelEn: 'Lesser Poland' },
  { code: 'MZ', labelPl: 'Mazowieckie', labelEn: 'Masovia' },
  { code: 'OP', labelPl: 'Opolskie', labelEn: 'Opole' },
  { code: 'PK', labelPl: 'Podkarpackie', labelEn: 'Subcarpathia' },
  { code: 'PD', labelPl: 'Podlaskie', labelEn: 'Podlasie' },
  { code: 'PM', labelPl: 'Pomorskie', labelEn: 'Pomerania' },
  { code: 'SL', labelPl: 'Śląskie', labelEn: 'Silesia' },
  { code: 'SK', labelPl: 'Świętokrzyskie', labelEn: 'Holy Cross' },
  { code: 'WN', labelPl: 'Warmińsko-mazurskie', labelEn: 'Warmia-Masuria' },
  { code: 'WP', labelPl: 'Wielkopolskie', labelEn: 'Greater Poland' },
  { code: 'ZP', labelPl: 'Zachodniopomorskie', labelEn: 'West Pomerania' },
];

// Industry → recommended certificates. `required` are pre-ticked (compliance-heavy
// branches like healthcare); `suggested` show up as TagInput suggestions.
// Sample briefs — new users land on an empty wizard and freeze. One-click examples
// per industry give them a working scaffold to edit instead of stare at a blank box.
export const SAMPLE_BRIEFS: Record<Industry, { pl: string; en: string }[]> = {
  manufacturing: [
    { pl: 'Granulat HDPE virgin, 50 ton/mies., Europa, ISO 9001, MOQ 5 ton, lead time max 4 tyg.', en: 'HDPE virgin granulate, 50 tons/month, Europe, ISO 9001, MOQ 5 tons, lead time max 4 weeks.' },
    { pl: 'Obudowy do kontrolera IoT, wtrysk z ABS, 10 000 szt/rok, IATF 16949, partia próbna 200 szt.', en: 'IoT controller enclosures, ABS injection molded, 10k units/yr, IATF 16949, sample batch 200 pcs.' },
  ],
  events: [
    { pl: 'Catering dla 500 osób na konferencji w Berlinie, 18 grudnia, opcje wegańskie i bezglutenowe, budżet do 45 EUR/os.', en: 'Catering for 500 people at a conference in Berlin, December 18, vegan and gluten-free options, budget up to €45/person.' },
    { pl: 'Obsługa AV (nagłośnienie, ekran LED, oświetlenie) na event firmowy w Warszawie, 14 listopada, 300 uczestników.', en: 'AV services (sound, LED screen, lighting) for a corporate event in Warsaw, November 14, 300 attendees.' },
  ],
  construction: [
    { pl: 'Podwykonawca HVAC do osiedla 200 mieszkań w województwie mazowieckim, ISO 9001, OC min. 5M PLN.', en: 'HVAC subcontractor for a 200-unit residential development in Masovian voivodeship, ISO 9001, liability insurance min. 5M PLN.' },
    { pl: 'Stal konstrukcyjna S355 do hali produkcyjnej, 80 ton, Dolnośląskie, DoP, CE, dostawa w 6 tygodni.', en: 'S355 structural steel for a production hall, 80 tons, Lower Silesia, DoP, CE, delivery in 6 weeks.' },
  ],
  horeca: [
    { pl: 'Dostawca oliwy extra virgin z Andaluzji dla sieci 12 hoteli w Polsce, MOQ 200 L/mies, HACCP, bio certificate.', en: 'Extra virgin olive oil supplier from Andalusia for a chain of 12 hotels in Poland, MOQ 200 L/month, HACCP, organic certificate.' },
    { pl: 'Dostawca świeżych ryb dla restauracji fine dining w Gdańsku, codzienna dostawa, IFS Food.', en: 'Fresh fish supplier for a fine-dining restaurant in Gdańsk, daily delivery, IFS Food.' },
  ],
  healthcare: [
    { pl: 'Jednorazowe rękawiczki nitrylowe dla kliniki, 100 000 par/mies., CE, MDR, ISO 13485, nearshore.', en: 'Single-use nitrile gloves for a clinic, 100k pairs/month, CE, MDR, ISO 13485, nearshore.' },
    { pl: 'Sprzęt laboratoryjny (pipety automatyczne, wirówki) dla szpitala w Krakowie, CE, wsparcie techniczne PL.', en: 'Lab equipment (automatic pipettes, centrifuges) for a Kraków hospital, CE, PL technical support.' },
  ],
  retail: [
    { pl: 'Opakowania kosmetyczne private label (butelki 50ml z pompką), 20 000 szt, nearshore UE, MOQ 5000, OEKO-TEX.', en: 'Private-label cosmetic packaging (50ml bottles with pump), 20k pcs, EU nearshore, MOQ 5000, OEKO-TEX.' },
    { pl: 'T-shirty bawełniane pod markę własną, 10 000 szt, Portugalia lub Turcja, GOTS, lead time 6 tyg.', en: 'Private-label cotton t-shirts, 10k pcs, Portugal or Turkey, GOTS, 6-week lead time.' },
  ],
  logistics: [
    { pl: 'System regałów paletowych 10 000 miejsc paletowych, Europa Środkowa, CE, montaż w 8 tygodni.', en: 'Pallet racking system, 10k pallet positions, Central Europe, CE, installation in 8 weeks.' },
    { pl: '3PL dla e-commerce, magazyn koło Warszawy, 500 zamówień/dzień, pick & pack, SLA 24h.', en: '3PL for e-commerce, warehouse near Warsaw, 500 orders/day, pick & pack, 24h SLA.' },
  ],
  mro: [
    { pl: 'Łożyska SKF 6308-2RS1 + aftermarket alternatywy, 2000 szt/rok, 3 zakłady w Polsce.', en: 'SKF 6308-2RS1 bearings + aftermarket alternatives, 2000 pcs/year, 3 plants in Poland.' },
    { pl: 'Serwis maintenance dla linii pakującej FMCG, SLA odpowiedzi <4h, 24/7, Mazowieckie.', en: 'Maintenance service for an FMCG packaging line, SLA response <4h, 24/7, Masovia.' },
  ],
  other: [
    { pl: 'Opisz czego potrzebujesz — AI wypełni formularz za Ciebie.', en: 'Describe what you need — AI will fill the form for you.' },
  ],
};

export const INDUSTRY_CERTIFICATES: Record<Industry, { required: string[]; suggested: string[] }> = {
  manufacturing: { required: [], suggested: ['ISO 9001', 'ISO 14001', 'IATF 16949', 'AS9100', 'RoHS', 'REACH', 'CE'] },
  events: { required: [], suggested: ['HACCP', 'ISO 22000'] },
  construction: { required: [], suggested: ['ISO 9001', 'ISO 45001', 'CE', 'DoP'] },
  horeca: { required: ['HACCP'], suggested: ['IFS', 'BRC', 'ISO 22000', 'organic'] },
  healthcare: { required: ['CE', 'MDR', 'ISO 13485'], suggested: ['FDA', 'ISO 14971', 'ISO 9001'] },
  retail: { required: [], suggested: ['OEKO-TEX', 'GOTS', 'FDA', 'CE', 'BSCI'] },
  logistics: { required: [], suggested: ['ISO 9001', 'ISO 14001', 'GDP', 'AEO'] },
  mro: { required: [], suggested: ['ISO 9001', 'CE', 'UL', 'ATEX'] },
  other: { required: [], suggested: ['ISO 9001', 'CE'] },
};

const briefSchema = z.object({
  industry: z.enum(INDUSTRY_OPTIONS as [Industry, ...Industry[]], { error: t.campaigns.wizard.brief?.industryLabel || 'Select industry' }),
  sourcingMode: z.enum(['product', 'service', 'mixed'] as [SourcingMode, ...SourcingMode[]], { error: t.campaigns.wizard.brief?.modeLabel || 'Select mode' }),
  brief: z.string().max(4000).optional(),
});

const step1Schema = z.object({
  productName: z.string().min(2, t.campaigns.wizard.validation.min2Chars).max(200, t.campaigns.wizard.validation.max200Chars),
  material: z.string().max(100).optional(),
  quantity: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1, t.campaigns.wizard.validation.min1).optional()
  ),
  unit: z.string().max(20).optional(),
  eau: optionalNumber,
  partNumber: z.string().max(100).optional(),
  description: z.string().max(1000, t.campaigns.wizard.validation.max1000Chars).optional(),
});

const step2Schema = z.object({
  targetRegion: z.enum(['PL', 'US', 'GB', 'CA', 'AU', 'CN', 'EU', 'GLOBAL', 'GLOBAL_NO_CN', 'CUSTOM'], { error: t.campaigns.wizard.validation.selectRegion }),
  incoterms: z.string().optional(),
  desiredDeliveryDate: z.string().optional(),
  deliveryLocationId: z.string().optional(),
  supplierTypes: z.array(z.string()).optional(),
  moq: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1).optional()
  ),
  leadTimeWeeks: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1).max(52).optional()
  ),
});

const step3Schema = z.object({
  sequenceTemplateId: z.string().optional(),
});

/* Countries data extracted to @/constants/countries.ts */


const INCOTERMS_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'EXW', label: 'EXW', desc: t.campaigns.wizard.incotermsOptions.EXW },
  { value: 'FCA', label: 'FCA', desc: t.campaigns.wizard.incotermsOptions.FCA },
  { value: 'DAP', label: 'DAP', desc: t.campaigns.wizard.incotermsOptions.DAP },
  { value: 'DDP', label: 'DDP', desc: t.campaigns.wizard.incotermsOptions.DDP },
  { value: 'FOB', label: 'FOB', desc: t.campaigns.wizard.incotermsOptions.FOB },
  { value: 'CIF', label: 'CIF', desc: t.campaigns.wizard.incotermsOptions.CIF },
];

const SINGLE_COUNTRY_REGIONS = new Set(['PL', 'US', 'GB', 'CA', 'AU', 'CN']);

const REGION_OPTIONS_PL: { value: Region; label: string; icon: string; desc: string }[] = [
  { value: 'PL', label: t.campaigns.wizard.search.regionPL, icon: '\u{1F1F5}\u{1F1F1}', desc: t.campaigns.wizard.search.regionDescPL },
  { value: 'EU', label: t.campaigns.wizard.search.regionEU, icon: '\u{1F1EA}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescEU },
  { value: 'GLOBAL', label: t.campaigns.wizard.search.regionGLOBAL, icon: '\u{1F30D}', desc: t.campaigns.wizard.search.regionDescGLOBAL },
  { value: 'GLOBAL_NO_CN', label: t.campaigns.wizard.search.regionGLOBAL_NO_CN, icon: '\u{1F30E}', desc: t.campaigns.wizard.search.regionDescGLOBAL_NO_CN },
  { value: 'CUSTOM', label: t.campaigns.wizard.search.regionCustom, icon: '\u{1F4CD}', desc: t.campaigns.wizard.search.regionDescCUSTOM },
];

const REGION_OPTIONS_EN: { value: Region; label: string; icon: string; desc: string }[] = [
  { value: 'US', label: t.campaigns.wizard.search.regionUS, icon: '\u{1F1FA}\u{1F1F8}', desc: t.campaigns.wizard.search.regionDescUS },
  { value: 'GB', label: t.campaigns.wizard.search.regionGB, icon: '\u{1F1EC}\u{1F1E7}', desc: t.campaigns.wizard.search.regionDescGB },
  { value: 'CA', label: t.campaigns.wizard.search.regionCA, icon: '\u{1F1E8}\u{1F1E6}', desc: t.campaigns.wizard.search.regionDescCA },
  { value: 'AU', label: t.campaigns.wizard.search.regionAU, icon: '\u{1F1E6}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescAU },
  { value: 'CN', label: t.campaigns.wizard.search.regionCN, icon: '\u{1F1E8}\u{1F1F3}', desc: t.campaigns.wizard.search.regionDescCN },
  { value: 'EU', label: t.campaigns.wizard.search.regionEU, icon: '\u{1F1EA}\u{1F1FA}', desc: t.campaigns.wizard.search.regionDescEU },
  { value: 'GLOBAL', label: t.campaigns.wizard.search.regionGLOBAL, icon: '\u{1F30D}', desc: t.campaigns.wizard.search.regionDescGLOBAL },
  { value: 'GLOBAL_NO_CN', label: t.campaigns.wizard.search.regionGLOBAL_NO_CN, icon: '\u{1F30E}', desc: t.campaigns.wizard.search.regionDescGLOBAL_NO_CN },
  { value: 'CUSTOM', label: t.campaigns.wizard.search.regionCustom, icon: '\u{1F4CD}', desc: t.campaigns.wizard.search.regionDescCUSTOM },
];

const REGION_OPTIONS = isEN ? REGION_OPTIONS_EN : REGION_OPTIONS_PL;

interface RfqWizardProps {
  onComplete?: (campaignId: string) => void;
  prefillIndustry?: Industry;
  prefillMode?: SourcingMode;
}

const WIZARD_STORAGE_KEY = 'procurea_wizard_draft_v2';

function loadWizardDraft(): { formData: Partial<CreateCampaignDto>; step: number; certificates: string[]; selectedCountries: string[]; excludedCountries: string[] } | null {
  try {
    const raw = sessionStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.formData?.productName) return parsed;
    return null;
  } catch { return null; }
}

function saveWizardDraft(data: { formData: Partial<CreateCampaignDto>; step: number; certificates: string[]; selectedCountries: string[]; excludedCountries: string[] }) {
  try { sessionStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function clearWizardDraft() {
  try { sessionStorage.removeItem(WIZARD_STORAGE_KEY); } catch { /* ignore */ }
}

export function RfqWizard({ onComplete, prefillIndustry, prefillMode }: RfqWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateCampaignDto>>({
    supplierTypes: ['PRODUCENT'],
    ...(prefillIndustry ? { industry: prefillIndustry } : {}),
    ...(prefillMode ? { sourcingMode: prefillMode } : {}),
  });
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [sequences, setSequences] = useState<SequenceTemplate[]>([]);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [selectedIncoterms, setSelectedIncoterms] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<{ id: string; filename: string; url: string; size: number }[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<DocumentRecord[]>([]);
  const [docPickerOpen, setDocPickerOpen] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [excludedCountries, setExcludedCountries] = useState<string[]>([]);
  const [excludeSearch, setExcludeSearch] = useState('');
  const [showExcludePanel, setShowExcludePanel] = useState(false);
  const [aiParsing, setAiParsing] = useState(false);
  const [parsedBrief, setParsedBrief] = useState<ParsedBrief | null>(null);
  const [selectedVoivodeships, setSelectedVoivodeships] = useState<string[]>([]);
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  const createMutation = useCreateCampaign();
  const submittedRef = useRef(false);

  // Check for saved wizard draft on mount
  useEffect(() => {
    const draft = loadWizardDraft();
    if (draft) {
      setShowResumeDialog(true);
    }
  }, []);

  const handleResumeDraft = () => {
    const draft = loadWizardDraft();
    if (draft) {
      setFormData(draft.formData);
      setCurrentStep(draft.step);
      setCertificates(draft.certificates || []);
      setSelectedCountries(draft.selectedCountries || []);
      setExcludedCountries(draft.excludedCountries || []);
    }
    setShowResumeDialog(false);
  };

  const handleStartFresh = () => {
    clearWizardDraft();
    setShowResumeDialog(false);
  };

  // Auto-save wizard state on changes
  useEffect(() => {
    if (submittedRef.current) return;
    if (formData.productName) {
      saveWizardDraft({ formData, step: currentStep, certificates, selectedCountries, excludedCountries });
    }
  }, [formData, currentStep, certificates, selectedCountries, excludedCountries]);

  // Track wizard start + abandonment on unmount
  useEffect(() => {
    analytics.campaignWizardStart();
    analytics.campaignWizardStep(0);
    if (prefillIndustry || prefillMode) analytics.wizardPrefillApplied(prefillIndustry, prefillMode);
    const cleanupHesitation = startHesitationTracker('wizard', 45000);
    return () => {
      cleanupHesitation();
      if (!submittedRef.current) {
        analytics.campaignWizardAbandoned(currentStep);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = [
    { id: 'brief', label: t.campaigns.wizard.steps.brief, schema: briefSchema },
    { id: 'product', label: t.campaigns.wizard.steps.product, schema: step1Schema },
    { id: 'search-logistics', label: t.campaigns.wizard.steps.searchLogistics, schema: step2Schema },
    ...(isFullPlan ? [{ id: 'email', label: t.sequences.emailConfig, schema: step3Schema }] : []),
    { id: 'summary', label: t.campaigns.wizard.step5, schema: z.any() },
  ];

  const currentSchema = steps[currentStep].schema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData as Record<string, unknown>,
    mode: 'onSubmit',
  });

  // Load sequences and locations
  useEffect(() => {
    sequencesService.getAll().then(setSequences).catch(() => { });
    if (user?.organizationId) {
      organizationService.getLocations(user.organizationId).then((locs) => {
        setLocations(locs);
        // Pre-select default location if none chosen yet
        if (!formData.deliveryLocationId) {
          const defaultLoc = locs.find(l => l.isDefault);
          if (defaultLoc) {
            form.setValue('deliveryLocationId', defaultLoc.id);
          }
        }
      }).catch(() => { });
    }
  }, [user?.organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset form values when step changes
  useEffect(() => {
    form.reset(formData as Record<string, unknown>);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-add industry-required certs when user picks the industry (compliance-heavy
  // branches like healthcare need CE/MDR/ISO 13485 as hard gates, not optional tags).
  useEffect(() => {
    const industry = formData.industry as Industry | undefined;
    if (!industry) return;
    const required = INDUSTRY_CERTIFICATES[industry]?.required || [];
    if (!required.length) return;
    setCertificates(prev => {
      const missing = required.filter(c => !prev.includes(c));
      return missing.length ? [...prev, ...missing] : prev;
    });
  }, [formData.industry]);

  // Pre-select first sequence if none selected
  useEffect(() => {
    if (sequences.length > 0 && !form.getValues('sequenceTemplateId')) {
      form.setValue('sequenceTemplateId', sequences[0].id, { shouldValidate: true, shouldDirty: true });
    }
  }, [sequences, form]);

  const handleAiFill = async () => {
    const brief = (form.getValues('brief') as string) || '';
    const industry = (form.getValues('industry') as Industry) || undefined;
    const sourcingMode = (form.getValues('sourcingMode') as SourcingMode) || undefined;
    if (!brief.trim() || brief.trim().length < 10) {
      toast.error(isEN ? 'Please describe your need first (at least 10 characters).' : 'Opisz najpierw swoje zapotrzebowanie (min. 10 znaków).');
      return;
    }
    setAiParsing(true);
    analytics.briefAiFillClicked(industry, sourcingMode);
    try {
      const parsed = await campaignsService.parseBrief({ brief, industry, sourcingMode });
      setParsedBrief(parsed);
      analytics.briefAiFillSucceeded(parsed.confidence, parsed.industry, parsed.sourcingMode);
      if (parsed.confidence < 0.4) analytics.briefAiFillLowConfidence(parsed.confidence, parsed.industry);

      // Auto-fill form data for downstream steps
      const autoFill: Partial<CreateCampaignDto> = {
        industry: parsed.industry,
        sourcingMode: parsed.sourcingMode,
        brief,
        parsedBrief: parsed,
        productName: parsed.productName || (form.getValues('productName') as string),
        material: parsed.material,
        quantity: parsed.quantity,
        unit: parsed.unit,
        eau: parsed.eau,
        partNumber: parsed.partNumber,
        description: parsed.description || brief,
        targetRegion: parsed.targetRegion,
        targetCountries: parsed.targetCountries,
        city: parsed.city,
        eventDate: parsed.eventDate,
        headcount: parsed.headcount,
        desiredDeliveryDate: parsed.desiredDeliveryDate,
        targetPrice: parsed.targetPrice,
        currency: parsed.currency,
        requiredCertificates: parsed.requiredCertificates,
      };
      setFormData(prev => ({ ...prev, ...autoFill }));
      if (parsed.requiredCertificates?.length) setCertificates(parsed.requiredCertificates);
      if (parsed.targetCountries?.length) setSelectedCountries(parsed.targetCountries);
      if (parsed.incoterms?.length) setSelectedIncoterms(parsed.incoterms);
      // Update the current form with parsed industry/mode so validation passes
      form.setValue('industry', parsed.industry as Industry, { shouldValidate: true });
      form.setValue('sourcingMode', parsed.sourcingMode as SourcingMode, { shouldValidate: true });
      form.setValue('brief', brief);
      toast.success(t.campaigns.wizard.brief?.aiFilled || 'Form auto-filled');
    } catch (err) {
      console.error('Brief parse failed:', err);
      const reason = (err as { statusCode?: number })?.statusCode === 429 ? 'rate_limited' : 'server_error';
      analytics.briefAiFillFailed(reason);
      toast.error(t.campaigns.wizard.brief?.aiError || 'Failed to parse brief');
    } finally {
      setAiParsing(false);
    }
  };

  const handleNext = async (data: Record<string, unknown>) => {
    const parsed = { ...data };

    // Inject tag-based fields at search step
    if (steps[currentStep]?.id === 'search-logistics') {
      parsed.requiredCertificates = certificates;
      parsed.incoterms = selectedIncoterms.join(',');
      if (parsed.targetRegion === 'CUSTOM') {
        parsed.targetCountries = selectedCountries;
      }
      if (excludedCountries.length > 0 && parsed.targetRegion !== 'CUSTOM' && !SINGLE_COUNTRY_REGIONS.has(parsed.targetRegion as string)) {
        parsed.excludedCountries = excludedCountries;
      }
    }

    const newFormData = { ...formData, ...parsed };
    setFormData(newFormData);

    if (currentStep === steps.length - 1) {
      // Auto-generate campaign name from product name
      const finalData: Partial<CreateCampaignDto> & { name: string } = {
        ...newFormData,
        name: `${t.campaigns.wizard.email.campaignPrefix}: ${newFormData.productName}`,
        requiredCertificates: certificates,
        incoterms: selectedIncoterms.join(','),
        targetCountries: newFormData.targetRegion === 'CUSTOM' ? selectedCountries : undefined,
        excludedCountries: (excludedCountries.length > 0 && newFormData.targetRegion !== 'CUSTOM' && !SINGLE_COUNTRY_REGIONS.has(newFormData.targetRegion as string)) ? excludedCountries : undefined,
        voivodeships: selectedVoivodeships.length > 0 ? selectedVoivodeships : undefined,
        ...((attachments.length > 0 || selectedDocs.length > 0) ? {
          attachments: JSON.stringify([
            ...attachments,
            ...selectedDocs.map((d) => ({ id: d.id, filename: d.originalName, url: d.url, size: d.sizeBytes })),
          ]),
        } : {}),
      };

      try {
        const result = await createMutation.mutateAsync(finalData as CreateCampaignDto);
        submittedRef.current = true;
        clearWizardDraft();
        analytics.campaignCreated(newFormData.targetRegion, newFormData.industry as string | undefined, newFormData.sourcingMode as string | undefined);
        if (onComplete) {
          onComplete(result.id);
        } else {
          navigate(`/campaigns/${result.id}`);
        }
      } catch (error: unknown) {
        console.error('Failed to create campaign:', error);
        const err = error as { message?: string; statusCode?: number };
        const msg = err?.message || t.campaigns.wizard.validation.createError;
        const isCreditsError = err?.statusCode === 400 && (msg.toLowerCase().includes('kredyt') || msg.toLowerCase().includes('wyszukiw'));
        if (isCreditsError) {
          toast.error(msg, {
            duration: 8000,
            action: { label: t.settings.billing.topUp.action, onClick: () => useUIStore.getState().openBillingModal() },
          });
        } else {
          toast.error(msg);
        }
      }
    } else {
      analytics.campaignWizardStep(currentStep + 1);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const currentValues = form.getValues();
      if (steps[currentStep]?.id === 'search-logistics') {
        // Save incoterms to formData when going back
        currentValues.incoterms = selectedIncoterms.join(',');
      }
      setFormData(prev => ({ ...prev, ...currentValues }));
      setCurrentStep(currentStep - 1);
    }
  };

  const filteredCountries = countrySearch
    ? AVAILABLE_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : AVAILABLE_COUNTRIES;

  // Countries available for exclusion (based on selected region)
  const currentRegion = form.watch('targetRegion') as string;
  const regionCodes = REGION_COUNTRY_CODES[currentRegion] || [];
  const excludeableCountries = AVAILABLE_COUNTRIES.filter(c => regionCodes.includes(c.code));
  const filteredExcludeCountries = excludeSearch
    ? excludeableCountries.filter(c => c.name.toLowerCase().includes(excludeSearch.toLowerCase()))
    : excludeableCountries;

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const displayCertificates = certificates.join(', ');

  return (
    <>
    {/* Resume draft dialog */}
    <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEN ? 'Resume previous form?' : 'Wznowić poprzedni formularz?'}</DialogTitle>
          <DialogDescription>
            {isEN
              ? 'You have an unfinished campaign form. Would you like to resume or start fresh?'
              : 'Masz niedokończony formularz kampanii. Chcesz go wznowić czy zacząć od nowa?'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleStartFresh}>
            {isEN ? 'Start fresh' : 'Zacznij od nowa'}
          </Button>
          <Button onClick={handleResumeDraft}>
            {isEN ? 'Resume' : 'Wznów'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{steps[currentStep].label}</span>
          <span className="text-muted-foreground">
            {t.campaigns.wizard.stepOf.replace('{current}', String(currentStep + 1)).replace('{total}', String(steps.length))}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleNext)} autoComplete="off" className="space-y-6">

            {/* ===== STEP 0: Brief + industry + sourcing mode ===== */}
            {steps[currentStep]?.id === 'brief' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold mb-1">{t.campaigns.wizard.brief.title}</h3>
                  <p className="text-sm text-muted-foreground">{t.campaigns.wizard.brief.subtitle}</p>
                </div>

                {/* Brief textarea */}
                <div>
                  <textarea
                    {...form.register('brief')}
                    maxLength={4000}
                    placeholder={t.campaigns.wizard.brief.placeholder}
                    rows={5}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiFill}
                      disabled={aiParsing}
                    >
                      {aiParsing ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t.campaigns.wizard.brief.aiFilling}</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" />{t.campaigns.wizard.brief.aiFillButton}</>
                      )}
                    </Button>
                  </div>
                  {parsedBrief && parsedBrief.confidence < 0.4 && parsedBrief.notes && (
                    <Alert className="mt-3">
                      <AlertDescription>{parsedBrief.notes}</AlertDescription>
                    </Alert>
                  )}

                  {/* Sample briefs — new users get one-click examples to avoid blank-canvas freeze */}
                  {(() => {
                    const ind = (formData.industry as Industry | undefined) || null;
                    const samples = ind ? SAMPLE_BRIEFS[ind] : null;
                    if (!samples || samples.length === 0) return null;
                    return (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2">
                          {isEN ? 'Or pick an example:' : 'Albo wybierz przykład:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {samples.map((s, i) => {
                            const text = isEN ? s.en : s.pl;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => form.setValue('brief', text, { shouldDirty: true })}
                                className="text-left text-xs px-2.5 py-1.5 rounded-md border border-dashed border-input hover:border-primary hover:bg-primary/5 transition-all max-w-full"
                                title={text}
                              >
                                <span className="line-clamp-1">{text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Industry grid */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.brief.industryLabel} *</label>
                  <p className="text-xs text-muted-foreground mb-3">{t.campaigns.wizard.brief.industrySubtitle}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRY_OPTIONS.map((ind) => {
                      const selected = form.watch('industry') === ind;
                      const labelKey = ind as keyof typeof t.campaigns.wizard.brief.industries;
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => form.setValue('industry', ind, { shouldValidate: true, shouldDirty: true })}
                          className={cn(
                            'flex flex-col items-start gap-0.5 p-3 rounded-lg border-2 transition-all text-left',
                            selected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-input hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          <span className="text-sm font-medium">{t.campaigns.wizard.brief.industries[labelKey] as string}</span>
                          <span className="text-xs text-muted-foreground">{t.campaigns.wizard.brief.industries[(labelKey + 'Desc') as keyof typeof t.campaigns.wizard.brief.industries] as string}</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.industry && <p className="text-sm text-destructive mt-1">{form.formState.errors.industry.message as string}</p>}
                </div>

                {/* Sourcing mode */}
                <div>
                  <label className="block text-sm font-medium mb-3">{t.campaigns.wizard.brief.modeLabel} *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(['product', 'service', 'mixed'] as SourcingMode[]).map((mode) => {
                      const selected = form.watch('sourcingMode') === mode;
                      const labelMap: Record<SourcingMode, string> = {
                        product: t.campaigns.wizard.brief.modeProduct,
                        service: t.campaigns.wizard.brief.modeService,
                        mixed: t.campaigns.wizard.brief.modeMixed,
                      };
                      const descMap: Record<SourcingMode, string> = {
                        product: t.campaigns.wizard.brief.modeProductDesc,
                        service: t.campaigns.wizard.brief.modeServiceDesc,
                        mixed: t.campaigns.wizard.brief.modeMixedDesc,
                      };
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => form.setValue('sourcingMode', mode, { shouldValidate: true, shouldDirty: true })}
                          className={cn(
                            'flex flex-col items-start gap-0.5 p-3 rounded-lg border-2 transition-all text-left',
                            selected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-input hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          <span className="text-sm font-medium">{labelMap[mode]}</span>
                          <span className="text-xs text-muted-foreground">{descMap[mode]}</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.sourcingMode && <p className="text-sm text-destructive mt-1">{form.formState.errors.sourcingMode.message as string}</p>}
                </div>
              </div>
            )}

            {/* ===== STEP 1: Produkt i specyfikacja ===== */}
            {steps[currentStep]?.id === 'product' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.basicInfo.productName} *</label>
                  <input type="text" {...form.register('productName')} maxLength={200} placeholder={t.campaigns.wizard.basicInfo.productNamePlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  {form.formState.errors.productName && <p className="text-sm text-destructive mt-1">{form.formState.errors.productName.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.material}</label>
                  <input type="text" {...form.register('material')} maxLength={100} placeholder={t.campaigns.wizard.specs.materialPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.quantity}</label>
                    <input type="text" inputMode="numeric" pattern="[0-9]*" {...form.register('quantity', { valueAsNumber: true })} placeholder={t.campaigns.wizard.specs.quantityPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {form.formState.errors.quantity && <p className="text-sm text-destructive mt-1">{form.formState.errors.quantity.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.unit}</label>
                    <input type="text" {...form.register('unit')} maxLength={20} defaultValue={t.campaigns.wizard.specs.unitDefault} placeholder={t.campaigns.wizard.specs.unitDefault} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.eau} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" {...form.register('eau', { valueAsNumber: true })} placeholder={t.campaigns.wizard.specs.eauPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.partNumber} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
                  <input type="text" {...form.register('partNumber')} maxLength={100} placeholder={t.campaigns.wizard.specs.partNumberPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.upload.title}</label>

                  {/* Selected documents from library */}
                  {selectedDocs.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs font-medium text-muted-foreground">{t.documents.selectedDocuments}:</p>
                      {selectedDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-2 rounded-md border p-2 text-sm bg-muted/30">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 truncate">{doc.originalName}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pick from library button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mb-3"
                    onClick={() => setDocPickerOpen(true)}
                  >
                    <Library className="h-4 w-4 mr-2" />
                    {t.documents.pickDocuments}
                  </Button>

                  {/* Upload new files (existing flow) */}
                  <p className="text-xs text-muted-foreground mb-1.5">{t.documents.orUploadNew}:</p>
                  <FileUpload value={attachments} onChange={setAttachments} createDocumentRecord entityType="campaign" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.basicInfo.description} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
                  <textarea {...form.register('description')} maxLength={1000} placeholder={t.campaigns.wizard.basicInfo.descriptionPlaceholder} rows={3} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* AI Recommendations Hint — show when product name has 3+ chars */}
                {(form.watch('productName') as string)?.length >= 3 && (
                  <RecommendedSuppliers
                    productName={form.watch('productName') as string}
                    category={form.watch('material') as string}
                    limit={5}
                    compact
                  />
                )}
              </div>
            )}

            {/* ===== STEP 2: Wyszukiwanie i logistyka ===== */}
            {steps[currentStep]?.id === 'search-logistics' && (
              <div className="space-y-6">
                {/* Region — visual radio buttons */}
                <div>
                  <label className="block text-sm font-medium mb-3">{t.campaigns.wizard.search.region}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {REGION_OPTIONS.map((opt) => {
                      const isSelected = form.watch('targetRegion') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            form.setValue('targetRegion', opt.value, { shouldValidate: true, shouldDirty: true });
                            setExcludedCountries([]);
                            setShowExcludePanel(false);
                          }}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-input hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.targetRegion && (
                    <p className="text-sm text-destructive mt-2">{form.formState.errors.targetRegion.message as string}</p>
                  )}
                </div>

                {/* Country picker — shown when CUSTOM selected */}
                {form.watch('targetRegion') === 'CUSTOM' && (
                  <div className="border rounded-lg p-4 space-y-3">
                    {/* Selected countries as badges */}
                    {selectedCountries.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedCountries.map(code => {
                          const c = AVAILABLE_COUNTRIES.find(ac => ac.code === code);
                          return c ? (
                            <Badge key={code} variant="secondary" className="flex items-center gap-1 pr-1">
                              {c.flag} {c.name}
                              <button
                                type="button"
                                onClick={() => setSelectedCountries(prev => prev.filter(p => p !== code))}
                                className="ml-1 rounded-full hover:bg-muted p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                    {/* Search input */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder={t.campaigns.wizard.search.searchCountry}
                        className="w-full pl-9 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {/* Country list */}
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredCountries.map(c => {
                        const isChecked = selectedCountries.includes(c.code);
                        return (
                          <label
                            key={c.code}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedCountries(prev =>
                                  isChecked ? prev.filter(p => p !== c.code) : [...prev, c.code]
                                );
                              }}
                              className="h-3.5 w-3.5 rounded border-input"
                            />
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedCountries.length === 0 && (
                      <p className="text-xs text-destructive">{t.campaigns.wizard.validation.selectCountry}</p>
                    )}
                  </div>
                )}

                {/* Voivodeships — Construction campaigns need site-level locality inside PL,
                    not "whole country". A Warsaw site shouldn't surface Gdańsk-only HVAC subs. */}
                {formData.industry === 'construction' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isEN ? 'PL voivodeships (optional)' : 'Województwa PL (opcjonalnie)'}
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      {isEN
                        ? 'Narrow the search to specific regions — leave empty for all of Poland.'
                        : 'Zawęź wyszukiwanie do konkretnych regionów — zostaw puste dla całej Polski.'}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {PL_VOIVODESHIPS.map(v => {
                        const selected = selectedVoivodeships.includes(v.code);
                        return (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => {
                              setSelectedVoivodeships(prev =>
                                selected ? prev.filter(x => x !== v.code) : [...prev, v.code]
                              );
                            }}
                            className={cn(
                              'px-2.5 py-1.5 rounded-md border text-xs text-left transition-all',
                              selected
                                ? 'border-primary bg-primary/5 text-primary font-medium'
                                : 'border-input hover:border-primary/40'
                            )}
                          >
                            {isEN ? v.labelEn : v.labelPl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Exclude countries — shown for EU/GLOBAL/GLOBAL_NO_CN */}
                {regionCodes.length > 0 && currentRegion !== 'CUSTOM' && !SINGLE_COUNTRY_REGIONS.has(currentRegion) && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExcludePanel(!showExcludePanel);
                        if (!showExcludePanel) setExcludeSearch('');
                      }}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Globe2 className="h-4 w-4" />
                      <span>{t.campaigns.wizard.search.excludeCountries}</span>
                      {excludedCountries.length > 0 && (
                        <Badge variant="secondary" className="text-xs">{excludedCountries.length}</Badge>
                      )}
                      <span className="text-xs">{showExcludePanel ? '\u25B2' : '\u25BC'}</span>
                    </button>

                    {/* Excluded countries badges */}
                    {excludedCountries.length > 0 && !showExcludePanel && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {excludedCountries.map(code => {
                          const c = AVAILABLE_COUNTRIES.find(ac => ac.code === code);
                          return c ? (
                            <Badge key={code} variant="destructive" className="flex items-center gap-1 pr-1 text-xs">
                              {c.flag} {c.name}
                              <button
                                type="button"
                                onClick={() => setExcludedCountries(prev => prev.filter(p => p !== code))}
                                className="ml-0.5 rounded-full hover:bg-destructive/80 p-0.5"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}

                    {showExcludePanel && (
                      <div className="border rounded-lg p-3 mt-2 space-y-2">
                        {/* Excluded badges inside panel */}
                        {excludedCountries.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {excludedCountries.map(code => {
                              const c = AVAILABLE_COUNTRIES.find(ac => ac.code === code);
                              return c ? (
                                <Badge key={code} variant="destructive" className="flex items-center gap-1 pr-1 text-xs">
                                  {c.flag} {c.name}
                                  <button
                                    type="button"
                                    onClick={() => setExcludedCountries(prev => prev.filter(p => p !== code))}
                                    className="ml-0.5 rounded-full hover:bg-destructive/80 p-0.5"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                        {/* Search */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={excludeSearch}
                            onChange={(e) => setExcludeSearch(e.target.value)}
                            placeholder={t.campaigns.wizard.search.excludeCountriesSearch}
                            className="w-full pl-9 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        {/* Country list */}
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {filteredExcludeCountries.map(c => {
                            const isExcluded = excludedCountries.includes(c.code);
                            return (
                              <label
                                key={c.code}
                                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={isExcluded}
                                  onChange={() => {
                                    setExcludedCountries(prev =>
                                      isExcluded ? prev.filter(p => p !== c.code) : [...prev, c.code]
                                    );
                                  }}
                                  className="h-3.5 w-3.5 rounded border-input"
                                />
                                <span>{c.flag}</span>
                                <span>{c.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Supplier Types — radio cards */}
                <div>
                  <label className="block text-sm font-medium mb-3">{t.campaigns.wizard.supplierTypes.title}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: ['PRODUCENT'], label: t.campaigns.wizard.supplierTypes.onlyManufacturers, desc: t.campaigns.wizard.supplierTypes.onlyManufacturersDesc, icon: '\u{1F3ED}' },
                      { value: ['PRODUCENT', 'HANDLOWIEC'], label: t.campaigns.wizard.supplierTypes.manufacturersAndTraders, desc: t.campaigns.wizard.supplierTypes.manufacturersAndTradersDesc, icon: '\u{1F310}' },
                    ].map((opt) => {
                      const currentTypes = form.watch('supplierTypes') || ['PRODUCENT'];
                      const isSelected = JSON.stringify(currentTypes.slice().sort()) === JSON.stringify(opt.value.slice().sort());
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => form.setValue('supplierTypes', opt.value, { shouldValidate: true, shouldDirty: true })}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                            isSelected
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-input hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Certificates — industry-aware suggestions + compliance-mandatory highlighting */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.search.certificates}</label>
                  {(() => {
                    const ind = (formData.industry as Industry | undefined) || 'other';
                    const certSet = INDUSTRY_CERTIFICATES[ind];
                    const required = certSet.required;
                    const allSuggestions = Array.from(new Set([...required, ...certSet.suggested, 'ISO 9001', 'CE']));
                    return (
                      <>
                        {required.length > 0 && (
                          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-muted-foreground">
                              {isEN ? 'Required for this industry:' : 'Wymagane dla tej branży:'}
                            </span>
                            {required.map(cert => (
                              <Badge key={cert} variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <TagInput
                          value={certificates}
                          onChange={setCertificates}
                          placeholder={t.campaigns.wizard.search.certificatesPlaceholder}
                          suggestions={allSuggestions}
                        />
                      </>
                    );
                  })()}
                </div>

                {/* Product-sourcing logistics: Incoterms + MOQ + Lead time + nearshore preference.
                    Previously gated behind full plan; landing promises these on Manufacturing /
                    Retail / Healthcare so we surface them for all product/mixed-mode campaigns. */}
                {(() => {
                  const mode = formData.sourcingMode as SourcingMode | undefined;
                  const ind = formData.industry as Industry | undefined;
                  const isProductish = mode === 'product' || mode === 'mixed';
                  const showProductLogistics = isProductish;
                  const showMoqLeadTime = isProductish && (ind === 'manufacturing' || ind === 'retail' || ind === 'healthcare' || ind === 'mro' || ind === 'logistics' || !ind);
                  const showSourcingGeo = ind === 'retail';
                  if (!showProductLogistics) return null;
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-3">
                          {t.campaigns.wizard.logistics.incoterms}
                          <span className="text-muted-foreground font-normal ml-1">({t.campaigns.wizard.search.multiSelect})</span>
                        </label>
                        <TooltipProvider delayDuration={200}>
                          <div className="grid grid-cols-3 gap-2">
                            {INCOTERMS_OPTIONS.map((term) => {
                              const isChecked = selectedIncoterms.includes(term.value);
                              return (
                                <button
                                  key={term.value}
                                  type="button"
                                  onClick={() => {
                                    setSelectedIncoterms(prev =>
                                      isChecked ? prev.filter(v => v !== term.value) : [...prev, term.value]
                                    );
                                  }}
                                  className={cn(
                                    'flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all',
                                    isChecked
                                      ? 'border-primary bg-primary/5 text-primary font-medium'
                                      : 'border-input hover:border-primary/40'
                                  )}
                                >
                                  <span>{term.label}</span>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-3.5 w-3.5 text-muted-foreground ml-1 shrink-0" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[250px]">
                                      <p>{term.desc}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </button>
                              );
                            })}
                          </div>
                        </TooltipProvider>
                      </div>

                      {showMoqLeadTime && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              {isEN ? 'MOQ (min. order)' : 'MOQ (min. zamówienie)'}
                              <span className="text-muted-foreground font-normal ml-1">({t.common.optional})</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              {...form.register('moq', { valueAsNumber: true })}
                              placeholder={isEN ? 'e.g. 500' : 'np. 500'}
                              className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {isEN
                                ? 'Used to filter suppliers whose MOQ exceeds this.'
                                : 'Odfiltruje dostawców z MOQ wyższym niż ten.'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              {isEN ? 'Lead time (weeks)' : 'Lead time (tygodnie)'}
                              <span className="text-muted-foreground font-normal ml-1">({t.common.optional})</span>
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              {...form.register('leadTimeWeeks', { valueAsNumber: true })}
                              placeholder={isEN ? 'e.g. 4' : 'np. 4'}
                              className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              {isEN
                                ? 'Max acceptable supplier production time.'
                                : 'Maksymalny akceptowalny czas produkcji dostawcy.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {showSourcingGeo && (
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            {isEN ? 'Sourcing geography preference' : 'Preferencja geografii'}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['nearshore', 'offshore', 'mixed'] as const).map(opt => {
                              const selected = formData.sourcingGeography === opt;
                              const labels = {
                                nearshore: isEN ? 'Nearshore (EU, TR)' : 'Nearshore (UE, TR)',
                                offshore: isEN ? 'Offshore (Asia)' : 'Offshore (Azja)',
                                mixed: isEN ? 'Mixed' : 'Mieszane',
                              };
                              const descs = {
                                nearshore: isEN ? 'PL, CZ, PT, IT, TR — low MOQ, fast lead' : 'PL, CZ, PT, IT, TR — niski MOQ, szybki lead',
                                offshore: isEN ? 'CN, VN, IN — lowest unit price' : 'CN, VN, IN — najniższa cena jednostkowa',
                                mixed: isEN ? 'Both — compare landed cost' : 'Oba — porównaj landed cost',
                              };
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, sourcingGeography: opt }))}
                                  className={cn(
                                    'flex flex-col items-start gap-0.5 p-3 rounded-lg border-2 transition-all text-left',
                                    selected
                                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                      : 'border-input hover:border-primary/40 hover:bg-muted/30'
                                  )}
                                >
                                  <span className="text-sm font-medium">{labels[opt]}</span>
                                  <span className="text-xs text-muted-foreground">{descs[opt]}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.logistics.deliveryDateLabel}</label>
                        <input
                          type="date"
                          {...form.register('desiredDeliveryDate')}
                          className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </>
                  );
                })()}

                {/* Delivery location */}
                {isFullPlan && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.logistics.deliveryLocation}</label>
                  <select {...form.register('deliveryLocationId')} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm">
                    <option value="">{t.campaigns.wizard.logistics.selectLocation}</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.address}
                      </option>
                    ))}
                  </select>
                  {locations.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.campaigns.wizard.logistics.noLocations}
                    </p>
                  )}
                </div>
                )}
              </div>
            )}

            {/* ===== STEP 3: Konfiguracja emaili ===== */}
            {steps[currentStep]?.id === 'email' && (
              <div className="space-y-6">
                {/* Translation notice at TOP */}
                <Alert className="bg-primary/5 text-primary border-primary/20">
                  <Globe2 className="h-4 w-4" />
                  <AlertDescription>
                    {t.campaigns.wizard.email.translationNotice}
                  </AlertDescription>
                </Alert>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Mail className="inline-block w-4 h-4 mr-1" />
                    {t.sequences.selectTemplate}
                  </label>
                  <select
                    {...form.register('sequenceTemplateId')}
                    className="w-full px-3 py-2.5 border rounded-md bg-background text-sm"
                  >
                    <option value="">{t.sequences.defaultTemplate}</option>
                    {sequences.map((seq, index) => (
                      <option key={seq.id} value={seq.id}>
                        {seq.name} {seq.isSystem ? `(${t.sequences.system})` : ''}
                        {index === 0 ? ` (${t.campaigns.wizard.email.recommended})` : ''}
                        {' — '}
                        {seq.steps.length} {t.sequences.steps.toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t.campaigns.wizard.email.templateDescription}
                  </p>
                </div>

                {/* Selected template steps preview */}
                {(() => {
                  const selectedId = form.watch('sequenceTemplateId');
                  const selected = sequences.find(s => s.id === selectedId);
                  if (!selected) return null;
                  return (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium">{t.sequences.steps}:</h4>
                      {selected.steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-3 text-sm">
                          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium whitespace-nowrap">
                            {t.sequences.day} {step.dayOffset}
                          </span>
                          <div>
                            <p className="font-medium">{step.subject}</p>
                            <p className="text-muted-foreground text-xs line-clamp-2">{step.bodySnippet}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Email preview — without bottom translation notice */}
                <div>
                  <h4 className="text-sm font-medium mb-2">{t.sequences.preview}</h4>
                  <EmailPreview
                    stepId={(() => {
                      const selectedId = form.watch('sequenceTemplateId');
                      const selected = sequences.find(s => s.id === selectedId);
                      return selected?.steps[0]?.id;
                    })()}
                    organizationId={user?.organizationId || undefined}
                    sampleData={{
                      productName: formData.productName || t.campaigns.wizard.email.sampleProduct,
                      quantity: String(formData.quantity || '1000'),
                      currency: 'EUR',
                    }}
                    showTranslationNotice={false}
                    className="max-h-[400px] overflow-y-auto"
                  />
                </div>
              </div>
            )}

            {/* ===== STEP 4: Podsumowanie ===== */}
            {steps[currentStep]?.id === 'summary' && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg">{t.campaigns.wizard.summary.campaignSummary}</h3>
                  <div className="space-y-2 text-sm">
                    {formData.industry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.campaigns.wizard.summary.industry}:</span>
                        <span className="font-medium">
                          {(t.campaigns.wizard.brief.industries as Record<string, string>)[formData.industry as string] || formData.industry}
                        </span>
                      </div>
                    )}
                    {formData.sourcingMode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.campaigns.wizard.summary.sourcingMode}:</span>
                        <span className="font-medium">
                          {formData.sourcingMode === 'product' && t.campaigns.wizard.brief.modeProduct}
                          {formData.sourcingMode === 'service' && t.campaigns.wizard.brief.modeService}
                          {formData.sourcingMode === 'mixed' && t.campaigns.wizard.brief.modeMixed}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.product}:</span><span className="font-medium">{formData.productName}</span></div>
                    {formData.city && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.city}:</span><span className="font-medium">{formData.city}</span></div>}
                    {formData.eventDate && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.eventDate}:</span><span className="font-medium">{formData.eventDate}</span></div>}
                    {formData.headcount && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.headcount}:</span><span className="font-medium">{formData.headcount}</span></div>}
                    {selectedVoivodeships.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isEN ? 'Voivodeships' : 'Województwa'}:</span>
                        <span className="font-medium text-right">
                          {selectedVoivodeships
                            .map(c => PL_VOIVODESHIPS.find(v => v.code === c))
                            .filter(Boolean)
                            .map(v => isEN ? v!.labelEn : v!.labelPl)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    {formData.moq && <div className="flex justify-between"><span className="text-muted-foreground">MOQ:</span><span className="font-medium">{formData.moq}</span></div>}
                    {formData.leadTimeWeeks && <div className="flex justify-between"><span className="text-muted-foreground">{isEN ? 'Lead time' : 'Lead time'}:</span><span className="font-medium">{formData.leadTimeWeeks} {isEN ? 'weeks' : 'tyg.'}</span></div>}
                    {formData.sourcingGeography && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isEN ? 'Sourcing geo' : 'Geografia'}:</span>
                        <span className="font-medium">{formData.sourcingGeography}</span>
                      </div>
                    )}
                    {formData.material && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.material}:</span><span className="font-medium">{formData.material}</span></div>}
                    {formData.quantity && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.quantity}:</span><span className="font-medium">{formData.quantity} {formData.unit || t.campaigns.wizard.specs.unitDefault}</span></div>}
                    {formData.eau && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.eau}:</span><span className="font-medium">{formData.eau}</span></div>}
                    {formData.partNumber && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.partNumber}:</span><span className="font-medium">{formData.partNumber}</span></div>}
                    {formData.description && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.description}:</span><span className="font-medium line-clamp-2">{formData.description}</span></div>}
                    {formData.targetRegion && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.campaigns.wizard.summary.region}:</span>
                        <span className="font-medium">
                          {formData.targetRegion === 'CUSTOM'
                            ? `\u{1F4CD} ${selectedCountries.map(c => AVAILABLE_COUNTRIES.find(ac => ac.code === c)?.name).filter(Boolean).join(', ')}`
                            : `${REGION_OPTIONS.find(r => r.value === formData.targetRegion)?.icon} ${REGION_OPTIONS.find(r => r.value === formData.targetRegion)?.label}`
                          }
                        </span>
                      </div>
                    )}
                    {formData.supplierTypes && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.campaigns.wizard.summary.supplierTypes}:</span>
                        <span className="font-medium">
                          {(formData.supplierTypes as string[]).includes('HANDLOWIEC')
                            ? t.campaigns.wizard.supplierTypes.manufacturersAndTraders
                            : t.campaigns.wizard.supplierTypes.onlyManufacturers
                          }
                        </span>
                      </div>
                    )}
                    {displayCertificates && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.certificates}:</span><span className="font-medium">{displayCertificates}</span></div>}
                    {selectedIncoterms.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Incoterms:</span>
                        <div className="flex gap-1">
                          {selectedIncoterms.map((term) => (
                            <Badge key={term} variant="secondary">{term}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {formData.desiredDeliveryDate && <div className="flex justify-between"><span className="text-muted-foreground">{t.campaigns.wizard.summary.deliveryDate}:</span><span className="font-medium">{formData.desiredDeliveryDate}</span></div>}
                  </div>

                  {/* Attachments summary */}
                  {(attachments.length > 0 || selectedDocs.length > 0) && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">{t.campaigns.wizard.summary.attachments} ({attachments.length + selectedDocs.length})</h4>
                      <div className="space-y-1">
                        {selectedDocs.map((doc) => (
                          <p key={doc.id} className="text-xs text-muted-foreground font-sans">{'\u{1F4CE}'} {doc.originalName}</p>
                        ))}
                        {attachments.map((file) => (
                          <p key={file.id} className="text-xs text-muted-foreground font-sans">{'\u{1F4CE}'} {file.filename}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      {t.campaigns.wizard.summary.launchDescription}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0 || createMutation.isPending}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.campaigns.wizard.creating}</>
                ) : currentStep === steps.length - 1 ? (
                  t.campaigns.wizard.summary.launch
                ) : (
                  <>{t.common.next}<ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

    {/* Document Picker Dialog */}
    <DocumentPickerDialog
      open={docPickerOpen}
      onOpenChange={setDocPickerOpen}
      selectedIds={selectedDocs.map((d) => d.id)}
      onSelect={(docs) => setSelectedDocs(docs)}
    />
    </>
  );
}

/* ---------- Document Picker Dialog ---------- */

function DocumentPickerDialog({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onSelect: (docs: DocumentRecord[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [localSelected, setLocalSelected] = useState<DocumentRecord[]>([]);

  // Load docs when opened
  useEffect(() => {
    if (!open) return;
    const loadDocs = async () => {
      setLoading(true);
      try {
        const res = await documentsService.list({ search: search || undefined, limit: 50 });
        setDocs(res.data);
        // Pre-fill local selection from parent
        if (selectedIds.length > 0) {
          setLocalSelected(res.data.filter((d: DocumentRecord) => selectedIds.includes(d.id)));
        } else {
          setLocalSelected([]);
        }
      } catch {
        setDocs([]);
        setLocalSelected([]);
      } finally {
        setLoading(false);
      }
    };
    loadDocs();
  }, [open, search, selectedIds]);

  const toggleDoc = useCallback((doc: DocumentRecord) => {
    setLocalSelected((prev) => {
      const exists = prev.find((d) => d.id === doc.id);
      if (exists) return prev.filter((d) => d.id !== doc.id);
      return [...prev, doc];
    });
  }, []);

  const handleConfirm = () => {
    onSelect(localSelected);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t.documents.documentLibrary}</DialogTitle>
          <DialogDescription>{t.documents.selectFromExisting}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.documents.searchDocuments}
            className="pl-9"
          />
        </div>

        {/* Documents list */}
        <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px] space-y-1.5">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t.documents.noDocumentsYet}
            </p>
          ) : (
            docs.map((doc) => {
              const isSelected = localSelected.some((d) => d.id === doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDoc(doc)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-md border p-2.5 text-left text-sm transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent',
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors',
                    isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input',
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{doc.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category ? `${doc.category} — ` : ''}
                      {formatDocSize(doc.sizeBytes)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleConfirm}>
            {localSelected.length > 0
              ? `${isEN ? 'Select' : 'Wybierz'} (${localSelected.length})`
              : t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDocSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default RfqWizard;
