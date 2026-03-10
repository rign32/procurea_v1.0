import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Loader2, Mail, HelpCircle, Globe2, X, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TagInput } from '@/components/ui/tag-input';
import { FileUpload } from '@/components/ui/file-upload';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useCreateCampaign } from '@/hooks/useCampaigns';
import { t } from '@/i18n';
import { toast } from 'sonner';
import { EmailPreview } from '@/components/email/EmailPreview';
import { sequencesService, type SequenceTemplate } from '@/services/sequences.service';
import { organizationService } from '@/services/organization.service';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import type { CreateCampaignDto, OrganizationLocation, Region } from '@/types/campaign.types';

// Zod schemas — 4 steps
const optionalNumber = z.preprocess(
  (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
  z.number().optional()
);

const step1Schema = z.object({
  productName: z.string().min(2, 'Minimum 2 znaki').max(200, 'Maksymalnie 200 znaków'),
  material: z.string().max(100).optional(),
  quantity: z.preprocess(
    (val) => (val === '' || val === undefined || val === null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().min(1, 'Minimum 1').optional()
  ),
  unit: z.string().max(20).optional(),
  eau: optionalNumber,
  partNumber: z.string().max(100).optional(),
  description: z.string().max(1000, 'Maksymalnie 1000 znaków').optional(),
});

const step2Schema = z.object({
  targetRegion: z.enum(['PL', 'EU', 'GLOBAL', 'GLOBAL_NO_CN', 'CUSTOM']).optional(),
  incoterms: z.string().optional(),
  desiredDeliveryDate: z.string().optional(),
  deliveryLocationId: z.string().optional(),
  supplierTypes: z.array(z.string()).optional(),
});

const step3Schema = z.object({
  sequenceTemplateId: z.string().optional(),
});

const AVAILABLE_COUNTRIES: { code: string; name: string; flag: string; group: string }[] = [
  // Europa
  { code: 'PL', name: 'Polska', flag: '\u{1F1F5}\u{1F1F1}', group: 'Europa' },
  { code: 'DE', name: 'Niemcy', flag: '\u{1F1E9}\u{1F1EA}', group: 'Europa' },
  { code: 'CZ', name: 'Czechy', flag: '\u{1F1E8}\u{1F1FF}', group: 'Europa' },
  { code: 'SK', name: 'S\u0142owacja', flag: '\u{1F1F8}\u{1F1F0}', group: 'Europa' },
  { code: 'AT', name: 'Austria', flag: '\u{1F1E6}\u{1F1F9}', group: 'Europa' },
  { code: 'FR', name: 'Francja', flag: '\u{1F1EB}\u{1F1F7}', group: 'Europa' },
  { code: 'IT', name: 'W\u0142ochy', flag: '\u{1F1EE}\u{1F1F9}', group: 'Europa' },
  { code: 'ES', name: 'Hiszpania', flag: '\u{1F1EA}\u{1F1F8}', group: 'Europa' },
  { code: 'PT', name: 'Portugalia', flag: '\u{1F1F5}\u{1F1F9}', group: 'Europa' },
  { code: 'NL', name: 'Holandia', flag: '\u{1F1F3}\u{1F1F1}', group: 'Europa' },
  { code: 'BE', name: 'Belgia', flag: '\u{1F1E7}\u{1F1EA}', group: 'Europa' },
  { code: 'CH', name: 'Szwajcaria', flag: '\u{1F1E8}\u{1F1ED}', group: 'Europa' },
  { code: 'SE', name: 'Szwecja', flag: '\u{1F1F8}\u{1F1EA}', group: 'Europa' },
  { code: 'DK', name: 'Dania', flag: '\u{1F1E9}\u{1F1F0}', group: 'Europa' },
  { code: 'NO', name: 'Norwegia', flag: '\u{1F1F3}\u{1F1F4}', group: 'Europa' },
  { code: 'FI', name: 'Finlandia', flag: '\u{1F1EB}\u{1F1EE}', group: 'Europa' },
  { code: 'HU', name: 'W\u0119gry', flag: '\u{1F1ED}\u{1F1FA}', group: 'Europa' },
  { code: 'RO', name: 'Rumunia', flag: '\u{1F1F7}\u{1F1F4}', group: 'Europa' },
  { code: 'BG', name: 'Bu\u0142garia', flag: '\u{1F1E7}\u{1F1EC}', group: 'Europa' },
  { code: 'HR', name: 'Chorwacja', flag: '\u{1F1ED}\u{1F1F7}', group: 'Europa' },
  { code: 'SI', name: 'S\u0142owenia', flag: '\u{1F1F8}\u{1F1EE}', group: 'Europa' },
  { code: 'LT', name: 'Litwa', flag: '\u{1F1F1}\u{1F1F9}', group: 'Europa' },
  { code: 'LV', name: '\u0141otwa', flag: '\u{1F1F1}\u{1F1FB}', group: 'Europa' },
  { code: 'EE', name: 'Estonia', flag: '\u{1F1EA}\u{1F1EA}', group: 'Europa' },
  { code: 'IE', name: 'Irlandia', flag: '\u{1F1EE}\u{1F1EA}', group: 'Europa' },
  { code: 'GB', name: 'Wielka Brytania', flag: '\u{1F1EC}\u{1F1E7}', group: 'Europa' },
  { code: 'GR', name: 'Grecja', flag: '\u{1F1EC}\u{1F1F7}', group: 'Europa' },
  // Azja
  { code: 'CN', name: 'Chiny', flag: '\u{1F1E8}\u{1F1F3}', group: 'Azja' },
  { code: 'JP', name: 'Japonia', flag: '\u{1F1EF}\u{1F1F5}', group: 'Azja' },
  { code: 'KR', name: 'Korea Po\u0142udniowa', flag: '\u{1F1F0}\u{1F1F7}', group: 'Azja' },
  { code: 'IN', name: 'Indie', flag: '\u{1F1EE}\u{1F1F3}', group: 'Azja' },
  { code: 'TW', name: 'Tajwan', flag: '\u{1F1F9}\u{1F1FC}', group: 'Azja' },
  { code: 'VN', name: 'Wietnam', flag: '\u{1F1FB}\u{1F1F3}', group: 'Azja' },
  { code: 'TH', name: 'Tajlandia', flag: '\u{1F1F9}\u{1F1ED}', group: 'Azja' },
  { code: 'MY', name: 'Malezja', flag: '\u{1F1F2}\u{1F1FE}', group: 'Azja' },
  { code: 'ID', name: 'Indonezja', flag: '\u{1F1EE}\u{1F1E9}', group: 'Azja' },
  { code: 'TR', name: 'Turcja', flag: '\u{1F1F9}\u{1F1F7}', group: 'Azja' },
  // Ameryki
  { code: 'US', name: 'USA', flag: '\u{1F1FA}\u{1F1F8}', group: 'Ameryki' },
  { code: 'CA', name: 'Kanada', flag: '\u{1F1E8}\u{1F1E6}', group: 'Ameryki' },
  { code: 'MX', name: 'Meksyk', flag: '\u{1F1F2}\u{1F1FD}', group: 'Ameryki' },
  { code: 'BR', name: 'Brazylia', flag: '\u{1F1E7}\u{1F1F7}', group: 'Ameryki' },
  // Oceania
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}', group: 'Oceania' },
];

const INCOTERMS_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'EXW', label: 'EXW', desc: 'Ex Works — Ty odbierasz towar z zakładu sprzedawcy' },
  { value: 'FCA', label: 'FCA', desc: 'Free Carrier — dostawa do przewoźnika' },
  { value: 'DAP', label: 'DAP', desc: 'Delivered at Place — dostawca dostarcza na wyznaczone miejsce' },
  { value: 'DDP', label: 'DDP', desc: 'Delivered Duty Paid — dostawa z opłaconym cłem' },
  { value: 'FOB', label: 'FOB', desc: 'Free on Board — załadunek na statek w porcie' },
  { value: 'CIF', label: 'CIF', desc: 'Cost, Insurance, Freight — koszt, ubezpieczenie i fracht' },
];

