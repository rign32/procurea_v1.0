import { useState } from 'react';
import { CalendarClock, Plus, Trash2, Play, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useScheduledReports,
  useCreateScheduledReport,
  useDeleteScheduledReport,
  useRunScheduledReport,
} from '@/hooks/useScheduledReports';
import type { ReportFrequency, ReportType } from '@/hooks/useScheduledReports';
import { isEN } from '@/i18n';

const FREQUENCY_LABELS: Record<ReportFrequency, string> = {
  daily: isEN ? 'Daily' : 'Dzienny',
  weekly: isEN ? 'Weekly' : 'Tygodniowy',
  monthly: isEN ? 'Monthly' : 'Miesieczny',
};

const FREQUENCY_BADGE_CLASS: Record<ReportFrequency, string> = {
  daily: 'border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:bg-blue-950',
  weekly: 'border-purple-300 text-purple-700 bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:bg-purple-950',
  monthly: 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-950',
};

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  campaign_summary: isEN ? 'Campaign Summary' : 'Podsumowanie kampanii',
  analytics: isEN ? 'Analytics' : 'Analityka',
  supplier_performance: isEN ? 'Supplier Performance' : 'Wydajnosc dostawcow',
};

const REPORT_TYPES: ReportType[] = ['campaign_summary', 'analytics', 'supplier_performance'];
const FREQUENCIES: ReportFrequency[] = ['daily', 'weekly', 'monthly'];

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ScheduledReportsTab() {
  const { data: reports, isLoading } = useScheduledReports();
  const createMutation = useCreateScheduledReport();
  const deleteMutation = useDeleteScheduledReport();
  const runMutation = useRunScheduledReport();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formFrequency, setFormFrequency] = useState<ReportFrequency>('weekly');
  const [formReportType, setFormReportType] = useState<ReportType>('campaign_summary');
  const [formRecipientInput, setFormRecipientInput] = useState('');
  const [formRecipients, setFormRecipients] = useState<string[]>([]);

  const resetForm = () => {
    setFormName('');
    setFormFrequency('weekly');
    setFormReportType('campaign_summary');
    setFormRecipientInput('');
    setFormRecipients([]);
  };

  const addRecipient = () => {
    const email = formRecipientInput.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(isEN ? 'Invalid email address' : 'Nieprawidlowy adres email');
      return;
    }
    if (formRecipients.includes(email)) {
      toast.error(isEN ? 'Email already added' : 'Email juz dodany');
      return;
    }
    setFormRecipients((prev) => [...prev, email]);
    setFormRecipientInput('');
  };

  const removeRecipient = (email: string) => {
    setFormRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRecipient();
    }
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error(isEN ? 'Name is required' : 'Nazwa jest wymagana');
      return;
    }
    if (formRecipients.length === 0) {
      toast.error(isEN ? 'At least one recipient is required' : 'Wymagany co najmniej jeden odbiorca');
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formName.trim(),
        frequency: formFrequency,
        reportType: formReportType,
        recipients: formRecipients,
      });
      toast.success(isEN ? 'Report scheduled' : 'Raport zaplanowany');
      setCreateOpen(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Failed to create report' : 'Blad tworzenia raportu')
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: isEN ? 'Delete Scheduled Report' : 'Usun zaplanowany raport',
      description: isEN
        ? `Are you sure you want to delete "${name}"?`
        : `Czy na pewno chcesz usunac "${name}"?`,
      variant: 'destructive',
      confirmLabel: isEN ? 'Delete' : 'Usun',
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(isEN ? 'Report deleted' : 'Raport usuniety');
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Failed to delete' : 'Blad usuwania')
      );
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      await runMutation.mutateAsync(id);
      toast.success(isEN ? 'Report is being generated' : 'Raport jest generowany');
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Failed to run report' : 'Blad uruchamiania raportu')
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const reportsList = reports ?? [];

  return (
    <div className="space-y-6">
      {ConfirmDialogElement}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEN ? 'Scheduled Reports' : 'Zaplanowane raporty'}</CardTitle>
              <CardDescription className="mt-1">
                {isEN
                  ? 'Automatically generate and send reports on a schedule.'
                  : 'Automatycznie generuj i wysylaj raporty wedlug harmonogramu.'}
              </CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {isEN ? 'New Report' : 'Nowy raport'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {reportsList.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title={isEN ? 'No scheduled reports' : 'Brak zaplanowanych raportow'}
              description={
                isEN
                  ? 'Create your first scheduled report to receive automated updates.'
                  : 'Utworz pierwszy zaplanowany raport, aby otrzymywac automatyczne aktualizacje.'
              }
              className="min-h-[250px]"
              action={
                <Button onClick={() => setCreateOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {isEN ? 'New Report' : 'Nowy raport'}
                </Button>
              }
            />
          ) : (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {reportsList.map((report) => (
                <motion.div
                  key={report.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CalendarClock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-sm">{report.name}</span>
                      <Badge
                        variant="outline"
                        className={FREQUENCY_BADGE_CLASS[report.frequency]}
                      >
                        {FREQUENCY_LABELS[report.frequency]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>{REPORT_TYPE_LABELS[report.reportType]}</span>
                      <span>
                        {isEN ? 'Recipients' : 'Odbiorcy'}:{' '}
                        {report.recipients.join(', ')}
                      </span>
                      <span>
                        {isEN ? 'Last run' : 'Ostatnie uruchomienie'}:{' '}
                        {formatDate(report.lastRunAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRunNow(report.id)}
                      disabled={runMutation.isPending}
                      title={isEN ? 'Run now' : 'Uruchom teraz'}
                    >
                      {runMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(report.id, report.name)}
                      disabled={deleteMutation.isPending}
                      title={isEN ? 'Delete' : 'Usun'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Create Scheduled Report Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEN ? 'New Scheduled Report' : 'Nowy zaplanowany raport'}
            </DialogTitle>
            <DialogDescription>
              {isEN
                ? 'Configure automated report delivery.'
                : 'Skonfiguruj automatyczne dostarczanie raportow.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isEN ? 'Report Name' : 'Nazwa raportu'}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={
                  isEN ? 'e.g. Weekly campaign update' : 'np. Tygodniowa aktualizacja kampanii'
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isEN ? 'Frequency' : 'Czestotliwosc'}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as ReportFrequency)}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {FREQUENCY_LABELS[f]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{isEN ? 'Report Type' : 'Typ raportu'}</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={formReportType}
                  onChange={(e) => setFormReportType(e.target.value as ReportType)}
                >
                  {REPORT_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {REPORT_TYPE_LABELS[rt]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isEN ? 'Recipients' : 'Odbiorcy'}</Label>
              <div className="flex gap-2">
                <Input
                  value={formRecipientInput}
                  onChange={(e) => setFormRecipientInput(e.target.value)}
                  onKeyDown={handleRecipientKeyDown}
                  placeholder={isEN ? 'Enter email and press Enter' : 'Wpisz email i nacisnij Enter'}
                  type="email"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addRecipient}
                  disabled={!formRecipientInput.trim()}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formRecipients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formRecipients.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                resetForm();
              }}
            >
              {isEN ? 'Cancel' : 'Anuluj'}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                createMutation.isPending ||
                !formName.trim() ||
                formRecipients.length === 0
              }
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEN ? 'Creating...' : 'Tworzenie...'}
                </>
              ) : (
                <>{isEN ? 'Create Report' : 'Utworz raport'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ScheduledReportsTab;
