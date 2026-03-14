import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRfqs } from '@/hooks/useRfqs';
import { t } from '@/i18n';
import { useAuthStore } from '@/stores/auth.store';
import type { RfqRequest } from '@/types/campaign.types';
import { motion } from 'framer-motion';

type TabKey = 'draft' | 'active' | 'closed';

const TAB_TO_STATUS: Record<TabKey, RfqRequest['status']> = {
  draft: 'DRAFT',
  active: 'ACTIVE',
  closed: 'CLOSED',
};

export function RfqsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCreate = user?.role === 'ADMIN' || user?.campaignAccess !== 'readonly';
  const [activeTab, setActiveTab] = useState<TabKey>('active');
  const { data, isLoading, error } = useRfqs(TAB_TO_STATUS[activeTab]);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'draft', label: t.rfqs.tabs.draft },
    { key: 'active', label: t.rfqs.tabs.active },
    { key: 'closed', label: t.rfqs.tabs.closed },
  ];

  const filteredRfqs = useMemo(() => {
    if (!data) return [];
    return data.rfqs;
  }, [data]);

  const handleViewRfq = (rfq: RfqRequest) => {
    navigate(`/rfqs/${rfq.id}`);
  };

  const getStatusBadge = (status: RfqRequest['status']) => {
    const variants: Record<RfqRequest['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
      DRAFT: 'secondary',
      ACTIVE: 'default',
      CLOSED: 'outline',
      ARCHIVED: 'secondary',
    };

    return (
      <Badge variant={variants[status]}>
        {t.rfqs.status[status.toLowerCase() as keyof typeof t.rfqs.status]}
      </Badge>
    );
  };

  const formatCurrency = (price?: number, currency?: string) => {
    if (price == null) return '—';
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency || 'PLN',
    }).format(price);
  };

  if (!data && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{t.errors.generic}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t.common.refresh}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.rfqs.title}</h1>
          <p className="text-muted-foreground mt-1">
            {t.rfqs.subtitle}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/campaigns/new')} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            {t.rfqs.createNew}
          </Button>
        )}
      </div>

      {/* Tab Filters */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RFQ List */}
      {filteredRfqs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.common.noData}</h3>
              <p className="text-muted-foreground mb-6">
                {t.rfqs.emptyCategory} &ldquo;{tabs.find((tab) => tab.key === activeTab)?.label}&rdquo;
              </p>
              {canCreate && (
                <Button onClick={() => navigate('/campaigns/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t.rfqs.createNew}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {filteredRfqs.map((rfq) => (
            <motion.div
              key={rfq.id}
              variants={{
                hidden: { opacity: 0, x: -20 },
                show: { opacity: 1, x: 0 }
              }}
            >
              <Card
                className="hover:shadow-soft-xl transition-shadow cursor-pointer border-border/40"
                onClick={() => handleViewRfq(rfq)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{rfq.productName}</CardTitle>
                    {getStatusBadge(rfq.status)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t.rfqs.detail.quantity}</p>
                      <p className="font-medium">
                        {rfq.quantity != null ? `${rfq.quantity} ${rfq.unit || 'szt.'}` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.rfqs.detail.targetPrice}</p>
                      <p className="font-medium">{formatCurrency(rfq.targetPrice, rfq.currency)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.rfqs.detail.offers}</p>
                      <p className="font-medium">{rfq.offers?.length ?? 0} {t.rfqs.detail.offersReceived}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Utworzono</p>
                      <p className="font-medium">
                        {new Date(rfq.createdAt).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                  </div>

                  {rfq.campaignId && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        {t.rfqs.detail.linkedCampaign}: {rfq.campaign?.name || rfq.campaignId}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default RfqsPage;
