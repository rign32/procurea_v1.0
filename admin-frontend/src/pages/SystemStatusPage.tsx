import { useEffect, useState, useCallback } from 'react';
import { getMonitoringStatus, getMonitoringHistory } from '../services/api';
import {
    Activity,
    RefreshCw,
    Loader2,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Minus,
} from 'lucide-react';

interface ServiceCheckResult {
    serviceId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTimeMs: number;
    message: string;
}

interface SmokeTestResult {
    timestamp: string;
    overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, ServiceCheckResult>;
    durationMs: number;
}

interface MonitoringIncident {
    id: string;
    serviceId: string;
    status: string;
    startedAt: string;
    resolvedAt: string | null;
    durationMs: number | null;
    severity: string;
    title: string;
    message: string | null;
}

interface UptimeInfo {
    uptimePercent: number;
    avgResponseTimeMs: number;
}

interface StatusData {
    lastCheck: string | null;
    result: SmokeTestResult | null;
    openIncidents: MonitoringIncident[];
}

interface HistoryData {
    events: Array<{ id: string; createdAt: string; severity: string; metadata: SmokeTestResult }>;
    incidents: MonitoringIncident[];
    uptimeByService: Record<string, UptimeInfo>;
}

const SERVICE_LABELS: Record<string, string> = {
    database: 'Database',
    gemini: 'Gemini API',
    serper: 'Serper.dev',
    resend: 'Resend Email',
    app_pl: 'App PL',
    app_io: 'App EN',
};

const SERVICE_ORDER = ['database', 'gemini', 'serper', 'resend', 'app_pl', 'app_io'];

function StatusDot({ status }: { status: string }) {
    const color =
        status === 'healthy' ? 'bg-success' :
        status === 'degraded' ? 'bg-warning' :
        'bg-danger';
    return <span className={`inline-block w-3 h-3 rounded-full ${color}`} />;
}

