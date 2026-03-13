import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Infinity as InfinityIcon, Loader2, ExternalLink, Check, XCircle, Sparkles, Coffee, Wallet, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { t, isEN } from '@/i18n';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { billingService } from '@/services/billing.service';
import type { BillingInfo } from '@/services/billing.service';
import apiClient from '@/services/api.client';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/campaign.types';

const bt = t.settings.billing;

const PACKS = [
    { id: 'pack_10', credits: 10, priceNet: isEN ? 89 : 149, unitPrice: isEN ? 8.90 : 14.90, label: bt.packs.pack10 },
    { id: 'pack_25', credits: 25, priceNet: isEN ? 199 : 299, unitPrice: isEN ? 7.96 : 11.96, label: bt.packs.pack25, badge: bt.packs.popular, savings: bt.packs.savings25 },
    { id: 'pack_50', credits: 50, priceNet: isEN ? 299 : 499, unitPrice: isEN ? 5.98 : 9.98, label: bt.packs.pack50, badge: bt.packs.bestValue, savings: bt.packs.savings50 },
];

const SUBSCRIPTION_PRICE_NET = isEN ? 399 : 599;
const VAT_RATE = 0.23;

function formatPrice(amount: number): string {
    if (isEN) return `$${amount.toFixed(2)}`;
    return `${amount.toFixed(2).replace('.', ',')} PLN`;
}

function formatUnit(amount: number): string {
    if (isEN) return `$${amount.toFixed(2)}`;
    return `${amount.toFixed(2).replace('.', ',')} PLN`;
}

/* ── Count-up animation hook ── */
function useCountUp(target: number, duration = 1.2) {
    const [current, setCurrent] = useState(0);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current || target === 0) return;
        hasRun.current = true;
        const startTime = performance.now();
        const animate = (now: number) => {
            const elapsed = (now - startTime) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCurrent(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [target, duration]);

    return current;
}

/* ── Coffee cup with animated steam ── */
function CoffeeCupAnimation() {
    return (
        <motion.div
            className="relative shrink-0"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
        >
            <Coffee className="w-14 h-14 md:w-16 md:h-16 text-primary" strokeWidth={1.5} />
            {/* Steam wisps */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                <div className="w-0.5 h-5 bg-gradient-to-t from-primary/40 to-transparent rounded-full animate-steam-1" />
                <div className="w-0.5 h-7 bg-gradient-to-t from-primary/30 to-transparent rounded-full animate-steam-2" />
                <div className="w-0.5 h-4 bg-gradient-to-t from-primary/35 to-transparent rounded-full animate-steam-3" />
            </div>
        </motion.div>
    );
}

/* ── Animation variants ── */
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1, y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
};

const packCardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
};

interface BillingTabProps {
    user: User;
}

