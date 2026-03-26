/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, react-hooks/refs */
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import websocketService from '../services/websocket.service';
import campaignsService, { inferLogLevel } from '../services/campaigns.service';
import useCampaignsStore from '../stores/campaigns.store';
import type {
  CampaignLog,
  CampaignStage,
  Supplier,
} from '../types/campaign.types';

interface ContactProgress {
  supplierName: string;
  status: string;
  contactsFound: number;
  level?: string;
}

interface UseRealTimeMonitorReturn {
  logs: CampaignLog[];
  suppliers: Supplier[];
  progress: Record<CampaignStage, number>;
  isConnected: boolean;
  isPolling: boolean;
  completedSignal: number;
  contactProgress: ContactProgress[];
}

/**
 * Custom hook for real-time campaign monitoring
 * Uses WebSocket as primary, with polling fallback
 */
export function useRealTimeMonitor(
  campaignId: string,
  enabled: boolean = true
): UseRealTimeMonitorReturn {
  const {
    logs,
    suppliers,
    addLog,
    addSupplier,
    updateActiveCampaign,
    clearLogs,
    clearSuppliers,
  } = useCampaignsStore();

  const [wsConnected, setWsConnected] = useState(false);
  const [completedSignal, setCompletedSignal] = useState(0);
  const [contactProgress, setContactProgress] = useState<ContactProgress[]>([]);
  const lastLogTimestamp = useRef<string | undefined>(undefined);
  const previousCampaignId = useRef<string | undefined>(undefined);
  const recentLogHashes = useRef<Set<string>>(new Set());

  const progressRef = useRef<Record<CampaignStage, number>>({
    STRATEGY: 0,
    SCANNING: 0,
    ANALYSIS: 0,
    ENRICHMENT: 0,
    AUDIT: 0,
    COMPLETED: 0,
  });

  // WebSocket connection
  useEffect(() => {
    if (!enabled || !campaignId) return;

    // Only clear data when switching FROM one campaign TO another (not on initial mount)
    if (previousCampaignId.current && previousCampaignId.current !== campaignId) {
      clearLogs();
      clearSuppliers();
      lastLogTimestamp.current = undefined;
    }
    // Always update the ref to track current campaign
    previousCampaignId.current = campaignId;

    // Subscribe to connection status changes
    const unsubConnection = websocketService.onConnectionChange(setWsConnected);

    websocketService.connect('sourcing');
    websocketService.joinCampaignRoom(campaignId);

    // Backend event shapes:
    //   campaign.log → { message }
    //   campaign.progress → { stage, progress }
    //   campaign.supplier_update → { url, status, data? }
    //   campaign.completed / campaign.error → never emitted
    const cleanup = websocketService.subscribeToCampaignEvents({
      onLog: (event: any) => {
        const message = event.message || '';
        // Deduplicate: skip identical messages received within 2s window
        const hash = message;
        if (recentLogHashes.current.has(hash)) return;
        recentLogHashes.current.add(hash);
        setTimeout(() => recentLogHashes.current.delete(hash), 2000);

        const log: CampaignLog = {
          id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
          campaignId: campaignId,
          message: message,
          level: inferLogLevel(message),
          timestamp: new Date().toISOString(),
        };
        addLog(log);
        lastLogTimestamp.current = log.timestamp;
      },

      onProgress: (event: any) => {
        const stage = event.stage as CampaignStage;
        const progress = event.progress || 0;
        progressRef.current[stage] = progress;
        updateActiveCampaign({ stage });

        // Detect completion via progress (backend emits 'COMPLETED', 100)
        if (stage === 'COMPLETED' && progress === 100) {
          updateActiveCampaign({ status: 'COMPLETED', stage: 'COMPLETED' });
          setCompletedSignal(prev => prev + 1);
        }
      },

      onSupplierUpdate: (event: any) => {
        if (event.data) {
          addSupplier(event.data as Supplier);
          const s = event.data as Supplier;
          if (s.name) {
            setContactProgress(prev => {
              const existing = prev.find(p => p.supplierName === s.name);
              if (existing) {
                return prev.map(p => p.supplierName === s.name
                  ? { ...p, status: event.status || 'found', contactsFound: (s as any).contacts?.length || 0, level: (s as any).contactLevel || p.level }
                  : p);
              }
              return [...prev, { supplierName: s.name, status: event.status || 'found', contactsFound: (s as any).contacts?.length || 0, level: (s as any).contactLevel }];
            });
          }
        }
      },

      // Backend doesn't emit these, but keep as safety net
       
      onCompleted: (data: any) => {
        updateActiveCampaign({ status: data?.status || 'COMPLETED', stage: 'COMPLETED' });
        progressRef.current.COMPLETED = 100;
        setCompletedSignal(prev => prev + 1);
      },
      onError: (error: any) => {
        console.error('[RealTimeMonitor] Campaign error:', error);
        updateActiveCampaign({ status: 'ERROR' });
      },
    });

    return () => {
      cleanup();
      unsubConnection();
      websocketService.leaveCampaignRoom(campaignId);
    };
  }, [campaignId, enabled, addLog, addSupplier, updateActiveCampaign, clearLogs, clearSuppliers]);

  // Polling fallback (when WebSocket doesn't connect)
  const { data: polledData, isLoading } = useQuery({
    queryKey: ['campaign-logs', campaignId],
    queryFn: () => campaignsService.getLogs(campaignId, lastLogTimestamp.current),
    enabled: enabled && !wsConnected,
    refetchInterval: 3000,
    staleTime: 1000,
    refetchOnMount: 'always',  // Fetch immediately on mount (no 3-second delay)
    initialData: undefined,     // No cache, always fetch fresh
  });

  // Update store with polled data (deduplicate by timestamp)
  useEffect(() => {
    if (polledData && !wsConnected) {
      polledData.logs
        .filter(log => !lastLogTimestamp.current || log.timestamp > lastLogTimestamp.current)
        .forEach(log => addLog(log));

      // Process polled suppliers (addSupplier deduplicates by id)
      if (polledData.suppliers?.length > 0) {
        polledData.suppliers.forEach((s: any) => addSupplier(s as Supplier));
      }

      updateActiveCampaign({
        status: polledData.status as any,
        stage: polledData.stage as CampaignStage,
      });

      if (polledData.logs.length > 0) {
        lastLogTimestamp.current = polledData.logs[polledData.logs.length - 1].timestamp;
      }
    }
  }, [polledData, addLog, addSupplier, updateActiveCampaign]);

  return {
    logs,
    suppliers,
    progress: progressRef.current,
    isConnected: wsConnected,
    isPolling: !wsConnected && isLoading,
    completedSignal,
    contactProgress,
  };
}

export default useRealTimeMonitor;