const REGION_OPTIONS: { value: Region; label: string; icon: string; desc: string }[] = [
  { value: 'PL', label: 'Polska', icon: '\u{1F1F5}\u{1F1F1}', desc: 'Dostawcy z Polski' },
  { value: 'EU', label: 'Unia Europejska', icon: '\u{1F1EA}\u{1F1FA}', desc: 'Dostawcy z krajów UE' },
  { value: 'GLOBAL', label: 'Globalnie', icon: '\u{1F30D}', desc: 'Dostawcy z całego świata' },
  { value: 'GLOBAL_NO_CN', label: 'Bez Chin', icon: '\u{1F30E}', desc: 'Globalnie z wyłączeniem Chin' },
  { value: 'CUSTOM', label: 'Wybrane kraje', icon: '\u{1F4CD}', desc: 'Wybierz konkretne kraje' },
];

interface RfqWizardProps {
  onComplete?: (campaignId: string) => void;
}

export function RfqWizard({ onComplete }: RfqWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CreateCampaignDto>>({ supplierTypes: ['PRODUCENT'] });
  const [sequences, setSequences] = useState<SequenceTemplate[]>([]);
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [certificates, setCertificates] = useState<string[]>([]);
  const [selectedIncoterms, setSelectedIncoterms] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  const createMutation = useCreateCampaign();
  const submittedRef = useRef(false);

  // Track wizard start + abandonment on unmount
  useEffect(() => {
    analytics.campaignWizardStart();
    analytics.campaignWizardStep(0);
    return () => {
      if (!submittedRef.current) {
        analytics.campaignWizardAbandoned(currentStep);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const steps = [
    { id: 'product', label: 'Produkt i specyfikacja', schema: step1Schema },
    { id: 'search-logistics', label: 'Wyszukiwanie i logistyka', schema: step2Schema },
    ...(isFullPlan ? [{ id: 'email', label: t.sequences.emailConfig, schema: step3Schema }] : []),
    { id: 'summary', label: t.campaigns.wizard.step5, schema: z.any() },
  ];

  const currentSchema = steps[currentStep].schema;

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData as any,
    mode: 'onChange',
  });

  // Reset form values when step changes
  useEffect(() => {
    form.reset(formData as any);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-select first sequence if none selected
  useEffect(() => {
    if (sequences.length > 0 && !form.getValues('sequenceTemplateId')) {
      form.setValue('sequenceTemplateId', sequences[0].id, { shouldValidate: true, shouldDirty: true });
    }
  }, [sequences, form]);

  const handleNext = async (data: any) => {
    const parsed = { ...data };

    // Inject tag-based fields at search step
    if (steps[currentStep]?.id === 'search-logistics') {
      parsed.requiredCertificates = certificates;
      parsed.incoterms = selectedIncoterms.join(',');
      if (parsed.targetRegion === 'CUSTOM') {
        parsed.targetCountries = selectedCountries;
      }
    }

    const newFormData = { ...formData, ...parsed };
    setFormData(newFormData);

    if (currentStep === steps.length - 1) {
      // Auto-generate campaign name from product name
      const finalData: any = {
        ...newFormData,
        name: `Kampania: ${newFormData.productName}`,
        requiredCertificates: certificates,
        incoterms: selectedIncoterms.join(','),
        targetCountries: newFormData.targetRegion === 'CUSTOM' ? selectedCountries : undefined,
      };
      if (attachments.length > 0) {
        finalData.attachments = JSON.stringify(attachments);
      }

      try {
        const result = await createMutation.mutateAsync(finalData as CreateCampaignDto);
        submittedRef.current = true;
        analytics.campaignCreated(newFormData.targetRegion);
        if (onComplete) {
          onComplete(result.id);
        } else {
          navigate(`/campaigns/${result.id}`);
        }
      } catch (error: any) {
        console.error('Failed to create campaign:', error);
        const msg = error?.message || 'Nie udało się utworzyć kampanii';
        const isCreditsError = error?.statusCode === 400 && (msg.toLowerCase().includes('kredyt') || msg.toLowerCase().includes('wyszukiw'));
        if (isCreditsError) {
          toast.error(msg, {
            duration: 8000,
            action: { label: 'Doładuj wyszukiwania', onClick: () => navigate('/settings?tab=billing') },
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

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;
  const displayCertificates = certificates.join(', ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{steps[currentStep].label}</span>
          <span className="text-muted-foreground">
            Krok {currentStep + 1} z {steps.length}
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
          <form onSubmit={form.handleSubmit(handleNext)} className="space-y-6">

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
                    <input type="number" min={1} {...form.register('quantity', { valueAsNumber: true })} placeholder={t.campaigns.wizard.specs.quantityPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    {form.formState.errors.quantity && <p className="text-sm text-destructive mt-1">{form.formState.errors.quantity.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.unit}</label>
                    <input type="text" {...form.register('unit')} maxLength={20} defaultValue="szt." placeholder="szt." className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.eau} <span className="text-muted-foreground font-normal">(opcjonalne)</span></label>
                  <input type="number" {...form.register('eau', { valueAsNumber: true })} placeholder={t.campaigns.wizard.specs.eauPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.specs.partNumber} <span className="text-muted-foreground font-normal">(opcjonalne)</span></label>
                  <input type="text" {...form.register('partNumber')} maxLength={100} placeholder={t.campaigns.wizard.specs.partNumberPlaceholder} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.upload.title}</label>
                  <FileUpload value={attachments} onChange={setAttachments} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t.campaigns.wizard.basicInfo.description} <span className="text-muted-foreground font-normal">(opcjonalne)</span></label>
                  <textarea {...form.register('description')} maxLength={1000} placeholder={t.campaigns.wizard.basicInfo.descriptionPlaceholder} rows={3} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
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
                          onClick={() => form.setValue('targetRegion', opt.value, { shouldValidate: true, shouldDirty: true })}
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
                        placeholder="Szukaj kraju..."
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
                      <p className="text-xs text-destructive">Wybierz co najmniej 1 kraj</p>
                    )}
                  </div>
                )}

                {/* Supplier Types — checkboxes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Typy dostawców <span className="text-muted-foreground font-normal">(wielokrotny wybór)</span></label>
                  <div className="space-y-2">
                    {[
                      { value: 'PRODUCENT', label: 'Producenci', desc: 'Firmy które same wytwarzają produkty' },
                      { value: 'HANDLOWIEC', label: 'Handlowcy / Dystrybutorzy', desc: 'Sklepy, hurtownie, pośrednicy' },
                    ].map((opt) => {
                      const currentTypes = form.watch('supplierTypes') || ['PRODUCENT'];
                      const isSelected = currentTypes.includes(opt.value);
                      return (
                        <label
                          key={opt.value}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer hover:bg-muted/30 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const current = form.getValues('supplierTypes') || ['PRODUCENT'];
                              const updated = isSelected
                                ? current.filter((t: string) => t !== opt.value)
                                : [...current, opt.value];
                              if (updated.length > 0) {
                                form.setValue('supplierTypes', updated, { shouldValidate: true });
                              }
                            }}
                            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                          />
                          <div>
                            <p className="font-medium text-sm">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Certificates */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.search.certificates}</label>
                  <TagInput
                    value={certificates}
                    onChange={setCertificates}
                    placeholder={t.campaigns.wizard.search.certificatesPlaceholder}
                    suggestions={['ISO 9001', 'ISO 14001', 'ISO 13485', 'IATF 16949', 'AS9100', 'CE', 'UL', 'RoHS', 'REACH']}
                  />
                </div>

                {/* Incoterms — multi-select with tooltips */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    {t.campaigns.wizard.logistics.incoterms}
                    <span className="text-muted-foreground font-normal ml-1">(wielokrotny wybór)</span>
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
                                isChecked
                                  ? prev.filter(v => v !== term.value)
                                  : [...prev, term.value]
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

                {/* Delivery date */}
                <div>
                  <label className="block text-sm font-medium mb-2">Pożądana data dostawy / Lead time</label>
                  <input type="date" {...form.register('desiredDeliveryDate')} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>

                {/* Delivery location */}
                {isFullPlan && (
                <div>
                  <label className="block text-sm font-medium mb-2">{t.campaigns.wizard.logistics.deliveryLocation}</label>
                  <select {...form.register('deliveryLocationId')} className="w-full px-3 py-2.5 border rounded-md bg-background text-sm">
                    <option value="">Wybierz lokalizację</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} — {loc.address}
                      </option>
                    ))}
                  </select>
                  {locations.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Dodaj lokalizacje w Ustawienia &rarr; Lokalizacje
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
                    System automatycznie przetłumaczy tę wiadomość na język preferowany przez dostawcę przed wysyłką.
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
                        {index === 0 ? ' (Rekomendowana)' : ''}
                        {' — '}
                        {seq.steps.length} {t.sequences.steps.toLowerCase()}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Szablon określa harmonogram wysyłki emaili do dostawców (początkowy, przypomnienia)
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
                      productName: formData.productName || 'Przykładowy produkt',
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
                  <h3 className="font-semibold text-lg">Podsumowanie kampanii</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Produkt:</span><span className="font-medium">{formData.productName}</span></div>
                    {formData.material && <div className="flex justify-between"><span className="text-muted-foreground">Materiał:</span><span className="font-medium">{formData.material}</span></div>}
                    {formData.quantity && <div className="flex justify-between"><span className="text-muted-foreground">Ilość:</span><span className="font-medium">{formData.quantity} {formData.unit || 'szt'}</span></div>}
                    {formData.targetRegion && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Region:</span>
                        <span className="font-medium">
                          {formData.targetRegion === 'CUSTOM'
                            ? `\u{1F4CD} ${selectedCountries.map(c => AVAILABLE_COUNTRIES.find(ac => ac.code === c)?.name).filter(Boolean).join(', ')}`
                            : `${REGION_OPTIONS.find(r => r.value === formData.targetRegion)?.icon} ${REGION_OPTIONS.find(r => r.value === formData.targetRegion)?.label}`
                          }
                        </span>
                      </div>
                    )}
                    {displayCertificates && <div className="flex justify-between"><span className="text-muted-foreground">Certyfikaty:</span><span className="font-medium">{displayCertificates}</span></div>}
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
                    {formData.desiredDeliveryDate && <div className="flex justify-between"><span className="text-muted-foreground">Data dostawy:</span><span className="font-medium">{formData.desiredDeliveryDate}</span></div>}
                    {formData.description && <div className="flex justify-between"><span className="text-muted-foreground">Opis:</span><span className="font-medium line-clamp-2">{formData.description}</span></div>}
                  </div>

                  {/* Attachments summary */}
                  {attachments.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium mb-2">{t.campaigns.wizard.summary.attachments} ({attachments.length})</h4>
                      <div className="space-y-1">
                        {attachments.map((file: any) => (
                          <p key={file.id} className="text-xs text-muted-foreground">📎 {file.filename}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Po uruchomieniu, AI rozpocznie wyszukiwanie dostawców zgodnie z parametrami.
                      Proces może potrwać kilka minut.
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Tworzenie...</>
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
  );
}

export default RfqWizard;
