import { useEffect, useState } from 'react';
import { getIntegrationStatus, getCostSummary, getSourcingCostPerRequest } from '../services/api';
import {
    Plug,
    Activity,
    DollarSign,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Loader2,
    Zap,
    Database,
    Mail,
    Flame,
    Search,
    Cpu,
    TrendingDown,
    Users,
} from 'lucide-react';

interface ServiceStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: string;
    message: string;
    apiKey?: string;
    provider?: string;
    details?: Record<string, any>;
}

interface IntegrationData {
    overall: string;
    timestamp: string;
    version: string;
    environment: string;
    services: Record<string, ServiceStatus>;
    recentErrors: number;
}

interface CostData {
    totalCalls: number;
    successRate: number;
    totalCost: number;
    byService: { service: string; calls: number; errors: number; avgResponseTime: number; totalCost: number }[];
    dailyStats: { date: string; calls: number; cost: number }[];
    perUserCosts: { userId: string; email: string; name: string; totalCost: number; totalCalls: number }[];
}

interface PerRequestCost {
    period: string;
    totalCost: number;
    totalCalls: number;
    avgCostPerApiCall: number;
    estimatedCostPerSourcingRequest: number;
    byService: Record<string, { calls: number; cost: number; avgCost: number }>;
}

const statusConfig = {
    healthy: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-muted', label: 'Zdrowy' },
    degraded: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-muted', label: 'Degradacja' },
    unhealthy: { icon: XCircle, color: 'text-danger', bg: 'bg-danger-muted', label: 'Niesprawny' },
};

const serviceIcons: Record<string, any> = {
    gemini: Cpu,
    serpApi: Search,
    database: Database,
    email: Mail,
    firebase: Flame,
};

