import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Infinity as InfinityIcon, Loader2, ExternalLink, Check, XCircle, Zap, ChevronDown } from 'lucide-react';
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
    { id: 'pack_10', credits: 10, priceNet: isEN ? 89 : 149, unitPrice: isEN ? 8.90 : 14.90, label: bt.packs.pack10, coffeeLabel: bt.packs.coffeeLatte },
    { id: 'pack_25', credits: 25, priceNet: isEN ? 199 : 299, unitPrice: isEN ? 7.96 : 11.96, label: bt.packs.pack25, badge: bt.packs.popular, savings: bt.packs.savings25, coffeeLabel: bt.packs.coffeeAmericano },
    { id: 'pack_50', credits: 50, priceNet: isEN ? 299 : 499, unitPrice: isEN ? 5.98 : 9.98, label: bt.packs.pack50, badge: bt.packs.bestValue, savings: bt.packs.savings50, coffeeLabel: bt.packs.coffeeEspresso },
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

/* ── Custom SVG coffee cup with animated steam ── */
function CoffeeSvgAnimation() {
    return (
        <motion.div
            className="relative shrink-0 w-16 h-16 md:w-20 md:h-20"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
        >
            {/* Warm glow behind cup */}
            <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-xl" />

            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative w-full h-full">
                <defs>
                    <linearGradient id="cupGrad" x1="16" y1="24" x2="16" y2="52">
                        <stop offset="0%" stopColor="#8B6914" />
                        <stop offset="100%" stopColor="#5C3D0E" />
                    </linearGradient>
                    <linearGradient id="coffeeGrad" x1="20" y1="28" x2="20" y2="34">
                        <stop offset="0%" stopColor="#6F4E37" />
                        <stop offset="100%" stopColor="#3E2723" />
                    </linearGradient>
                </defs>

                {/* Saucer */}
                <ellipse cx="32" cy="54" rx="22" ry="4" fill="#D4C5A9" opacity="0.5" />
                <ellipse cx="32" cy="53" rx="20" ry="3.5" fill="#E8DCC8" opacity="0.7" />

                {/* Cup body */}
                <path d="M14 28 L14 46 Q14 52 22 52 L42 52 Q50 52 50 46 L50 28 Z" fill="url(#cupGrad)" opacity="0.9" />

                {/* Coffee liquid surface */}
                <ellipse cx="32" cy="28" rx="18" ry="4" fill="url(#coffeeGrad)" />

                {/* Cup rim highlight */}
                <ellipse cx="32" cy="28" rx="18" ry="4" fill="none" stroke="#C4A35A" strokeWidth="1" opacity="0.6" />

                {/* Handle */}
                <path d="M50 32 Q58 32 58 40 Q58 48 50 48" fill="none" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

                {/* Steam paths — animated with Framer Motion */}
                <motion.path
                    d="M24 24 Q22 18 26 14 Q30 10 27 4"
                    stroke="#8B6914"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 0.4, 0.3, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.6,
                    }}
                />
                <motion.path
                    d="M32 24 Q34 16 30 12 Q26 8 30 2"
                    stroke="#8B6914"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 0.45, 0.35, 0],
                    }}
                    transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1.0,
                    }}
                />
                <motion.path
                    d="M40 24 Q42 19 38 14 Q34 9 38 4"
                    stroke="#8B6914"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    fill="none"
                    opacity={0}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                        pathLength: [0, 1, 1, 0],
                        opacity: [0, 0.35, 0.25, 0],
                    }}
                    transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1.4,
                    }}
                />
            </svg>
        </motion.div>
    );
}

/* ── Floating sparkle particle ── */
function FloatingSparkle({ delay, x, duration, size = 'sm' }: { delay: number; x: number; duration: number; size?: 'sm' | 'md' }) {
    return (
        <motion.div
            className={`absolute rounded-full bg-primary/40 ${size === 'md' ? 'w-1.5 h-1.5' : 'w-1 h-1'}`}
            style={{ left: `${x}%`, top: '80%' }}
            animate={{
                y: [0, -30, -60],
                x: [0, (x > 50 ? 8 : -8), 0],
                opacity: [0, 0.6, 0],
                scale: [0.5, 1, 0.5],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: 'easeInOut',
            }}
        />
    );
}

/* ── Animation variants ── */
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1, y: 0,
        transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
};

