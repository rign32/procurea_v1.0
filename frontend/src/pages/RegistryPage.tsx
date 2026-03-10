import { useState, useMemo } from 'react';
import { Loader2, Search, Building2, Mail, ShieldCheck, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSuppliers } from '@/hooks/useSuppliers';
import { t } from '@/i18n';
import type { Supplier } from '@/types/supplier.types';
import { motion, AnimatePresence } from 'framer-motion';
import { EmptyState } from '@/components/ui/empty-state';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export function RegistryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, error } = useSuppliers();
  const suppliers = data?.suppliers;

  // Deduplicate suppliers by registry domain / company name to build a "registry" view
  const companies = useMemo(() => {
    if (!suppliers) return [];
    const seen = new Map<string, Supplier>();
    for (const s of suppliers) {
      const key = s.registryId || s.name || s.url;
      if (!seen.has(key)) {
        seen.set(key, s);
      }
    }
    return Array.from(seen.values());
  }, [suppliers]);

  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.specialization?.toLowerCase().includes(q)
    );
  }, [companies, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = companies.length;
    const withEmails = companies.filter((c) => c.contactEmails).length;
    const scores = companies
      .map((c) => c.analysisScore)
      .filter((s): s is number => s != null);
    const avgScore = scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : '—';
    return { total, withEmails, avgScore };
  }, [companies]);

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
          <p className="text-destructive">{t.errors.generic}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t.common.refresh}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold">{t.registry.title}</h1>
        <p className="text-muted-foreground mt-1">{t.registry.subtitle}</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.registry.stats.totalCompanies}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.registry.stats.withEmails}</p>
              <p className="text-2xl font-bold">{stats.withEmails}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
              <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.registry.stats.averageQuality}</p>
              <p className="text-2xl font-bold">{stats.avgScore}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`${t.common.search}...`}
          className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </motion.div>

      {/* Companies Table */}
      <motion.div variants={itemVariants}>
        {filteredCompanies.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={t.common.noData}
            description={
              searchQuery
                ? 'Brak wyników dla podanego zapytania'
                : 'Rejestr firm jest pusty'
            }
          />
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t.registry.table.company}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t.registry.table.country}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t.registry.table.quality}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        {t.registry.table.verified}
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Specjalizacja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    <AnimatePresence mode="popLayout">
                      {filteredCompanies.map((company) => (
                        <motion.tr
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit={{ opacity: 0, x: -20 }}
                          layout
                          key={company.id}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{company.name || '—'}</p>
                              {company.city && (
                                <p className="text-xs text-muted-foreground">{company.city}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">{company.country || '—'}</td>
                          <td className="px-4 py-3">
                            {company.analysisScore != null ? (
                              <Badge
                                variant={company.analysisScore >= 7 ? 'default' : company.analysisScore >= 4 ? 'secondary' : 'destructive'}
                              >
                                {company.analysisScore.toFixed(1)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {company.contactEmails ? (
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 max-w-[200px]">
                            {company.specialization ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <p className="text-xs text-muted-foreground line-clamp-1 cursor-default hover:text-foreground transition-colors">
                                      {company.specialization}
                                    </p>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="max-w-[300px] text-xs leading-relaxed">{company.specialization}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <p className="text-xs text-muted-foreground">—</p>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}

export default RegistryPage;
