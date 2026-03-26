import { useEffect, useState, useCallback } from 'react';
import websocketService from '../services/websocket.service';
import type { Socket } from 'socket.io-client';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for WebSocket connection
 * @param namespace WebSocket namespace (default: 'sourcing')
 * @param autoConnect Auto-connect on mount (default: true)
 */
export function useWebSocket(
  namespace: string = 'sourcing',
  autoConnect: boolean = true
): UseWebSocketReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      const socketInstance = websocketService.connect(namespace);
      setSocket(socketInstance);
      setError(null);

      // Listen for connection status changes
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (err) => {
        setError(err.message);
        setIsConnected(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [namespace]);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      // Defer to avoid synchronous setState in effect
      queueMicrotask(() => connect());
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
  };
}

export default useWebSocket;
