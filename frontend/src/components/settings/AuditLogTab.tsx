import { useState, useEffect, useCallback, Fragment } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { isEN } from '@/i18n';
import { organizationService } from '@/services/organization.service';
import type { AuditLogEntry, AuditLogResponse } from '@/services/organization.service';

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const PAGE_SIZE = 20;

const ENTITY_TYPES = [
  { value: '', label: isEN ? 'All types' : 'Wszystkie typy' },
  { value: 'Campaign', label: isEN ? 'Campaign' : 'Kampania' },
  { value: 'Supplier', label: isEN ? 'Supplier' : 'Dostawca' },
  { value: 'RfqRequest', label: 'RFQ' },
  { value: 'User', label: isEN ? 'User' : 'Uzytkownik' },
  { value: 'Offer', label: isEN ? 'Offer' : 'Oferta' },
  { value: 'Organization', label: isEN ? 'Organization' : 'Organizacja' },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-600',
  UPDATE: 'bg-blue-600',
  DELETE: 'bg-red-600',
};

function formatAction(action: string): string {
  const map: Record<string, string> = isEN
    ? { CREATE: 'Create', UPDATE: 'Update', DELETE: 'Delete' }
    : { CREATE: 'Utworzenie', UPDATE: 'Aktualizacja', DELETE: 'Usuni\u0119cie' };
  return map[action] || action;
}

function formatEntityType(type: string): string {
  if (!isEN) {
    const map: Record<string, string> = {
      Campaign: 'Kampania',
      Supplier: 'Dostawca',
      RfqRequest: 'RFQ',
      User: 'Uzytkownik',
      Offer: 'Oferta',
      Organization: 'Organizacja',
    };
    return map[type] || type;
  }
  return type;
}

interface AuditLogTabProps {
  user: { organizationId?: string; role?: string };
}

