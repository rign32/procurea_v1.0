import { useState } from 'react';
import { ShieldCheck, Upload, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import portalService from '@/services/portal.service';
import {
  CERTIFICATE_TYPES,
  CERTIFICATE_LABELS,
  type CertificateType,
} from '@/services/certificates.service';

interface UploadedCert {
  id: string;
  type: string;
  code: string;
  validUntil: string;
  originalName: string;
}

interface Labels {
  title: string;
  subtitle: string;
  type: string;
  code: string;
  codePlaceholder: string;
  issuer: string;
  issuerPlaceholder: string;
  validUntil: string;
  file: string;
  filePlaceholder: string;
  upload: string;
  uploading: string;
  uploaded: string;
  errorMissingFile: string;
  errorMissingFields: string;
  errorUpload: string;
  validPdf: string;
}

const LABELS_BY_LANG: Record<string, Labels> = {
  pl: {
    title: 'Certyfikaty (opcjonalnie)',
    subtitle: 'Dodaj certyfikaty ISO, CE, branżowe — pomaga zbudować zaufanie do oferty.',
    type: 'Typ certyfikatu',
    code: 'Kod / numer',
    codePlaceholder: 'np. 9001:2015',
    issuer: 'Wystawca (opcjonalnie)',
    issuerPlaceholder: 'np. TÜV, DNV, BSI',
    validUntil: 'Ważny do',
    file: 'Skan PDF',
    filePlaceholder: 'Wybierz plik (PDF, max 10MB)',
    upload: 'Prześlij certyfikat',
    uploading: 'Przesyłam…',
    uploaded: 'Przesłane certyfikaty',
    errorMissingFile: 'Wybierz plik PDF',
    errorMissingFields: 'Wypełnij typ, kod i datę ważności',
    errorUpload: 'Nie udało się przesłać certyfikatu',
    validPdf: 'Tylko pliki PDF',
  },
  en: {
    title: 'Certificates (optional)',
    subtitle: 'Add ISO, CE, industry certificates — helps build trust in your offer.',
    type: 'Certificate type',
    code: 'Code / number',
    codePlaceholder: 'e.g. 9001:2015',
    issuer: 'Issuer (optional)',
    issuerPlaceholder: 'e.g. TÜV, DNV, BSI',
    validUntil: 'Valid until',
    file: 'PDF scan',
    filePlaceholder: 'Choose file (PDF, max 10MB)',
    upload: 'Upload certificate',
    uploading: 'Uploading…',
    uploaded: 'Uploaded certificates',
    errorMissingFile: 'Choose a PDF file',
    errorMissingFields: 'Fill in type, code and validity date',
    errorUpload: 'Certificate upload failed',
    validPdf: 'PDF files only',
  },
  de: {
    title: 'Zertifikate (optional)',
    subtitle: 'Fügen Sie ISO-, CE- oder Branchenzertifikate hinzu — schafft Vertrauen.',
    type: 'Zertifikatstyp',
    code: 'Code / Nummer',
    codePlaceholder: 'z.B. 9001:2015',
    issuer: 'Aussteller (optional)',
    issuerPlaceholder: 'z.B. TÜV, DNV, BSI',
    validUntil: 'Gültig bis',
    file: 'PDF-Scan',
    filePlaceholder: 'Datei wählen (PDF, max 10MB)',
    upload: 'Zertifikat hochladen',
    uploading: 'Hochladen…',
    uploaded: 'Hochgeladene Zertifikate',
    errorMissingFile: 'PDF-Datei wählen',
    errorMissingFields: 'Typ, Code und Gültigkeit ausfüllen',
    errorUpload: 'Zertifikat-Upload fehlgeschlagen',
    validPdf: 'Nur PDF-Dateien',
  },
};

function getLabels(lang: string): Labels {
  return LABELS_BY_LANG[lang] ?? LABELS_BY_LANG.en;
}

interface Props {
  accessToken: string;
  lang: string;
  locked: boolean;
}

export function PortalCertificatesSection({ accessToken, lang, locked }: Props) {
  const t = getLabels(lang);
  const [type, setType] = useState<CertificateType>('ISO_9001');
  const [code, setCode] = useState('');
  const [issuer, setIssuer] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<UploadedCert[]>([]);

  const resetForm = () => {
    setCode('');
    setIssuer('');
    setValidUntil('');
    setFile(null);
    // reset file input visually
    const input = document.getElementById('cert-file-input') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error(t.errorMissingFile);
      return;
    }
    if (!code.trim() || !validUntil) {
      toast.error(t.errorMissingFields);
      return;
    }
    if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error(t.validPdf);
      return;
    }

    try {
      setUploading(true);
      const result = await portalService.uploadCertificate(accessToken, file, {
        type,
        code: code.trim(),
        validUntil,
        issuer: issuer.trim() || undefined,
      });
      setUploaded((prev) => [
        ...prev,
        {
          id: result.certificate.id,
          type: result.certificate.type,
          code: result.certificate.code,
          validUntil: result.certificate.validUntil,
          originalName: result.document.originalName,
        },
      ]);
      toast.success(`${CERTIFICATE_LABELS[type]} · ${code}`);
      resetForm();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t.errorUpload);
    } finally {
      setUploading(false);
    }
  };

  if (locked && uploaded.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!locked && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{t.type}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CertificateType)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {CERTIFICATE_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {CERTIFICATE_LABELS[tp]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.code}</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t.codePlaceholder}
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.issuer}</label>
              <Input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder={t.issuerPlaceholder}
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.validUntil}</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">{t.file}</label>
              <input
                id="cert-file-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.uploading}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t.upload}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {uploaded.length > 0 && (
          <div className="border-t pt-3">
            <div className="text-sm font-medium mb-2">{t.uploaded}</div>
            <ul className="space-y-2">
              {uploaded.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between text-sm rounded-md border px-3 py-2 bg-muted/30"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="font-medium">
                      {CERTIFICATE_LABELS[c.type as CertificateType] ?? c.type}
                    </span>
                    <span className="text-muted-foreground truncate">· {c.code}</span>
                  </div>
                  <span className="text-muted-foreground text-xs whitespace-nowrap ml-3">
                    {new Date(c.validUntil).toLocaleDateString(lang)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PortalCertificatesSection;
