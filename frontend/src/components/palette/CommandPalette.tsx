import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Target, Users, FileText, Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { isEN } from '@/i18n';
import { useCampaigns } from '@/hooks/useCampaigns';
import suppliersService from '@/services/suppliers.service';
import type { Supplier } from '@/types/supplier.types';

type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  onSelect: () => void;
  group: 'actions' | 'campaigns' | 'suppliers';
};

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { data: campaigns } = useCampaigns();
  const [query, setQuery] = useState('');
  const [supplierResults, setSupplierResults] = useState<Supplier[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setSupplierResults([]);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setSupplierResults([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await suppliersService.getAll({ search: query, pageSize: 8 });
        if (!cancelled) setSupplierResults(res.suppliers ?? []);
      } catch {
        if (!cancelled) setSupplierResults([]);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const items: PaletteItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const campaignItems: PaletteItem[] = (campaigns ?? [])
      .filter((c) =>
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.rfqRequest?.productName?.toLowerCase().includes(q)
      )
      .slice(0, 8)
      .map((c) => ({
        id: `c-${c.id}`,
        label: c.name,
        hint: c.rfqRequest?.productName || c.status,
        icon: <Target className="h-3.5 w-3.5 text-muted-ink" strokeWidth={1.5} />,
        onSelect: () => {
          onOpenChange(false);
          navigate(`/campaigns/${c.id}`);
        },
        group: 'campaigns',
      }));

    const supplierItems: PaletteItem[] = supplierResults.map((s) => ({
      id: `s-${s.id}`,
      label: s.name || s.website || s.id,
      hint: [s.country, s.specialization].filter(Boolean).join(' · '),
      icon: <Users className="h-3.5 w-3.5 text-muted-ink" strokeWidth={1.5} />,
      onSelect: () => {
        onOpenChange(false);
        navigate(`/suppliers/${s.id}`);
      },
      group: 'suppliers',
    }));

    const actionsAll: PaletteItem[] = [
      {
        id: 'new-campaign',
        label: isEN ? 'New campaign' : 'Nowa kampania',
        icon: <Plus className="h-3.5 w-3.5 text-brand" strokeWidth={2} />,
        onSelect: () => {
          onOpenChange(false);
          navigate('/campaigns/new');
        },
        group: 'actions',
      },
      {
        id: 'go-campaigns',
        label: isEN ? 'Go to campaigns' : 'Przejdź do kampanii',
        icon: <Target className="h-3.5 w-3.5 text-muted-ink" strokeWidth={1.5} />,
        onSelect: () => {
          onOpenChange(false);
          navigate('/campaigns');
        },
        group: 'actions',
      },
      {
        id: 'go-suppliers',
        label: isEN ? 'Go to suppliers' : 'Przejdź do dostawców',
        icon: <Users className="h-3.5 w-3.5 text-muted-ink" strokeWidth={1.5} />,
        onSelect: () => {
          onOpenChange(false);
          navigate('/suppliers');
        },
        group: 'actions',
      },
      {
        id: 'go-rfqs',
        label: isEN ? 'Go to RFQs' : 'Przejdź do RFQ',
        icon: <FileText className="h-3.5 w-3.5 text-muted-ink" strokeWidth={1.5} />,
        onSelect: () => {
          onOpenChange(false);
          navigate('/rfqs');
        },
        group: 'actions',
      },
    ];
    const actionItems = actionsAll.filter((a) => !q || a.label.toLowerCase().includes(q));

    return [...actionItems, ...campaignItems, ...supplierItems];
  }, [campaigns, supplierResults, query, navigate, onOpenChange]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[activeIndex]?.onSelect();
    } else if (e.key === 'Escape') {
      onOpenChange(false);
    }
  };

  const grouped = useMemo(() => {
    const groups: Record<PaletteItem['group'], PaletteItem[]> = {
      actions: [],
      campaigns: [],
      suppliers: [],
    };
    items.forEach((it) => groups[it.group].push(it));
    return groups;
  }, [items]);

  const groupLabels: Record<PaletteItem['group'], string> = {
    actions: isEN ? 'Actions' : 'Akcje',
    campaigns: isEN ? 'Campaigns' : 'Kampanie',
    suppliers: isEN ? 'Suppliers' : 'Dostawcy',
  };

  let runningIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        <div className="relative border-b border-rule">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-ink-2 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEN ? 'Search campaigns, suppliers, actions…' : 'Szukaj kampanii, dostawców, akcji…'}
            className="w-full h-12 pl-11 pr-4 bg-transparent text-[14px] placeholder:text-muted-ink-2 focus:outline-none"
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto py-2">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-muted-ink">
              {isEN ? 'No results.' : 'Brak wyników.'}
            </div>
          ) : (
            (['actions', 'campaigns', 'suppliers'] as const).map((group) => {
              const groupItems = grouped[group];
              if (groupItems.length === 0) return null;
              return (
                <div key={group} className="px-2 pb-1">
                  <div className="px-2.5 pt-1.5 pb-1 font-mono text-[9.5px] uppercase tracking-[0.1em] text-muted-ink-2">
                    {groupLabels[group]}
                  </div>
                  {groupItems.map((item) => {
                    const index = runningIndex++;
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => item.onSelect()}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={cn(
                          'flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-[6px] text-[13px]',
                          isActive ? 'bg-bg-2 text-ink' : 'text-ink-2 hover:bg-bg-2'
                        )}
                      >
                        {item.icon}
                        <span className="truncate">{item.label}</span>
                        {item.hint && (
                          <span className="ml-auto font-mono text-[10.5px] text-muted-ink-2 truncate max-w-[180px]">
                            {item.hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-rule px-3 py-1.5 flex items-center gap-3 font-mono text-[10.5px] text-muted-ink-2">
          <span><kbd className="kbd">↑↓</kbd> {isEN ? 'navigate' : 'nawigacja'}</span>
          <span><kbd className="kbd">↵</kbd> {isEN ? 'select' : 'wybierz'}</span>
          <span><kbd className="kbd">esc</kbd> {isEN ? 'close' : 'zamknij'}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
