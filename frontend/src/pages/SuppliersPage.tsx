import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, Users, Download, Search, Check, X, FolderKanban, XCircle, ShieldAlert, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { BlacklistDialog } from '@/components/suppliers/BlacklistDialog';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { suppliersService } from '@/services/suppliers.service';
import { apiClient } from '@/services/api.client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { t, isEN } from '@/i18n';
import { getCountryFlag } from '@/utils/normalize-country';
import type { Supplier } from '@/types/supplier.types';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [minScore, setMinScore] = useState<number>(0);

  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importCampaignId, setImportCampaignId] = useState('');
  const [importPreview, setImportPreview] = useState<Record<string, string>[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

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
      minScore: minScore > 0 ? minScore : undefined,
    }],
    queryFn: ({ pageParam = 1 }) => suppliersService.getAll({
      search: debouncedSearch || undefined,
      campaignIds: selectedCampaigns.length > 0 ? selectedCampaigns : undefined,
      // UI exposes 0-100 percent; backend stores analysisScore as 0-10.
      minScore: minScore > 0 ? minScore / 10 : undefined,
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

  // Bulk exclude mutation
  const bulkExcludeMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiClient.post('/suppliers/bulk/exclude', { ids });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(isEN ? 'Suppliers excluded successfully' : 'Dostawcy wykluczeni pomyslnie');
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error(isEN ? 'Failed to exclude suppliers' : 'Nie udalo sie wykluczyc dostawcow');
    },
  });

  // Bulk blacklist mutation
  const bulkBlacklistMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await apiClient.post('/suppliers/bulk/blacklist', { ids });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success(isEN ? 'Suppliers blacklisted successfully' : 'Dostawcy dodani do czarnej listy');
      setSelectedIds(new Set());
    },
    onError: () => {
      toast.error(isEN ? 'Failed to blacklist suppliers' : 'Nie udalo sie dodac do czarnej listy');
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async () => {
      if (!importFile || !importCampaignId) throw new Error('Missing file or campaign');
      return suppliersService.importSuppliers(importFile, importCampaignId);
    },
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      if (result.imported > 0) {
        toast.success(t.suppliers.import.success);
      }
    },
    onError: () => {
      toast.error(t.suppliers.import.failed);
    },
  });

  // Handle file selection for import
  const handleImportFileChange = (file: File | null) => {
    setImportFile(file);
    setImportResult(null);
    if (!file) {
      setImportPreview([]);
      return;
    }
    // Parse preview using FileReader + simple CSV parse
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) return;
        // Simple CSV preview (first 5 rows)
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) return;
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const preview: Record<string, string>[] = [];
        for (let i = 1; i < Math.min(lines.length, 6); i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
          preview.push(row);
        }
        setImportPreview(preview);
      } catch {
        setImportPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const resetImportDialog = () => {
    setImportFile(null);
    setImportCampaignId('');
    setImportPreview([]);
    setImportResult(null);
  };

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

  // Selection handlers (must be after filteredSuppliers is defined)
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === filteredSuppliers.length && filteredSuppliers.length > 0) {
        return new Set();
      }
      return new Set(filteredSuppliers.map((s: Supplier) => s.id));
    });
  }, [filteredSuppliers]);

  const handleBulkExclude = useCallback(async () => {
    const count = selectedIds.size;
    const confirmed = await confirm({
      title: isEN ? `Exclude ${count} suppliers?` : `Wykluczyc ${count} dostawcow?`,
      description: isEN
        ? 'These suppliers will be excluded from all campaigns. This action cannot be undone.'
        : 'Ci dostawcy zostana wykluczeni ze wszystkich kampanii. Tej operacji nie mozna cofnac.',
      confirmLabel: isEN ? 'Exclude' : 'Wyklucz',
      variant: 'destructive',
    });
    if (confirmed) {
      bulkExcludeMutation.mutate([...selectedIds]);
    }
  }, [selectedIds, confirm, bulkExcludeMutation]);

  const handleBulkBlacklist = useCallback(async () => {
    const count = selectedIds.size;
    const confirmed = await confirm({
      title: isEN ? `Blacklist ${count} suppliers?` : `Dodac ${count} dostawcow do czarnej listy?`,
      description: isEN
        ? 'These suppliers will be permanently blacklisted. This action cannot be undone.'
        : 'Ci dostawcy zostana trwale dodani do czarnej listy. Tej operacji nie mozna cofnac.',
      confirmLabel: isEN ? 'Blacklist' : 'Czarna lista',
      variant: 'destructive',
    });
    if (confirmed) {
      bulkBlacklistMutation.mutate([...selectedIds]);
    }
  }, [selectedIds, confirm, bulkBlacklistMutation]);

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
        // UI exposes 0-100 percent; backend expects 0-10 analysisScore.
        minScore: minScore > 0 ? minScore / 10 : undefined,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `suppliers-${stamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      if (selectedCampaigns.length > 0) {
        // Backend export doesn't yet take campaignIds — be honest about it.
        toast.info(isEN
          ? 'Export currently ignores the campaign filter. CSV contains all suppliers matching country + score + search.'
          : 'Eksport nie obsługuje jeszcze filtru kampanii. CSV zawiera wszystkich dostawców pasujących do kraju + oceny + wyszukiwania.');
      }
    } catch {
      toast.error(isEN ? 'Export failed' : 'Eksport nie powiódł się');
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
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule">
        <div>
          <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold text-ink">
            {t.suppliers.title}
          </h1>
          <p className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums">
            <span className="tabular-nums">{serverTotal}</span> {t.suppliers.allSuppliers.toLowerCase()}
            {countries.length > 0 && (
              <> <span className="text-rule-2">·</span> <span className="tabular-nums">{countries.length}</span> {isEN ? 'countries' : 'krajów'}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ds-ghost" size="ds" onClick={() => { resetImportDialog(); setImportDialogOpen(true); }}>
            <Upload className="mr-1.5 h-4 w-4" />
            {isEN ? 'Import' : 'Importuj'}
          </Button>
          <Button variant="ds-ghost" size="ds" onClick={handleExportCSV}>
            <Download className="mr-1.5 h-4 w-4" />
            {t.common.export}
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface border border-rule rounded-[10px] p-4 flex flex-col sm:flex-row gap-4">
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
            {/* Reset */}
            <div className="flex gap-1.5 p-2 border-b">
              <Button
                variant={selectedCampaigns.length === 0 ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => setSelectedCampaigns([])}
                disabled={selectedCampaigns.length === 0}
              >
                {selectedCampaigns.length === 0 ? t.common.all : t.suppliers.page.clearFilters}
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
                disabled={selectedCountries.length === 0}
              >
                {selectedCountries.length === 0 ? t.common.all : t.suppliers.page.clearFilters}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={selectEU}
              >
                {t.suppliers.page.euOnly}
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

        {/* Min Score Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-[180px] justify-between font-normal"
            >
              <span className="flex items-center gap-2 truncate">
                <Star className="h-4 w-4 shrink-0 text-muted-foreground" />
                {minScore > 0
                  ? (isEN ? `Score ≥ ${minScore}%` : `Ocena ≥ ${minScore}%`)
                  : (isEN ? 'Any score' : 'Dowolna ocena')}
              </span>
              {minScore > 0 ? (
                <X
                  className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinScore(0);
                  }}
                />
              ) : (
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-2" align="end">
            <div className="text-[10.5px] font-mono uppercase tracking-[0.1em] text-muted-ink-2 px-1 pb-1.5">
              {isEN ? 'Minimum AI match score' : 'Minimalna ocena AI'}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[0, 50, 70, 85].map((v) => (
                <Button
                  key={v}
                  variant={minScore === v ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setMinScore(v)}
                >
                  {v === 0 ? (isEN ? 'Any' : 'Dowolna') : `≥ ${v}%`}
                </Button>
              ))}
            </div>
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
          {/* Summary bar with Select All */}
          <div className="flex items-center gap-3">
            <Checkbox
              checked={
                selectedIds.size === filteredSuppliers.length && filteredSuppliers.length > 0
                  ? true
                  : selectedIds.size > 0
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={toggleSelectAll}
            />
            <p className="text-sm text-muted-foreground">
              {selectedIds.size > 0
                ? `${selectedIds.size} ${isEN ? 'selected' : 'zaznaczonych'} / `
                : ''}
              {t.suppliers.page.showingOf.replace('{shown}', String(filteredSuppliers.length)).replace('{total}', String(serverTotal))}
            </p>
          </div>

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
                  selected={selectedIds.has(supplier.id)}
                  onSelect={toggleSelect}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Load more */}
          {hasNextPage && (
            <div className="flex justify-center pt-4 pb-20">
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

      {/* Bulk action toolbar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-2xl px-5 py-3"
          >
            <span className="text-sm font-medium whitespace-nowrap">
              {selectedIds.size} {isEN ? 'selected' : 'zaznaczonych'}
            </span>

            <div className="h-5 w-px bg-border" />

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkExclude}
              disabled={bulkExcludeMutation.isPending}
            >
              {bulkExcludeMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isEN ? 'Exclude' : 'Wyklucz'}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkBlacklist}
              disabled={bulkBlacklistMutation.isPending}
            >
              {bulkBlacklistMutation.isPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
              )}
              {isEN ? 'Blacklist' : 'Czarna lista'}
            </Button>

            <div className="h-5 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              {isEN ? 'Clear' : 'Wyczysc'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {supplierToBlacklist && (
        <BlacklistDialog
          isOpen={true}
          onClose={() => setSupplierToBlacklist(null)}
          supplierName={supplierToBlacklist.name || t.common.unknown}
          isSubmitting={blacklistMutation.isPending}
          onConfirm={(reason) => blacklistMutation.mutate({ id: supplierToBlacklist.id, reason })}
        />
      )}

      {ConfirmDialogElement}

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(open) => { if (!open) resetImportDialog(); setImportDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {t.suppliers.import.title}
            </DialogTitle>
            <DialogDescription>
              {t.suppliers.import.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Campaign selector */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                {t.suppliers.import.selectCampaign}
              </label>
              <select
                value={importCampaignId}
                onChange={(e) => setImportCampaignId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t.suppliers.import.selectCampaignPlaceholder}</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name?.replace(/^Kampania:\s*/i, '') || c.id}
                  </option>
                ))}
              </select>
            </div>

            {/* File upload zone */}
            <div>
              <input
                ref={importFileRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => handleImportFileChange(e.target.files?.[0] || null)}
              />
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                onClick={() => importFileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleImportFileChange(file);
                }}
              >
                {importFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{importFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => { e.stopPropagation(); handleImportFileChange(null); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t.suppliers.import.dropzone}</p>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {t.suppliers.import.columns}
              </p>
            </div>

            {/* Preview table */}
            {importPreview.length > 0 && !importResult && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {t.suppliers.import.preview.replace('{count}', String(importPreview.length))}
                </p>
                <div className="border rounded-md overflow-x-auto max-h-[200px]">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        {Object.keys(importPreview[0]).map((h) => (
                          <th key={h} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, i) => (
                        <tr key={i} className="border-t">
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="px-2 py-1 whitespace-nowrap max-w-[150px] truncate">
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import result */}
            {importResult && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {t.suppliers.import.results}
                </p>
                <div className="text-sm space-y-1">
                  <p>{t.suppliers.import.imported.replace('{count}', String(importResult.imported))}</p>
                  <p>{t.suppliers.import.skipped.replace('{count}', String(importResult.skipped))}</p>
                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {t.suppliers.import.errors} ({importResult.errors.length})
                      </p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5 max-h-[100px] overflow-y-auto">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {importResult ? (
              <Button onClick={() => { resetImportDialog(); setImportDialogOpen(false); }}>
                {t.common.close}
              </Button>
            ) : (
              <Button
                disabled={!importFile || !importCampaignId || importMutation.isPending}
                onClick={() => importMutation.mutate()}
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.suppliers.import.importing}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t.suppliers.import.import}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SuppliersPage;
