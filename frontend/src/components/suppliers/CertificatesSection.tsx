import { useState } from 'react';
import {
  Award,
  Plus,
  Trash2,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  Check,
  X,
  Eye,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  useSupplierCertificates,
  useCreateCertificate,
  useDeleteCertificate,
  useApproveCertificate,
  useRejectCertificate,
} from '@/hooks/useCertificates';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_LABELS,
  type CertificateStatus,
  type CertificateType,
  type SupplierCertificate,
} from '@/services/certificates.service';

interface CertificatesSectionProps {
  supplierId: string;
}

const STATUS_CONFIG: Record<
  CertificateStatus,
  { label: string; icon: typeof CheckCircle2; cls: string }
> = {
  ACTIVE: {
    label: 'Aktywny',
    icon: CheckCircle2,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  EXPIRING_SOON: {
    label: 'Wygasa wkrótce',
    icon: Clock,
    cls: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  EXPIRED: {
    label: 'Wygasły',
    icon: AlertTriangle,
    cls: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  UNKNOWN: {
    label: 'Bez daty',
    icon: HelpCircle,
    cls: 'bg-slate-50 text-slate-600 border-slate-200',
  },
};

const VERIFICATION_CONFIG: Record<
  'EXTRACTED' | 'EVIDENCED' | 'VERIFIED',
  { label: string; tooltip: string; icon: typeof CheckCircle2; cls: string }
> = {
  EXTRACTED: {
    label: 'Wykryty przez AI',
    tooltip: 'Tekst certyfikatu znaleziony na stronie dostawcy, brak twardych dowodów (numer, data, dokument)',
    icon: Sparkles,
    cls: 'bg-slate-50 text-slate-600 border-slate-200',
  },
  EVIDENCED: {
    label: 'Z dowodami',
    tooltip: 'AI znalazło co najmniej jeden twardy sygnał: numer, datę, wystawcę lub link do dokumentu',
    icon: Eye,
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  VERIFIED: {
    label: 'Zweryfikowany',
    tooltip: 'Cert przeszedł ręczną weryfikację kupującego lub cross-check w zewnętrznym rejestrze',
    icon: ShieldCheck,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function CertificatesSection({ supplierId }: CertificatesSectionProps) {
  const { data, isLoading } = useSupplierCertificates(supplierId);
  const createMutation = useCreateCertificate(supplierId);
  const deleteMutation = useDeleteCertificate(supplierId);
  const approveMutation = useApproveCertificate(supplierId);
  const rejectMutation = useRejectCertificate(supplierId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const certs = data?.items ?? [];
  const summary = data?.summary;
  const pendingCount = summary?.pending ?? certs.filter((c) => c.reviewStatus === 'PENDING').length;

  const handleDelete = async (cert: SupplierCertificate) => {
    if (!confirm(`Usunąć certyfikat ${CERTIFICATE_LABELS[cert.type]} (${cert.code})?`)) return;
    try {
      await deleteMutation.mutateAsync(cert.id);
      toast.success('Certyfikat usunięty');
    } catch {
      toast.error('Nie udało się usunąć');
    }
  };

  const handleApprove = async (cert: SupplierCertificate) => {
    try {
      await approveMutation.mutateAsync(cert.id);
      toast.success('Certyfikat zatwierdzony');
    } catch {
      toast.error('Nie udało się zatwierdzić');
    }
  };

  const handleReject = async (cert: SupplierCertificate) => {
    const notes = prompt('Powód odrzucenia (opcjonalnie):') ?? undefined;
    try {
      await rejectMutation.mutateAsync({ certificateId: cert.id, notes: notes || undefined });
      toast.success('Certyfikat odrzucony');
    } catch {
      toast.error('Nie udało się odrzucić');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-4 w-4" />
              Certyfikaty
              {certs.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({certs.length})
                </span>
              )}
            </CardTitle>
            {summary && (
              <div className="flex gap-3 mt-2 text-xs flex-wrap">
                {summary.ACTIVE > 0 && (
                  <span className="text-emerald-600">
                    ✓ {summary.ACTIVE} aktywne
                  </span>
                )}
                {summary.EXPIRING_SOON > 0 && (
                  <span className="text-amber-600">
                    ⏱ {summary.EXPIRING_SOON} wygasa wkrótce
                  </span>
                )}
                {summary.EXPIRED > 0 && (
                  <span className="text-rose-600">
                    ⚠ {summary.EXPIRED} wygasłe
                  </span>
                )}
                {summary.UNKNOWN > 0 && (
                  <span className="text-slate-500">
                    ? {summary.UNKNOWN} bez daty
                  </span>
                )}
                {pendingCount > 0 && (
                  <span className="text-amber-700 font-medium">
                    👁 {pendingCount} do weryfikacji
                  </span>
                )}
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Dodaj
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : certs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Brak zarejestrowanych certyfikatów. Dodaj pierwszy, żeby włączyć
            tracking dat ważności i alerty 90 dni przed wygaśnięciem.
          </p>
        ) : (
          <div className="space-y-2">
            {certs.map((cert) => {
              const cfg = STATUS_CONFIG[cert.status];
              const Icon = cfg.icon;
              const verCfg = VERIFICATION_CONFIG[cert.verificationStatus];
              const VerIcon = verCfg.icon;
              const days = cert.validUntil ? daysUntil(cert.validUntil) : null;
              return (
                <div
                  key={cert.id}
                  className="rounded-lg border border-slate-200 p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {CERTIFICATE_LABELS[cert.type]}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${cfg.cls}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${verCfg.cls}`}
                        title={verCfg.tooltip}
                      >
                        <VerIcon className="h-3 w-3 mr-1" />
                        {verCfg.label}
                      </Badge>
                      {cert.source === 'PORTAL' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Od dostawcy
                        </Badge>
                      )}
                      {cert.source === 'PIPELINE' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-violet-50 text-violet-700 border-violet-200"
                          title="Cert znaleziony przez AI podczas skautingu — wymaga Twojej akceptacji"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          AI Sourcing
                        </Badge>
                      )}
                      {cert.reviewStatus === 'PENDING' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-50 text-amber-700 border-amber-200"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Do weryfikacji
                        </Badge>
                      )}
                      {cert.reviewStatus === 'REJECTED' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-rose-50 text-rose-700 border-rose-200"
                        >
                          Odrzucony
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <div>
                        Kod: <span className="font-mono">{cert.code}</span>
                        {cert.certNumber && <span> · Nr: <span className="font-mono">{cert.certNumber}</span></span>}
                        {cert.issuer && <span> · Wystawca: {cert.issuer}</span>}
                      </div>
                      {cert.validUntil ? (
                        <div>
                          Ważny do: <strong>{cert.validUntil.slice(0, 10)}</strong>
                          {cert.status !== 'EXPIRED' && days !== null && (
                            <span className="ml-2">({days} dni)</span>
                          )}
                          {cert.status === 'EXPIRED' && days !== null && (
                            <span className="ml-2 text-rose-600">
                              (wygasł {Math.abs(days)} dni temu)
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="italic">Brak daty ważności — dodaj ręcznie, żeby włączyć alert wygaśnięcia</div>
                      )}
                      {cert.sourceUrl && (
                        <div>
                          <a
                            href={cert.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Zobacz źródło
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {cert.document && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => window.open(cert.document!.url, '_blank')}
                        title="Pobierz dokument"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {cert.reviewStatus === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleApprove(cert)}
                          disabled={approveMutation.isPending}
                          title="Zatwierdź"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleReject(cert)}
                          disabled={rejectMutation.isPending}
                          title="Odrzuć"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700"
                      onClick={() => handleDelete(cert)}
                      disabled={deleteMutation.isPending}
                      title="Usuń"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AddCertificateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={async (payload) => {
            try {
              await createMutation.mutateAsync(payload);
              toast.success('Certyfikat dodany');
              setDialogOpen(false);
            } catch (err: any) {
              toast.error(
                err?.response?.data?.message || 'Nie udało się dodać',
              );
            }
          }}
          isSubmitting={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}

interface AddCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    type: CertificateType;
    code: string;
    issuer?: string;
    certNumber?: string;
    issuedAt?: string;
    validUntil: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

function AddCertificateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddCertificateDialogProps) {
  const [type, setType] = useState<CertificateType>('ISO_9001');
  const [code, setCode] = useState('');
  const [issuer, setIssuer] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const reset = () => {
    setType('ISO_9001');
    setCode('');
    setIssuer('');
    setCertNumber('');
    setIssuedAt('');
    setValidUntil('');
  };

  const handleSubmit = async () => {
    if (!code.trim() || !validUntil) {
      toast.error('Wymagane: kod certyfikatu i data ważności');
      return;
    }
    await onSubmit({
      type,
      code: code.trim(),
      issuer: issuer.trim() || undefined,
      certNumber: certNumber.trim() || undefined,
      issuedAt: issuedAt || undefined,
      validUntil: new Date(validUntil).toISOString(),
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj certyfikat</DialogTitle>
          <DialogDescription>
            Zapisz certyfikat z datą ważności — Procurea wyśle email-alert 90
            dni przed wygaśnięciem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Typ *</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CertificateType)}
              className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CERTIFICATE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {CERTIFICATE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs">Kod / nr certyfikatu *</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="np. PL-ISO-9001-2024/0123"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Wystawca</Label>
              <Input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Bureau Veritas"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Nr rejestr.</Label>
              <Input
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                placeholder="opcjonalnie"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Wystawiono</Label>
              <Input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Ważny do *</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Dodaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
