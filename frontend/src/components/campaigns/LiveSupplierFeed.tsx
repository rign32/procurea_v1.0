import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SupplierCard } from '../suppliers/SupplierCard';
import { rfqsService } from '@/services/rfqs.service';
import type { Supplier } from '@/types/supplier.types';
import { PL } from '@/i18n/pl';

interface LiveSupplierFeedProps {
  suppliers: Supplier[];
  campaignId?: string;
  rfqRequestId?: string;
  isAccepted?: boolean;
  excludedIds?: string[];
  onExclude?: (supplierId: string) => void;
}

export function LiveSupplierFeed({
  suppliers,
  campaignId,
  rfqRequestId,
  isAccepted = false,
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
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Czekam na wyniki wyszukiwania...</p>
        <p className="text-sm mt-2">Dostawcy będą pojawiać się tutaj w czasie rzeczywistym</p>
      </div>
    );
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
