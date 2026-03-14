import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, Users, Download, Search, Check, X, FolderKanban } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { BlacklistDialog } from '@/components/suppliers/BlacklistDialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { suppliersService } from '@/services/suppliers.service';
import { apiClient } from '@/services/api.client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { t } from '@/i18n';
import { getCountryFlag } from '@/utils/normalize-country';
import type { Supplier } from '@/types/supplier.types';
import { motion } from 'framer-motion';
import { analytics } from '@/lib/analytics';

// EU country names — must match backend data (which uses Polish names)
// AND also match English names for EN builds
const EU_COUNTRIES_PL = new Set([
  'Niemcy', 'Francja', 'Włochy', 'Hiszpania', 'Holandia', 'Belgia', 'Austria',
  'Polska', 'Czechy', 'Słowacja', 'Węgry', 'Rumunia', 'Bułgaria', 'Chorwacja',
  'Słowenia', 'Litwa', 'Łotwa', 'Estonia', 'Irlandia', 'Luksemburg',
  'Portugalia', 'Finlandia', 'Szwecja', 'Dania',
]);
const EU_COUNTRIES_EN = new Set([
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria',
  'Poland', 'Czech Republic', 'Czechia', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Croatia',
  'Slovenia', 'Lithuania', 'Latvia', 'Estonia', 'Ireland', 'Luxembourg',
  'Portugal', 'Finland', 'Sweden', 'Denmark',
]);
const EU_COUNTRIES = new Set([...EU_COUNTRIES_PL, ...EU_COUNTRIES_EN]);

