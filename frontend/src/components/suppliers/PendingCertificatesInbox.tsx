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

    const { data, isLoading } = useQuery({
        queryKey: ['certificates-pending-inbox'],
        queryFn: () => certificatesService.listPendingReviewInbox(),
        staleTime: 30_000,
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
                <ul className="space-y-2">
                    {items.map((row) => (
                        <li
                            key={row.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/40 p-3"
                        >
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
