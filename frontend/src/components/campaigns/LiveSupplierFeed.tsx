import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SupplierCard } from '../suppliers/SupplierCard';
import { rfqsService } from '@/services/rfqs.service';
import type { Supplier } from '@/types/supplier.types';
import { t } from '@/i18n';

const MAX_SECONDS = 2 * 60; // 2 minutes

function WaitingForResults({ isRunning, campaignStartedAt }: { isRunning?: boolean; campaignStartedAt?: string; onStop?: () => void }) {
  const calcRemaining = useCallback(() => {
    if (!campaignStartedAt) return MAX_SECONDS;
    const elapsed = Math.floor((Date.now() - new Date(campaignStartedAt).getTime()) / 1000);
    return Math.max(0, MAX_SECONDS - elapsed);
  }, [campaignStartedAt]);

  const [secondsLeft, setSecondsLeft] = useState(calcRemaining);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft(calcRemaining());
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, calcRemaining]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!isRunning) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t.feed.waitingForResults}</p>
        <p className="text-sm mt-2">{t.feed.suppliersAppearHere}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 space-y-6">
      <p className="text-lg font-medium">{t.feed.searching}</p>
      <div className="flex justify-center">
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
            className="text-muted/30" strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
            className="text-primary" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - secondsLeft / MAX_SECONDS)}`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            className="text-xl font-bold fill-foreground">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </text>
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">
        {t.feed.runsInBackground}
      </p>
    </div>
  );
}

interface LiveSupplierFeedProps {
  suppliers: Supplier[];
  campaignId?: string;
  rfqRequestId?: string;
  isAccepted?: boolean;
  isRunning?: boolean;
  excludedIds?: string[];
  onExclude?: (supplierId: string) => void;
  campaignStartedAt?: string;
  onStop?: () => void;
}

export function LiveSupplierFeed({
  suppliers,
  rfqRequestId,
  isAccepted = false,
  isRunning = false,
  excludedIds = [],
  onExclude,
  campaignStartedAt,
  onStop,
}: LiveSupplierFeedProps) {
  const navigate = useNavigate();
  const [, setSendingTo] = useState<string | null>(null);

  const handleViewDetails = (supplierId: string) => {
    navigate(`/suppliers/${supplierId}`);
  };

  const handleSendRfq = async (supplierId: string) => {
    if (!rfqRequestId) {
      toast.error(t.feed.noLinkedRfq);
      return;
    }
    if (!window.confirm(t.feed.sendRfqConfirm)) return;

    setSendingTo(supplierId);
    try {
      const result = await rfqsService.sendToSuppliers(rfqRequestId, [supplierId]);
      toast.success(t.feed.sentResult.replace('{sent}', String(result.sent)).replace('{failed}', String(result.failed)));
    } catch (err: unknown) {
      toast.error(`Błąd: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSendingTo(null);
    }
  };

  const handleExclude = (supplierId: string) => {
    if (onExclude) {
      onExclude(supplierId);
    }
  };

  const visibleSuppliers = suppliers.filter(s => !excludedIds.includes(s.id));

  if (visibleSuppliers.length === 0 && suppliers.length === 0) {
    return <WaitingForResults isRunning={isRunning} campaignStartedAt={campaignStartedAt} onStop={onStop} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSuppliers.map((supplier) => {
          const isExcluded = excludedIds.includes(supplier.id);
          return (
            <div
              key={supplier.id}
              className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${isExcluded ? 'opacity-50' : ''}`}
            >
              <SupplierCard
                supplier={supplier}
                onClick={() => handleViewDetails(supplier.id)}
                onSendRfq={isAccepted ? () => handleSendRfq(supplier.id) : undefined}
                onExclude={!isAccepted ? () => handleExclude(supplier.id) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LiveSupplierFeed;
