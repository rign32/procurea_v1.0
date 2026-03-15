import { useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { BillingTab } from '@/components/settings/BillingTab';
import { useAuthStore } from '@/stores/auth.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { analytics } from '@/lib/analytics';
import { apiClient } from '@/services/api.client';

interface BillingModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function BillingModal({ open, onOpenChange }: BillingModalProps) {
    const { user } = useAuthStore();

    useEffect(() => {
        if (open) {
            analytics.billingModalOpen();
            apiClient.post('/billing/track-view', { planId: 'billing_modal', source: 'modal' }).catch(() => {});
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-xl">
                <VisuallyHidden>
                    <DialogTitle>Plan</DialogTitle>
                </VisuallyHidden>
                <div className="p-6 md:p-8">
                    <BillingTab user={user} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
