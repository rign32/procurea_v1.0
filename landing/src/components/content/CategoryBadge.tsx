import type { ContentType } from "@/content/contentHub"

const STYLES: Record<ContentType, { bg: string; text: string; dot: string; label: string; labelPl: string }> = {
  'blog': {
    bg: 'bg-brand-50',
    text: 'text-brand-700',
    dot: 'bg-brand-500',
    label: 'Article',
    labelPl: 'Artykuł',
  },
  'resource': {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    label: 'Guide',
    labelPl: 'Przewodnik',
  },
  'case-study': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Case Study',
    labelPl: 'Case Study',
  },
}

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

export interface CategoryBadgeProps {
  type: ContentType
  className?: string
}

export function CategoryBadge({ type, className = '' }: CategoryBadgeProps) {
  const s = STYLES[type]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${s.bg} ${s.text} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {isEN ? s.label : s.labelPl}
    </span>
  )
}

export default CategoryBadge
