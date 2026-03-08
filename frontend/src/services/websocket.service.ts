import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from './api.client';
import type {
  CampaignLogEvent,
  CampaignProgressEvent,
  SupplierUpdateEvent,
} from '../types/campaign.types';

/**
 * WebSocket Service - Socket.IO client wrapper
 */

interface WebSocketCallbacks {
  onLog?: (event: CampaignLogEvent) => void;
  onProgress?: (event: CampaignProgressEvent) => void;
  onSupplierUpdate?: (event: SupplierUpdateEvent) => void;
  onCompleted?: (data: { campaignId: string; status: string }) => void;
  onError?: (error: any) => void;
}

type ConnectionListener = (connected: boolean) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private connectionListeners: Set<ConnectionListener> = new Set();

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    // Immediately notify with current status
    listener(this.connected);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  private notifyConnectionChange(status: boolean) {
    this.isConnected = status;
    this.connectionListeners.forEach(listener => listener(this.connected));
  }

  /**
   * Połącz z WebSocket namespace
   */
  connect(namespace: string = 'sourcing'): Socket {
    // In production (Cloud Functions), WS_BASE_URL is empty — skip connection, use polling fallback
    if (!WS_BASE_URL) {
      this.notifyConnectionChange(false);
      return null as unknown as Socket;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(`${WS_BASE_URL}/${namespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    this.socket.on('connect', () => {
      this.notifyConnectionChange(true);
      console.log(`[WebSocket] Connected to /${namespace}`);
    });

    this.socket.on('disconnect', (reason) => {
      this.notifyConnectionChange(false);
      console.log(`[WebSocket] Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      this.notifyConnectionChange(false);
      console.error('[WebSocket] Connection error:', error.message);
    });

    return this.socket;
  }

  /**
   * Rozłącz WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Sprawdź czy połączony
   */
  get connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Dołącz do pokoju kampanii (subscribe to campaign updates)
   */
  joinCampaignRoom(campaignId: string): void {
    if (!this.socket) return; // No-op when WS disabled (polling mode)
    this.socket.emit('joinRoom', { campaignId });
    console.log(`[WebSocket] Joined campaign room: ${campaignId}`);
  }

  /**
   * Opuść pokój kampanii
   */
  leaveCampaignRoom(campaignId: string): void {
    if (!this.socket) return;
    this.socket.emit('leaveRoom', { campaignId });
    console.log(`[WebSocket] Left campaign room: ${campaignId}`);
  }

  /**
   * Nasłuchuj eventów kampanii
   */
  subscribeToCampaignEvents(callbacks: WebSocketCallbacks): () => void {
    if (!this.socket) {
      return () => {}; // No-op cleanup when WS disabled (polling mode)
    }

    // Register event listeners
    if (callbacks.onLog) {
      this.socket.on('campaign.log', callbacks.onLog);
    }

    if (callbacks.onProgress) {
      this.socket.on('campaign.progress', callbacks.onProgress);
    }

    if (callbacks.onSupplierUpdate) {
      this.socket.on('campaign.supplier_update', callbacks.onSupplierUpdate);
    }

    if (callbacks.onCompleted) {
      this.socket.on('campaign.completed', callbacks.onCompleted);
    }

    if (callbacks.onError) {
      this.socket.on('campaign.error', callbacks.onError);
    }

    // Return cleanup function
    return () => {
      if (!this.socket) return;

      this.socket.off('campaign.log');
      this.socket.off('campaign.progress');
      this.socket.off('campaign.supplier_update');
      this.socket.off('campaign.completed');
      this.socket.off('campaign.error');
    };
  }

  /**
   * Pobierz instancję Socket (dla custom eventów)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;
