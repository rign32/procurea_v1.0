import { useMemo, useState } from 'react';
import { TableProperties, Loader2, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueries } from '@tanstack/react-query';
import { offerLineItemsService, type RfqLineItem, type OfferLineItem } from '@/services/rfq-line-items.service';

interface LineByLineComparisonProps {
  rfqId: string;
  rfqLineItems: RfqLineItem[];
  offers: Array<{
    id: string;
    supplier?: { name?: string | null } | null;
    currency?: string | null;
  }>;
}

/**
 * Grid of (RFQ line) × (offer) showing per-line supplier quotes so the buyer
 * can compare offers line-by-line and award per position.
 *
 * Best cell per row (lowest unit price among non-null) is highlighted.
 */
export function LineByLineComparison({
  rfqId,
  rfqLineItems,
  offers,
}: LineByLineComparisonProps) {
  const [hideEmpty, setHideEmpty] = useState(true);

  const offerLineQueries = useQueries({
    queries: offers.map((o) => ({
      queryKey: ['offer-line-items', o.id],
      queryFn: () => offerLineItemsService.list(o.id),
      staleTime: 30_000,
    })),
  });

  const loading = offerLineQueries.some((q) => q.isLoading);

  // Map: offerId -> (rfqLineItemId -> OfferLineItem)
  const byOffer = useMemo(() => {
    const map = new Map<string, Map<string, OfferLineItem>>();
    offers.forEach((offer, idx) => {
      const res = offerLineQueries[idx].data;
      const inner = new Map<string, OfferLineItem>();
      if (res) {
        for (const row of res.lines) {
          if (row.offerLine) inner.set(row.rfqLine.id, row.offerLine);
        }
      }
      map.set(offer.id, inner);
    });
    return map;
  }, [offers, offerLineQueries]);

  const rowBestOfferId = useMemo(() => {
    const out = new Map<string, string>();
    for (const line of rfqLineItems) {
      let best: { offerId: string; price: number } | null = null;
      for (const offer of offers) {
        const ol = byOffer.get(offer.id)?.get(line.id);
        if (ol?.unitPrice != null && ol.unitPrice > 0) {
          if (!best || ol.unitPrice < best.price) {
            best = { offerId: offer.id, price: ol.unitPrice };
          }
        }
      }
      if (best) out.set(line.id, best.offerId);
    }
    return out;
  }, [rfqLineItems, offers, byOffer]);

  const visibleLines = useMemo(() => {
    if (!hideEmpty) return rfqLineItems;
    return rfqLineItems.filter((line) =>
      offers.some((o) => {
        const ol = byOffer.get(o.id)?.get(line.id);
        return ol != null;
      }),
    );
  }, [hideEmpty, rfqLineItems, offers, byOffer]);

  if (rfqLineItems.length === 0) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <TableProperties className="h-4 w-4" />
              Porównanie per pozycja
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Tabela linia × oferta. Najniższa cena w każdej linii wyróżniona
              na zielono. Pozwala wybrać zwycięzcę per pozycja (split-award).
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={hideEmpty}
              onChange={(e) => setHideEmpty(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Ukryj linie bez żadnej oferty
          </label>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : visibleLines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Żaden dostawca nie wypełnił pozycji per-line. Poproś o kwotowanie
            poprzez portal (<code className="text-xs">/offers/&lt;token&gt;</code>).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-rfq-id={rfqId}>
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium sticky left-0 bg-background w-64">
                    Pozycja
                  </th>
                  {offers.map((o) => (
                    <th key={o.id} className="py-2 px-2 font-medium text-right min-w-[130px]">
                      <div className="font-semibold text-xs text-foreground">
                        {o.supplier?.name || '—'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleLines.map((line, idx) => {
                  const bestOfferId = rowBestOfferId.get(line.id);
                  return (
                    <tr key={line.id} className="border-b last:border-0 align-top hover:bg-slate-50/60">
                      <td className="py-2 pr-3 sticky left-0 bg-background">
                        <div className="font-medium text-sm">
                          <span className="text-muted-foreground tabular-nums mr-1">
                            {idx + 1}.
                          </span>
                          {line.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground flex gap-2 flex-wrap">
                          {line.sku && <span className="font-mono">{line.sku}</span>}
                          <span>
                            {line.quantity} {line.unit}
                          </span>
                          {line.material && <span>· {line.material}</span>}
                        </div>
                      </td>
                      {offers.map((o) => {
                        const ol = byOffer.get(o.id)?.get(line.id);
                        const isBest = bestOfferId === o.id;
                        return (
                          <td
                            key={o.id}
                            className={`py-2 px-2 text-right ${
                              isBest
                                ? 'bg-emerald-50'
                                : ol
                                  ? ''
                                  : 'text-muted-foreground italic'
                            }`}
                          >
                            {ol ? (
                              <div className="text-xs">
                                <div className={`font-semibold tabular-nums text-sm ${isBest ? 'text-emerald-700' : ''}`}>
                                  {ol.unitPrice != null
                                    ? `${ol.unitPrice.toFixed(2)} ${ol.currency || ''}`
                                    : '—'}
                                  {isBest && (
                                    <TrendingDown className="inline h-3 w-3 ml-1" />
                                  )}
                                </div>
                                <div className="text-muted-foreground text-[10px] tabular-nums">
                                  {ol.moq != null && `MOQ ${ol.moq}`}
                                  {ol.moq != null && ol.leadTime != null && ' · '}
                                  {ol.leadTime != null && `${ol.leadTime} tyg`}
                                </div>
                                {ol.notes && (
                                  <div className="text-muted-foreground text-[10px] italic mt-0.5 line-clamp-2">
                                    {ol.notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
