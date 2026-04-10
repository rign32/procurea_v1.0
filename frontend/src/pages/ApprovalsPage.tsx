import { useState } from 'react';
import { Loader2, ClipboardCheck, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { useApprovals, useApproveApproval, useRejectApproval } from '@/hooks/useApprovals';
import { isEN } from '@/i18n';
import type { Approval, ApprovalStatus } from '@/services/approvals.service';

type TabKey = 'PENDING' | 'APPROVED' | 'REJECTED';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PENDING', label: isEN ? 'Pending' : 'Oczekujace' },
  { key: 'APPROVED', label: isEN ? 'Approved' : 'Zatwierdzone' },
  { key: 'REJECTED', label: isEN ? 'Rejected' : 'Odrzucone' },
];

const STATUS_BADGE_VARIANT: Record<ApprovalStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  APPROVED: 'default',
  REJECTED: 'destructive',
};

const STATUS_BADGE_CLASS: Record<ApprovalStatus, string> = {
  PENDING: 'border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:bg-amber-950',
  APPROVED: 'border-green-300 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-400 dark:bg-green-950',
  REJECTED: 'border-red-300 text-red-700 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-950',
};

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  PENDING: isEN ? 'Pending' : 'Oczekujace',
  APPROVED: isEN ? 'Approved' : 'Zatwierdzone',
  REJECTED: isEN ? 'Rejected' : 'Odrzucone',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('PENDING');
  const [actionDialog, setActionDialog] = useState<{
    type: 'approve' | 'reject';
    approval: Approval;
  } | null>(null);
  const [actionInput, setActionInput] = useState('');

  const { data: approvals, isLoading, error } = useApprovals(activeTab);
  const approveMutation = useApproveApproval();
  const rejectMutation = useRejectApproval();

  const handleAction = async () => {
    if (!actionDialog) return;

    try {
      if (actionDialog.type === 'approve') {
        await approveMutation.mutateAsync({
          id: actionDialog.approval.id,
          comments: actionInput.trim() || undefined,
        });
        toast.success(isEN ? 'Approval granted' : 'Zatwierdzono');
      } else {
        await rejectMutation.mutateAsync({
          id: actionDialog.approval.id,
          reason: actionInput.trim() || undefined,
        });
        toast.success(isEN ? 'Request rejected' : 'Odrzucono');
      }
      setActionDialog(null);
      setActionInput('');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Action failed' : 'Operacja nie powiodla sie'));
    }
  };

  if (!approvals && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{isEN ? 'An error occurred. Please try again.' : 'Wystapil blad. Sprobuj ponownie.'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {isEN ? 'Refresh' : 'Odswiez'}
          </Button>
        </div>
      </div>
    );
  }

  const approvalsList = approvals ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{isEN ? 'Approvals' : 'Zatwierdzenia'}</h1>
        <p className="text-muted-foreground mt-1">
          {isEN ? 'Review and manage approval requests' : 'Przegladaj i zarzadzaj wnioskami o zatwierdzenie'}
        </p>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approvals List */}
      {approvalsList.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={
            activeTab === 'PENDING'
              ? (isEN ? 'No pending approvals' : 'Brak oczekujacych zatwierdzen')
              : (isEN ? `No ${STATUS_LABELS[activeTab].toLowerCase()} items` : `Brak ${STATUS_LABELS[activeTab].toLowerCase()}`)
          }
          description={
            activeTab === 'PENDING'
              ? (isEN ? 'All caught up! No requests require your attention.' : 'Wszystko aktualne! Brak wnioskow wymagajacych Twojej uwagi.')
              : undefined
          }
        />
      ) : (
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {approvalsList.map((approval) => (
            <motion.div
              key={approval.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <Card className="border-border/40 hover:shadow-soft-xl transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">
                          {approval.requester?.name || approval.requester?.email || (isEN ? 'Unknown' : 'Nieznany')}
                        </span>
                        <Badge
                          variant={STATUS_BADGE_VARIANT[approval.status]}
                          className={STATUS_BADGE_CLASS[approval.status]}
                        >
                          {STATUS_LABELS[approval.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">{isEN ? 'Type: ' : 'Typ: '}</span>
                          <span className="font-medium">{approval.entityType}</span>
                        </div>
                        {approval.reason && (
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground">{isEN ? 'Reason: ' : 'Powod: '}</span>
                            <span>{approval.reason}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(approval.createdAt)}
                      </p>

                      {approval.comments && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-muted/30 rounded-md">
                          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">{approval.comments}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons — only for PENDING */}
                    {approval.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => { setActionDialog({ type: 'reject', approval }); setActionInput(''); }}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          {isEN ? 'Reject' : 'Odrzuc'}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => { setActionDialog({ type: 'approve', approval }); setActionInput(''); }}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          {isEN ? 'Approve' : 'Zatwierdz'}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Approve/Reject Confirmation Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(open) => { if (!open) { setActionDialog(null); setActionInput(''); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.type === 'approve'
                ? (isEN ? 'Confirm Approval' : 'Potwierdz zatwierdzenie')
                : (isEN ? 'Confirm Rejection' : 'Potwierdz odrzucenie')}
            </DialogTitle>
            <DialogDescription>
              {actionDialog?.type === 'approve'
                ? (isEN ? 'Are you sure you want to approve this request?' : 'Czy na pewno chcesz zatwierdzic ten wniosek?')
                : (isEN ? 'Are you sure you want to reject this request?' : 'Czy na pewno chcesz odrzucic ten wniosek?')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>
                {actionDialog?.type === 'approve'
                  ? (isEN ? 'Comments' : 'Komentarz')
                  : (isEN ? 'Rejection Reason' : 'Powod odrzucenia')}
                {' '}<span className="text-muted-foreground text-xs">({isEN ? 'optional' : 'opcjonalne'})</span>
              </Label>
              <Input
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder={
                  actionDialog?.type === 'approve'
                    ? (isEN ? 'Add a comment...' : 'Dodaj komentarz...')
                    : (isEN ? 'Provide a reason...' : 'Podaj powod...')
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setActionDialog(null); setActionInput(''); }}>
              {isEN ? 'Cancel' : 'Anuluj'}
            </Button>
            <Button
              variant={actionDialog?.type === 'reject' ? 'destructive' : 'default'}
              onClick={handleAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {(approveMutation.isPending || rejectMutation.isPending)
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : null}
              {actionDialog?.type === 'approve'
                ? (isEN ? 'Approve' : 'Zatwierdz')
                : (isEN ? 'Reject' : 'Odrzuc')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApprovalsPage;
