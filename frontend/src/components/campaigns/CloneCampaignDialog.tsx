import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Loader2, Search } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn, formatShortDate } from '@/lib/utils';
import { isEN } from '@/i18n';
import campaignsService from '@/services/campaigns.service';
import type { Campaign } from '@/types/campaign.types';

interface CloneCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: Campaign[];
}

export function CloneCampaignDialog({ open, onOpenChange, campaigns }: CloneCampaignDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = campaigns
      .filter((c) => c.status !== 'RUNNING')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (!q) return list;
    return list.filter((c) =>
      c.name?.toLowerCase().includes(q) ||
      c.rfqRequest?.productName?.toLowerCase().includes(q),
    );
  }, [campaigns, query]);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await campaignsService.clone(selectedId);
      onOpenChange(false);
      navigate(`/campaigns/${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : isEN ? 'Clone failed' : 'Klonowanie nie powiodło się';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEN ? 'Clone a past campaign' : 'Sklonuj kampanię'}
          </DialogTitle>
          <DialogDescription>
            {isEN
              ? 'Pick a completed campaign to re-run with the same search criteria.'
              : 'Wybierz zakończoną kampanię i uruchom ją ponownie z tymi samymi kryteriami.'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-ink-2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isEN ? 'Filter by name or product…' : 'Filtruj po nazwie lub produkcie…'}
            className="w-full h-9 pl-8 pr-3 rounded-[8px] bg-surface border border-rule-2 text-[13px] placeholder:text-muted-ink-2 focus:outline-none focus:border-brand"
          />
        </div>

        <div className="max-h-[320px] overflow-y-auto -mx-1 pr-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-muted-ink">
              {isEN ? 'No matching campaigns.' : 'Brak kampanii do wyświetlenia.'}
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-[8px] border transition-colors',
                        isSelected
                          ? 'border-brand bg-brand-softer'
                          : 'border-rule hover:border-rule-3 hover:bg-bg-2'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-semibold truncate">{c.name}</div>
                          <div className="mt-0.5 font-mono text-[10.5px] text-muted-ink flex gap-2">
                            <span>{(c.suppliersFound ?? 0).toLocaleString(isEN ? 'en-US' : 'pl-PL')} {isEN ? 'found' : 'znalezionych'}</span>
                            <span className="text-rule-3">·</span>
                            <span>{formatShortDate(c.createdAt)}</span>
                            <span className="text-rule-3">·</span>
                            <span>{c.status}</span>
                          </div>
                        </div>
                        <Copy
                          className={cn('h-4 w-4 shrink-0', isSelected ? 'text-brand' : 'text-muted-ink-2')}
                          strokeWidth={1.5}
                        />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && (
          <div className="text-[12px] text-bad bg-bad-soft border border-bad-border rounded-[6px] px-3 py-2">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            {isEN ? 'Cancel' : 'Anuluj'}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedId || submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {isEN ? 'Cloning…' : 'Klonowanie…'}
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                {isEN ? 'Clone & run' : 'Sklonuj i uruchom'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
