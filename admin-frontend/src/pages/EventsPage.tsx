import { useEffect, useState, useCallback } from 'react';
import { getObservabilityEvents } from '../services/api';
import { Bell, Loader2, RefreshCw, ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface ObservabilityEvent {
    id: string;
    category: string;
    type: string;
    severity: string;
    userId: string | null;
    userEmail: string | null;
    campaignId: string | null;
    title: string;
    message: string | null;
    metadata: any;
    slackSent: boolean;
    createdAt: string;
}

const SEVERITY_COLORS: Record<string, string> = {
    info: 'bg-blue-500/20 text-blue-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    critical: 'bg-red-600/30 text-red-300 ring-1 ring-red-500/50',
};

const CATEGORY_COLORS: Record<string, string> = {
    auth: 'bg-purple-500/20 text-purple-400',
    conversion: 'bg-green-500/20 text-green-400',
    campaign: 'bg-teal-500/20 text-teal-400',
    error: 'bg-red-500/20 text-red-400',
};

const CATEGORIES = ['auth', 'conversion', 'campaign', 'error'];
const SEVERITIES = ['info', 'warning', 'error', 'critical'];

export default function EventsPage() {
    const [events, setEvents] = useState<ObservabilityEvent[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string>('');
    const [severityFilter, setSeverityFilter] = useState<string>('');
    const [offset, setOffset] = useState(0);
    const limit = 50;

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {
                limit: String(limit),
                offset: String(offset),
            };
            if (categoryFilter) params.category = categoryFilter;
            if (severityFilter) params.severity = severityFilter;

            const res = await getObservabilityEvents(params);
            setEvents(res.data.events);
            setTotal(res.data.total);
        } catch (err) {
            console.error('Failed to load events:', err);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter, severityFilter, offset]);

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 30000);
        return () => clearInterval(interval);
    }, [fetchEvents]);

    useEffect(() => {
        setOffset(0);
    }, [categoryFilter, severityFilter]);

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString('pl-PL', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Bell className="text-accent" size={24} />
                    <h1 className="text-2xl font-bold text-text-primary">Observability Events</h1>
                    <span className="text-sm text-text-muted">({total} total)</span>
                </div>
                <button
                    onClick={fetchEvents}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-raised border border-border text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Odśwież
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-text-muted" />
                    <span className="text-xs text-text-muted uppercase">Kategoria:</span>
                    <button
                        onClick={() => setCategoryFilter('')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${!categoryFilter ? 'bg-accent/20 text-accent' : 'bg-surface-raised text-text-secondary hover:text-text-primary'}`}
                    >
                        Wszystkie
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat === categoryFilter ? '' : cat)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${cat === categoryFilter ? CATEGORY_COLORS[cat] : 'bg-surface-raised text-text-secondary hover:text-text-primary'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted uppercase">Severity:</span>
                    <button
                        onClick={() => setSeverityFilter('')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${!severityFilter ? 'bg-accent/20 text-accent' : 'bg-surface-raised text-text-secondary hover:text-text-primary'}`}
                    >
                        Wszystkie
                    </button>
                    {SEVERITIES.map(sev => (
                        <button
                            key={sev}
                            onClick={() => setSeverityFilter(sev === severityFilter ? '' : sev)}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${sev === severityFilter ? SEVERITY_COLORS[sev] : 'bg-surface-raised text-text-secondary hover:text-text-primary'}`}
                        >
                            {sev}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events table */}
            {loading && events.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-accent" size={32} />
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 text-text-muted">
                    Brak zdarzeń pasujących do filtrów
                </div>
            ) : (
                <div className="bg-surface-raised rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-text-muted text-xs uppercase">
                                <th className="px-4 py-3 text-left w-8"></th>
                                <th className="px-4 py-3 text-left">Czas</th>
                                <th className="px-4 py-3 text-left">Severity</th>
                                <th className="px-4 py-3 text-left">Kategoria</th>
                                <th className="px-4 py-3 text-left">Typ</th>
                                <th className="px-4 py-3 text-left">Tytuł</th>
                                <th className="px-4 py-3 text-left">Email</th>
                                <th className="px-4 py-3 text-left w-6">Slack</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <>
                                    <tr
                                        key={event.id}
                                        onClick={() => setExpanded(expanded === event.id ? null : event.id)}
                                        className="border-b border-border/50 hover:bg-surface-hover cursor-pointer transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            {expanded === event.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </td>
                                        <td className="px-4 py-3 text-text-muted whitespace-nowrap text-xs">
                                            {formatTime(event.createdAt)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_COLORS[event.severity] || ''}`}>
                                                {event.severity}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[event.category] || ''}`}>
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-text-secondary text-xs font-mono">
                                            {event.type}
                                        </td>
                                        <td className="px-4 py-3 text-text-primary max-w-xs truncate">
                                            {event.title}
                                        </td>
                                        <td className="px-4 py-3 text-text-muted text-xs">
                                            {event.userEmail || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {event.slackSent ? '✓' : '—'}
                                        </td>
                                    </tr>
                                    {expanded === event.id && (
                                        <tr key={`${event.id}-detail`} className="bg-surface/50">
                                            <td colSpan={8} className="px-8 py-4">
                                                <div className="space-y-2 text-xs">
                                                    {event.message && (
                                                        <div>
                                                            <span className="text-text-muted">Message: </span>
                                                            <span className="text-text-primary whitespace-pre-wrap">{event.message}</span>
                                                        </div>
                                                    )}
                                                    {event.userId && (
                                                        <div>
                                                            <span className="text-text-muted">User ID: </span>
                                                            <span className="text-text-primary font-mono">{event.userId}</span>
                                                        </div>
                                                    )}
                                                    {event.campaignId && (
                                                        <div>
                                                            <span className="text-text-muted">Campaign ID: </span>
                                                            <span className="text-text-primary font-mono">{event.campaignId}</span>
                                                        </div>
                                                    )}
                                                    {event.metadata && (
                                                        <div>
                                                            <span className="text-text-muted">Metadata: </span>
                                                            <pre className="mt-1 p-2 bg-surface rounded text-text-secondary overflow-x-auto">
                                                                {JSON.stringify(event.metadata, null, 2)}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {total > limit && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-text-muted">
                        {offset + 1}–{Math.min(offset + limit, total)} z {total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setOffset(Math.max(0, offset - limit))}
                            disabled={offset === 0}
                            className="px-3 py-1.5 rounded bg-surface-raised border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                        >
                            Poprzednia
                        </button>
                        <button
                            onClick={() => setOffset(offset + limit)}
                            disabled={offset + limit >= total}
                            className="px-3 py-1.5 rounded bg-surface-raised border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-hover transition-colors"
                        >
                            Następna
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
