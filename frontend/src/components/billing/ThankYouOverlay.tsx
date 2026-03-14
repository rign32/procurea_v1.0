import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import { t, isEN } from '@/i18n';

interface ThankYouOverlayProps {
    open: boolean;
    onClose: () => void;
}

const CONFETTI_COLORS = [
    '#5E8C8F', '#2A5C5D', '#ec4899', '#f59e0b',
    '#10b981', '#C5E0E2', '#ef4444', '#14b8a6',
];

// Deterministic pseudo-random based on index (no Math.random in render)
function seededRand(seed: number): number {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

// Precompute all confetti configs outside render
const CONFETTI_CONFIGS = Array.from({ length: 40 }).map((_, i) => {
    const r1 = seededRand(i * 7 + 1);
    const r2 = seededRand(i * 7 + 2);
    const r3 = seededRand(i * 7 + 3);
    const r4 = seededRand(i * 7 + 4);
    const r5 = seededRand(i * 7 + 5);
    const r6 = seededRand(i * 7 + 6);
    const r7 = seededRand(i * 7 + 7);

    const angle = (i / 40) * Math.PI * 2 + (r1 - 0.5) * 0.5;
    const velocity = 200 + r2 * 300;
    const x = Math.cos(angle) * velocity;
    const y = Math.sin(angle) * velocity - 100;
    const rotation = r3 * 720 - 360;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const size = 4 + r4 * 6;
    const isRect = r5 > 0.5;
    const duration = 1.8 + r6 * 0.8;
    const delay = r7 * 0.3;

    return { x, y, rotation, color, size, isRect, duration, delay };
});

function ConfettiPiece({ index }: { index: number }) {
    const config = CONFETTI_CONFIGS[index];

    return (
        <motion.div
            className="absolute"
            style={{
                width: config.size,
                height: config.isRect ? config.size * 2.5 : config.size,
                backgroundColor: config.color,
                borderRadius: config.isRect ? '1px' : '50%',
                left: '50%',
                top: '45%',
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
            animate={{
                x: config.x,
                y: config.y + 200,
                rotate: config.rotation,
                opacity: [1, 1, 0],
                scale: [1, 1, 0.5],
            }}
            transition={{
                duration: config.duration,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: config.delay,
            }}
        />
    );
}

export function ThankYouOverlay({ open, onClose }: ThankYouOverlayProps) {
    useEffect(() => {
        if (!open) return;
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

                    {/* Confetti burst */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {CONFETTI_CONFIGS.map((_, i) => (
                            <ConfettiPiece key={i} index={i} />
                        ))}
                    </div>

                    {/* Content card */}
                    <motion.div
                        className="relative bg-card border rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-md mx-4"
                        initial={{ scale: 0.5, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <motion.div
                            className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center"
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                        >
                            <PartyPopper className="h-8 w-8 text-primary" />
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            className="text-2xl md:text-3xl font-bold mb-3"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                        >
                            {isEN ? 'Thank you!' : 'Dziękujemy!'}
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            className="text-muted-foreground mb-6"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                        >
                            {t.settings.billing.checkout.success}
                        </motion.p>

                        {/* Dismiss hint */}
                        <motion.p
                            className="text-xs text-muted-foreground/60"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                        >
                            {t.settings.billing.clickToClose}
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
