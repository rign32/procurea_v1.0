import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Globe,
  MapPin,
  Brain,
  Users,
  Award,
  Mail,
  Phone,
  UserCircle,
  ExternalLink,
  Loader2,
  ShieldAlert,
  StickyNote,
  ChevronDown,
  Save,
  Info,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api.client';
import { suppliersService } from '@/services/suppliers.service';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { BlacklistDialog } from '@/components/suppliers/BlacklistDialog';
import { SupplierScorecard } from '@/components/suppliers/SupplierScorecard';
import { useSupplier } from '@/hooks/useSuppliers';
import { useAuthStore } from '@/stores/auth.store';
import { scoreToPercent } from '@/utils/supplier-score';
import { t, isEN } from '@/i18n';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
import type { Contact } from '@/types/supplier.types';
import { CommentThread } from '@/components/collaboration/CommentThread';
import { SupplierDocuments } from '@/components/suppliers/SupplierDocuments';
import { CertificatesSection } from '@/components/suppliers/CertificatesSection';
import { VatVerifiedBadge } from '@/components/suppliers/VatVerifiedBadge';
import { getVatMetadata } from '@/utils/supplier-metadata';

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [notesDirty, setNotesDirty] = useState(false);
  const { data: supplier, isLoading, error } = useSupplier(id || '');
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  // Sync notes/tags from supplier data — adjust state during render
  // (React-recommended pattern for deriving state from props/query)
  const [lastSyncedId, setLastSyncedId] = useState<string | null>(null);
  if (supplier && supplier.id !== lastSyncedId) {
    setLastSyncedId(supplier.id);
    setInternalNotes(supplier.internalNotes || '');
    setInternalTags(Array.isArray(supplier.internalTags) ? supplier.internalTags : []);
    setNotesDirty(false);
  }

  const notesMutation = useMutation({
    mutationFn: () => suppliersService.updateNotes(id!, { internalNotes, internalTags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', id] });
      toast.success(t.suppliers.detail.internalNotes.saved);
      setNotesDirty(false);
    },
    onError: () => {
      toast.error(t.suppliers.detail.internalNotes.saveFailed);
    },
  });

  const TAG_SUGGESTIONS = ['preferred', 'quality-issues', 'backup', 'local', 'certified', 'new'];

  const blacklistMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiClient.post(`/suppliers/${id}/blacklist`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      toast.success(t.suppliers.page.blacklistAdded);
      setIsBlacklistDialogOpen(false);
      navigate('/suppliers');
    },
    onError: () => {
      toast.error(t.suppliers.page.blacklistFailed);
    }
  });

  const scorePercent = scoreToPercent(supplier?.analysisScore);

  const getScoreVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getScoreBarColor = (score: number): string => {
    if (score >= 85) return 'bg-good';
    if (score >= 70) return 'bg-warn';
    return 'bg-muted-ink-2';
  };

  const getScoreBadgeVariant = (
    score: number
  ): 'good' | 'warn' | 'bad' => {
    if (score >= 85) return 'good';
    if (score >= 70) return 'warn';
    return 'bad';
  };

  if (!supplier && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">
            {error ? t.errors.generic : t.errors.notFound}
          </p>
          <Button onClick={() => navigate('/suppliers')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const certificates = supplier.certificates
    ? supplier.certificates.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/suppliers');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Breadcrumb back link */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 text-[12.5px] font-mono text-muted-ink hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.suppliers.title}
      </button>

      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule">
          <div className="min-w-0">
            <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold truncate">
              {supplier.name || 'Unknown'}
            </h1>
            {(() => {
              const vat = getVatMetadata(supplier);
              return vat ? (
                <div className="mt-2">
                  <VatVerifiedBadge vat={vat} />
                </div>
              ) : null;
            })()}
            <p className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums flex flex-wrap items-center gap-x-3 gap-y-1">
              {supplier.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" strokeWidth={1.5} />
                  {supplier.country}
                  {supplier.city && ` / ${supplier.city}`}
                </span>
              )}
              {supplier.employeeCount && supplier.employeeCount !== 'N/A' && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" strokeWidth={1.5} />
                  {supplier.employeeCount}
                </span>
              )}
              {certificates.length > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Award className="h-3 w-3" strokeWidth={1.5} />
                  {certificates.length} {t.suppliers.detail.certificates.toLowerCase()}
                </span>
              )}
              {supplier.website && (
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand hover:underline"
                >
                  <Globe className="h-3 w-3" strokeWidth={1.5} />
                  {supplier.website}
                </a>
              )}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Badge
              variant={getScoreBadgeVariant(scorePercent)}
              className="font-mono tabular-nums text-[13px] px-3 py-1"
            >
              {scorePercent}%
            </Badge>
            <Button
              variant="ds-danger"
              size="ds"
              onClick={() => setIsBlacklistDialogOpen(true)}
            >
              <ShieldAlert className="h-3.5 w-3.5" strokeWidth={2} />
              <span className="hidden md:inline">{t.suppliers.detail.reportSupplier}</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
              <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
                <Globe className="h-4 w-4 text-muted-ink" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                  {t.suppliers.detail.overview}
                </h3>
              </header>
              <div className="p-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {t.suppliers.filters.country}
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.country || t.common.noData}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {t.suppliers.detail.city}
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.city || t.common.noData}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {t.suppliers.detail.specialization}
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.specialization || t.common.noData}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {t.suppliers.detail.website}
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.website ? (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {supplier.website}
                        </a>
                      ) : (
                        t.common.noData
                      )}
                    </dd>
                  </div>
                  {supplier.employeeCount && supplier.employeeCount !== 'N/A' && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {t.suppliers.detail.companySize}
                      </dt>
                      <dd className="text-sm mt-1">
                        {supplier.employeeCount} {t.suppliers.detail.employees}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </motion.div>

          {/* AI Analysis Card */}
          <motion.div variants={itemVariants}>
            <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
              <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
                <Brain className="h-4 w-4 text-muted-ink" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                  {t.suppliers.detail.aiInsights}
                </h3>
              </header>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold font-mono tabular-nums">{scorePercent}%</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <p className="label-mono">
                        {t.suppliers.detail.overall}
                      </p>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="Explain score"
                              className="text-muted-ink-2 hover:text-ink transition-colors"
                            >
                              <Info className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[280px] text-xs">
                            <p className="font-semibold mb-1">
                              {isEN ? 'How is this score calculated?' : 'Jak wyliczamy tę ocenę?'}
                            </p>
                            <p className="leading-snug">
                              {isEN
                                ? 'AI analyses the supplier website (product range, certifications, company scale, industry fit) and returns a 0–10 capability score. Shown here as percent (×10).'
                                : 'AI analizuje stronę dostawcy (asortyment, certyfikaty, skalę firmy, dopasowanie branżowe) i zwraca ocenę 0–10. Tutaj pokazana jako procent (×10).'}
                            </p>
                            {supplier.analysisReason && (
                              <p className="mt-1.5 pt-1.5 border-t border-rule-2 italic">
                                {supplier.analysisReason}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-rule-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getScoreBarColor(scorePercent)}`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                {supplier.analysisReason && (
                  <div className="rounded-[8px] bg-surface-2 border border-rule-2 p-4">
                    <p className="text-sm font-semibold mb-1 text-ink">
                      {t.suppliers.detail.recommendation}
                    </p>
                    <p className="text-sm text-muted-ink">
                      {supplier.analysisReason}
                    </p>
                  </div>
                )}

                {/* Score breakdown — why this supplier got this score */}
                <div className="rounded-[8px] border border-rule-2 bg-surface-2 p-4">
                  <p className="text-sm font-semibold mb-2 text-ink">
                    {isEN ? 'Score breakdown' : 'Składowe oceny'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <BreakdownRow
                      label={isEN ? 'AI capability' : 'Zdolność AI'}
                      value={scorePercent}
                      suffix="%"
                      tone={scorePercent >= 70 ? 'good' : scorePercent >= 40 ? 'warn' : 'bad'}
                    />
                    <BreakdownRow
                      label={isEN ? 'Classification' : 'Klasyfikacja'}
                      value={classificationLabel(supplier.companyType, isEN)}
                      suffix={supplier.companyTypeConfidence ? ` · ${supplier.companyTypeConfidence}%` : ''}
                      tone={supplier.companyType === 'PRODUCENT' ? 'good' : supplier.companyType === 'HANDLOWIEC' ? 'warn' : 'muted'}
                    />
                    <BreakdownRow
                      label={isEN ? 'Email available' : 'Email dostępny'}
                      value={supplier.contactEmails ? (isEN ? 'Yes' : 'Tak') : (isEN ? 'No' : 'Nie')}
                      tone={supplier.contactEmails ? 'good' : 'muted'}
                    />
                    <BreakdownRow
                      label={isEN ? 'Certificates' : 'Certyfikaty'}
                      value={supplier.certificates ? (isEN ? 'Listed' : 'Podane') : (isEN ? 'Not found' : 'Brak')}
                      tone={supplier.certificates ? 'good' : 'muted'}
                    />
                    <BreakdownRow
                      label={isEN ? 'Team size' : 'Zespół'}
                      value={supplier.employeeCount || (isEN ? 'Unknown' : 'Nieznany')}
                      tone={supplier.employeeCount ? 'good' : 'muted'}
                    />
                    <BreakdownRow
                      label={isEN ? 'Specialization' : 'Specjalizacja'}
                      value={supplier.specialization ? (isEN ? 'Described' : 'Opisana') : (isEN ? 'Missing' : 'Brak')}
                      tone={supplier.specialization ? 'good' : 'muted'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Performance Scorecard */}
          <motion.div variants={itemVariants}>
            <SupplierScorecard supplierId={id!} analysisScore={supplier.analysisScore} />
          </motion.div>

          {/* Contacts Card — only visible for full plan */}
          {isFullPlan && (
          <motion.div variants={itemVariants}>
            <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
              <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
                <Users className="h-4 w-4 text-muted-ink" strokeWidth={1.5} />
                <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                  {t.suppliers.detail.contacts}
                </h3>
              </header>
              <div className="p-5">
                {supplier.contacts && supplier.contacts.length > 0 ? (
                  <div className="space-y-4">
                    {supplier.contacts.map((contact: Contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start gap-4 rounded-lg border p-4"
                      >
                        <UserCircle className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {contact.name || t.suppliers.detail.noName}
                            </span>
                            {contact.isDecisionMaker && (
                              <Badge variant="default" className="text-xs">
                                {t.suppliers.detail.primary}
                              </Badge>
                            )}
                          </div>
                          {contact.role && (
                            <p className="text-sm text-muted-foreground">
                              {contact.role}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : supplier.contactEmails ? (
                  <div className="space-y-2">
                    {supplier.contactEmails
                      .split(',')
                      .filter((e) => e.trim())
                      .map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${email.trim()}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {email.trim()}
                          </a>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t.common.noData}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
          )}

          {/* Internal Notes Card (collapsible) */}
          <motion.div variants={itemVariants}>
            <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
              <header
                className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-rule bg-surface-2 cursor-pointer select-none"
                onClick={() => setNotesOpen((v) => !v)}
              >
                <span className="flex items-center gap-3">
                  <StickyNote className="h-4 w-4 text-muted-ink" strokeWidth={1.5} />
                  <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                    {t.suppliers.detail.internalNotes.title}
                  </h3>
                  {(internalNotes || internalTags.length > 0) && internalTags.length > 0 && (
                    <Badge variant="mono" className="text-[11px]">
                      {internalTags.length}
                    </Badge>
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-ink transition-transform ${notesOpen ? 'rotate-180' : ''}`}
                />
              </header>
              <AnimatePresence initial={false}>
                {notesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      <Textarea
                        value={internalNotes}
                        onChange={(e) => {
                          setInternalNotes(e.target.value);
                          setNotesDirty(true);
                        }}
                        placeholder={t.suppliers.detail.internalNotes.notesPlaceholder}
                        rows={4}
                      />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                          {t.suppliers.detail.internalNotes.tagsLabel}
                        </label>
                        <TagInput
                          value={internalTags}
                          onChange={(tags) => {
                            setInternalTags(tags);
                            setNotesDirty(true);
                          }}
                          placeholder={t.suppliers.detail.internalNotes.tagsPlaceholder}
                          suggestions={TAG_SUGGESTIONS}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="accent"
                          size="ds-sm"
                          disabled={!notesDirty || notesMutation.isPending}
                          onClick={() => notesMutation.mutate()}
                        >
                          {notesMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" strokeWidth={2} />
                          )}
                          {t.suppliers.detail.internalNotes.save}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Certificates Card */}
          <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
            <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
              <Award className="h-4 w-4 text-muted-ink" strokeWidth={1.5} />
              <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                {t.suppliers.detail.certificates}
              </h3>
            </header>
            <div className="p-5">
              {certificates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {certificates.map((cert, index) => (
                    <Badge key={index} variant="mono">
                      {cert}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-ink">
                  {t.common.noData}
                </p>
              )}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
            <header className="flex items-center gap-3 px-5 py-3.5 border-b border-rule bg-surface-2">
              <h3 className="text-[14px] font-semibold tracking-[-0.015em]">
                {t.suppliers.detail.scoring}
              </h3>
            </header>
            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t.suppliers.detail.overall}
                </span>
                <Badge
                  variant={getScoreVariant(scorePercent)}
                  className="font-semibold"
                >
                  {scorePercent}%
                </Badge>
              </div>
              {supplier.employeeCount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.suppliers.detail.companySize}
                  </span>
                  <span>
                    {supplier.employeeCount} {t.suppliers.detail.employees}
                  </span>
                </div>
              )}
              {isFullPlan && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t.suppliers.detail.contacts}
                  </span>
                  <span>
                    {supplier.contacts?.length ||
                      (supplier.contactEmails
                        ? supplier.contactEmails.split(',').filter((e) => e.trim())
                          .length
                        : 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-ink">
                  {t.suppliers.detail.certificates}
                </span>
                <span className="font-mono tabular-nums">{certificates.length}</span>
              </div>
            </div>
          </div>

          {/* Structured Certificates (Sprint #2) */}
          {id && <CertificatesSection supplierId={id} />}

          {/* Supplier Documents */}
          {id && <SupplierDocuments supplierId={id} />}

        </motion.div>
      </div>

      {/* Comments Section */}
      {id && (
        <motion.div variants={itemVariants}>
          <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
            <div className="p-5">
              <CommentThread entityType="supplier" entityId={id} />
            </div>
          </div>
        </motion.div>
      )}

      {supplier && (
        <BlacklistDialog
          isOpen={isBlacklistDialogOpen}
          onClose={() => setIsBlacklistDialogOpen(false)}
          supplierName={supplier.name || t.common.unknown}
          isSubmitting={blacklistMutation.isPending}
          onConfirm={(reason) => blacklistMutation.mutate(reason)}
        />
      )}
    </motion.div>
  );
}

export default SupplierDetailPage;

// ---- Score breakdown helpers --------------------------------------------

function classificationLabel(
  type: 'PRODUCENT' | 'HANDLOWIEC' | 'NIEJASNY' | undefined,
  en: boolean,
): string {
  if (!type || type === 'NIEJASNY') return en ? 'Unclear' : 'Niejasny';
  if (type === 'PRODUCENT') return en ? 'Manufacturer' : 'Producent';
  return en ? 'Distributor' : 'Handlowiec';
}

function BreakdownRow({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  tone: 'good' | 'warn' | 'bad' | 'muted';
}) {
  const dotClass =
    tone === 'good' ? 'bg-good' :
    tone === 'warn' ? 'bg-warn' :
    tone === 'bad' ? 'bg-bad' : 'bg-rule-3';
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden />
      <span className="text-muted-ink flex-1 truncate">{label}</span>
      <span className="font-medium tabular-nums text-ink shrink-0">
        {value}{suffix ?? ''}
      </span>
    </div>
  );
}
