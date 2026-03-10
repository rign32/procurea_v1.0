import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { StatusTabs } from '@/components/ui/status-tabs';
import { usePagination } from '@/hooks/usePagination';
import { useCampaigns } from '@/hooks/useCampaigns';
import campaignsService from '@/services/campaigns.service';
import { PL } from '@/i18n/pl';
import { useAuthStore } from '@/stores/auth.store';
import type { Campaign, CampaignStatus } from '@/types/campaign.types';
import { motion } from 'framer-motion';

export function CampaignsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canCreate = user?.role === 'ADMIN' || user?.campaignAccess !== 'readonly';
  const queryClient = useQueryClient();
  const { data: campaigns, isLoading, error } = useCampaigns();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const isFullPlan = user?.plan === 'full';

  const deleteMutation = useMutation({
    mutationFn: campaignsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setDeleteId(null);
    },
  });

  // Client-side filtering
  const filtered = (campaigns || []).filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { paginatedItems, currentPage, totalPages, total, nextPage, prevPage } = usePagination(filtered, 12);

  // Status tab counts
  const statusCounts = {
    ALL: campaigns?.length || 0,
    RUNNING: campaigns?.filter((c) => c.status === 'RUNNING').length || 0,
    COMPLETED: campaigns?.filter((c) => c.status === 'COMPLETED').length || 0,
    ERROR: campaigns?.filter((c) => c.status === 'ERROR').length || 0,
    PAUSED: campaigns?.filter((c) => c.status === 'PAUSED').length || 0,
  };

  const tabs = [
    { key: 'ALL', label: PL.campaigns.filters.all, count: statusCounts.ALL },
    { key: 'RUNNING', label: PL.campaigns.status.running, count: statusCounts.RUNNING },
    { key: 'COMPLETED', label: PL.campaigns.status.completed, count: statusCounts.COMPLETED },
    { key: 'ERROR', label: PL.campaigns.status.error, count: statusCounts.ERROR },
    { key: 'PAUSED', label: PL.campaigns.status.paused, count: statusCounts.PAUSED },
  ];

  const getStatusBadge = (status: Campaign['status']) => {
    const variants: Record<CampaignStatus, 'default' | 'secondary' | 'destructive'> = {
      RUNNING: 'secondary',
      COMPLETED: 'default',
      STOPPED: 'secondary',
      ERROR: 'destructive',
      PAUSED: 'secondary',
      SENDING: 'default',
      ACCEPTED: 'default',
      DONE: 'default',
    };
    return (
      <Badge variant={variants[status]}>
        {PL.campaigns.status[status.toLowerCase() as keyof typeof PL.campaigns.status]}
      </Badge>
    );
  };

  const getStageBadge = (stage: Campaign['stage']) => (
    <Badge variant="outline">
      {PL.campaigns.stage[stage.toLowerCase() as keyof typeof PL.campaigns.stage]}
    </Badge>
  );

  if (isLoading) {
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
          <p className="text-destructive">{PL.errors.generic}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">{PL.common.refresh}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{PL.campaigns.title}</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj kampaniami sourcingowymi AI</p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate('/campaigns/new')} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            {PL.campaigns.createNew}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <StatusTabs tabs={tabs} activeTab={statusFilter} onTabChange={setStatusFilter} />
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={PL.campaigns.filters.searchPlaceholder}
          className="sm:ml-auto sm:w-72"
        />
      </div>

      {/* Campaigns Grid */}
      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{PL.campaigns.noCampaigns}</h3>
              <p className="text-muted-foreground mb-6">{PL.campaigns.createFirst}</p>
              {canCreate && (
                <Button onClick={() => navigate('/campaigns/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  {PL.campaigns.createNew}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paginatedItems.map((campaign) => (
              <motion.div
                key={campaign.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Card
                  className="group hover:shadow-soft-xl transition-shadow cursor-pointer relative h-full flex flex-col"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  {/* Delete button on hover */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteId(campaign.id); }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    title={PL.campaigns.deleteCampaign}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <CardTitle className="text-lg line-clamp-2">{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getStageBadge(campaign.stage)}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="flex items-center justify-between text-sm">
                      {isFullPlan && (
                        <div>
                          <p className="text-muted-foreground">Zakwalifikowanych</p>
                          <p className="text-2xl font-bold text-green-600">
                            {campaign.suppliersQualified || 0}
                          </p>
                        </div>
                      )}
                      <div className="text-right ml-auto">
                        <p className="text-muted-foreground">Dostawców</p>
                        <p className="text-2xl font-bold">{campaign.suppliersFound || 0}</p>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-4 mt-auto">
                      <p>Utworzono: {new Date(campaign.createdAt).toLocaleDateString('pl-PL')}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {total} kampanii, strona {currentPage} z {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1}>
                  {PL.common.previous}
                </Button>
                <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages}>
                  {PL.common.nextPage}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteId(null)}>
          <div className="bg-background rounded-lg p-6 max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">{PL.campaigns.deleteCampaign}</h3>
            <p className="text-muted-foreground mb-6">{PL.campaigns.deleteConfirm}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)}>{PL.common.cancel}</Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {PL.common.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignsPage;