export function AuditLogTab({ user }: AuditLogTabProps) {
  const [response, setResponse] = useState<AuditLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await organizationService.getAuditLogs({
        entityType: entityTypeFilter || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setResponse(data);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message;
      setError(msg || (isEN ? 'Failed to load audit logs' : 'Nie udalo sie zaladowac dziennika audytu'));
    } finally {
      setLoading(false);
    }
  }, [entityTypeFilter, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all pages for export (up to 1000 rows)
      const allData: AuditLogEntry[] = [];
      let currentPage = 1;
      const maxPages = 50; // Safety limit
      while (currentPage <= maxPages) {
        const res = await organizationService.getAuditLogs({
          entityType: entityTypeFilter || undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        allData.push(...res.data);
        if (currentPage >= res.totalPages) break;
        currentPage++;
      }

      // Build CSV
      const headers = ['Date', 'User', 'Email', 'Action', 'Entity Type', 'Entity ID', 'Changes'];
      const rows = allData.map((log) => [
        new Date(log.createdAt).toISOString(),
        log.userName || '',
        log.userEmail || '',
        log.action,
        log.entityType,
        log.entityId,
        log.changes ? JSON.stringify(log.changes) : '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — user can retry
    } finally {
      setExporting(false);
    }
  };

  const logs = response?.data ?? [];
  const totalPages = response?.totalPages ?? 1;
  const total = response?.total ?? 0;

  if (!user?.organizationId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <AlertCircle className="mx-auto h-10 w-10 opacity-50 mb-3" />
          <p>{isEN ? 'You need to belong to an organization to view audit logs.' : 'Musisz nalezec do organizacji, aby widziec dziennik audytu.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="show" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                {isEN ? 'Audit Log' : 'Dziennik audytu'}
              </CardTitle>
              <CardDescription className="mt-1">
                {isEN
                  ? `${total} entries total`
                  : `${total} wpis${total === 1 ? '' : total < 5 ? 'y' : 'ow'} lacznie`}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Entity type filter */}
              <select
                value={entityTypeFilter}
                onChange={(e) => {
                  setEntityTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {ENTITY_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </select>

              {/* Export CSV */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={exporting || total === 0}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isEN ? 'Export CSV' : 'Eksport CSV'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40 ml-auto" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="mx-auto h-10 w-10 opacity-50 mb-3 text-destructive" />
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={fetchLogs}>
                {isEN ? 'Retry' : 'Ponow'}
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ScrollText className="mx-auto h-10 w-10 opacity-50 mb-3" />
              <p>
                {isEN
                  ? 'No audit log entries found.'
                  : 'Brak wpisow w dzienniku audytu.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="w-8 p-4 py-3"></th>
                      <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isEN ? 'Date' : 'Data'}
                      </th>
                      <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isEN ? 'User' : 'Uzytkownik'}
                      </th>
                      <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isEN ? 'Action' : 'Akcja'}
                      </th>
                      <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isEN ? 'Entity Type' : 'Typ obiektu'}
                      </th>
                      <th className="text-left p-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {isEN ? 'Entity ID' : 'ID obiektu'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const isExpanded = expandedRows.has(log.id);
                      const hasChanges = log.changes && Object.keys(log.changes).length > 0;
                      return (
                        <Fragment key={log.id}>
                          <tr
                            className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${
                              hasChanges ? 'cursor-pointer' : ''
                            }`}
                            onClick={() => hasChanges && toggleRow(log.id)}
                          >
                            <td className="p-4 py-4 text-center">
                              {hasChanges && (
                                isExpanded
                                  ? <ChevronDown className="h-4 w-4 text-muted-foreground inline" />
                                  : <ChevronRight className="h-4 w-4 text-muted-foreground inline" />
                              )}
                            </td>
                            <td className="p-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="p-4 py-4 text-sm">
                              <div>
                                <span className="font-medium">{log.userName || (isEN ? 'Unknown' : 'Nieznany')}</span>
                                {log.userEmail && (
                                  <span className="text-muted-foreground ml-1 text-xs">({log.userEmail})</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 py-4">
                              <Badge
                                variant="default"
                                className={`text-[10px] ${ACTION_COLORS[log.action] || 'bg-gray-600'}`}
                              >
                                {formatAction(log.action)}
                              </Badge>
                            </td>
                            <td className="p-4 py-4 text-sm">
                              {formatEntityType(log.entityType)}
                            </td>
                            <td className="p-4 py-4 text-sm text-muted-foreground font-mono text-xs">
                              {log.entityId.length > 12
                                ? `${log.entityId.slice(0, 8)}...`
                                : log.entityId}
                            </td>
                          </tr>
                          {isExpanded && hasChanges && (
                            <tr className="border-b bg-muted/20">
                              <td colSpan={6} className="p-4">
                                <div className="rounded-md bg-background border p-4 overflow-x-auto">
                                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                    {isEN ? 'Changes' : 'Zmiany'}
                                  </h4>
                                  <ChangesView changes={log.changes!} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {isEN
                      ? `Page ${page} of ${totalPages}`
                      : `Strona ${page} z ${totalPages}`}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Renders a JSON diff as old/new fields table */
function ChangesView({ changes }: { changes: Record<string, unknown> }) {
  // Support two formats:
  // 1. { old: {...}, new: {...} } — full diff
  // 2. { fieldName: { old: x, new: y }, ... } — per-field diff
  if (changes.old && changes.new && typeof changes.old === 'object' && typeof changes.new === 'object') {
    const oldObj = changes.old as Record<string, unknown>;
    const newObj = changes.new as Record<string, unknown>;
    const allKeys = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
    const changedKeys = allKeys.filter(
      (k) => JSON.stringify(oldObj[k]) !== JSON.stringify(newObj[k])
    );

    if (changedKeys.length === 0) {
      return <p className="text-sm text-muted-foreground">{isEN ? 'No visible changes' : 'Brak widocznych zmian'}</p>;
    }

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-left pb-2 pr-4 font-semibold">{isEN ? 'Field' : 'Pole'}</th>
            <th className="text-left pb-2 pr-4 font-semibold">{isEN ? 'Old value' : 'Stara wartosc'}</th>
            <th className="text-left pb-2 font-semibold">{isEN ? 'New value' : 'Nowa wartosc'}</th>
          </tr>
        </thead>
        <tbody>
          {changedKeys.map((key) => (
            <tr key={key} className="border-t border-border/30">
              <td className="py-1.5 pr-4 font-mono text-xs text-muted-foreground">{key}</td>
              <td className="py-1.5 pr-4 text-red-500/80 font-mono text-xs break-all">
                {formatValue(oldObj[key])}
              </td>
              <td className="py-1.5 text-green-600 font-mono text-xs break-all">
                {formatValue(newObj[key])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Per-field diff format or raw JSON fallback
  const entries = Object.entries(changes);
  const isPerField = entries.every(
    ([, v]) => typeof v === 'object' && v !== null && ('old' in (v as object) || 'new' in (v as object))
  );

  if (isPerField) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th className="text-left pb-2 pr-4 font-semibold">{isEN ? 'Field' : 'Pole'}</th>
            <th className="text-left pb-2 pr-4 font-semibold">{isEN ? 'Old value' : 'Stara wartosc'}</th>
            <th className="text-left pb-2 font-semibold">{isEN ? 'New value' : 'Nowa wartosc'}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val]) => {
            const diff = val as { old?: unknown; new?: unknown };
            return (
              <tr key={key} className="border-t border-border/30">
                <td className="py-1.5 pr-4 font-mono text-xs text-muted-foreground">{key}</td>
                <td className="py-1.5 pr-4 text-red-500/80 font-mono text-xs break-all">
                  {formatValue(diff.old)}
                </td>
                <td className="py-1.5 text-green-600 font-mono text-xs break-all">
                  {formatValue(diff.new)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  // Fallback: raw JSON
  return (
    <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
      {JSON.stringify(changes, null, 2)}
    </pre>
  );
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}