function StatusBadge({ status }: { status: 'healthy' | 'degraded' | 'unhealthy' }) {
    const cfg = statusConfig[status] || statusConfig.healthy;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
            <Icon size={12} />
            {cfg.label}
        </span>
    );
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<IntegrationData | null>(null);
    const [costs, setCosts] = useState<CostData | null>(null);
    const [perRequest, setPerRequest] = useState<PerRequestCost | null>(null);
    const [loading, setLoading] = useState(true);
    const [deepChecking, setDeepChecking] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [intRes, costRes, prRes] = await Promise.all([
                getIntegrationStatus(),
                getCostSummary(),
                getSourcingCostPerRequest(),
            ]);
            setIntegrations(intRes.data);
            setCosts(costRes.data);
            setPerRequest(prRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const runDeepCheck = async () => {
        setDeepChecking(true);
        try {
            const { data } = await getIntegrationStatus(true);
            setIntegrations(data);
        } catch (err) {
            console.error(err);
        } finally {
            setDeepChecking(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">API & Integracje</h1>
                    <p className="text-sm text-text-muted mt-1">Status usług, klucze API i monitorowanie kosztów</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={runDeepCheck}
                        disabled={deepChecking}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-muted text-accent hover:bg-accent/20 transition-all text-sm font-medium disabled:opacity-50"
                    >
                        {deepChecking ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        Deep Check
                    </button>
                    <button
                        onClick={fetchData}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all text-sm"
                    >
                        <RefreshCw size={14} />
                        Odśwież
                    </button>
                </div>
            </div>

            {/* Overall Status */}
            {integrations && (
                <div className="bg-surface-raised border border-border rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${statusConfig[integrations.overall as keyof typeof statusConfig]?.bg || 'bg-success-muted'
                            }`}>
                            <Activity size={24} className={statusConfig[integrations.overall as keyof typeof statusConfig]?.color || 'text-success'} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Status systemu</h2>
                            <p className="text-xs text-text-muted mt-0.5">
                                v{integrations.version} · {integrations.environment} · {new Date(integrations.timestamp).toLocaleString('pl-PL')}
                            </p>
                        </div>
                    </div>
                    <StatusBadge status={integrations.overall as any} />
                </div>
            )}

            {/* Services Grid */}
            {integrations && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(integrations.services).map(([name, svc]) => {
                        const Icon = serviceIcons[name] || Plug;
                        return (
                            <div key={name} className="bg-surface-raised border border-border rounded-xl p-5 hover:border-border-hover transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${statusConfig[svc.status]?.bg || 'bg-success-muted'}`}>
                                            <Icon size={20} className={statusConfig[svc.status]?.color || 'text-success'} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-text-primary capitalize">{name}</h3>
                                            {(svc as any).provider && (
                                                <span className="text-xs text-text-muted font-mono">{(svc as any).provider}</span>
                                            )}
                                        </div>
                                    </div>
                                    <StatusBadge status={svc.status} />
                                </div>
                                <p className="text-xs text-text-secondary mb-2">{svc.message}</p>
                                {svc.apiKey && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="text-text-muted">Klucz:</span>
                                        <code className="px-2 py-0.5 rounded bg-surface text-text-secondary font-mono">{svc.apiKey}</code>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Cost Summary */}
            {perRequest && (
                <div className="bg-surface-raised border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-accent" />
                        Koszty – podsumowanie (30 dni)
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-surface border border-border rounded-xl p-4">
                            <div className="text-xs text-text-muted uppercase tracking-wider">Koszt łączny</div>
                            <div className="text-2xl font-bold text-text-primary mt-1 font-mono">${perRequest.totalCost.toFixed(4)}</div>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-4">
                            <div className="text-xs text-text-muted uppercase tracking-wider">Wywołania API</div>
                            <div className="text-2xl font-bold text-text-primary mt-1">{perRequest.totalCalls.toLocaleString()}</div>
                        </div>
                        <div className="bg-surface border border-border rounded-xl p-4">
                            <div className="text-xs text-text-muted uppercase tracking-wider">Avg / API call</div>
                            <div className="text-2xl font-bold text-accent mt-1 font-mono">${perRequest.avgCostPerApiCall.toFixed(6)}</div>
                        </div>
                        <div className="bg-surface border border-accent/30 rounded-xl p-4 animate-pulse-glow">
                            <div className="text-xs text-accent uppercase tracking-wider font-medium">Est. / Sourcing Request</div>
                            <div className="text-2xl font-bold text-accent mt-1 font-mono">${perRequest.estimatedCostPerSourcingRequest.toFixed(4)}</div>
                            <div className="text-[10px] text-text-muted mt-1">~10 Serper + ~15 Gemini calls</div>
                        </div>
                    </div>

                    {/* Per-service breakdown */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">Serwis</th>
                                    <th className="text-right py-2 px-3 text-xs font-medium text-text-muted uppercase">Wywołania</th>
                                    <th className="text-right py-2 px-3 text-xs font-medium text-text-muted uppercase">Koszt łączny</th>
                                    <th className="text-right py-2 px-3 text-xs font-medium text-text-muted uppercase">Avg / call</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(perRequest.byService).map(([svc, data]) => (
                                    <tr key={svc} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                                        <td className="py-2 px-3 font-mono text-accent">{svc}</td>
                                        <td className="py-2 px-3 text-right text-text-primary">{data.calls}</td>
                                        <td className="py-2 px-3 text-right font-mono text-text-primary">${data.cost.toFixed(4)}</td>
                                        <td className="py-2 px-3 text-right font-mono text-text-secondary">${data.avgCost.toFixed(6)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Per-user costs */}
            {costs?.perUserCosts && costs.perUserCosts.length > 0 && (
                <div className="bg-surface-raised border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Users size={20} className="text-warning" />
                        Koszty per użytkownik (top 20)
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 px-3 text-xs font-medium text-text-muted uppercase">Użytkownik</th>
                                    <th className="text-right py-2 px-3 text-xs font-medium text-text-muted uppercase">Wywołania</th>
                                    <th className="text-right py-2 px-3 text-xs font-medium text-text-muted uppercase">Koszt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costs.perUserCosts.map((u, i) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                                        <td className="py-2 px-3">
                                            <div className="text-text-primary">{u.name || '—'}</div>
                                            <div className="text-xs text-text-muted">{u.email}</div>
                                        </td>
                                        <td className="py-2 px-3 text-right text-text-primary">{u.totalCalls}</td>
                                        <td className="py-2 px-3 text-right font-mono text-text-primary">${u.totalCost.toFixed(4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
