import { cn } from '@/lib/utils';

interface Tab {
    key: string;
    label: string;
    count?: number;
}

interface StatusTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (key: string) => void;
    className?: string;
}

export function StatusTabs({ tabs, activeTab, onTabChange, className }: StatusTabsProps) {
    return (
        <div className={cn('flex gap-1 rounded-lg bg-muted p-1', className)}>
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        activeTab === tab.key
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className={cn(
                            'rounded-full px-1.5 py-0.5 text-xs',
                            activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10',
                        )}>
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
