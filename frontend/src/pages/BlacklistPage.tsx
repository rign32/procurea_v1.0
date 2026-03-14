import { ShieldAlert, Trash2, Search, Loader2, Upload, Download, Pencil } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useBlacklist, downloadBlacklistTemplate } from '@/hooks/useBlacklist';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
            updateReason({ id: editingId, reason: editValue.trim() || 'Zablokowany przez użytkownika' }, {
                onSuccess: () => toast.success('Powód zaktualizowany'),
                onError: () => toast.error('Nie udało się zaktualizować powodu'),
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

    const handleRemove = (id: string, name: string) => {
        removeFromBlacklist(id, {
            onSuccess: () => {
                toast.success(`Usunięto ${name} z Blacklisty`);
            },
            onError: () => {
                toast.error('Nie udało się usunąć z Blacklisty');
            }
        });
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await importBlacklist(file);
            toast.success(`Zaimportowano ${result.imported} firm. Pominięto: ${result.skipped}.`);
            if (result.errors.length > 0) {
                toast.warning(`Błędy: ${result.errors.length}. Sprawdź konsolę.`);
                console.warn('[Blacklist Import] Errors:', result.errors);
            }
        } catch {
            toast.error('Błąd importu pliku');
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleTemplateDownload = async () => {
        try {
            await downloadBlacklistTemplate();
        } catch {
            toast.error('Błąd pobierania szablonu');
        }
    };

    if (!blacklist && isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center text-destructive">
                {t.errors.generic}
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                    Zarządzanie Blacklistą
                </h1>
                <p className="text-muted-foreground mt-1">
                    Dostawcy na rzeczonej liście nie będą uwzględniani w przyszłych kampaniach.
                </p>
            </motion.div>

            {/* Search Bar + Import/Template buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Szukaj po nazwie firmy lub domenie..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleTemplateDownload}>
                        <Download className="h-4 w-4 mr-1.5" />
                        Pobierz szablon
                    </Button>
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
                        {isImporting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                        ) : (
                            <Upload className="h-4 w-4 mr-1.5" />
                        )}
                        Importuj Excel
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

            {/* List */}
            <motion.div variants={itemVariants}>
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Firma / Domena</th>
                                    <th className="px-6 py-3 font-medium">Kraj</th>
                                    <th className="px-6 py-3 font-medium">Powód dodania</th>
                                    <th className="px-6 py-3 font-medium text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y relative">
                                <AnimatePresence mode="popLayout">
                                    {filteredBlacklist.length === 0 ? (
                                        <motion.tr
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                Brak firm na Blackliście spełniających kryteria wyszukiwania.
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
                                                className="hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-foreground">{item.name || 'Nieznana firma'}</div>
                                                    <div className="text-muted-foreground">{item.domain}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.country ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <span>{getCountryFlag(item.country)}</span>
                                                            <span>{normalizeCountry(item.country)}</span>
                                                            {item.city && <span className="text-muted-foreground">({item.city})</span>}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
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
                                                            className="group flex items-center gap-1.5 text-left truncate max-w-full hover:text-foreground transition-colors"
                                                            title="Kliknij, aby edytować powód"
                                                        >
                                                            <span className="truncate">{item.blacklistReason || 'Zablokowany przez użytkownika'}</span>
                                                            <Pencil className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemove(item.id, item.name || item.domain)}
                                                        disabled={isRemoving}
                                                        className="text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1.5" />
                                                        Odrzuć
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}

export default BlacklistPage;
