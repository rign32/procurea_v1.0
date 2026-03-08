import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface BlacklistDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    supplierName: string;
    isSubmitting?: boolean;
}

export function BlacklistDialog({
    isOpen,
    onClose,
    onConfirm,
    supplierName,
    isSubmitting = false,
}: BlacklistDialogProps) {
    const [reason, setReason] = useState('');

    const handleConfirm = () => {
        onConfirm(reason);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="h-5 w-5" />
                        Dodaj do Blacklisty
                    </DialogTitle>
                    <DialogDescription>
                        Czy na pewno chcesz dodać <strong>{supplierName}</strong> do Blacklisty? Ten dostawca nie będzie brany pod uwagę w przyszłych kampaniach.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="reason" className="text-sm font-medium">
                            Powód (opcjonalnie)
                        </label>
                        <Textarea
                            id="reason"
                            placeholder="np. Słaba jakość komunikacji, nierealistyczne ceny..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none h-24"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Anuluj
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <ShieldAlert className="h-4 w-4 mr-2" />
                        )}
                        Dodaj do Blacklisty
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