export function SuppliersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => { analytics.supplierListView(); }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);
  const [supplierToBlacklist, setSupplierToBlacklist] = useState<Supplier | null>(null);

  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [campaignFilterOpen, setCampaignFilterOpen] = useState(false);

  // Debounce search query (300ms) to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch campaigns for filter
  const { data: campaignsData } = useCampaigns();
  const campaigns = campaignsData ?? [];

  // Server-side search + infinite scroll load-more
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['suppliers', {
      search: debouncedSearch || undefined,
      campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
    }],
    queryFn: ({ pageParam = 1 }) => suppliersService.getAll({
      search: debouncedSearch || undefined,
      campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
      page: pageParam,
      pageSize: 100,
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.suppliers.length, 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
  });

  const suppliers = data?.pages.flatMap(p => p.suppliers) ?? [];
  const serverTotal = data?.pages[0]?.total ?? 0;

  const blacklistMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.post(`/suppliers/${id}/blacklist`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(t.suppliers.page.blacklistAdded);
      setSupplierToBlacklist(null);
    },
    onError: () => {
      toast.error(t.suppliers.page.blacklistFailed);
    }
  });

  const countries = useMemo(() => {
    if (!suppliers.length) return [];
    const unique = new Set(
      suppliers.map((s: Supplier) => s.country).filter((c): c is string => !!c)
    );
    return Array.from(unique).sort();
  }, [suppliers]);

  const filteredCountryList = useMemo(() => {
    if (!countrySearch) return countries;
    const q = countrySearch.toLowerCase();
    return countries.filter(c => c.toLowerCase().includes(q));
  }, [countries, countrySearch]);

  // Client-side country filter only (search is now server-side)
  const filteredSuppliers = useMemo(() => {
    if (!suppliers.length) return [];
    if (selectedCountries.length === 0) return suppliers;
    return suppliers.filter((supplier: Supplier) =>
      selectedCountries.includes(supplier.country || '')
    );
  }, [suppliers, selectedCountries]);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
    );
  };

  const toggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(c => c !== campaignId)
        : [...prev, campaignId]
    );
  };

  const selectEU = () => {
    const euInList = countries.filter(c => EU_COUNTRIES.has(c));
    setSelectedCountries(euInList);
  };

  const handleExportCSV = async () => {
    try {
      const blob = await suppliersService.exportCSV({
        country: selectedCountries.length === 1 ? selectedCountries[0] : undefined,
        search: searchQuery || undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'suppliers.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  const countryLabel = selectedCountries.length === 0
    ? t.suppliers.page.allCountries
    : selectedCountries.length === 1
      ? `${getCountryFlag(selectedCountries[0])} ${selectedCountries[0]}`
      : `${selectedCountries.length} ${selectedCountries.length < 5 ? t.suppliers.page.countries : t.suppliers.page.countriesMany}`;

  const campaignLabel = selectedCampaigns.length === 0
    ? t.suppliers.page.allCampaigns
    : selectedCampaigns.length === 1
      ? (campaigns.find(c => c.id === selectedCampaigns[0])?.name?.replace(/^Kampania:\s*/i, '') || t.nav.campaigns)
      : `${selectedCampaigns.length} ${selectedCampaigns.length < 5 ? t.suppliers.page.campaigns : t.suppliers.page.campaignsMany}`;

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
          <h1 className="text-3xl font-bold">{t.suppliers.title}</h1>
          <p className="text-muted-foreground mt-1">{t.suppliers.allSuppliers}</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          {t.common.export}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t.suppliers.page.searchPlaceholder}
            className="w-full"
          />
        </div>

        {/* Campaign Filter */}
        <Popover open={campaignFilterOpen} onOpenChange={setCampaignFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[260px] justify-between font-normal"
            >
              <span className="flex items-center gap-2 truncate">
                <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                {campaignLabel}
              </span>
              {selectedCampaigns.length > 0 ? (
                <X
                  className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCampaigns([]);
                  }}
                />
              ) : (
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-0" align="end">
            {/* Preset buttons */}
            <div className="flex gap-1.5 p-2 border-b">
              <Button
                variant={selectedCampaigns.length === 0 ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => setSelectedCampaigns([])}
              >
                {t.common.all}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => setSelectedCampaigns([])}
              >
                {t.suppliers.page.clearFilters}
              </Button>
            </div>

            {/* Campaign list */}
            <div className="max-h-[240px] overflow-y-auto p-1">
              {campaigns.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t.suppliers.page.noCampaigns}
                </div>
              ) : (
                campaigns.map((campaign) => {
                  const isSelected = selectedCampaigns.includes(campaign.id);
                  return (
                    <button
                      key={campaign.id}
                      onClick={() => toggleCampaign(campaign.id)}
                      className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm hover:bg-accent transition-colors"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      <span className="flex-1 text-left truncate">{campaign.name?.replace(/^Kampania:\s*/i, '')}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with count */}
            {selectedCampaigns.length > 0 && (
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                {t.suppliers.page.selectedOf.replace('{selected}', String(selectedCampaigns.length)).replace('{total}', String(campaigns.length))}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Country Filter */}
        <Popover open={countryFilterOpen} onOpenChange={setCountryFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[260px] justify-between font-normal"
            >
              <span className="flex items-center gap-2 truncate">
                <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
                {countryLabel}
              </span>
              {selectedCountries.length > 0 ? (
                <X
                  className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCountries([]);
                  }}
                />
              ) : (
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="end">
            {/* Search within countries */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder={t.suppliers.page.searchCountry}
                  className="h-8 pl-8 text-sm"
                />
              </div>
            </div>

            {/* Preset buttons */}
            <div className="flex gap-1.5 p-2 border-b">
              <Button
                variant={selectedCountries.length === 0 ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => setSelectedCountries([])}
              >
                {t.common.all}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={selectEU}
              >
                {t.suppliers.page.euOnly}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => setSelectedCountries([])}
              >
                {t.suppliers.page.clearFilters}
              </Button>
            </div>

            {/* Country list */}
            <div className="max-h-[240px] overflow-y-auto p-1">
              {filteredCountryList.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {t.common.noData}
                </div>
              ) : (
                filteredCountryList.map((country) => {
                  const isSelected = selectedCountries.includes(country);
                  return (
                    <button
                      key={country}
                      onClick={() => toggleCountry(country)}
                      className="flex w-full items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-sm hover:bg-accent transition-colors"
                    >
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                      />
                      <span>{getCountryFlag(country)}</span>
                      <span className="flex-1 text-left">{country}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer with count */}
            {selectedCountries.length > 0 && (
              <div className="border-t px-3 py-2 text-xs text-muted-foreground">
                {t.suppliers.page.selectedOf.replace('{selected}', String(selectedCountries.length)).replace('{total}', String(countries.length))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t.common.noData}</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCountries.length > 0 || selectedCampaigns.length > 0
                  ? t.suppliers.page.emptySearch
                  : t.suppliers.page.emptyNoSuppliers}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {t.suppliers.page.showingOf.replace('{shown}', String(filteredSuppliers.length)).replace('{total}', String(serverTotal))}
          </p>

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
            {filteredSuppliers.map((supplier: Supplier) => (
              <motion.div
                key={supplier.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <SupplierCard
                  supplier={supplier}
                  onClick={() => navigate(`/suppliers/${supplier.id}`)}
                  onBlacklist={() => setSupplierToBlacklist(supplier)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t.suppliers.page.loadMore.replace('{loaded}', String(suppliers.length)).replace('{total}', String(serverTotal))}
              </Button>
            </div>
          )}
        </>
      )}

      {supplierToBlacklist && (
        <BlacklistDialog
          isOpen={true}
          onClose={() => setSupplierToBlacklist(null)}
          supplierName={supplierToBlacklist.name || t.common.unknown}
          isSubmitting={blacklistMutation.isPending}
          onConfirm={(reason) => blacklistMutation.mutate({ id: supplierToBlacklist.id, reason })}
        />
      )}
    </div>
  );
}

export default SuppliersPage;