export function BillingTab({ user }: BillingTabProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const { setUser } = useAuthStore();

    const displayPrice = useCountUp(SUBSCRIPTION_PRICE_NET);

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
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || bt.checkout.paymentError);
            setCheckoutLoading(null);
        }
    }

    async function handleSubscriptionCheckout() {
        setCheckoutLoading('subscription');
        try {
            const { url } = await billingService.createSubscriptionCheckout();
            window.location.href = url;
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || bt.checkout.paymentError);
            setCheckoutLoading(null);
        }
    }

    async function handleManageSubscription() {
        try {
            const { url } = await billingService.createPortalSession();
            window.open(url, '_blank');
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error');
        }
    }

    async function handleCancelSubscription() {
        if (!window.confirm(bt.subscription.cancelConfirm)) return;
        setCancelLoading(true);
        try {
            await billingService.cancelSubscription();
            toast.success(bt.subscription.cancelSuccess);
            loadBillingInfo();
            apiClient.get('/auth/me').then(res => { if (res.data?.id) setUser(res.data); }).catch(() => {});
        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || bt.checkout.paymentError);
        } finally {
            setCancelLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const orgCredits = billingInfo?.orgCredits ?? (user as unknown as Record<string, unknown>)?.orgCredits as number ?? 0;
    const personalCredits = billingInfo?.personalCredits ?? (user as unknown as Record<string, unknown>)?.personalCredits as number ?? 0;
    const totalCredits = orgCredits + personalCredits;
    const effectivePlan = billingInfo?.orgPlan ?? (user as unknown as Record<string, unknown>)?.orgPlan as string ?? billingInfo?.plan ?? user?.plan ?? 'research';
    const isUnlimited = effectivePlan === 'unlimited';
    const hasOrg = (user as unknown as Record<string, unknown>)?.hasOrganization as boolean ?? !!user?.organizationId;
    const transactions = billingInfo?.recentTransactions ?? [];

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
        >
            {isUnlimited ? (
                /* ──── UNLIMITED PLAN — Status card ──── */
                <motion.div variants={itemVariants}>
                    <Card className={billingInfo?.cancelAtPeriodEnd
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent"
                    }>
                        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${billingInfo?.cancelAtPeriodEnd ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
                                    <InfinityIcon className={`h-6 w-6 ${billingInfo?.cancelAtPeriodEnd ? 'text-amber-500' : 'text-primary'}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {hasOrg ? bt.orgUnlimited : bt.subscription.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">
                                        {billingInfo?.cancelAtPeriodEnd
                                            ? `${bt.subscription.cancelPending} ${billingInfo?.currentPeriodEnd ? new Date(billingInfo.currentPeriodEnd).toLocaleDateString(isEN ? 'en-US' : 'pl-PL') : ''}`
                                            : bt.subscription.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="outline" className="px-3 py-1.5 text-base font-medium">
                                    <InfinityIcon className="h-4 w-4 mr-1" />
                                    {bt.unlimited}
                                </Badge>
                                {billingInfo?.hasStripeCustomer && (
                                    <Button variant="outline" onClick={handleManageSubscription}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        {bt.subscription.manage}
                                    </Button>
                                )}
                                {!billingInfo?.cancelAtPeriodEnd && (
                                    <Button
                                        variant="ghost"
                                        className="text-destructive hover:text-destructive"
                                        onClick={handleCancelSubscription}
                                        disabled={cancelLoading}
                                    >
                                        {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                                        {bt.subscription.cancelButton}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <>
                    {/* ===== 1. HERO — Coffee animation + copy ===== */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center gap-6 md:gap-8 pt-2">
                        <CoffeeCupAnimation />
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h2 className="text-2xl font-bold tracking-tight">
                                {bt.hero.title}
                            </h2>
                            <p className="text-muted-foreground">
                                {bt.hero.subtitle}
                            </p>
                            {totalCredits > 0 && (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20">
                                    <Wallet className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">
                                        {totalCredits} {bt.creditsAvailable}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ===== 2. SUBSCRIPTION — Animated gradient border ===== */}
                    <motion.div variants={itemVariants}>
                        <div className="relative p-[2px] rounded-xl overflow-hidden">
                            {/* Rotating conic-gradient border */}
                            <div
                                className="absolute inset-0 animate-border-rotate"
                                style={{
                                    background: 'conic-gradient(from var(--border-angle, 0deg), hsl(226 100% 55%) 0%, transparent 25%, transparent 75%, hsl(226 100% 55%) 100%)',
                                }}
                            />
                            {/* Glow layer */}
                            <div
                                className="absolute inset-0 animate-border-rotate blur-md"
                                style={{
                                    background: 'conic-gradient(from var(--border-angle, 0deg), hsl(226 100% 55% / 0.3) 0%, transparent 25%, transparent 75%, hsl(226 100% 55% / 0.3) 100%)',
                                }}
                            />

                            <Card className="relative bg-card z-10">
                                <CardContent className="relative p-6 md:p-8">
                                    {/* Shimmer overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer pointer-events-none" />

                                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                                        {/* Left: icon + title + benefits */}
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <motion.div
                                                    className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
                                                    initial={{ scale: 0, rotate: -90 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                                                >
                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-xl font-bold">{bt.subscription.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{bt.subscription.description}</p>
                                                </div>
                                            </div>

                                            <ul className="space-y-2.5">
                                                {[bt.subscription.benefit1, bt.subscription.benefit2, bt.subscription.benefit3].map((benefit, i) => (
                                                    <motion.li
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{
                                                            type: 'spring',
                                                            stiffness: 400,
                                                            damping: 15,
                                                            delay: 0.5 + i * 0.15,
                                                        }}
                                                        className="flex items-center gap-2.5 text-sm"
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 500,
                                                                damping: 15,
                                                                delay: 0.6 + i * 0.15,
                                                            }}
                                                            className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                                                        >
                                                            <Check className="h-3 w-3 text-primary" />
                                                        </motion.div>
                                                        {benefit}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Right: price + CTA */}
                                        <div className="text-center lg:text-right space-y-4 lg:min-w-[220px]">
                                            <div>
                                                <div className="flex items-baseline justify-center lg:justify-end gap-1">
                                                    {isEN && <span className="text-3xl font-bold">$</span>}
                                                    <span className="text-5xl font-bold tracking-tight">{displayPrice}</span>
                                                    <span className="text-muted-foreground text-lg">{isEN ? '' : ' PLN'}{bt.subscription.perMonth}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {isEN ? bt.vat : `${bt.vat} (${formatPrice(SUBSCRIPTION_PRICE_NET * (1 + VAT_RATE))} ${bt.gross}${bt.subscription.perMonth})`}
                                                </p>
                                            </div>

                                            <Button
                                                size="lg"
                                                className="w-full lg:w-auto px-8"
                                                onClick={handleSubscriptionCheckout}
                                                disabled={!!checkoutLoading}
                                            >
                                                {checkoutLoading === 'subscription' ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <InfinityIcon className="h-4 w-4 mr-2" />
                                                )}
                                                {checkoutLoading === 'subscription' ? bt.checkout.redirecting : bt.subscription.subscribe}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* ===== 3. DIVIDER ===== */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm font-medium text-muted-foreground px-2">{bt.orBuyPack}</span>
                        <div className="flex-1 h-px bg-border" />
                    </motion.div>

                    {/* ===== 4. PACK CARDS ===== */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PACKS.map((pack, index) => {
                            const isHighlighted = index === 1;
                            const grossPrice = pack.priceNet * (1 + (isEN ? 0 : VAT_RATE));
                            return (
                                <motion.div
                                    key={pack.id}
                                    variants={packCardVariants}
                                    whileHover={{ y: -4 }}
                                    className="will-change-transform"
                                >
                                    <Card className={`relative overflow-hidden h-full flex flex-col transition-shadow duration-200 ${
                                        isHighlighted
                                            ? 'border-primary shadow-lg animate-pulse-ring'
                                            : 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'
                                    }`}>
                                        {/* Badge */}
                                        {pack.badge && (
                                            <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg ${
                                                isHighlighted
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {pack.badge}
                                            </div>
                                        )}

                                        <CardContent className="p-6 flex flex-col flex-1">
                                            {/* Credits count */}
                                            <div className="text-center mb-4">
                                                <div className="text-4xl font-bold">{pack.credits}</div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    {isEN ? 'searches' : 'wyszukiwań'}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-center mb-4">
                                                <div className="text-2xl font-bold">
                                                    {isEN ? `$${pack.priceNet}` : `${pack.priceNet} PLN`}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {isEN ? bt.vat : `${bt.vat} (${formatPrice(grossPrice)} ${bt.gross})`}
                                                </div>
                                            </div>

                                            {/* Unit price */}
                                            <div className={`text-center py-2 px-3 rounded-md mb-4 ${
                                                isHighlighted ? 'bg-primary/10' : 'bg-muted/50'
                                            }`}>
                                                <span className="text-sm font-medium">
                                                    {formatUnit(pack.unitPrice)} {bt.packs.perSearch}
                                                </span>
                                            </div>

                                            {/* Savings badge */}
                                            {'savings' in pack && pack.savings && (
                                                <div className="text-center mb-4">
                                                    <motion.div
                                                        animate={{ scale: [1, 1.05, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                                    >
                                                        <Badge variant="secondary" className="text-xs">
                                                            {pack.savings}
                                                        </Badge>
                                                    </motion.div>
                                                </div>
                                            )}

                                            {/* No-expiry note */}
                                            <p className="text-xs text-muted-foreground text-center mb-4 flex-1">
                                                {bt.packs.noExpiry}
                                            </p>

                                            {/* CTA Button */}
                                            <Button
                                                className="w-full"
                                                variant={isHighlighted ? 'default' : 'outline'}
                                                onClick={() => handleCreditCheckout(pack.id)}
                                                disabled={!!checkoutLoading}
                                            >
                                                {checkoutLoading === pack.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                ) : (
                                                    <Search className="h-4 w-4 mr-2" />
                                                )}
                                                {checkoutLoading === pack.id
                                                    ? bt.checkout.redirecting
                                                    : `${bt.packs.buy} — ${isEN ? `$${pack.priceNet}` : `${pack.priceNet} PLN`}`}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ===== 5. TRANSACTION HISTORY (collapsible) ===== */}
            {transactions.length > 0 && (
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => setHistoryOpen(!historyOpen)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                        <motion.div
                            animate={{ rotate: historyOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </motion.div>
                        {historyOpen ? bt.hideHistory : bt.showHistory}
                    </button>

                    <AnimatePresence>
                        {historyOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
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
                                                            <td className="p-3">
                                                                <span>{tx.description || tx.type}</span>
                                                                {hasOrg && tx.source && (
                                                                    <Badge variant="outline" className="ml-2 text-[10px] px-1.5 py-0">
                                                                        {tx.source === 'org' ? bt.sourceOrg : bt.sourcePersonal}
                                                                    </Badge>
                                                                )}
                                                            </td>
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
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    );
}
