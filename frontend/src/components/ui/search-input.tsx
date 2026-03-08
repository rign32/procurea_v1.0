import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Szukaj...', className }: SearchInputProps) {
    const [internal, setInternal] = useState(value);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => { setInternal(value); }, [value]);

    const handleChange = (v: string) => {
        setInternal(v);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(v), 300);
    };

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                type="text"
                value={internal}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {internal && (
                <button
                    onClick={() => handleChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
