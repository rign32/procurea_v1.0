import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, AlertCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t, isEN } from '@/i18n';
import { billingService } from '@/services/billing.service';
import type { BillingInfo } from '@/services/billing.service';

const bt = t.settings.billing;

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type FilterType = 'all' | 'purchases' | 'usage';

interface TransactionHistoryTabProps {
    user: { organizationId?: string };
}

export function TransactionHistoryTab({ user }: TransactionHistoryTabProps) {
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');

    const hasOrg = !!user?.organizationId;

    useEffect(() => {
        billingService.getInfo()
            .then(setBillingInfo)
            .catch((err) => console.error('Failed to load billing info:', err))
            .finally(() => setLoading(false));
    }, []);

    const transactions = billingInfo?.recentTransactions ?? [];

    const filtered = transactions.filter((tx) => {
        if (filter === 'purchases') return tx.amount > 0;
        if (filter === 'usage') return tx.amount < 0;
        return true;
    });

    const handleComplaint = (txId: string, txDate: string, txDescription: string | null) => {
        const subject = isEN
            ? `Complaint — Transaction ${txId}`
            : `Reklamacja — Transakcja ${txId}`;
        const body = isEN
            ? `Hello,\n\nI would like to file a complaint regarding the following transaction:\n\nTransaction ID: ${txId}\nDate: ${txDate}\nDescription: ${txDescription || 'N/A'}\n\nReason for complaint:\n\n`
            : `Dzień dobry,\n\nChciałbym zgłosić reklamację dotyczącą transakcji:\n\nID transakcji: ${txId}\nData: ${txDate}\nOpis: ${txDescription || 'Brak'}\n\nPowód reklamacji:\n\n`;
        const email = isEN ? 'hello@procurea.io' : 'kontakt@procurea.pl';
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                {bt.history.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {isEN
                                    ? `${transactions.length} transactions total`
                                    : `${transactions.length} transakcji łącznie`}
                            </CardDescription>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex gap-1 rounded-lg bg-muted p-1">
                            {([
                                { key: 'all', label: isEN ? 'All' : 'Wszystkie' },
                                { key: 'purchases', label: isEN ? 'Purchases' : 'Zakupy' },
                                { key: 'usage', label: isEN ? 'Usage' : 'Zużycie' },
                            ] as const).map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                        filter === f.key
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <AlertCircle className="mx-auto h-10 w-10 opacity-50 mb-3" />
                            <p>{bt.history.noTransactions}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.date}</th>
                                        <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.description}</th>
                                        <th className="text-right p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.amount}</th>
                                        <th className="text-right p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.balance}</th>
                                        <th className="p-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((tx) => (
                                        <tr key={tx.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(tx.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                                            </td>
                                            <td className="p-4 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span>{tx.description || tx.type}</span>
                                                    {hasOrg && tx.source && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                            {tx.source === 'org' ? bt.sourceOrg : bt.sourcePersonal}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`p-4 py-4 text-right text-base font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </td>
                                            <td className="p-4 py-4 text-right text-sm text-muted-foreground">{tx.balanceAfter}</td>
                                            <td className="p-4 py-4 text-right">
                                                {tx.amount < 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-muted-foreground hover:text-foreground h-7"
                                                        onClick={() => handleComplaint(
                                                            tx.id,
                                                            new Date(tx.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL'),
                                                            tx.description
                                                        )}
                                                    >
                                                        <Mail className="h-3 w-3 mr-1" />
                                                        {isEN ? 'Claim' : 'Reklamacja'}
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
