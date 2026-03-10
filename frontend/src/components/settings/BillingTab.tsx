import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Infinity, Loader2, ExternalLink, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PL } from '@/i18n/pl';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { billingService } from '@/services/billing.service';
import type { BillingInfo } from '@/services/billing.service';
import apiClient from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';

const t = PL.settings.billing;

const PACKS = [
    { id: 'pack_1', credits: 1, priceNet: 70, label: t.packs.pack1 },
    { id: 'pack_5', credits: 5, priceNet: 240, label: t.packs.pack5, badge: t.packs.popular },
    { id: 'pack_20', credits: 20, priceNet: 600, label: t.packs.pack20, badge: t.packs.bestValue },
];

const SUBSCRIPTION_PRICE_NET = 1000;
const VAT_RATE = 0.23;

function formatPln(amount: number): string {
    return `${amount.toFixed(2).replace('.', ',')} PLN`;
}

function getPlanLabel(plan: string): string {
    switch (plan) {
        case 'unlimited': return t.planUnlimited;
        case 'pay_as_you_go': return t.planPayAsYouGo;
        default: return t.planResearch;
    }
}

function getPlanVariant(plan: string): 'default' | 'secondary' | 'outline' {
    switch (plan) {
        case 'unlimited': return 'default';
        case 'pay_as_you_go': return 'secondary';
        default: return 'outline';
    }
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface BillingTabProps {
    user: any;
}

export function BillingTab({ user }: BillingTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const { setUser } = useAuthStore();

    useEffect(() => {
        loadBillingInfo();
    }, []);

    useEffect(() => {
        const billingStatus = searchParams.get('billing');
        if (billingStatus === 'success') {
            toast.success(t.checkout.success);
            searchParams.delete('billing');
            setSearchParams(searchParams, { replace: true });
            loadBillingInfo();
            // Refresh user data in store (picks up new credits/plan)
            apiClient.get('/auth/me').then(res => { if (res.data?.id) setUser(res.data); }).catch(() => {});
        } else if (billingStatus === 'canceled') {
            toast.error(t.checkout.canceled);
            searchParams.delete('billing');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams]);

    async function loadBillingInfo() {
        try {
            const info = await billingService.getInfo();
            setBillingInfo(info);
        } catch (err) {
            console.error('Failed to load billing info:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreditCheckout(packId: string) {
        setCheckoutLoading(packId);
        try {
            const { url } = await billingService.createCreditCheckout(packId);
            window.location.href = url;
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Błąd podczas tworzenia płatności');
            setCheckoutLoading(null);
        }
    }

    async function handleSubscriptionCheckout() {
        setCheckoutLoading('subscription');
        try {
            const { url } = await billingService.createSubscriptionCheckout();
            window.location.href = url;
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Błąd podczas tworzenia płatności');
            setCheckoutLoading(null);
        }
    }

    async function handleManageSubscription() {
        try {
            const { url } = await billingService.createPortalSession();
            window.open(url, '_blank');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Błąd');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const credits = billingInfo?.searchCredits ?? user?.searchCredits ?? 0;
    const plan = billingInfo?.plan ?? user?.plan ?? 'research';
    const isUnlimited = plan === 'unlimited';
    const transactions = billingInfo?.recentTransactions ?? [];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8 max-w-4xl mx-auto mt-4"
        >
            {/* Current Balance */}
            <motion.div variants={itemVariants}>
                <Card>
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">{t.currentBalance}</p>
                            <p className="text-4xl font-bold mt-1">
                                {isUnlimited ? (
                                    <span className="flex items-center gap-2">
                                        <Infinity className="h-8 w-8" />
                                        {t.unlimited}
                                    </span>
                                ) : (
                                    credits
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">{t.currentPlan}</p>
                            <Badge variant={getPlanVariant(plan)}>
                                {getPlanLabel(plan)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Credit Packs */}
            {!isUnlimited && (
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold mb-4">{t.packs.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PACKS.map((pack) => {
                            const gross = pack.priceNet * (1 + VAT_RATE);
                            const isLoading = checkoutLoading === pack.id;
                            return (
                                <Card key={pack.id} className="relative">
                                    {pack.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <Badge variant="default" className="text-xs">
                                                {pack.id === 'pack_5' && <Star className="h-3 w-3 mr-1" />}
                                                {pack.id === 'pack_20' && <TrendingUp className="h-3 w-3 mr-1" />}
                                                {pack.badge}
                                            </Badge>
                                        </div>
                                    )}
                                    <CardHeader className="text-center pb-2">
                                        <CardTitle className="text-lg">{pack.label}</CardTitle>
                                        <div className="mt-2">
                                            <span className="text-3xl font-bold">{pack.priceNet}</span>
                                            <span className="text-muted-foreground ml-1">PLN</span>
                                        </div>
                                        <CardDescription>
                                            {t.vat}
                                            <br />
                                            <span className="text-xs">({formatPln(gross)} {t.gross})</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <Button
                                            className="w-full"
                                            onClick={() => handleCreditCheckout(pack.id)}
                                            disabled={!!checkoutLoading}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Search className="h-4 w-4 mr-2" />
                                            )}
                                            {isLoading ? t.checkout.redirecting : t.packs.buy}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Subscription */}
            <motion.div variants={itemVariants}>
                {isUnlimited ? (
                    <Card className="border-primary/30">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h3 className="font-semibold text-lg">{t.subscription.title}</h3>
                                <p className="text-muted-foreground text-sm">{t.subscription.description}</p>
                            </div>
                            {billingInfo?.hasStripeCustomer && (
                                <Button variant="outline" onClick={handleManageSubscription}>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    {t.subscription.manage}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-primary/20">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-lg">{t.subscription.title}</CardTitle>
                            <div className="mt-2">
                                <span className="text-3xl font-bold">{SUBSCRIPTION_PRICE_NET}</span>
                                <span className="text-muted-foreground ml-1">PLN{t.subscription.perMonth}</span>
                            </div>
                            <CardDescription>
                                {t.vat}
                                <br />
                                <span className="text-xs">({formatPln(SUBSCRIPTION_PRICE_NET * (1 + VAT_RATE))} {t.gross}{t.subscription.perMonth})</span>
                            </CardDescription>
                            <p className="text-sm text-muted-foreground mt-2">{t.subscription.description}</p>
                        </CardHeader>
                        <CardContent className="pt-2 max-w-xs mx-auto">
                            <Button
                                className="w-full"
                                variant="default"
                                onClick={handleSubscriptionCheckout}
                                disabled={!!checkoutLoading}
                            >
                                {checkoutLoading === 'subscription' ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Infinity className="h-4 w-4 mr-2" />
                                )}
                                {checkoutLoading === 'subscription' ? t.checkout.redirecting : t.subscription.subscribe}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </motion.div>

            {/* Transaction History */}
            {transactions.length > 0 && (
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold mb-4">{t.history.title}</h3>
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 font-medium">{t.history.date}</th>
                                            <th className="text-left p-3 font-medium">{t.history.description}</th>
                                            <th className="text-right p-3 font-medium">{t.history.amount}</th>
                                            <th className="text-right p-3 font-medium">{t.history.balance}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b last:border-0">
                                                <td className="p-3 text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString('pl-PL')}
                                                </td>
                                                <td className="p-3">{tx.description || tx.type}</td>
                                                <td className={`p-3 text-right font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                </td>
                                                <td className="p-3 text-right text-muted-foreground">{tx.balanceAfter}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
