import { useState } from 'react';
import { Gift, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PL } from '@/i18n/pl';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

interface BillingTabProps {
    user: any;
}

export function BillingTab({ user }: BillingTabProps) {
    const [acknowledged, setAcknowledged] = useState(false);

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-2xl mx-auto mt-8"
        >
            <Card className="border-primary/20 shadow-lg text-center p-6">
                <CardHeader>
                    <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Gift className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Wersja testowa</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Wszystkie funkcje premium są obecnie włączone za darmo w ramach wczesnego dostępu do platformy Procurea.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!acknowledged ? (
                        <Button
                            size="lg"
                            className="mt-4"
                            onClick={() => {
                                setAcknowledged(true);
                                toast.success('Dziękujemy za korzystanie z Procurea!');
                            }}
                        >
                            Rozumiem
                        </Button>
                    ) : (
                        <div className="flex items-center justify-center text-green-600 font-medium mt-4 gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            <span>Konto premium jest aktywne</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