function StatusBadge({ status }: { status: string }) {
    const styles =
        status === 'healthy' ? 'bg-success/10 text-success border-success/20' :
        status === 'degraded' ? 'bg-warning/10 text-warning border-warning/20' :
        'bg-danger/10 text-danger border-danger/20';
    const label =
        status === 'healthy' ? 'All Systems Operational' :
        status === 'degraded' ? 'Degraded Performance' :
        'System Issues Detected';
    const Icon = status === 'healthy' ? CheckCircle2 : status === 'degraded' ? AlertTriangle : XCircle;

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${styles}`}>
            <Icon size={18} />
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    if (hours < 24) return `${hours}h ${remaining}min`;
    return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export default function SystemStatusPage() {
    const [statusData, setStatusData] = useState<StatusData | null>(null);
    const [historyData, setHistoryData] = useState<HistoryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [statusRes, historyRes] = await Promise.all([
                getMonitoringStatus(),
                getMonitoringHistory(24),
            ]);
            setStatusData(statusRes.data);
            setHistoryData(historyRes.data);
        } catch (err) {
            console.error('Failed to fetch monitoring data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-accent" size={32} />
            </div>
        );
    }

    const result = statusData?.result;
    const services = result?.services || {};
    const uptime = historyData?.uptimeByService || {};
    const openIncidents = statusData?.openIncidents || [];
    const recentEvents = historyData?.events?.slice(0, 30) || [];
    const allIncidents = historyData?.incidents || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
                        <Activity size={24} className="text-accent" />
                        System Status
                    </h1>
                    <p className="text-sm text-text-muted mt-1">
                        {statusData?.lastCheck
                            ? `Last check: ${formatRelativeTime(statusData.lastCheck)}`
                            : 'No data yet — waiting for first smoke test'}
                    </p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-surface-raised border border-border hover:border-border-hover transition-all"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Overall Status */}
            {result && <StatusBadge status={result.overallStatus} />}

            {/* Service Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICE_ORDER.map((serviceId) => {
                    const check = services[serviceId];
                    const serviceUptime = uptime[serviceId];
                    return (
                        <div
                            key={serviceId}
                            className="bg-surface-raised border border-border rounded-xl p-5 hover:border-border-hover transition-all"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-text-primary">
                                    {SERVICE_LABELS[serviceId] || serviceId}
                                </span>
                                {check ? <StatusDot status={check.status} /> : <Minus size={14} className="text-text-muted" />}
                            </div>
                            {check ? (
                                <>
                                    <p className="text-xs text-text-muted mb-1">
                                        Response: <span className="text-text-secondary">{check.responseTimeMs}ms</span>
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        Status: <span className="text-text-secondary">{check.message}</span>
                                    </p>
                                </>
                            ) : (
                                <p className="text-xs text-text-muted">No data</p>
                            )}
                            {serviceUptime && (
                                <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] uppercase text-text-muted">Uptime 24h</p>
                                        <p className={`text-sm font-semibold ${
                                            serviceUptime.uptimePercent >= 99 ? 'text-success' :
                                            serviceUptime.uptimePercent >= 95 ? 'text-warning' : 'text-danger'
                                        }`}>
                                            {serviceUptime.uptimePercent}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase text-text-muted">Avg Response</p>
                                        <p className="text-sm font-semibold text-text-secondary">
                                            {serviceUptime.avgResponseTimeMs}ms
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Open Incidents */}
            {openIncidents.length > 0 && (
                <div className="bg-surface-raised border border-danger/30 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-danger flex items-center gap-2 mb-4">
                        <AlertTriangle size={20} />
                        Active Incidents ({openIncidents.length})
                    </h2>
                    <div className="space-y-3">
                        {openIncidents.map((incident) => (
                            <div key={incident.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-text-primary">{incident.title}</p>
                                    <p className="text-xs text-text-muted">
                                        Since {formatTime(incident.startedAt)} ({formatRelativeTime(incident.startedAt)})
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    incident.severity === 'critical' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                                }`}>
                                    {incident.severity}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 24h Timeline */}
            {recentEvents.length > 0 && (
                <div className="bg-surface-raised border border-border rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                        <Clock size={20} className="text-accent" />
                        24h Smoke Test History
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-overlay/50">
                                    <th className="text-left py-2 px-3 text-xs uppercase text-text-muted">Time</th>
                                    <th className="text-left py-2 px-3 text-xs uppercase text-text-muted">Overall</th>
                                    {SERVICE_ORDER.map((sId) => (
                                        <th key={sId} className="text-center py-2 px-3 text-xs uppercase text-text-muted">
                                            {SERVICE_LABELS[sId]?.split(' ')[0] || sId}
                                        </th>
                                    ))}
                                    <th className="text-right py-2 px-3 text-xs uppercase text-text-muted">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {recentEvents.map((event) => {
                                    const meta = event.metadata;
                                    return (
                                        <tr key={event.id} className="hover:bg-surface-hover">
                                            <td className="py-2 px-3 text-text-secondary">{formatTime(event.createdAt)}</td>
                                            <td className="py-2 px-3">
                                                {meta?.overallStatus && <StatusDot status={meta.overallStatus} />}
                                            </td>
                                            {SERVICE_ORDER.map((sId) => (
                                                <td key={sId} className="py-2 px-3 text-center">
                                                    {meta?.services?.[sId] ? (
                                                        <StatusDot status={meta.services[sId].status} />
                                                    ) : (
                                                        <Minus size={12} className="text-text-muted inline" />
                                                    )}
                                                </td>
                                            ))}
                                            <td className="py-2 px-3 text-right text-text-muted">
                                                {meta?.durationMs ? `${meta.durationMs}ms` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Recent Resolved Incidents */}
            {allIncidents.filter((i) => i.status === 'resolved').length > 0 && (
                <div className="bg-surface-raised border border-border rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-text-primary mb-4">
                        Recently Resolved Incidents
                    </h2>
                    <div className="space-y-2">
                        {allIncidents
                            .filter((i) => i.status === 'resolved')
                            .slice(0, 10)
                            .map((incident) => (
                                <div key={incident.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                                    <div>
                                        <p className="text-sm text-text-secondary">{incident.title}</p>
                                        <p className="text-xs text-text-muted">
                                            {formatTime(incident.startedAt)} — {incident.resolvedAt ? formatTime(incident.resolvedAt) : '?'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {incident.durationMs != null && (
                                            <span className="text-xs text-text-muted">{formatDuration(incident.durationMs)}</span>
                                        )}
                                        <CheckCircle2 size={16} className="text-success" />
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!result && (
                <div className="bg-surface-raised border border-border rounded-xl p-12 text-center">
                    <Activity size={48} className="text-text-muted mx-auto mb-4" />
                    <p className="text-text-secondary text-lg">No monitoring data yet</p>
                    <p className="text-text-muted text-sm mt-1">
                        Smoke tests will appear here once Cloud Scheduler starts triggering them.
                    </p>
                </div>
            )}
        </div>
    );
}
