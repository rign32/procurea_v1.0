import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getIndustryAnalytics, IndustryAnalyticsRow } from '../services/api';
import { Users, Building2, Activity, DollarSign, TrendingUp, AlertTriangle, Briefcase } from 'lucide-react';

const INDUSTRY_LABELS: Record<string, string> = {
    manufacturing: 'Produkcja',
    events: 'Eventy',
    construction: 'Budownictwo',
    horeca: 'HoReCa',
    healthcare: 'Healthcare',
    retail: 'Retail',
    logistics: 'Logistyka',
    mro: 'MRO',
    other: 'Inne',
};

const MODE_LABELS: Record<string, string> = {
    product: 'Produkt',
    service: 'Usługa',
    mixed: 'Mieszane',
};

interface DashboardData {
    users: { total: number; active: number; blocked: number };
    organizations: { total: number };
    apiUsage: {
        totalCalls: number;
        successRate: number;
        totalCost: number;
        byService: { service: string; calls: number; errors: number; avgResponseTime: number; totalCost: number }[];
        dailyStats: { date: string; calls: number; cost: number }[];
    };
}

function StatCard({ icon: Icon, label, value, sub, color, onClick }: {
    icon: any; label: string; value: string | number; sub?: string; color: string; onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-surface-raised border border-border rounded-xl p-5 hover:border-border-hover transition-all duration-200 group ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
                    {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [industries, setIndustries] = useState<IndustryAnalyticsRow[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            getDashboard().then(r => setData(r.data)).catch(console.error),
            getIndustryAnalytics().then(r => setIndustries(r.data)).catch(console.error),
        ]).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return <p className="text-text-muted">Brak danych</p>;

    const totalErrors = data.apiUsage.byService.reduce((sum, s) => sum + s.errors, 0);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-sm text-text-muted mt-1">Przegląd systemu Procurea</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Użytkownicy"
                    value={data.users.total}
                    sub={`${data.users.active} aktywnych · ${data.users.blocked} zablokowanych`}
                    color="bg-accent-muted text-accent"
                    onClick={() => navigate('/users')}
                />
                <StatCard
                    icon={Building2}
                    label="Organizacje"
                    value={data.organizations.total}
                    color="bg-success-muted text-success"
                />
                <StatCard
                    icon={Activity}
                    label="API Calls (30d)"
                    value={data.apiUsage.totalCalls.toLocaleString()}
                    sub={`${data.apiUsage.successRate.toFixed(1)}% success rate`}
                    color="bg-warning-muted text-warning"
                    onClick={() => navigate('/integrations')}
                />
                <StatCard
                    icon={DollarSign}
                    label="Koszty (30d)"
                    value={`$${data.apiUsage.totalCost.toFixed(4)}`}
                    color="bg-danger-muted text-danger"
                    onClick={() => navigate('/integrations')}
                />
            </div>

            {/* Service Breakdown */}
            <div className="bg-surface-raised border border-border rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-accent" />
                    Wykorzystanie API per serwis
                </h2>
                {data.apiUsage.byService.length === 0 ? (
                    <p className="text-sm text-text-muted">Brak danych o wykorzystaniu API</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-text-muted">Serwis</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Wywołania</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Błędy</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Avg Response</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Koszt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.apiUsage.byService.map((svc) => (
                                    <tr key={svc.service} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-accent">{svc.service}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-text-primary">{svc.calls.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            {svc.errors > 0 ? (
                                                <button
                                                    onClick={() => navigate('/errors?tab=sourcing')}
                                                    className="text-danger hover:text-red-300 underline underline-offset-2 decoration-danger/40 hover:decoration-danger transition-colors font-medium"
                                                >
                                                    {svc.errors} →
                                                </button>
                                            ) : (
                                                <span className="text-success">0</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-text-secondary">{svc.avgResponseTime}ms</td>
                                        <td className="py-3 px-4 text-right font-mono text-text-primary">${svc.totalCost.toFixed(4)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {totalErrors > 0 && (
                    <div className="mt-4 pt-3 border-t border-border">
                        <button
                            onClick={() => navigate('/errors?tab=sourcing')}
                            className="inline-flex items-center gap-2 text-sm text-danger hover:text-red-300 transition-colors"
                        >
                            <AlertTriangle size={14} />
                            <span>{totalErrors} błędów – kliknij, by zobaczyć szczegóły</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Daily Stats */}
            {/* Industry breakdown — Sprint 2 B1: kampanie per branża */}
            {industries.length > 0 && (
                <div className="bg-surface-raised border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-1 flex items-center gap-2">
                        <Briefcase size={20} className="text-accent" />
                        Kampanie per branża
                    </h2>
                    <p className="text-xs text-text-muted mb-4">
                        Grupowanie po wybranej branży i trybie sourcingu. Success rate = ukończone / wszystkie.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-text-muted">Branża</th>
                                    <th className="text-left py-3 px-4 font-medium text-text-muted">Tryb</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Kampanii</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Ukończone</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Zaakceptowane</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Avg dostawców</th>
                                    <th className="text-right py-3 px-4 font-medium text-text-muted">Avg czas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {industries.map((row, idx) => (
                                    <tr key={`${row.industry}-${row.sourcingMode}-${idx}`} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                                        <td className="py-3 px-4 font-medium text-text-primary">
                                            {INDUSTRY_LABELS[row.industry] || row.industry}
                                        </td>
                                        <td className="py-3 px-4 text-text-muted">
                                            {MODE_LABELS[row.sourcingMode] || row.sourcingMode}
                                        </td>
                                        <td className="py-3 px-4 text-right text-text-primary">{row.campaignCount}</td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="font-mono text-success">{row.completedCount}</span>
                                            <span className="text-xs text-text-muted ml-2">
                                                ({(row.completionRate * 100).toFixed(0)}%)
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <span className="font-mono text-accent">{row.acceptedCount}</span>
                                            <span className="text-xs text-text-muted ml-2">
                                                ({(row.acceptanceRate * 100).toFixed(0)}%)
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-text-primary">
                                            {row.avgSuppliersQualified.toFixed(1)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-text-muted">
                                            {row.avgDurationMinutes !== null ? `${row.avgDurationMinutes} min` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {data.apiUsage.dailyStats.length > 0 && (
                <div className="bg-surface-raised border border-border rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                        <Activity size={20} className="text-accent" />
                        Aktywność dzienna (ostatnie wpisy)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                        {data.apiUsage.dailyStats.slice(-7).map((day) => (
                            <div key={day.date} className="bg-surface border border-border rounded-lg p-3 text-center">
                                <div className="text-xs text-text-muted">{day.date.slice(5)}</div>
                                <div className="text-lg font-bold text-text-primary mt-1">{day.calls}</div>
                                <div className="text-xs font-mono text-accent">${day.cost.toFixed(4)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
