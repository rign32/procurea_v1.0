import { create } from 'zustand';

interface UIStore {
    billingModalOpen: boolean;
    openBillingModal: () => void;
    closeBillingModal: () => void;
    setBillingModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
    billingModalOpen: false,
    openBillingModal: () => set({ billingModalOpen: true }),
    closeBillingModal: () => set({ billingModalOpen: false }),
    setBillingModalOpen: (open) => set({ billingModalOpen: open }),
}));
