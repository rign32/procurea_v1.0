import { useEffect, useState } from 'react';
import { Layers, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import portalService from '@/services/portal.service';
import type { PortalOfferView } from '@/services/portal.service';

type RfqLineItem = NonNullable<PortalOfferView['rfq']['lineItems']>[number];

interface PortalLineItemsGridProps {
  accessToken: string;
  lineItems: RfqLineItem[];
  currency: string;
  locked: boolean; // true when offer already SUBMITTED/ACCEPTED
  onSaved?: () => void;
}

interface LineEdit {
  unitPrice: string;
  moq: string;
  leadTime: string;
  notes: string;
}

function blankEdit(quote: RfqLineItem['quote']): LineEdit {
  return {
    unitPrice: quote?.unitPrice != null ? String(quote.unitPrice) : '',
    moq: quote?.moq != null ? String(quote.moq) : '',
    leadTime: quote?.leadTime != null ? String(quote.leadTime) : '',
    notes: quote?.notes ?? '',
  };
}

export function PortalLineItemsGrid({
  accessToken,
  lineItems,
  currency,
  locked,
  onSaved,
}: PortalLineItemsGridProps) {
  const [edits, setEdits] = useState<Record<string, LineEdit>>(() =>
    Object.fromEntries(lineItems.map((l) => [l.id, blankEdit(l.quote)])),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEdits(
      Object.fromEntries(lineItems.map((l) => [l.id, blankEdit(l.quote)])),
    );
  }, [lineItems]);

  const update = (lineId: string, field: keyof LineEdit, value: string) => {
    setEdits((prev) => ({
      ...prev,
      [lineId]: { ...prev[lineId], [field]: value },
    }));
  };

  const handleSave = async () => {
    const items = lineItems
      .map((line) => {
        const e = edits[line.id];
        if (!e) return null;
        const unitPrice = e.unitPrice.trim() ? Number(e.unitPrice) : undefined;
        const moq = e.moq.trim() ? Number(e.moq) : undefined;
        const leadTime = e.leadTime.trim() ? Number(e.leadTime) : undefined;
        const notes = e.notes.trim() || undefined;
        // Skip entirely empty rows (nothing to save)
        if (
          unitPrice === undefined &&
          moq === undefined &&
          leadTime === undefined &&
          !notes
        ) {
          return null;
        }
        return {
          rfqLineItemId: line.id,
          unitPrice,
          currency,
          moq,
          leadTime,
          notes,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

    try {
      setSaving(true);
      await portalService.saveLineItems(accessToken, items);
      toast.success(`Zapisano ${items.length} pozycji`);
      onSaved?.();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Nie udało się zapisać pozycji');
    } finally {
      setSaving(false);
    }
  };

  const filledCount = lineItems.filter((l) => {
    const e = edits[l.id];
    return e && (e.unitPrice.trim() || e.moq.trim() || e.leadTime.trim());
  }).length;

  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers className="h-4 w-4" />
            Pozycje zapytania ({lineItems.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            Wypełnione: {filledCount}/{lineItems.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Wielopozycyjne RFQ (BOQ / multi-SKU). Podaj cenę jednostkową dla
          każdej pozycji, którą możesz zrealizować. Pozycje bez ceny zostaną
          potraktowane jako „nie oferujemy".
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-2 font-medium w-8">#</th>
                <th className="py-2 pr-2 font-medium">Pozycja</th>
                <th className="py-2 pr-2 font-medium text-right">Ilość</th>
                <th className="py-2 pr-2 font-medium w-24 text-right">
                  Cena/szt ({currency})
                </th>
                <th className="py-2 pr-2 font-medium w-20 text-right">MOQ</th>
                <th className="py-2 pr-2 font-medium w-24 text-right">Lead (tyg.)</th>
                <th className="py-2 pr-2 font-medium">Uwagi</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((line, idx) => {
                const e = edits[line.id];
                if (!e) return null;
                return (
                  <tr key={line.id} className="border-b last:border-0 align-top">
                    <td className="py-2 pr-2 text-muted-foreground tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 pr-2">
                      <div className="font-medium">{line.name}</div>
                      {line.sku && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {line.sku}
                        </div>
                      )}
                      {line.material && (
                        <div className="text-xs text-muted-foreground">
                          Materiał: {line.material}
                        </div>
                      )}
                      {line.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {line.description}
                        </div>
                      )}
                      {line.requiredCerts && line.requiredCerts.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {line.requiredCerts.map((c) => (
                            <span
                              key={c}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium"
                            >
                              {c.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-right tabular-nums">
                      {line.quantity} {line.unit}
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        value={e.unitPrice}
                        onChange={(ev) =>
                          update(line.id, 'unitPrice', ev.target.value)
                        }
                        disabled={locked}
                        step="0.01"
                        placeholder="0.00"
                        className="h-8 tabular-nums text-right"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        value={e.moq}
                        onChange={(ev) => update(line.id, 'moq', ev.target.value)}
                        disabled={locked}
                        placeholder="—"
                        className="h-8 tabular-nums text-right"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        type="number"
                        value={e.leadTime}
                        onChange={(ev) =>
                          update(line.id, 'leadTime', ev.target.value)
                        }
                        disabled={locked}
                        placeholder="—"
                        className="h-8 tabular-nums text-right"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <Input
                        value={e.notes}
                        onChange={(ev) =>
                          update(line.id, 'notes', ev.target.value)
                        }
                        disabled={locked}
                        placeholder="(opcjonalnie)"
                        className="h-8"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!locked && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              Zapisz pozycje
            </Button>
          </div>
        )}

        {locked && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
            Oferta została złożona — pozycje są zamrożone. Jeśli potrzebujesz
            wprowadzić zmiany, skontaktuj się z kupującym.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