const packCardVariants = {
    hidden: { opacity: 0, y: 60, rotateX: 4 },
    show: {
        opacity: 1, y: 0, rotateX: 0,
        transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
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
                    {/* ===== 1. SUBSCRIPTION SECTION ===== */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        {/* Section header */}
                        <div className="space-y-1">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                                {bt.subscription.header}
                            </h2>
                            <p className="text-muted-foreground">
                                {bt.subscription.headerSubtitle}
                            </p>
                        </div>

                        {/* Subscription card — animated gradient border */}
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
                                <CardContent className="relative p-6 md:p-8 overflow-hidden">
                                    {/* Shimmer overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer pointer-events-none" />

                                    {/* Floating sparkle particles */}
                                    <FloatingSparkle delay={0} x={15} duration={3.5} />
                                    <FloatingSparkle delay={1.2} x={45} duration={4} />
                                    <FloatingSparkle delay={2.1} x={75} duration={3.2} />
                                    <FloatingSparkle delay={0.8} x={90} duration={3.8} />
                                    <FloatingSparkle delay={1.8} x={30} duration={3.6} size="md" />
                                    <FloatingSparkle delay={0.4} x={60} duration={4.2} size="md" />

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
                                                    <Zap className="h-5 w-5 text-primary" />
                                                </motion.div>
                                                <div>
                                                    <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent">
                                                        {bt.subscription.title}
                                                    </h3>
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
                                                            initial={{ scale: 0, rotate: -20 }}
                                                            animate={{ scale: 1, rotate: 0 }}
                                                            transition={{
                                                                type: 'spring',
                                                                stiffness: 500,
                                                                damping: 12,
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

                                            {/* Energy bar */}
                                            <motion.div
                                                className="h-1 w-24 rounded-full bg-gradient-to-r from-primary via-blue-400 to-primary/50 mt-3"
                                                initial={{ scaleX: 0, opacity: 0 }}
                                                animate={{ scaleX: 1, opacity: 1 }}
                                                transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }}
                                                style={{ transformOrigin: 'left' }}
                                            />
                                        </div>

                                        {/* Right: price + CTA */}
                                        <div className="relative text-center lg:text-right space-y-4 lg:min-w-[220px]">
                                            {/* Price glow backdrop */}
                                            <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-xl pointer-events-none" />
                                            <div className="relative">
                                                <motion.div
                                                    className="flex items-baseline justify-center lg:justify-end gap-1"
                                                    initial={{ filter: 'blur(8px)', opacity: 0 }}
                                                    animate={{ filter: 'blur(0px)', opacity: 1 }}
                                                    transition={{ duration: 0.8, delay: 0.4 }}
                                                >
                                                    {isEN && <span className="text-3xl font-bold">$</span>}
                                                    <span className="text-5xl font-bold tracking-tight">{displayPrice}</span>
                                                    <span className="text-muted-foreground text-lg">{isEN ? '' : ' PLN'}{bt.subscription.perMonth}</span>
                                                </motion.div>
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

                    {/* ===== 2. DIVIDER ===== */}
                    <motion.div variants={itemVariants} className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm font-medium text-muted-foreground px-2">{bt.orBuyPack}</span>
                        <div className="flex-1 h-px bg-border" />
                    </motion.div>

                    {/* ===== 3. PACKS SECTION ===== */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        {/* Packs header with coffee animation */}
                        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-6">
                            <CoffeeSvgAnimation />
                            <div className="flex-1 space-y-1.5 text-center md:text-left">
                                <h2 className="text-2xl font-bold tracking-tight">
                                    {bt.packs.header}
                                </h2>
                                <p className="text-muted-foreground text-sm">
                                    {bt.packs.headerSubtitle}
                                </p>
                            </div>
                        </div>

                        {/* Pack cards — 3D perspective container */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ perspective: '800px' }}>
                            {PACKS.map((pack, index) => {
                                const isHighlighted = index === 1;
                                const grossPrice = pack.priceNet * (1 + (isEN ? 0 : VAT_RATE));
                                return (
                                    <motion.div
                                        key={pack.id}
                                        variants={packCardVariants}
                                        whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
                                        className="will-change-transform"
                                    >
                                        <Card className={`relative overflow-hidden h-full flex flex-col transition-shadow duration-300 ${
                                            isHighlighted
                                                ? 'border-primary shadow-lg shadow-primary/10'
                                                : 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'
                                        }`}>
                                            {/* Highlighted card gradient overlay */}
                                            {isHighlighted && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.02] pointer-events-none" />
                                            )}

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

                                                {/* Unit price with coffee reference */}
                                                <div className={`text-center py-2.5 px-3 rounded-lg mb-4 relative ${
                                                    isHighlighted ? 'bg-primary/10' : 'bg-muted/50'
                                                }`}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-lg">☕</span>
                                                        <span className="text-sm font-semibold">
                                                            {formatUnit(pack.unitPrice)} {bt.packs.perSearch}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5">
                                                        {pack.coffeeLabel}
                                                    </div>
                                                </div>

                                                {/* Savings badge */}
                                                {'savings' in pack && pack.savings && (
                                                    <div className="text-center mb-4">
                                                        <motion.div
                                                            animate={{ scale: [1, 1.06, 1] }}
                                                            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                                        >
                                                            <Badge variant="secondary" className="text-xs font-semibold">
                                                                {pack.savings}
                                                            </Badge>
                                                        </motion.div>
                                                    </div>
                                                )}

                                                {/* Spacer */}
                                                <div className="flex-1" />

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

                        {/* No-expiry note under packs */}
                        <p className="text-xs text-muted-foreground text-center">
                            {bt.packs.noExpiry}
                        </p>
                    </motion.div>
                </>
            )}

            {/* ===== 4. TRANSACTION HISTORY (collapsible) ===== */}
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
                                className="overflow-hidden mt-3"
                            >
                                <Card className="shadow-sm">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b bg-muted/40">
                                                        <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.date}</th>
                                                        <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.description}</th>
                                                        <th className="text-right p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.amount}</th>
                                                        <th className="text-right p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{bt.history.balance}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map((tx) => (
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
