import { useState } from 'react';
import { Loader2, FileSignature, Plus, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useContracts, useCreateContract, useUpdateContractStatus } from '@/hooks/useContracts';
import { useRfqs } from '@/hooks/useRfqs';
import { isEN } from '@/i18n';
import type { ContractStatus, Contract } from '@/services/contracts.service';

type TabKey = 'all' | 'DRAFT' | 'UNDER_REVIEW' | 'SIGNED' | 'ACTIVE';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: isEN ? 'All' : 'Wszystkie' },
  { key: 'DRAFT', label: isEN ? 'Draft' : 'Szkic' },
  { key: 'UNDER_REVIEW', label: isEN ? 'Under Review' : 'W recenzji' },
  { key: 'SIGNED', label: isEN ? 'Signed' : 'Podpisany' },
  { key: 'ACTIVE', label: isEN ? 'Active' : 'Aktywny' },
];

const STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: isEN ? 'Draft' : 'Szkic',
  UNDER_REVIEW: isEN ? 'Under Review' : 'W recenzji',
  SIGNED: isEN ? 'Signed' : 'Podpisany',
  ACTIVE: isEN ? 'Active' : 'Aktywny',
  EXPIRED: isEN ? 'Expired' : 'Wygasly',
  TERMINATED: isEN ? 'Terminated' : 'Rozwiazany',
};

const STATUS_BADGE_VARIANT: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  UNDER_REVIEW: 'outline',
  SIGNED: 'default',
  ACTIVE: 'default',
  EXPIRED: 'secondary',
  TERMINATED: 'destructive',
};

const STATUS_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['SIGNED', 'DRAFT'],
  SIGNED: ['ACTIVE'],
  ACTIVE: ['EXPIRED', 'TERMINATED'],
  EXPIRED: [],
  TERMINATED: [],
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString(isEN ? 'en-US' : 'pl-PL');
}

