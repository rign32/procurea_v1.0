import { ShieldAlert, Trash2, Search, Loader2, Upload, Download, Pencil } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useBlacklist, downloadBlacklistTemplate } from '@/hooks/useBlacklist';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { t } from '@/i18n';
import { toast } from 'sonner';
import { getCountryFlag, normalizeCountry } from '@/utils/normalize-country';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
};

export function BlacklistPage() {
    const { blacklist, isLoading, error, removeFromBlacklist, isRemoving, updateReason, importBlacklist, isImporting } = useBlacklist();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startEditing = (id: string, currentReason: string) => {
        setEditingId(id);
        setEditValue(currentReason || '');
    };

    const saveReason = () => {
        if (editingId) {
            updateReason({ id: editingId, reason: editValue.trim() || t.blacklist.defaultReason }, {
                onSuccess: () => toast.success(t.blacklist.reasonUpdated),
                onError: () => toast.error(t.blacklist.reasonUpdateFailed),
            });
            setEditingId(null);
        }
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditValue('');
    };

    const filteredBlacklist = useMemo(() => {
        if (!blacklist) return [];
        return blacklist.filter((item) => {
            const q = searchQuery.toLowerCase();
            return (
                (item.name && item.name.toLowerCase().includes(q)) ||
                (item.domain && item.domain.toLowerCase().includes(q))
            );
        });
    }, [blacklist, searchQuery]);

    const reasonsCount = useMemo(() => {
        if (!blacklist) return 0;
        const set = new Set<string>();
        blacklist.forEach((item) => {
            if (item.blacklistReason) set.add(item.blacklistReason.toLowerCase().trim());
        });
        return set.size;
    }, [blacklist]);

    const handleRemove = (id: string, name: string) => {
        removeFromBlacklist(id, {
            onSuccess: () => {
                toast.success(t.blacklist.removed.replace('{name}', name));
            },
            onError: () => {
                toast.error(t.blacklist.removeFailed);
            }
        });
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await importBlacklist(file);
            toast.success(t.blacklist.imported.replace('{imported}', String(result.imported)).replace('{skipped}', String(result.skipped)));
            if (result.errors.length > 0) {
                toast.warning(t.blacklist.importErrors.replace('{count}', String(result.errors.length)));
                console.warn('[Blacklist Import] Errors:', result.errors);
            }
        } catch {
            toast.error(t.blacklist.importFailed);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTemplateDownload = async () => {
        try {
            await downloadBlacklistTemplate();
        } catch {
            toast.error(t.blacklist.templateFailed);
        }
    };

    if (!blacklist && isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-ink" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center text-bad">
                {t.errors.generic}
            </div>
        );
    }

    const totalCount = blacklist?.length ?? 0;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule"
            >
                <div>
                    <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold">{t.blacklist.title}</h1>
                    <p className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums">
                        {totalCount} {totalCount === 1 ? 'supplier' : 'suppliers'} · {reasonsCount} {reasonsCount === 1 ? 'reason' : 'reasons'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="quiet" size="ds-sm" onClick={handleTemplateDownload}>
                        <Download className="h-4 w-4 mr-1.5" />
                        {t.blacklist.downloadTemplate}
                    </Button>
                    <Button variant="cta" size="ds-sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                        {isImporting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                            <Upload className="h-4 w-4 mr-1.5" />
                        )}
                        {t.blacklist.importExcel}
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-ink" />
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t.blacklist.searchPlaceholder}
                        className="pl-10"
                    />
                </div>
            </motion.div>

            {/* List */}
            <motion.div variants={itemVariants}>
                {filteredBlacklist.length === 0 && !searchQuery ? (
                    <div className="bg-surface border border-dashed border-rule rounded-[10px] p-12 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-bad-soft flex items-center justify-center mb-4">
                            <ShieldAlert className="h-6 w-6 text-bad" />
                        </div>
                        <p className="text-[14px] text-ink font-medium">{t.blacklist.empty}</p>
                    </div>
                ) : (
                    <div className="bg-surface border border-rule rounded-[10px] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="label-mono text-muted-ink bg-surface-2 border-b border-rule">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">{t.blacklist.table.companyDomain}</th>
                                        <th className="px-6 py-3 font-medium">{t.blacklist.table.country}</th>
                                        <th className="px-6 py-3 font-medium">{t.blacklist.table.reason}</th>
                                        <th className="px-6 py-3 font-medium text-right">{t.blacklist.table.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rule relative">
                                    <AnimatePresence mode="popLayout">
                                        {filteredBlacklist.length === 0 ? (
                                            <motion.tr
                                                key="empty"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan={4} className="px-6 py-12 text-center text-muted-ink">
                                                    {t.blacklist.empty}
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredBlacklist.map((item) => (
                                                <motion.tr
                                                    variants={itemVariants}
                                                    initial="hidden"
                                                    animate="show"
                                                    exit={{ opacity: 0, x: -20 }}
                                                    layout
                                                    key={item.id}
                                                    className="hover:bg-surface-2 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-ink">{item.name || t.blacklist.unknownCompany}</div>
                                                        <div className="font-mono text-[12px] text-muted-ink tabular-nums">{item.domain}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.country ? (
                                                            <div className="flex items-center gap-1.5">
                                                                <span>{getCountryFlag(item.country)}</span>
                                                                <span>{normalizeCountry(item.country)}</span>
                                                                {item.city && <span className="text-muted-ink">({item.city})</span>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-ink">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs">
                                                        {editingId === item.id ? (
                                                            <Input
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') saveReason();
                                                                    if (e.key === 'Escape') cancelEditing();
                                                                }}
                                                                onBlur={saveReason}
                                                                autoFocus
                                                                className="h-8 text-sm"
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => startEditing(item.id, item.blacklistReason || '')}
                                                                className="group flex items-center gap-1.5 text-left truncate max-w-full hover:text-ink transition-colors"
                                                                title={t.blacklist.editReasonHint}
                                                            >
                                                                <span className="truncate">{item.blacklistReason || t.blacklist.defaultReason}</span>
                                                                <Pencil className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ds-ghost"
                                                            size="ds-sm"
                                                            onClick={() => handleRemove(item.id, item.name || item.domain)}
                                                            disabled={isRemoving}
                                                            className="text-muted-ink hover:text-ink hover:bg-surface-2"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-1.5" />
                                                            {t.blacklist.remove}
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default BlacklistPage;
