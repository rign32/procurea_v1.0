import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Infinity, Loader2, ExternalLink, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t, isEN } from '@/i18n';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { billingService } from '@/services/billing.service';
import type { BillingInfo } from '@/services/billing.service';
import apiClient from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';

const bt = t.settings.billing;
const CURRENCY = isEN ? 'USD' : 'PLN';

const PACKS = [
    { id: 'pack_1', credits: 1, priceNet: isEN ? 49 : 70, unitPrice: isEN ? 49 : 70, label: bt.packs.pack1 },
    { id: 'pack_5', credits: 5, priceNet: isEN ? 190 : 240, unitPrice: isEN ? 38 : 48, label: bt.packs.pack5, badge: bt.packs.popular },
    { id: 'pack_20', credits: 20, priceNet: isEN ? 560 : 600, unitPrice: isEN ? 28 : 30, label: bt.packs.pack20, badge: bt.packs.bestValue },
];

const SUBSCRIPTION_PRICE_NET = isEN ? 780 : 1000;
const VAT_RATE = 0.23;

function formatPrice(amount: number): string {
    if (isEN) return `$${amount.toFixed(2)}`;
    return `${amount.toFixed(2).replace('.', ',')} PLN`;
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
    const [selectedPack, setSelectedPack] = useState('pack_5');
    const { setUser } = useAuthStore();

    useEffect(() => {
        loadBillingInfo();
    }, []);

    useEffect(() => {
        const billingStatus = searchParams.get('billing');
        const sessionId = searchParams.get('session_id');
        if (billingStatus === 'success') {
            searchParams.delete('billing');
            searchParams.delete('session_id');
            setSearchParams(searchParams, { replace: true });

            const fulfill = async () => {
                if (sessionId) {
                    try {
                        await billingService.verifySession(sessionId);
                    } catch (err) {
                        console.error('Failed to verify session:', err);
                    }
                }
                loadBillingInfo();
                apiClient.get('/auth/me').then(res => { if (res.data?.id) setUser(res.data); }).catch(() => {});
                toast.success(bt.checkout.success);
            };
            fulfill();
        } else if (billingStatus === 'canceled') {
            toast.error(bt.checkout.canceled);
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
            className="space-y-4"
        >
            {isUnlimited ? (
                /* Unlimited plan — single status card */
                <motion.div variants={itemVariants}>
                    <Card className="border-primary/30 bg-primary/5">
                        <CardContent className="flex items-center justify-between p-6">
                            <div>
                                <h3 className="font-semibold text-lg">{bt.subscription.title}</h3>
                                <p className="text-muted-foreground text-sm">{bt.subscription.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="px-3 py-1.5 text-base font-medium">
                                    <Infinity className="h-4 w-4 mr-1" />
                                    {bt.unlimited}
                                </Badge>
                                {billingInfo?.hasStripeCustomer && (
                                    <Button variant="outline" onClick={handleManageSubscription}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        {bt.subscription.manage}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                /* Two-column layout: Pay-per-search vs Subscription */
                <motion.div variants={itemVariants}>
                    {(() => {
                        const selected = PACKS.find(p => p.id === selectedPack) || PACKS[1];
                        const selectedGross = selected.priceNet * (1 + VAT_RATE);
                        return (
                            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[420px]">
                                {/* LEFT: Pay per search — pack selector */}
                                <Card className="flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{bt.payAsYouGo.title}</CardTitle>
                                            <Badge variant="outline" className="px-2.5 py-1 text-sm font-medium">
                                                <Search className="h-3.5 w-3.5 mr-1.5" />
                                                {credits} {bt.currentBalance.toLowerCase()}
                                            </Badge>
                                        </div>
                                        <CardDescription>{bt.payAsYouGo.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        <div className="border rounded-lg divide-y overflow-hidden">
                                            {PACKS.map((pack) => {
                                                const isSelected = selectedPack === pack.id;
                                                return (
                                                    <button
                                                        key={pack.id}
                                                        type="button"
                                                        onClick={() => setSelectedPack(pack.id)}
                                                        className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-primary' : 'border-muted-foreground/30'}`}>
                                                                {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-sm">{pack.label}</span>
                                                                {pack.badge && (
                                                                    <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0">{pack.badge}</Badge>
                                                                )}
                                                                {isSelected && (
                                                                    <p className="text-xs text-primary mt-0.5">{isEN ? `$${pack.unitPrice}` : `${pack.unitPrice} PLN`} {bt.packs.perSearch}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className={`font-bold text-sm ${isSelected ? 'text-primary' : ''}`}>
                                                            {isEN ? `$${pack.priceNet}` : `${pack.priceNet} PLN`}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-4 space-y-1">
                                            <p className="text-xs text-muted-foreground">
                                                {isEN ? bt.vat : `${bt.vat} (${formatPrice(selectedGross)} ${bt.gross})`}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{bt.packs.noExpiry}</p>
                                        </div>

                                        <Button
                                            className="w-full mt-auto pt-3"
                                            onClick={() => handleCreditCheckout(selectedPack)}
                                            disabled={!!checkoutLoading}
                                        >
                                            {checkoutLoading === selectedPack ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Search className="h-4 w-4 mr-2" />
                                            )}
                                            {checkoutLoading === selectedPack
                                                ? bt.checkout.redirecting
                                                : `${bt.packs.buy} ${selected.label} — ${isEN ? `$${selected.priceNet}` : `${selected.priceNet} PLN`}`}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* "lub" divider */}
                                <div className="hidden lg:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center z-10 pointer-events-none">
                                    <div className="bg-background border rounded-full px-3 py-1 text-sm font-medium text-muted-foreground shadow-sm">
                                        {bt.or}
                                    </div>
                                </div>
                                <div className="flex lg:hidden justify-center -my-2">
                                    <span className="text-sm font-medium text-muted-foreground">— {bt.or} —</span>
                                </div>

                                {/* RIGHT: Subscription — centered */}
                                <Card className="border-primary/30 bg-gradient-to-b from-primary/5 to-transparent flex flex-col">
                                    <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-5">
                                        <div>
                                            <h3 className="text-lg font-semibold">{bt.subscription.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{bt.subscription.description}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-baseline justify-center gap-1">
                                                {isEN && <span className="text-4xl font-bold">$</span>}
                                                <span className="text-4xl font-bold">{SUBSCRIPTION_PRICE_NET}</span>
                                                <span className="text-muted-foreground">{isEN ? '' : ' PLN'}{bt.subscription.perMonth}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {isEN ? bt.vat : `${bt.vat} (${formatPrice(SUBSCRIPTION_PRICE_NET * (1 + VAT_RATE))} ${bt.gross}${bt.subscription.perMonth})`}
                                            </p>
                                        </div>
                                        <ul className="text-sm text-muted-foreground space-y-1.5">
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {bt.subscription.benefit1}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {bt.subscription.benefit2}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-primary shrink-0" />
                                                {bt.subscription.benefit3}
                                            </li>
                                        </ul>
                                        <Button
                                            size="lg"
                                            className="w-full"
                                            onClick={handleSubscriptionCheckout}
                                            disabled={!!checkoutLoading}
                                        >
                                            {checkoutLoading === 'subscription' ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Infinity className="h-4 w-4 mr-2" />
                                            )}
                                            {checkoutLoading === 'subscription' ? bt.checkout.redirecting : bt.subscription.subscribe}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })()}
                </motion.div>
            )}

            {/* Transaction History */}
            {transactions.length > 0 && (
                <motion.div variants={itemVariants}>
                    <h3 className="text-lg font-semibold mb-4">{bt.history.title}</h3>
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 font-medium">{bt.history.date}</th>
                                            <th className="text-left p-3 font-medium">{bt.history.description}</th>
                                            <th className="text-right p-3 font-medium">{bt.history.amount}</th>
                                            <th className="text-right p-3 font-medium">{bt.history.balance}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx) => (
                                            <tr key={tx.id} className="border-b last:border-0">
                                                <td className="p-3 text-muted-foreground">
                                                    {new Date(tx.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
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
