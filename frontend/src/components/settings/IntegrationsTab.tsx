import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plug,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    RefreshCw,
    Trash2,
    ExternalLink,
    Check,
    X,
    Users2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    integrationsService,
    type IntegrationConnection,
    type SupplierMatch,
} from '@/services/integrations.service';

function StatusBadge({ status }: { status: string }) {
    const cfg: Record<string, { cls: string; icon: typeof CheckCircle2; label: string }> = {
        LINKED: {
            cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: CheckCircle2,
            label: 'Połączone',
        },
        PENDING: {
            cls: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: Loader2,
            label: 'W trakcie',
        },
        ERROR: {
            cls: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: AlertTriangle,
            label: 'Błąd',
        },
        DISCONNECTED: {
            cls: 'bg-slate-50 text-slate-600 border-slate-200',
            icon: AlertTriangle,
            label: 'Rozłączone',
        },
    };
    const c = cfg[status] ?? {
        cls: 'bg-slate-50 text-slate-600 border-slate-200',
        icon: AlertTriangle,
        label: status,
    };
    const Icon = c.icon;
    return (
        <Badge variant="outline" className={`text-[10px] ${c.cls}`}>
            <Icon className="h-3 w-3 mr-1" />
            {c.label}
        </Badge>
    );
}

function formatRelative(iso: string | null): string {
    if (!iso) return 'nigdy';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60_000);
    if (mins < 1) return 'przed chwilą';
    if (mins < 60) return `${mins} min temu`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} godz. temu`;
    const days = Math.round(hours / 24);
    return `${days} dni temu`;
}

export function IntegrationsTab() {
    const qc = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['integrations', 'connections'],
        queryFn: () => integrationsService.listConnections(),
        staleTime: 30_000,
    });

    const syncMutation = useMutation({
        mutationFn: (connId: string) => integrationsService.sync(connId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['integrations', 'connections'] });
            toast.success('Synchronizacja zakończona');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Synchronizacja nie powiodła się');
        },
    });

    const disconnectMutation = useMutation({
        mutationFn: (connId: string) => integrationsService.disconnect(connId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['integrations', 'connections'] });
            toast.success('Integracja rozłączona');
        },
        onError: () => toast.error('Nie udało się rozłączyć'),
    });

    const connections = data ?? [];

    return (
        <div className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plug className="h-4 w-4" />
                    Integracje ERP / księgowość
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Podłącz system księgowy (NetSuite, QuickBooks, Xero, Sage) przez
                    Merge.dev — Procurea wysyła zamówienia bezpośrednio do Twojego ERP
                    po zatwierdzeniu oferty.
                </p>
                <p className="text-xs text-muted-foreground">
                    Budujesz własną integrację?{' '}
                    <a
                        href="/api/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                        API reference <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    {' · '}
                    <a
                        href="https://github.com/rign32/procurea_v1.0/blob/main/docs/INTEGRATIONS.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                        Integrations guide <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                </p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                        Nie udało się załadować integracji.
                    </div>
                ) : connections.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        <p className="mb-3">Brak połączonych systemów.</p>
                        <a
                            href="https://app.merge.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                            Otwórz Merge.dev <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {connections.map((conn: IntegrationConnection) => (
                            <li
                                key={conn.id}
                                className="rounded-lg border p-3 flex items-start justify-between gap-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm">
                                            {conn.platformName ?? conn.platformSlug ?? conn.provider}
                                        </span>
                                        <StatusBadge status={conn.status} />
                                        {conn.integrationCategory && (
                                            <Badge variant="outline" className="text-[10px]">
                                                {conn.integrationCategory}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        <div>
                                            Ostatnia synchronizacja:{' '}
                                            <strong>{formatRelative(conn.lastSyncedAt)}</strong>
                                            {conn.lastSyncSupplierCount != null && (
                                                <> · {conn.lastSyncSupplierCount} dostawców</>
                                            )}
                                        </div>
                                        {conn.statusMessage && (
                                            <div className="text-rose-700">{conn.statusMessage}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        onClick={() => syncMutation.mutate(conn.id)}
                                        disabled={syncMutation.isPending}
                                        title="Synchronizuj teraz"
                                    >
                                        {syncMutation.isPending &&
                                        syncMutation.variables === conn.id ? (
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-3.5 w-3.5" />
                                        )}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    `Rozłączyć ${conn.platformName ?? conn.provider}? Procurea przestanie wysyłać PO do tego systemu.`,
                                                )
                                            ) {
                                                disconnectMutation.mutate(conn.id);
                                            }
                                        }}
                                        disabled={disconnectMutation.isPending}
                                        title="Rozłącz"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>

        <MatchesCard enabled={connections.length > 0} />
        </div>
    );
}

function MatchesCard({ enabled }: { enabled: boolean }) {
    const qc = useQueryClient();

    const { data: matches = [], isLoading } = useQuery({
        queryKey: ['integrations', 'matches'],
        queryFn: () => integrationsService.listMatches(),
        enabled,
        staleTime: 60_000,
    });

    const confirmMutation = useMutation({
        mutationFn: ({
            matchId,
            status,
            reason,
        }: {
            matchId: string;
            status: 'confirmed' | 'rejected';
            reason?: string;
        }) => integrationsService.confirmMatch(matchId, status, reason),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['integrations', 'matches'] });
            qc.invalidateQueries({ queryKey: ['erp-match'] });
        },
        onError: () => toast.error('Nie udało się zaktualizować dopasowania'),
    });

    if (!enabled) return null;

    const suggested = matches.filter((m) => m.status === 'suggested');
    const confirmed = matches.filter((m) => m.status === 'confirmed');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Users2 className="h-4 w-4" />
                    Dopasowania dostawców do ERP
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Procurea porównuje swoich dostawców z rekordami vendor w Twoim ERP
                    po NIP-ie, domenie i nazwie. Potwierdź lub odrzuć sugerowane pary —
                    inaczej PO nie zsynchronizuje się z właściwym vendorem.
                </p>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : matches.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-3">
                        Brak sugerowanych dopasowań. Uruchom synchronizację powyżej.
                    </p>
                ) : (
                    <>
                        <div className="text-xs text-muted-foreground mb-2 flex gap-3">
                            <span>
                                <CheckCircle2 className="h-3 w-3 inline mr-1 text-emerald-600" />
                                {confirmed.length} potwierdzonych
                            </span>
                            <span>
                                <AlertTriangle className="h-3 w-3 inline mr-1 text-amber-600" />
                                {suggested.length} do przejrzenia
                            </span>
                        </div>
                        <ul className="space-y-2">
                            {suggested.slice(0, 20).map((m: SupplierMatch) => (
                                <li
                                    key={m.id}
                                    className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 flex items-start justify-between gap-3 text-sm"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Link
                                                to={`/suppliers/${m.supplier?.id ?? m.supplierId}`}
                                                className="font-semibold hover:underline truncate"
                                            >
                                                {m.supplier?.name ?? '(Procurea supplier)'}
                                            </Link>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="font-medium">
                                                {m.externalSupplier.name}
                                            </span>
                                            <Badge variant="outline" className="text-[10px]">
                                                {m.externalSupplier.connection.platformName ??
                                                    m.externalSupplier.connection.platformSlug}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] bg-blue-50 text-blue-700 border-blue-200"
                                            >
                                                {Math.round(m.confidence * 100)}% · {m.matchType}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5 space-x-2">
                                            {m.externalSupplier.taxNumber && (
                                                <span>NIP: {m.externalSupplier.taxNumber}</span>
                                            )}
                                            {m.externalSupplier.website && (
                                                <span>· {m.externalSupplier.website}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                            onClick={() =>
                                                confirmMutation.mutate({
                                                    matchId: m.id,
                                                    status: 'confirmed',
                                                })
                                            }
                                            disabled={confirmMutation.isPending}
                                            title="Potwierdź match"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                            onClick={() => {
                                                const reason =
                                                    prompt('Powód odrzucenia (opcjonalnie):') ??
                                                    undefined;
                                                confirmMutation.mutate({
                                                    matchId: m.id,
                                                    status: 'rejected',
                                                    reason: reason || undefined,
                                                });
                                            }}
                                            disabled={confirmMutation.isPending}
                                            title="Odrzuć match"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {suggested.length > 20 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Pokazano 20 z {suggested.length}. Odśwież listę po zatwierdzeniu kilku.
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default IntegrationsTab;
