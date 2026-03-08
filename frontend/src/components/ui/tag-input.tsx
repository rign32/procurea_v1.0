import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    className?: string;
    suggestions?: string[];
}

export function TagInput({ value, onChange, placeholder = 'Dodaj tag...', className, suggestions }: TagInputProps) {
    const [input, setInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInput('');
        setShowSuggestions(false);
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (input.trim()) addTag(input);
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const filteredSuggestions = suggestions?.filter(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
    );

    return (
        <div className={cn('relative', className)}>
            <div
                className="flex flex-wrap gap-1.5 min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag, i) => (
                    <span
                        key={`${tag}-${i}`}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                            className="hover:text-destructive"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
                    onKeyDown={handleKeyDown}
                    onBlur={() => { if (input.trim()) addTag(input); setTimeout(() => setShowSuggestions(false), 150); }}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground"
                />
            </div>
            {showSuggestions && filteredSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-40 overflow-y-auto">
                    {filteredSuggestions.map((s) => (
                        <button
                            key={s}
                            type="button"
                            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                            onMouseDown={(e) => { e.preventDefault(); addTag(s); }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