export function ContractsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const statusFilter = activeTab === 'all' ? undefined : activeTab as ContractStatus;
  const { data: contracts, isLoading, error } = useContracts(statusFilter);
  const createMutation = useCreateContract();
  const statusMutation = useUpdateContractStatus();

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formOfferId, setFormOfferId] = useState('');
  const [formTerms, setFormTerms] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  // Get accepted offers for the create dialog
  const { data: closedRfqs } = useRfqs('CLOSED');
  const acceptedOffers = (closedRfqs?.rfqs ?? [])
    .flatMap(rfq => (rfq.offers ?? []).filter(o => o.status === 'ACCEPTED').map(o => ({
      ...o,
      productName: rfq.productName,
    })));

  const resetForm = () => {
    setFormTitle('');
    setFormOfferId('');
    setFormTerms('');
    setFormStartDate('');
    setFormEndDate('');
  };

  const handleCreate = async () => {
    if (!formOfferId || !formTitle.trim()) {
      toast.error(isEN ? 'Title and offer are required' : 'Tytul i oferta sa wymagane');
      return;
    }

    try {
      await createMutation.mutateAsync({
        offerId: formOfferId,
        title: formTitle.trim(),
        terms: formTerms.trim() || undefined,
        startDate: formStartDate || undefined,
        endDate: formEndDate || undefined,
      });
      toast.success(isEN ? 'Contract created' : 'Kontrakt utworzony');
      setCreateOpen(false);
      resetForm();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Failed to create contract' : 'Blad tworzenia kontraktu'));
    }
  };

  const handleStatusChange = async (contract: Contract, newStatus: ContractStatus) => {
    try {
      await statusMutation.mutateAsync({ id: contract.id, status: newStatus });
      toast.success(isEN ? `Status updated to ${STATUS_LABELS[newStatus]}` : `Status zmieniony na ${STATUS_LABELS[newStatus]}`);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Failed to update status' : 'Blad zmiany statusu'));
    }
  };

  if (!contracts && isLoading) {
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

  const contractsList = contracts ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isEN ? 'Contracts' : 'Kontrakty'}</h1>
          <p className="text-muted-foreground mt-1">
            {isEN ? 'Manage your contracts with suppliers' : 'Zarzadzaj kontraktami z dostawcami'}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {isEN ? 'New Contract' : 'Nowy kontrakt'}
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
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      {contractsList.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title={isEN ? 'No contracts yet' : 'Brak kontraktow'}
          description={isEN ? 'Create your first contract from an accepted offer.' : 'Utworz pierwszy kontrakt z zaakceptowanej oferty.'}
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {isEN ? 'New Contract' : 'Nowy kontrakt'}
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
          {contractsList.map((contract) => {
            const isExpanded = expandedId === contract.id;
            const transitions = STATUS_TRANSITIONS[contract.status] ?? [];

            return (
              <motion.div
                key={contract.id}
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
              >
                <Card className="border-border/40 hover:shadow-soft-xl transition-shadow">
                  <CardHeader
                    className="pb-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : contract.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{contract.title}</CardTitle>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <Badge variant={STATUS_BADGE_VARIANT[contract.status]}>
                        {STATUS_LABELS[contract.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">{isEN ? 'Supplier' : 'Dostawca'}</p>
                        <p className="font-medium">{contract.offer?.supplier?.name ?? '\u2014'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{isEN ? 'Product' : 'Produkt'}</p>
                        <p className="font-medium">{contract.offer?.rfqRequest?.productName ?? '\u2014'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{isEN ? 'Start Date' : 'Data rozpoczecia'}</p>
                        <p className="font-medium">{formatDate(contract.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{isEN ? 'End Date' : 'Data zakonczenia'}</p>
                        <p className="font-medium">{formatDate(contract.endDate)}</p>
                      </div>
                    </div>

                    {/* Expanded detail section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        {contract.terms && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{isEN ? 'Terms' : 'Warunki'}</p>
                            <p className="text-sm whitespace-pre-wrap bg-muted/30 rounded-md p-3">{contract.terms}</p>
                          </div>
                        )}

                        {contract.offer && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{isEN ? 'Offer Details' : 'Szczegoly oferty'}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm bg-muted/30 rounded-md p-3">
                              <div>
                                <p className="text-muted-foreground">{isEN ? 'Price' : 'Cena'}</p>
                                <p className="font-medium">
                                  {contract.offer.price != null
                                    ? new Intl.NumberFormat(isEN ? 'en-US' : 'pl-PL', {
                                        style: 'currency',
                                        currency: contract.offer.currency || 'PLN',
                                      }).format(contract.offer.price)
                                    : '\u2014'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{isEN ? 'Supplier Country' : 'Kraj dostawcy'}</p>
                                <p className="font-medium">{contract.offer.supplier?.country ?? '\u2014'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">{isEN ? 'Created' : 'Utworzono'}</p>
                                <p className="font-medium">{formatDate(contract.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status Transition Buttons */}
                        {transitions.length > 0 && (
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-sm text-muted-foreground mr-2">
                              {isEN ? 'Change status:' : 'Zmien status:'}
                            </span>
                            {transitions.map((nextStatus) => (
                              <Button
                                key={nextStatus}
                                variant={nextStatus === 'TERMINATED' ? 'destructive' : 'outline'}
                                size="sm"
                                disabled={statusMutation.isPending}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(contract, nextStatus);
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

      {/* Create Contract Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEN ? 'New Contract' : 'Nowy kontrakt'}</DialogTitle>
            <DialogDescription>
              {isEN ? 'Create a contract from an accepted offer.' : 'Utworz kontrakt z zaakceptowanej oferty.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isEN ? 'Contract Title' : 'Tytul kontraktu'}</Label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={isEN ? 'e.g. Supply Agreement 2026' : 'np. Umowa dostawy 2026'}
              />
            </div>

            <div className="space-y-2">
              <Label>{isEN ? 'Accepted Offer' : 'Zaakceptowana oferta'}</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formOfferId}
                onChange={(e) => setFormOfferId(e.target.value)}
              >
                <option value="">{isEN ? 'Select an offer...' : 'Wybierz oferte...'}</option>
                {acceptedOffers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.productName} — {offer.supplier?.name ?? (isEN ? 'Unknown supplier' : 'Nieznany dostawca')}
                    {offer.price != null ? ` (${offer.price} ${offer.currency || 'PLN'})` : ''}
                  </option>
                ))}
              </select>
              {acceptedOffers.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  {isEN ? 'No accepted offers found. Accept an offer in RFQs first.' : 'Brak zaakceptowanych ofert. Najpierw zaakceptuj oferte w zapytaniach.'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{isEN ? 'Terms' : 'Warunki'} <span className="text-muted-foreground text-xs">({isEN ? 'optional' : 'opcjonalne'})</span></Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formTerms}
                onChange={(e) => setFormTerms(e.target.value)}
                placeholder={isEN ? 'Contract terms and conditions...' : 'Warunki kontraktu...'}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isEN ? 'Start Date' : 'Data rozpoczecia'} <span className="text-muted-foreground text-xs">({isEN ? 'optional' : 'opcjonalne'})</span></Label>
                <Input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{isEN ? 'End Date' : 'Data zakonczenia'} <span className="text-muted-foreground text-xs">({isEN ? 'optional' : 'opcjonalne'})</span></Label>
                <Input
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetForm(); }}>
              {isEN ? 'Cancel' : 'Anuluj'}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !formTitle.trim() || !formOfferId}
            >
              {createMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEN ? 'Creating...' : 'Tworzenie...'}</>
                : <>{isEN ? 'Create Contract' : 'Utworz kontrakt'}</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContractsPage;
