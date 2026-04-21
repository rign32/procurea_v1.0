import { useState } from 'react';
import { Loader2, ShoppingCart, Plus, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { usePurchaseOrders, useGeneratePO, useUpdatePOStatus, useSyncToErp } from '@/hooks/usePurchaseOrders';
import { useContracts } from '@/hooks/useContracts';
import { isEN } from '@/i18n';
import type { POStatus, PurchaseOrder } from '@/services/purchase-orders.service';

type TabKey = 'all' | 'DRAFT' | 'SUBMITTED' | 'CONFIRMED' | 'DELIVERED' | 'INVOICED';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: isEN ? 'All' : 'Wszystkie' },
  { key: 'DRAFT', label: isEN ? 'Draft' : 'Szkic' },
  { key: 'SUBMITTED', label: isEN ? 'Submitted' : 'Wysłane' },
  { key: 'CONFIRMED', label: isEN ? 'Confirmed' : 'Potwierdzone' },
  { key: 'DELIVERED', label: isEN ? 'Delivered' : 'Dostarczone' },
  { key: 'INVOICED', label: isEN ? 'Invoiced' : 'Zafakturowane' },
];

const STATUS_LABELS: Record<POStatus, string> = {
  DRAFT: isEN ? 'Draft' : 'Szkic',
  SUBMITTED: isEN ? 'Submitted' : 'Wysłane',
  CONFIRMED: isEN ? 'Confirmed' : 'Potwierdzone',
  DELIVERED: isEN ? 'Delivered' : 'Dostarczone',
  INVOICED: isEN ? 'Invoiced' : 'Zafakturowane',
  CANCELLED: isEN ? 'Cancelled' : 'Anulowane',
};

const STATUS_BADGE_VARIANT: Record<POStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  SUBMITTED: 'outline',
  CONFIRMED: 'default',
  DELIVERED: 'default',
  INVOICED: 'default',
  CANCELLED: 'destructive',
};

const STATUS_TRANSITIONS: Record<POStatus, POStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['INVOICED'],
  INVOICED: [],
  CANCELLED: [],
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString(isEN ? 'en-US' : 'pl-PL');
}

function formatCurrency(amount?: number, currency?: string): string {
  if (amount == null) return '\u2014';
  return new Intl.NumberFormat(isEN ? 'en-US' : 'pl-PL', {
    style: 'currency',
    currency: currency || 'EUR',
  }).format(amount);
}

