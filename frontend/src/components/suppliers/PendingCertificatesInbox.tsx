import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, Check, X, Download, Loader2, Inbox, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    certificatesService,
    CERTIFICATE_LABELS,
    type CertificateType,
    type SupplierCertificate,
} from '@/services/certificates.service';

type PendingRow = SupplierCertificate & {
    supplier: { id: string; name: string | null; country: string | null };
};

export function PendingCertificatesInbox() {
    const qc = useQueryClient();
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const { data, isLoading } = useQuery({
        queryKey: ['certificates-pending-inbox'],
        queryFn: () => certificatesService.listPendingReviewInbox(),
        staleTime: 30_000,
    });

    const bulkMutation = useMutation({
        mutationFn: ({ ids, action, notes }: { ids: string[]; action: 'APPROVE' | 'REJECT'; notes?: string }) =>
            certificatesService.bulkReview(ids, action, notes),
        onSuccess: (r, variables) => {
            qc.invalidateQueries({ queryKey: ['certificates-pending-inbox'] });
            qc.invalidateQueries({ queryKey: ['supplier-certificates'] });
            qc.invalidateQueries({ queryKey: ['campaign-insights'] });
            setSelected(new Set());
            toast.success(
                variables.action === 'APPROVE'
                    ? `Zatwierdzono ${r.updated} certyfikatów`
                    : `Odrzucono ${r.updated} certyfikatów`,
            );
        },
        onError: () => toast.error('Nie udało się wykonać operacji grupowej'),
    });

    const approveMutation = useMutation({
        mutationFn: (row: PendingRow) =>
            certificatesService.approve(row.supplier.id, row.id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['certificates-pending-inbox'] });
            qc.invalidateQueries({ queryKey: ['supplier-certificates'] });
            qc.invalidateQueries({ queryKey: ['campaign-insights'] });
            toast.success('Certyfikat zatwierdzony');
        },
        onError: () => toast.error('Nie udało się zatwierdzić'),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ row, notes }: { row: PendingRow; notes?: string }) =>
            certificatesService.reject(row.supplier.id, row.id, notes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['certificates-pending-inbox'] });
            qc.invalidateQueries({ queryKey: ['supplier-certificates'] });
            qc.invalidateQueries({ queryKey: ['campaign-insights'] });
            toast.success('Certyfikat odrzucony');
        },
        onError: () => toast.error('Nie udało się odrzucić'),
    });

    const items = data?.items ?? [];
    const count = data?.count ?? 0;

    const allItemIds = useMemo(() => items.map((i) => i.id), [items]);
    const allSelected = allItemIds.length > 0 && selected.size === allItemIds.length;
    const toggleAll = () => {
        if (allSelected) setSelected(new Set());
        else setSelected(new Set(allItemIds));
    };
    const toggleOne = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Inbox className="h-4 w-4" />
                        Certyfikaty do weryfikacji
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (count === 0) {
        return null; // nothing to review → hide the widget entirely
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Inbox className="h-4 w-4" />
                        Certyfikaty do weryfikacji
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            {count}
                        </Badge>
                    </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                    Dostawcy przesłali certyfikaty przez portal i czekają na akceptację.
                </p>
            </CardHeader>
            <CardContent>
                {/* Bulk toolbar */}
                <div className="flex items-center gap-2 mb-2 pb-2 border-b text-sm">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            className="h-3.5 w-3.5 rounded border-gray-300"
                        />
                        <span className="text-xs text-muted-foreground">
                            {selected.size === 0
                                ? 'Zaznacz wszystkie'
                                : `Zaznaczone: ${selected.size}/${count}`}
                        </span>
                    </label>
                    {selected.size > 0 && (
                        <div className="ml-auto flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                onClick={() =>
                                    bulkMutation.mutate({
                                        ids: Array.from(selected),
                                        action: 'APPROVE',
                                    })
                                }
                                disabled={bulkMutation.isPending}
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Zatwierdź zaznaczone
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-rose-700 border-rose-200 hover:bg-rose-50"
                                onClick={() => {
                                    const notes = prompt('Powód odrzucenia (opcjonalnie):') ?? undefined;
                                    bulkMutation.mutate({
                                        ids: Array.from(selected),
                                        action: 'REJECT',
                                        notes: notes || undefined,
                                    });
                                }}
                                disabled={bulkMutation.isPending}
                            >
                                <X className="h-3 w-3 mr-1" />
                                Odrzuć zaznaczone
                            </Button>
                        </div>
                    )}
                </div>

                <ul className="space-y-2">
                    {items.map((row) => (
                        <li
                            key={row.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3"
                        >
                            <input
                                type="checkbox"
                                checked={selected.has(row.id)}
                                onChange={() => toggleOne(row.id)}
                                className="h-3.5 w-3.5 mt-1 rounded border-gray-300 shrink-0"
                                aria-label="Zaznacz do operacji grupowej"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link
                                        to={`/suppliers/${row.supplier.id}`}
                                        className="font-semibold text-sm hover:underline truncate"
                                    >
                                        {row.supplier.name ?? 'Nieznany dostawca'}
                                    </Link>
                                    {row.supplier.country && (
                                        <span className="text-xs text-muted-foreground">
                                            · {row.supplier.country}
                                        </span>
                                    )}
                                    <Badge
                                        variant="outline"
                                        className="text-[10px] bg-amber-100 text-amber-800 border-amber-200"
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        Do weryfikacji
                                    </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    <span className="font-medium">
                                        {CERTIFICATE_LABELS[row.type as CertificateType] ?? row.type}
                                    </span>
                                    {' · '}
                                    <span className="font-mono">{row.code}</span>
                                    {row.issuer && <> · {row.issuer}</>}
                                    {' · ważny do '}
                                    <strong>{row.validUntil.slice(0, 10)}</strong>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {row.document && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => window.open(row.document!.url, '_blank')}
                                        title="Pobierz PDF"
                                    >
                                        {row.document.mimeType?.includes('pdf') ? (
                                            <FileText className="h-3.5 w-3.5" />
                                        ) : (
                                            <Download className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                )}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    onClick={() => approveMutation.mutate(row)}
                                    disabled={approveMutation.isPending}
                                    title="Zatwierdź"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                    onClick={() => {
                                        const notes = prompt('Powód odrzucenia (opcjonalnie):') ?? undefined;
                                        rejectMutation.mutate({ row, notes: notes || undefined });
                                    }}
                                    disabled={rejectMutation.isPending}
                                    title="Odrzuć"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default PendingCertificatesInbox;
