import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, Users, Download, Search, Check, X, Factory, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { usePagination } from '@/hooks/usePagination';
import { SupplierCard } from '@/components/suppliers/SupplierCard';
import { BlacklistDialog } from '@/components/suppliers/BlacklistDialog';
import { useSuppliers } from '@/hooks/useSuppliers';
import { suppliersService } from '@/services/suppliers.service';
import { apiClient } from '@/services/api.client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PL } from '@/i18n/pl';
import { getCountryFlag } from '@/utils/normalize-country';
import type { Supplier } from '@/types/supplier.types';
import { motion } from 'framer-motion';

const EU_COUNTRIES = new Set([
  'Niemcy', 'Francja', 'Włochy', 'Hiszpania', 'Holandia', 'Belgia', 'Austria',
  'Polska', 'Czechy', 'Słowacja', 'Węgry', 'Rumunia', 'Bułgaria', 'Chorwacja',
  'Słowenia', 'Litwa', 'Łotwa', 'Estonia', 'Irlandia', 'Luksemburg',
  'Portugalia', 'Finlandia', 'Szwecja', 'Dania',
]);

export function SuppliersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryFilterOpen, setCountryFilterOpen] = useState(false);
  const [supplierToBlacklist, setSupplierToBlacklist] = useState<Supplier | null>(null);
  const [companyTypeFilter, setCompanyTypeFilter] = useState<string>('');
  const [serverPage, setServerPage] = useState(1);

  // Debounce search query (300ms) to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setServerPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Server-side search + pagination
  const { data, isLoading, error } = useSuppliers({
    search: debouncedSearch || undefined,
    companyType: companyTypeFilter || undefined,
    page: serverPage,
    pageSize: 100,
  });
  const suppliers = data?.suppliers;
  const serverTotal = data?.total || 0;

  const blacklistMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await apiClient.post(`/suppliers/${id}/blacklist`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Dostawca dodany do Blacklisty');
      setSupplierToBlacklist(null);
    },
    onError: () => {
      toast.error('Nie udało się dodać do Blacklisty');
    }
  });

  const countries = useMemo(() => {
    if (!suppliers) return [];
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
    if (!suppliers) return [];
    if (selectedCountries.length === 0) return suppliers;
    return suppliers.filter((supplier: Supplier) =>
      selectedCountries.includes(supplier.country || '')
    );
  }, [suppliers, selectedCountries]);

  const { paginatedItems, currentPage, totalPages, total, nextPage, prevPage } = usePagination(filteredSuppliers, 12);

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev =>
      prev.includes(country)
        ? prev.filter(c => c !== country)
        : [...prev, country]
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
    ? 'Wszystkie kraje'
    : selectedCountries.length === 1
      ? `${getCountryFlag(selectedCountries[0])} ${selectedCountries[0]}`
      : `${selectedCountries.length} ${selectedCountries.length < 5 ? 'kraje' : 'krajów'}`;

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
          <Button onClick={() => window.location.reload()} className="mt-4">
            {PL.common.refresh}
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
          <h1 className="text-3xl font-bold">{PL.suppliers.title}</h1>
          <p className="text-muted-foreground mt-1">{PL.suppliers.allSuppliers}</p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="mr-2 h-4 w-4" />
          {PL.common.export}
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Szukaj po nazwie, stronie www, mieście lub specjalizacji..."
            className="w-full"
          />
        </div>

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
                  placeholder="Szukaj kraju..."
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
                Wszystkie
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={selectEU}
              >
                UE
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={() => setSelectedCountries([])}
              >
                Wyczyść
              </Button>
            </div>

            {/* Country list */}
            <div className="max-h-[240px] overflow-y-auto p-1">
              {filteredCountryList.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Brak wyników
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
                Wybrano: {selectedCountries.length} z {countries.length}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Company Type Filter */}
      <div className="flex gap-2">
        {[
          { value: '', label: 'Wszystkie', icon: null },
          { value: 'PRODUCENT', label: 'Producenci', icon: Factory },
          { value: 'HANDLOWIEC', label: 'Handlowcy', icon: Store },
        ].map(({ value, label, icon: Icon }) => (
          <Button
            key={value}
            variant={companyTypeFilter === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCompanyTypeFilter(value); setServerPage(1); }}
            className="text-xs"
          >
            {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
            {label}
          </Button>
        ))}
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{PL.common.noData}</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCountries.length > 0
                  ? 'Brak dostawców spełniających kryteria wyszukiwania'
                  : 'Nie znaleziono żadnych dostawców'}
              </p>
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
            {paginatedItems.map((supplier: Supplier) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {total} z {serverTotal} dostawców, strona {currentPage} z {totalPages}
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

          {/* Load more from server if there are additional pages */}
          {serverTotal > (suppliers?.length || 0) && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setServerPage(prev => prev + 1)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Załaduj więcej ({suppliers?.length || 0} z {serverTotal})
              </Button>
            </div>
          )}
        </>
      )}

      {supplierToBlacklist && (
        <BlacklistDialog
          isOpen={true}
          onClose={() => setSupplierToBlacklist(null)}
          supplierName={supplierToBlacklist.name || 'Nieznany'}
          isSubmitting={blacklistMutation.isPending}
          onConfirm={(reason) => blacklistMutation.mutate({ id: supplierToBlacklist.id, reason })}
        />
      )}
    </div>
  );
}

export default SuppliersPage;
