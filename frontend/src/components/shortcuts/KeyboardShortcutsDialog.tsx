import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { isEN } from '@/i18n';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ShortcutGroup = {
  title: string;
  items: Array<{ keys: string[]; label: string }>;
};

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const groups: ShortcutGroup[] = [
    {
      title: isEN ? 'Navigation' : 'Nawigacja',
      items: [
        { keys: ['⌘', 'K'], label: isEN ? 'Open command palette (search campaigns, suppliers, actions)' : 'Otwórz palette (szukaj kampanii, dostawców, akcji)' },
        { keys: ['?'], label: isEN ? 'Show this dialog' : 'Pokaż ten dialog' },
        { keys: ['Esc'], label: isEN ? 'Close any open dialog' : 'Zamknij otwarty dialog' },
      ],
    },
    {
      title: isEN ? 'Login (magic-link)' : 'Logowanie (magic-link)',
      items: [
        { keys: ['Tab'], label: isEN ? 'Move between email and verify buttons' : 'Przesuwaj się między polami i przyciskami' },
        { keys: ['Enter'], label: isEN ? 'Submit email / verify code' : 'Wyślij email / zweryfikuj kod' },
      ],
    },
    {
      title: isEN ? 'RFQ offer comparison' : 'Porównanie ofert RFQ',
      items: [
        { keys: ['Click', 'checkbox'], label: isEN ? 'Select 2+ offers to compare side-by-side' : 'Zaznacz 2+ oferty aby porównać obok siebie' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEN ? 'Keyboard shortcuts' : 'Skróty klawiszowe'}</DialogTitle>
          <DialogDescription>
            {isEN
              ? 'Procurea is desktop-first — a few shortcuts to move fast.'
              : 'Procurea jest desktop-first — kilka skrótów żeby szybciej pracować.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="label-mono mb-2">{group.title}</div>
              <ul className="space-y-1.5">
                {group.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-ink">{item.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {item.keys.map((k, j) => (
                        <span key={j} className="inline-flex items-center">
                          {j > 0 && <span className="mx-1 text-muted-ink-2">+</span>}
                          <kbd className="px-1.5 py-0.5 rounded-[4px] border border-rule bg-bg-2 text-[11px] font-mono text-ink">
                            {k}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