export function PurchaseOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusFilter = activeTab === 'all' ? undefined : activeTab as POStatus;
  const { data: purchaseOrders, isLoading, error } = usePurchaseOrders(statusFilter);
  const generateMutation = useGeneratePO();
  const statusMutation = useUpdatePOStatus();
  const _syncMutation = useSyncToErp();

  // Get signed/active contracts for PO generation
  const { data: signedContracts } = useContracts('SIGNED' as any);
  const { data: activeContracts } = useContracts('ACTIVE' as any);
  const eligibleContracts = [...(signedContracts ?? []), ...(activeContracts ?? [])];

  const handleGenerate = async () => {
    if (!selectedContractId) {
      toast.error(isEN ? 'Select a contract' : 'Wybierz kontrakt');
      return;
    }

    try {
      await generateMutation.mutateAsync(selectedContractId);
      toast.success(isEN ? 'Purchase order generated' : 'Zamówienie wygenerowane');
      setGenerateOpen(false);
      setSelectedContractId('');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Failed to generate PO' : 'Błąd generowania zamówienia'));
    }
  };

  const handleStatusChange = async (po: PurchaseOrder, newStatus: POStatus) => {
    try {
      await statusMutation.mutateAsync({ id: po.id, status: newStatus });
      toast.success(isEN ? `Status updated to ${STATUS_LABELS[newStatus]}` : `Status zmieniony na ${STATUS_LABELS[newStatus]}`);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Failed to update status' : 'Błąd zmiany statusu'));
    }
  };

  if (!purchaseOrders && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-ink" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{isEN ? 'An error occurred. Please try again.' : 'Wystąpił błąd. Spróbuj ponownie.'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {isEN ? 'Refresh' : 'Odśwież'}
          </Button>
        </div>
      </div>
    );
  }

  const poList = purchaseOrders ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold">{isEN ? 'Purchase Orders' : 'Zamówienia'}</h1>
          <p className="text-muted-ink mt-1">
            {isEN ? 'Manage purchase orders generated from contracts' : 'Zarządzaj zamówieniami wygenerowanymi z kontraktów'}
          </p>
        </div>
        <Button onClick={() => setGenerateOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {isEN ? 'Generate PO' : 'Generuj zamówienie'}
        </Button>
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
                : 'text-muted-ink hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PO List */}
      {poList.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={isEN ? 'No purchase orders yet' : 'Brak zamówień'}
          description={isEN ? 'Generate your first PO from a signed contract.' : 'Wygeneruj pierwsze zamówienie z podpisanego kontraktu.'}
          action={
            <Button onClick={() => setGenerateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {isEN ? 'Generate PO' : 'Generuj zamówienie'}
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {poList.map((po) => {
            const isExpanded = expandedId === po.id;
            const transitions = STATUS_TRANSITIONS[po.status] ?? [];

            return (
              <motion.div
                key={po.id}
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
              >
                <Card className="border-border/40 hover:shadow-soft-xl transition-shadow">
                  <CardHeader
                    className="pb-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : po.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{po.poNumber || po.id.slice(0, 8)}</CardTitle>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-ink" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-ink" />
                        )}
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[po.status]}>
                        {STATUS_LABELS[po.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-ink">{isEN ? 'Supplier' : 'Dostawca'}</p>
                        <p className="font-medium">{po.offer?.supplier?.name ?? '\u2014'}</p>
                      </div>
                      <div>
                        <p className="text-muted-ink">{isEN ? 'Contract' : 'Kontrakt'}</p>
                        <p className="font-medium">{po.contract?.title ?? '\u2014'}</p>
                      </div>
                      <div>
                        <p className="text-muted-ink">{isEN ? 'Total' : 'Kwota'}</p>
                        <p className="font-medium">{formatCurrency(po.totalAmount, po.currency)}</p>
                      </div>
                      <div>
                        <p className="text-muted-ink">{isEN ? 'Delivery' : 'Dostawa'}</p>
                        <p className="font-medium">{formatDate(po.deliveryDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-ink">{isEN ? 'Created' : 'Utworzono'}</p>
                        <p className="font-medium">{formatDate(po.createdAt)}</p>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        {/* Line items */}
                        {po.lines && po.lines.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-ink mb-2">{isEN ? 'Line Items' : 'Pozycje'}</p>
                            <div className="rounded-md border overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left px-3 py-2 font-medium">{isEN ? 'Description' : 'Opis'}</th>
                                    <th className="text-right px-3 py-2 font-medium">{isEN ? 'Qty' : 'Ilość'}</th>
                                    <th className="text-right px-3 py-2 font-medium">{isEN ? 'Unit Price' : 'Cena jedn.'}</th>
                                    <th className="text-right px-3 py-2 font-medium">{isEN ? 'Total' : 'Suma'}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {po.lines.map((line) => (
                                    <tr key={line.id} className="border-t">
                                      <td className="px-3 py-2">{line.description}</td>
                                      <td className="px-3 py-2 text-right">{line.quantity} {line.unit}</td>
                                      <td className="px-3 py-2 text-right">{formatCurrency(line.unitPrice, po.currency)}</td>
                                      <td className="px-3 py-2 text-right font-medium">{formatCurrency(line.totalPrice, po.currency)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Status Transition Buttons */}
                        {transitions.length > 0 && (
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-sm text-muted-ink mr-2">
                              {isEN ? 'Change status:' : 'Zmień status:'}
                            </span>
                            {transitions.map((nextStatus) => (
                              <Button
                                key={nextStatus}
                                variant={nextStatus === 'CANCELLED' ? 'destructive' : 'outline'}
                                size="sm"
                                disabled={statusMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(po, nextStatus);
                                }}
                              >
                                <ArrowRight className="mr-1 h-3 w-3" />
                                {STATUS_LABELS[nextStatus]}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Generate PO Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEN ? 'Generate Purchase Order' : 'Generuj zamówienie'}</DialogTitle>
            <DialogDescription>
              {isEN
                ? 'Select a signed or active contract to generate a PO.'
                : 'Wybierz podpisany lub aktywny kontrakt, aby wygenerować zamówienie.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{isEN ? 'Contract' : 'Kontrakt'}</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
              >
                <option value="">{isEN ? 'Select a contract...' : 'Wybierz kontrakt...'}</option>
                {eligibleContracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} — {c.offer?.supplier?.name ?? (isEN ? 'Unknown' : 'Nieznany')} ({c.status})
                  </option>
                ))}
              </select>
              {eligibleContracts.length === 0 && (
                <p className="text-xs text-muted-ink">
                  {isEN
                    ? 'No signed or active contracts found. Sign a contract first.'
                    : 'Brak podpisanych lub aktywnych kontraktów. Najpierw podpisz kontrakt.'}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setGenerateOpen(false); setSelectedContractId(''); }}>
              {isEN ? 'Cancel' : 'Anuluj'}
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending || !selectedContractId}
            >
              {generateMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEN ? 'Generating...' : 'Generowanie...'}</>
                : <>{isEN ? 'Generate PO' : 'Generuj zamówienie'}</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PurchaseOrdersPage;
