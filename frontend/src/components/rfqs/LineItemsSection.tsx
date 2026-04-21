import { useState } from 'react';
import { Layers, Plus, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  useRfqLineItems,
  useAddLineItem,
  useDeleteLineItem,
} from '@/hooks/useRfqLineItems';
import type { LineItemInput } from '@/services/rfq-line-items.service';

interface LineItemsSectionProps {
  rfqId: string;
}

export function LineItemsSection({ rfqId }: LineItemsSectionProps) {
  const { data, isLoading } = useRfqLineItems(rfqId);
  const addMutation = useAddLineItem(rfqId);
  const deleteMutation = useDeleteLineItem(rfqId);
  const [dialogOpen, setDialogOpen] = useState(false);

  const items = data?.items ?? [];

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Usunąć pozycję "${name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Pozycja usunięta');
    } catch {
      toast.error('Nie udało się usunąć pozycji');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4" />
              Pozycje RFQ (BOQ)
              {items.length > 0 && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({items.length})
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Lista SKU / pozycji BOQ. Dostawcy otrzymują RFQ z tą listą jako załącznikiem.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Dodaj pozycję
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Brak pozycji — to RFQ jest jednopozycyjne (używa pola
            <code className="mx-1 text-xs">productName</code>). Dodaj pozycje, jeśli
            to tender wielopozycyjny (BOQ lub lista SKU).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium w-10">#</th>
                  <th className="py-2 pr-3 font-medium">SKU / Pozycja</th>
                  <th className="py-2 pr-3 font-medium text-right">Ilość</th>
                  <th className="py-2 pr-3 font-medium">Materiał</th>
                  <th className="py-2 pr-3 font-medium text-right">Target (opcj.)</th>
                  <th className="py-2 pr-3 font-medium">Certyfikaty</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="py-2 pr-3 text-muted-foreground tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{item.name}</div>
                      {item.sku && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {item.sku}
                        </div>
                      )}
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 pr-3 text-xs">{item.material || '—'}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-xs">
                      {item.targetPrice != null ? item.targetPrice.toFixed(2) : '—'}
                    </td>
                    <td className="py-2 pr-3">
                      {item.requiredCerts && item.requiredCerts.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {item.requiredCerts.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium"
                            >
                              {c.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-1 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700"
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AddLineItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={async (input) => {
            try {
              await addMutation.mutateAsync(input);
              toast.success('Pozycja dodana');
              setDialogOpen(false);
            } catch (err: any) {
              toast.error(err?.response?.data?.message || 'Nie udało się dodać');
            }
          }}
          isSubmitting={addMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}

interface AddLineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: LineItemInput) => Promise<void>;
  isSubmitting: boolean;
}

function AddLineItemDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AddLineItemDialogProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [certsInput, setCertsInput] = useState('');

  const reset = () => {
    setSku('');
    setName('');
    setDescription('');
    setMaterial('');
    setQuantity(1);
    setUnit('pcs');
    setTargetPrice('');
    setCertsInput('');
  };

  const handleSubmit = async () => {
    if (!name.trim() || quantity <= 0) {
      toast.error('Nazwa i ilość są wymagane');
      return;
    }
    const certs = certsInput
      .split(',')
      .map((c) => c.trim().toUpperCase().replace(/\s+/g, '_'))
      .filter(Boolean);
    await onSubmit({
      sku: sku.trim() || undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      material: material.trim() || undefined,
      quantity,
      unit: unit.trim() || 'pcs',
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      requiredCerts: certs.length > 0 ? certs : undefined,
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj pozycję RFQ</DialogTitle>
          <DialogDescription>
            Jedna pozycja = jedna linia BOQ albo jeden SKU. Dodaj kolejne jeśli
            RFQ jest wielopozycyjne.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <Label className="text-xs">SKU / nr BOQ</Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="1.2.1"
                className="mt-0.5 h-8"
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Nazwa pozycji *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Stal konstrukcyjna S355"
                className="mt-0.5 h-8"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Opis / specyfikacja</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="opcjonalny opis, klasa, parametry"
              className="mt-0.5 h-8"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Ilość *</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                step="0.01"
                className="mt-0.5 h-8 tabular-nums"
              />
            </div>
            <div>
              <Label className="text-xs">Jednostka</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="pcs, kg, m²"
                className="mt-0.5 h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Target (opcj.)</Label>
              <Input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                step="0.01"
                placeholder="0.00"
                className="mt-0.5 h-8 tabular-nums"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Materiał</Label>
            <Input
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="S355, AISI 304, HDPE…"
              className="mt-0.5 h-8"
            />
          </div>

          <div>
            <Label className="text-xs">Wymagane certyfikaty (po przecinku)</Label>
            <Input
              value={certsInput}
              onChange={(e) => setCertsInput(e.target.value)}
              placeholder="CE, ISO_9001, IATF_16949"
              className="mt-0.5 h-8"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Kody pasujące do naszych certyfikatów — np. CE, MDR, ISO_9001,
              IATF_16949, HACCP.
            </p>
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
