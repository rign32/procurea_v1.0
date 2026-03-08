import { useState, useEffect } from 'react';
import { sequencesService } from '@/services/sequences.service';
import { PL } from '@/i18n/pl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe2 } from 'lucide-react';

interface EmailPreviewProps {
  stepId?: string;
  subject?: string;
  bodySnippet?: string;
  organizationId?: string;
  sampleData?: {
    productName?: string;
    senderName?: string;
    senderCompany?: string;
    supplierName?: string;
    quantity?: string;
    currency?: string;
  };
  className?: string;
  showTranslationNotice?: boolean;
}

export function EmailPreview({
  stepId,
  subject,
  bodySnippet,
  organizationId,
  sampleData,
  className = '',
  showTranslationNotice = true,
}: EmailPreviewProps) {
  const [html, setHtml] = useState<string>('');
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await sequencesService.previewEmail({
          stepId,
          subject,
          bodySnippet,
          organizationId,
          sampleData,
        });

        if (!cancelled) {
          setHtml(result.html);
          setPreviewSubject(result.subject);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || PL.errors.generic);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Debounce: wait 500ms after last change before loading
    const timer = setTimeout(loadPreview, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [stepId, subject, bodySnippet, organizationId, JSON.stringify(sampleData)]);

  if (loading) {
    return (
      <div className={`rounded-lg border bg-muted/30 p-8 text-center ${className}`}>
        <div className="animate-pulse text-muted-foreground">
          {PL.common.loading}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-center text-sm text-destructive ${className}`}>
        {error}
      </div>
    );
  }

  if (!html) return null;

  return (
    <div className={`rounded-lg border bg-white ${className}`}>
      {previewSubject && (
        <div className="border-b px-4 py-2 text-sm">
          <span className="text-muted-foreground">Temat: </span>
          <span className="font-medium">{previewSubject}</span>
        </div>
      )}
      <div
        className="p-4 bg-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {showTranslationNotice && (
        <div className="p-4 border-t bg-muted/20">
          <Alert className="bg-primary/5 text-primary border-primary/20">
            <Globe2 className="h-4 w-4" />
            <AlertDescription>
              System automatycznie przetłumaczy tę wiadomość na język preferowany przez dostawcę przed wysyłką.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

export default EmailPreview;
