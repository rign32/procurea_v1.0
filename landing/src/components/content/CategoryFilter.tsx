import type { ContentType } from "@/content/contentHub"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export type FilterValue = ContentType | 'all'

interface FilterOption {
  value: FilterValue
  labelEn: string
  labelPl: string
  count: number
}

export interface CategoryFilterProps {
  options: FilterOption[]
  active: FilterValue
  onChange: (value: FilterValue) => void
  className?: string
}

export function CategoryFilter({ options, active, onChange, className = '' }: CategoryFilterProps) {
  return (
    <div
      role="tablist"
      aria-label={isEN ? 'Content type filter' : 'Filtr typu treści'}
      className={`flex flex-wrap items-center gap-2 ${className}`}
    >
      {options.map(option => {
        const isActive = option.value === active
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
              ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white border border-black/[0.08] text-slate-700 hover:border-brand-500/40 hover:text-brand-600'
              }`}
          >
            <span>{isEN ? option.labelEn : option.labelPl}</span>
            <span
              className={`inline-flex items-center justify-center rounded-full text-[11px] font-bold px-1.5 min-w-[22px] h-[18px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {option.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default CategoryFilter
