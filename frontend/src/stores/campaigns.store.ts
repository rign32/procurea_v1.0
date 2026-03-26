import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Campaign, CampaignLog, Supplier } from '../types/campaign.types';

interface CampaignsState {
  // State
  campaigns: Campaign[];
  activeCampaign: Campaign | null;
  suppliers: Supplier[];
  logs: CampaignLog[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  removeCampaign: (id: string) => void;

  setActiveCampaign: (campaign: Campaign | null) => void;
  updateActiveCampaign: (updates: Partial<Campaign>) => void;

  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  clearSuppliers: () => void;

  setLogs: (logs: CampaignLog[]) => void;
  addLog: (log: CampaignLog) => void;
  clearLogs: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  reset: () => void;
}

const initialState = {
  campaigns: [],
  activeCampaign: null,
  suppliers: [],
  logs: [],
  isLoading: false,
  error: null,
};

export const useCampaignsStore = create<CampaignsState>()(
  devtools(
    (set, _get) => ({
      ...initialState,

      // Campaigns actions
      setCampaigns: (campaigns) => set({ campaigns }, false, 'setCampaigns'),

      addCampaign: (campaign) =>
        set(
          (state) => ({ campaigns: [campaign, ...state.campaigns] }),
          false,
          'addCampaign'
        ),

      updateCampaign: (id, updates) =>
        set(
          (state) => ({
            campaigns: state.campaigns.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          }),
          false,
          'updateCampaign'
        ),

      removeCampaign: (id) =>
        set(
          (state) => ({
            campaigns: state.campaigns.filter((c) => c.id !== id),
          }),
          false,
          'removeCampaign'
        ),

      // Active campaign actions
      setActiveCampaign: (campaign) =>
        set({ activeCampaign: campaign }, false, 'setActiveCampaign'),

      updateActiveCampaign: (updates) =>
        set(
          (state) => ({
            activeCampaign: state.activeCampaign
              ? { ...state.activeCampaign, ...updates }
              : null,
          }),
          false,
          'updateActiveCampaign'
        ),

      // Suppliers actions
      setSuppliers: (suppliers) => set({ suppliers }, false, 'setSuppliers'),

      addSupplier: (supplier) =>
        set(
          (state) => {
            // Deduplicate by ID
            const exists = state.suppliers.some((s) => s.id === supplier.id);
            if (exists) {
              return {
                suppliers: state.suppliers.map((s) =>
                  s.id === supplier.id ? supplier : s
                ),
              };
            }
            return { suppliers: [...state.suppliers, supplier] };
          },
          false,
          'addSupplier'
        ),

      updateSupplier: (id, updates) =>
        set(
          (state) => ({
            suppliers: state.suppliers.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          }),
          false,
          'updateSupplier'
        ),

      clearSuppliers: () => set({ suppliers: [] }, false, 'clearSuppliers'),

      // Logs actions
      setLogs: (logs) => set({ logs }, false, 'setLogs'),

      addLog: (log) =>
        set(
          (state) => {
            // Keep only last 500 logs to prevent memory leak
            const newLogs = [...state.logs, log];
            if (newLogs.length > 500) {
              newLogs.shift();
            }
            return { logs: newLogs };
          },
          false,
          'addLog'
        ),

      clearLogs: () => set({ logs: [] }, false, 'clearLogs'),

      // Loading & Error actions
      setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
      setError: (error) => set({ error }, false, 'setError'),

      // Reset all state
      reset: () => set(initialState, false, 'reset'),
    }),
    {
      name: 'campaigns-store',
      enabled: import.meta.env.DEV, // DevTools only in development
    }
  )
);

export default useCampaignsStore;
