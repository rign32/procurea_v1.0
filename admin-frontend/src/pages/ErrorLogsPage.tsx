import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getErrorLogs } from '../services/api';
import { AlertTriangle, ShieldAlert, Cpu, Clock, Loader2, RefreshCw, Database, User, Zap, ChevronDown, ChevronRight } from 'lucide-react';

type TabType = 'all' | 'auth' | 'sourcing';

interface DbError {
    id: string;
    timestamp: string;
    service: string;
    endpoint: string | null;
    errorMessage: string | null;
    requestPayload: string | null;
    responseTimeMs: number | null;
    tokensUsed: number | null;
    user: { id: string; email: string; name: string | null } | null;
}

interface AuthError {
    id: string;
    timestamp: string;
    requestId: string;
    action: string;
    provider?: string;
    userId?: string;
    email?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: any;
}

interface SystemError {
    id: string;
    timestamp: string;
    type: string;
    service: string;
    message: string;
    stack?: string;
    context?: Record<string, any>;
}

export default function ErrorLogsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState<TabType>((searchParams.get('tab') as TabType) || 'all');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data: result } = await getErrorLogs(tab === 'all' ? undefined : tab, 100);
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [tab]);

    const handleTabChange = (newTab: TabType) => {
        setTab(newTab);
        setSearchParams(newTab === 'all' ? {} : { tab: newTab });
    };

    const tabs: { key: TabType; label: string; icon: any }[] = [
        { key: 'all', label: 'Wszystkie', icon: AlertTriangle },
        { key: 'auth', label: 'Logowanie / Rejestracja', icon: ShieldAlert },
        { key: 'sourcing', label: 'Sourcing / API', icon: Cpu },
    ];

    const formatDate = (ts: string) =>
        new Date(ts).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const renderDbErrors = (errors: DbError[]) => (
        <div className="space-y-2">
            {errors.length === 0 ? (
                <div className="text-center py-12 text-text-muted text-sm">
                    <Database size={32} className="text-success mx-auto mb-3 opacity-50" />
                    Brak błędów API w bazie danych ✓
                </div>
            ) : (
                errors.map((err) => {
                    const isExpanded = expanded === err.id;
                    return (
                        <div
                            key={err.id}
                            className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-hover transition-all"
                        >
                            <button
                                onClick={() => setExpanded(isExpanded ? null : err.id)}
                                className="w-full text-left p-4 flex items-start justify-between gap-4"
                            >
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div className="h-9 w-9 rounded-lg bg-danger-muted flex items-center justify-center shrink-0 mt-0.5">
                                        <Zap size={16} className="text-danger" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-surface-overlay text-accent">{err.service}</span>
                                            {err.endpoint && (
                                                <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-surface-overlay text-text-muted truncate max-w-[200px]">{err.endpoint}</span>
                                            )}
                                            {err.responseTimeMs != null && (
                                                <span className="text-xs text-text-muted">{err.responseTimeMs}ms</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-danger mt-1.5 break-words">
                                            {err.errorMessage || 'Brak opisu błędu'}
                                        </p>
                                        {err.user && (
                                            <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted">
                                                <User size={10} />
                                                <span>{err.user.name || err.user.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-xs text-text-muted flex items-center gap-1.5">
                                        <Clock size={12} />
                                        {formatDate(err.timestamp)}
                                    </div>
                                    {isExpanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-0 border-t border-border">
                                    <div className="mt-3 space-y-2 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-text-muted">ID:</span>{' '}
                                                <span className="font-mono text-text-secondary">{err.id}</span>
                                            </div>
                                            <div>
                                                <span className="text-text-muted">Serwis:</span>{' '}
                                                <span className="font-mono text-accent">{err.service}</span>
                                            </div>
                                            {err.endpoint && (
                                                <div className="col-span-2">
                                                    <span className="text-text-muted">Endpoint:</span>{' '}
                                                    <span className="font-mono text-text-secondary">{err.endpoint}</span>
                                                </div>
                                            )}
                                            {err.tokensUsed != null && (
                                                <div>
                                                    <span className="text-text-muted">Tokeny:</span>{' '}
                                                    <span className="text-text-secondary">{err.tokensUsed}</span>
                                                </div>
                                            )}
                                            {err.responseTimeMs != null && (
                                                <div>
                                                    <span className="text-text-muted">Czas odpowiedzi:</span>{' '}
                                                    <span className="text-text-secondary">{err.responseTimeMs}ms</span>
                                                </div>
                                            )}
                                            {err.user && (
                                                <div className="col-span-2">
                                                    <span className="text-text-muted">Użytkownik:</span>{' '}
                                                    <span className="text-text-secondary">{err.user.name} ({err.user.email})</span>
                                                </div>
                                            )}
                                        </div>
                                        {err.errorMessage && (
                                            <div>
                                                <span className="text-text-muted block mb-1">Pełny komunikat błędu:</span>
                                                <pre className="p-3 bg-surface-overlay rounded-lg text-danger/80 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-words">{err.errorMessage}</pre>
                                            </div>
                                        )}
                                        {err.requestPayload && (
                                            <div>
                                                <span className="text-text-muted block mb-1">Payload zapytania:</span>
                                                <pre className="p-3 bg-surface-overlay rounded-lg text-text-secondary font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-words">{err.requestPayload}</pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );

    const renderAuthErrors = (logs: AuthError[]) => (
        <div className="space-y-2">
            {logs.length === 0 ? (
                <div className="text-center py-12 text-text-muted text-sm">
                    <ShieldAlert size={32} className="text-success mx-auto mb-3 opacity-50" />
                    Brak błędów logowania – wszystko działa poprawnie ✓
                </div>
            ) : (
                logs.map((log) => {
                    const isExpanded = expanded === log.id;
                    return (
                        <div
                            key={log.id}
                            className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-hover transition-all"
                        >
                            <button
                                onClick={() => setExpanded(isExpanded ? null : log.id)}
                                className="w-full text-left p-4 flex items-start justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-danger-muted flex items-center justify-center shrink-0">
                                        <ShieldAlert size={16} className="text-danger" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm text-text-primary">{log.action}</span>
                                            {log.provider && (
                                                <span className="text-xs px-2 py-0.5 rounded-md bg-surface-overlay text-text-muted font-mono">{log.provider}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-danger mt-0.5">{log.errorMessage || 'Brak komunikatu'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-xs text-text-muted flex items-center gap-1.5">
                                        <Clock size={12} />
                                        {formatDate(log.timestamp)}
                                    </div>
                                    {isExpanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="px-4 pb-4 pt-0 border-t border-border">
                                    <div className="mt-3 space-y-1 text-xs">
                                        {log.email && <p className="text-text-secondary"><span className="text-text-muted">Email:</span> {log.email}</p>}
                                        {log.userId && <p className="text-text-secondary"><span className="text-text-muted">User ID:</span> <span className="font-mono">{log.userId}</span></p>}
                                        {log.requestId && <p className="text-text-secondary"><span className="text-text-muted">Request:</span> <span className="font-mono">{log.requestId}</span></p>}
                                        {log.metadata && (
                                            <pre className="mt-2 p-3 bg-surface-overlay rounded-lg text-text-muted font-mono text-[11px] overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );

    const renderSystemErrors = (logs: SystemError[]) => (
        <div className="space-y-2">
            {logs.length === 0 ? null : (
                <>
                    <h3 className="text-sm font-medium text-text-muted mt-4 mb-2">Błędy systemowe (in-memory)</h3>
                    {logs.map((log) => {
                        const isExpanded = expanded === log.id;
                        return (
                            <div
                                key={log.id}
                                className="bg-surface border border-border rounded-lg overflow-hidden hover:border-border-hover transition-all"
                            >
                                <button
                                    onClick={() => setExpanded(isExpanded ? null : log.id)}
                                    className="w-full text-left p-4 flex items-start justify-between gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${log.type === 'API_ERROR' ? 'bg-danger-muted' : 'bg-warning-muted'
                                            }`}>
                                            <AlertTriangle size={16} className={log.type === 'API_ERROR' ? 'text-danger' : 'text-warning'} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-surface-overlay text-accent">{log.service}</span>
                                                <span className="px-2 py-0.5 rounded-md text-xs bg-surface-overlay text-text-muted">{log.type}</span>
                                            </div>
                                            <p className="text-sm text-danger mt-1">{log.message.slice(0, 120)}{log.message.length > 120 ? '...' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="text-xs text-text-muted flex items-center gap-1.5">
                                            <Clock size={12} />
                                            {formatDate(log.timestamp)}
                                        </div>
                                        {isExpanded ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="px-4 pb-4 pt-0 border-t border-border">
                                        <div className="mt-3 space-y-2 text-xs">
                                            <p className="text-text-secondary break-all">{log.message}</p>
                                            {log.context && (
                                                <pre className="p-3 bg-surface-overlay rounded-lg text-text-muted font-mono text-[11px] overflow-x-auto">{JSON.stringify(log.context, null, 2)}</pre>
                                            )}
                                            {log.stack && (
                                                <pre className="p-3 bg-surface-overlay rounded-lg text-danger/70 font-mono text-[10px] overflow-x-auto max-h-40">{log.stack}</pre>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Logi błędów</h1>
                    <p className="text-sm text-text-muted mt-1">Monitorowanie błędów logowania, rejestracji i sourcingu</p>
                </div>
                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-border text-text-secondary hover:text-text-primary hover:border-border-hover transition-all text-sm disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Odśwież
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-surface-raised border border-border rounded-xl p-1">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => handleTabChange(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${tab === key
                                ? 'bg-accent-muted text-accent shadow-glow'
                                : 'text-text-muted hover:text-text-secondary hover:bg-surface-hover'
                            }`}
                    >
                        <Icon size={16} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 text-accent animate-spin" />
                </div>
            ) : (
                <div className="animate-fade-in">
                    {tab === 'all' && data && (
                        <div className="space-y-8">
                            {/* Stats summary */}
                            {data.stats && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-danger">{data.stats.totalDbErrors || 0}</div>
                                        <div className="text-xs text-text-muted mt-1">Błędy API (DB)</div>
                                    </div>
                                    <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-warning">{data.stats.total || 0}</div>
                                        <div className="text-xs text-text-muted mt-1">Błędy systemowe</div>
                                    </div>
                                    <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-text-primary">{data.auth?.total || 0}</div>
                                        <div className="text-xs text-text-muted mt-1">Błędy logowania</div>
                                    </div>
                                    <div className="bg-surface-raised border border-border rounded-xl p-4 text-center">
                                        <div className="text-2xl font-bold text-text-primary">
                                            {Object.keys(data.stats.dbErrorsByService || {}).length}
                                        </div>
                                        <div className="text-xs text-text-muted mt-1">Serwisy z błędami</div>
                                    </div>
                                </div>
                            )}

                            {/* DB/API errors per service */}
                            {data.stats?.dbErrorsByService && Object.keys(data.stats.dbErrorsByService).length > 0 && (
                                <div className="bg-surface-raised border border-border rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-text-primary mb-3">Błędy per serwis (baza danych)</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(data.stats.dbErrorsByService as Record<string, number>).map(([svc, count]) => (
                                            <div key={svc} className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2">
                                                <span className="font-mono text-accent text-sm">{svc}</span>
                                                <span className="text-danger font-bold text-sm">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sourcing DB errors */}
                            {data.sourcing?.dbErrors && data.sourcing.dbErrors.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                                        <Database size={18} className="text-danger" />
                                        Błędy API Sourcing ({data.sourcing.dbErrors.length})
                                    </h2>
                                    {renderDbErrors(data.sourcing.dbErrors)}
                                </div>
                            )}

                            {/* System errors */}
                            {data.sourcing?.systemErrors && data.sourcing.systemErrors.length > 0 && (
                                <div>
                                    {renderSystemErrors(data.sourcing.systemErrors)}
                                </div>
                            )}

                            {/* Auth errors */}
                            <div>
                                <h2 className="text-lg font-semibold text-text-primary mb-3 flex items-center gap-2">
                                    <ShieldAlert size={18} className="text-warning" />
                                    Błędy logowania / rejestracji ({data.auth?.total || 0})
                                </h2>
                                {renderAuthErrors(data.auth?.logs || [])}
                            </div>
                        </div>
                    )}

                    {tab === 'auth' && data && renderAuthErrors(data.logs || [])}

                    {tab === 'sourcing' && data && (
                        <div className="space-y-6">
                            <div className="text-sm text-text-muted">
                                Łącznie: <span className="text-text-primary font-bold">{data.total}</span> błędów
                            </div>
                            {renderDbErrors(data.dbErrors || [])}
                            {renderSystemErrors(data.systemErrors || [])}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
