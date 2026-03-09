import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { SupplierCard } from '../suppliers/SupplierCard';
import { rfqsService } from '@/services/rfqs.service';
import type { Supplier } from '@/types/supplier.types';
import { PL } from '@/i18n/pl';

function WaitingForResults({ isRunning }: { isRunning?: boolean }) {
  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  if (!isRunning) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Czekam na wyniki wyszukiwania...</p>
        <p className="text-sm mt-2">Dostawcy będą pojawiać się tutaj w czasie rzeczywistym</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 space-y-6">
      <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" style={{ animationDuration: '2s' }} />
      <div>
        <p className="text-lg font-medium">Szukam dostawców...</p>
        <p className="text-sm text-muted-foreground mt-1">
          {secondsLeft > 0
            ? `Pierwsze wyniki pojawią się w ciągu ${minutes}:${seconds.toString().padStart(2, '0')}`
            : 'Jeszcze chwilę...'
          }
        </p>
      </div>
      <div className="flex justify-center">
        <svg className="w-20 h-20" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
            className="text-muted/30" strokeWidth="4" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor"
            className="text-primary" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - secondsLeft / 120)}`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dashoffset 1s linear' }} />
          <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
            className="text-xl font-bold fill-foreground">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </text>
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">
        Dostawcy będą pojawiać się automatycznie
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
}

export function LiveSupplierFeed({
  suppliers,
  campaignId,
  rfqRequestId,
  isAccepted = false,
  isRunning = false,
  excludedIds = [],
  onExclude,
}: LiveSupplierFeedProps) {
  const navigate = useNavigate();
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleViewDetails = (supplierId: string) => {
    navigate(`/suppliers/${supplierId}`);
  };

  const handleSendRfq = async (supplierId: string) => {
    if (!rfqRequestId) {
      toast.error('Brak powiązanego RFQ z tą kampanią');
      return;
    }
    if (!window.confirm('Wysłać RFQ do tego dostawcy?')) return;

    setSendingTo(supplierId);
    try {
      const result = await rfqsService.sendToSuppliers(rfqRequestId, [supplierId]);
      toast.success(`Wysłano: ${result.sent}, Błędy: ${result.failed}`);
    } catch (err: any) {
      toast.error(`Błąd: ${err.message}`);
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
    return <WaitingForResults isRunning={isRunning} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {PL.campaigns.detail.liveSuppliers}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({visibleSuppliers.length} {visibleSuppliers.length === 1 ? 'dostawca' : 'dostawców'})
          </span>
        </h3>
      </div>

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
