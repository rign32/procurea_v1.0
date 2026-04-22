import { useQuery } from '@tanstack/react-query';
import { Plug, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { integrationsService, type SupplierMatch } from '@/services/integrations.service';

interface Props {
    supplierId: string;
    variant?: 'inline' | 'card';
}

/**
 * Small indicator showing whether this Procurea supplier is already
 * present in the customer's ERP (via Merge.dev sync + matching). Used on
 * SupplierDetailPage and SupplierCard. Auto-hides when:
 *   - customer has no ERP connection (endpoint returns empty)
 *   - supplier has no suggested/confirmed match
 */
export function ErpMatchBadge({ supplierId, variant = 'inline' }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ['erp-match', supplierId],
        queryFn: () => integrationsService.matchesForSupplier(supplierId),
        staleTime: 5 * 60_000,
    });

    if (isLoading) {
        if (variant === 'inline') return null;
        return (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
            </span>
        );
    }

    const matches = data ?? [];
    if (matches.length === 0) return null;

    // Pick the most relevant: confirmed > suggested (highest confidence) > rejected
    const ranked = [...matches].sort((a, b) => {
        const order = { confirmed: 0, suggested: 1, rejected: 2 } as Record<string, number>;
        const ra = order[a.status] ?? 3;
        const rb = order[b.status] ?? 3;
        if (ra !== rb) return ra - rb;
        return b.confidence - a.confidence;
    });
    const m: SupplierMatch = ranked[0];

    const ext = m.externalSupplier;
    const platform = ext?.connection?.platformName || ext?.connection?.platformSlug || 'ERP';
    const pct = Math.round(m.confidence * 100);

    const cfg =
        m.status === 'confirmed'
            ? {
                  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  icon: CheckCircle2,
                  label: `W ERP: ${ext.name}`,
              }
            : m.status === 'rejected'
              ? {
                    cls: 'bg-slate-50 text-slate-500 border-slate-200 line-through',
                    icon: AlertTriangle,
                    label: `Odrzucono match z ERP`,
                }
              : {
                    cls: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: Plug,
                    label: `Prawdopodobnie w ERP: ${ext.name} (${pct}%)`,
                };
    const Icon = cfg.icon;

    const title = [
        `Match type: ${m.matchType}`,
        `Confidence: ${pct}%`,
        ext.taxNumber ? `NIP: ${ext.taxNumber}` : null,
        ext.website ? `Web: ${ext.website}` : null,
        `Platforma: ${platform}`,
        `Status: ${m.status}`,
    ]
        .filter(Boolean)
        .join('\n');

    return (
        <Badge
            variant="outline"
            className={`text-[10px] ${cfg.cls} cursor-help`}
            title={title}
        >
            <Icon className="h-3 w-3 mr-1" />
            {cfg.label}
        </Badge>
    );
}

export default ErpMatchBadge;
