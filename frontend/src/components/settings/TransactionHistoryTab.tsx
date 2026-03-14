import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, AlertCircle, Mail, FileText, ExternalLink, Download, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { t, isEN } from '@/i18n';
import { billingService } from '@/services/billing.service';
import type { BillingInfo, StripeInvoice } from '@/services/billing.service';
import { toast } from 'sonner';

const bt = t.settings.billing;

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

type FilterType = 'all' | 'purchases' | 'usage';

interface TransactionHistoryTabProps {
    user: { organizationId?: string };
}

function formatInvoiceAmount(amount: number, currency: string): string {
    const value = Math.abs(amount) / 100;
    if (currency === 'usd') return `$${value.toFixed(2)}`;
    return `${value.toFixed(2).replace('.', ',')} PLN`;
}

export function TransactionHistoryTab({ user }: TransactionHistoryTabProps) {
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
    const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [invoicesLoading, setInvoicesLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');
    const [portalLoading, setPortalLoading] = useState(false);

    const hasOrg = !!user?.organizationId;

    useEffect(() => {
        billingService.getInfo()
            .then(setBillingInfo)
            .catch((err) => console.error('Failed to load billing info:', err))
            .finally(() => setLoading(false));

        billingService.getInvoices()
            .then((data) => setInvoices(data.invoices))
            .catch((err) => console.error('Failed to load invoices:', err))
            .finally(() => setInvoicesLoading(false));
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

    const handleManageBilling = async () => {
        setPortalLoading(true);
        try {
            const { url } = await billingService.createPortalSession();
            window.open(url, '_blank');
        } catch {
            toast.error(isEN ? 'Could not open billing portal' : 'Nie udało się otworzyć portalu rozliczeniowego');
        } finally {
            setPortalLoading(false);
        }
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
            {/* ===== 1. BILLING DATA MANAGEMENT ===== */}
            <Card>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-medium">
                                {isEN ? 'Billing information' : 'Dane rozliczeniowe'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isEN
                                    ? 'Edit company data, billing address, and payment methods'
                                    : 'Edytuj dane firmy, adres rozliczeniowy i metody płatności'}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleManageBilling}
                        disabled={portalLoading || !billingInfo?.hasStripeCustomer}
                    >
                        {portalLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <ExternalLink className="h-4 w-4 mr-2" />
                        )}
                        {isEN ? 'Manage billing data' : 'Zarządzaj danymi do faktury'}
                    </Button>
                </CardContent>
            </Card>

            {/* ===== 2. INVOICES ===== */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {isEN ? 'Invoices' : 'Faktury'}
                    </CardTitle>
                    <CardDescription>
                        {isEN
                            ? 'Download invoices for your purchases'
                            : 'Pobierz faktury za zakupy'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {invoicesLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm px-4">
                            {isEN ? 'No invoices yet. Invoices will appear here after your first purchase.' : 'Brak faktur. Faktury pojawią się tutaj po pierwszym zakupie.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {isEN ? 'Date' : 'Data'}
                                        </th>
                                        <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {isEN ? 'Number' : 'Numer'}
                                        </th>
                                        <th className="text-right p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {isEN ? 'Amount' : 'Kwota'}
                                        </th>
                                        <th className="text-center p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {isEN ? 'Status' : 'Status'}
                                        </th>
                                        <th className="text-right p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {isEN ? 'Actions' : 'Akcje'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="p-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                                                {new Date(inv.date).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                                            </td>
                                            <td className="p-4 py-4 text-sm font-medium">
                                                {inv.number}
                                            </td>
                                            <td className="p-4 py-4 text-right text-sm font-semibold">
                                                {formatInvoiceAmount(inv.amount, inv.currency)}
                                            </td>
                                            <td className="p-4 py-4 text-center">
                                                <Badge
                                                    variant={inv.status === 'paid' ? 'default' : 'secondary'}
                                                    className={`text-[10px] ${inv.status === 'paid' ? 'bg-green-600' : ''}`}
                                                >
                                                    {inv.status === 'paid' ? (isEN ? 'Paid' : 'Opłacona') :
                                                     inv.status === 'open' ? (isEN ? 'Open' : 'Otwarta') :
                                                     inv.status}
                                                </Badge>
                                            </td>
                                            <td className="p-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {inv.pdfUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => window.open(inv.pdfUrl!, '_blank')}
                                                        >
                                                            <Download className="h-3 w-3 mr-1" />
                                                            PDF
                                                        </Button>
                                                    )}
                                                    {inv.hostedUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => window.open(inv.hostedUrl!, '_blank')}
                                                        >
                                                            <ExternalLink className="h-3 w-3 mr-1" />
                                                            {isEN ? 'View' : 'Otwórz'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ===== 3. TRANSACTION HISTORY ===== */}
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
