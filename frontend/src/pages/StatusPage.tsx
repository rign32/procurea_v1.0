import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, Activity } from 'lucide-react';
import apiClient from '@/services/api.client';

const isEN = (import.meta.env.VITE_LANGUAGE || 'pl') === 'en';

interface ServiceStatus {
    serviceId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    lastChecked?: string;
}

interface StatusData {
    overall: string;
    services: ServiceStatus[];
    uptime?: number;
}

const SERVICE_LABELS: Record<string, { pl: string; en: string }> = {
    app_pl: { pl: 'Aplikacja (PL)', en: 'Application (PL)' },
    app_io: { pl: 'Aplikacja (EN)', en: 'Application (EN)' },
    gemini: { pl: 'AI Engine', en: 'AI Engine' },
    serper: { pl: 'Wyszukiwarka', en: 'Search Engine' },
    database: { pl: 'Baza danych', en: 'Database' },
    resend: { pl: 'Email', en: 'Email' },
};

function StatusIcon({ status }: { status: string }) {
    if (status === 'healthy') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'degraded') return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
}

function StatusBadge({ status }: { status: string }) {
    const colors = {
        healthy: 'bg-green-100 text-green-800',
        degraded: 'bg-amber-100 text-amber-800',
        unhealthy: 'bg-red-100 text-red-800',
    };
    const labels = {
        healthy: isEN ? 'Operational' : 'Działa',
        degraded: isEN ? 'Degraded' : 'Pogorszone',
        unhealthy: isEN ? 'Down' : 'Niedostępne',
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || colors.unhealthy}`}>
            {labels[status as keyof typeof labels] || status}
        </span>
    );
}

export function StatusPage() {
    const { data, isLoading } = useQuery<StatusData>({
        queryKey: ['system-status'],
        queryFn: async () => {
            const { data } = await apiClient.get('/monitoring/status');
            return data;
        },
        refetchInterval: 30000,
    });

    const overallStatus = data?.overall || 'unknown';
    const overallColor = overallStatus === 'healthy' ? 'text-green-600' : overallStatus === 'degraded' ? 'text-amber-600' : 'text-red-600';

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Activity className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">Procurea Status</h1>
                    </div>
                    {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    ) : (
                        <p className={`text-lg font-medium ${overallColor}`}>
                            {overallStatus === 'healthy'
                                ? (isEN ? 'All systems operational' : 'Wszystkie systemy działają')
                                : overallStatus === 'degraded'
                                    ? (isEN ? 'Some systems degraded' : 'Niektóre systemy pogorszone')
                                    : (isEN ? 'System issues detected' : 'Wykryto problemy z systemem')}
                        </p>
                    )}
                </motion.div>

                {/* Services */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="border rounded-lg divide-y"
                >
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4">
                                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            </div>
                        ))
                    ) : (
                        data?.services?.map((service) => (
                            <div key={service.serviceId} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <StatusIcon status={service.status} />
                                    <span className="font-medium">
                                        {SERVICE_LABELS[service.serviceId]?.[isEN ? 'en' : 'pl'] || service.serviceId}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {service.responseTime != null && (
                                        <span className="text-xs text-muted-foreground">{service.responseTime}ms</span>
                                    )}
                                    <StatusBadge status={service.status} />
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    {isEN ? 'Auto-refreshes every 30 seconds' : 'Odświeża się automatycznie co 30 sekund'}
                    {data?.services?.[0]?.lastChecked && (
                        <> &middot; {isEN ? 'Last check' : 'Ostatnia kontrola'}: {new Date(data.services[0].lastChecked).toLocaleTimeString(isEN ? 'en-US' : 'pl-PL')}</>
                    )}
                </p>
            </div>
        </div>
    );
}

export default StatusPage;
