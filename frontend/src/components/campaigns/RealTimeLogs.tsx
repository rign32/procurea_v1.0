import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CampaignLog } from '@/types/campaign.types';
import { t } from '@/i18n';

interface RealTimeLogsProps {
  logs: CampaignLog[];
  isConnected?: boolean;
  isPolling?: boolean;
  maxHeight?: string;
}

export function RealTimeLogs({ logs, isConnected = false, isPolling = false, maxHeight = '600px' }: RealTimeLogsProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const getLogIcon = (level: CampaignLog['level']) => {
    switch (level) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogColor = (level: CampaignLog['level']) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-green-700 dark:text-green-400';
      case 'ERROR':
        return 'text-red-700 dark:text-red-400';
      case 'WARNING':
        return 'text-yellow-700 dark:text-yellow-400';
      default:
        return 'text-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>{t.campaigns.detail.realTimeLogs}</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : isPolling ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live' : isPolling ? 'Polling' : 'Offline'}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div
          ref={containerRef}
          className="h-full overflow-y-auto px-6 pb-4"
          style={{ maxHeight }}
        >
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <p>Oczekiwanie na logi...</p>
            </div>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, index) => (
                <div
                  key={`${log.id}-${index}`}
                  className="flex gap-3 py-1 hover:bg-muted/50 rounded px-2 -mx-2 transition-colors"
                >
                  <div className="flex-shrink-0 pt-0.5">{getLogIcon(log.level)}</div>
                  <span className="flex-shrink-0 text-muted-foreground w-20">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className={`flex-1 ${getLogColor(log.level)}`}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RealTimeLogs;
