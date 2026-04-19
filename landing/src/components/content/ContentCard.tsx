import { Link } from "react-router-dom"
import { ArrowRight, Download, BookOpen, TrendingUp } from "lucide-react"
import type { HubItem, ContentType } from "@/content/contentHub"
import { CategoryBadge } from "./CategoryBadge"

const LANG = (import.meta.env.VITE_LANGUAGE || 'pl') as 'pl' | 'en'
const isEN = LANG === 'en'

const GRADIENTS_BY_TYPE: Record<ContentType, string> = {
  'blog': 'from-brand-400 via-brand-600 to-slate-800',
  'resource': 'from-amber-400 via-orange-500 to-rose-600',
  'case-study': 'from-emerald-400 via-teal-600 to-slate-800',
}

const ACTION_LABELS: Record<ContentType, { en: string; pl: string; Icon: typeof ArrowRight }> = {
  'blog': { en: 'Read article', pl: 'Czytaj', Icon: BookOpen },
  'resource': { en: 'Download', pl: 'Pobierz', Icon: Download },
  'case-study': { en: 'Read story', pl: 'Zobacz case', Icon: TrendingUp },
}

function formatDate(dateString: string): string {
  const d = new Date(dateString)
  return d.toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export interface ContentCardProps {
  item: HubItem
  size?: 'default' | 'featured'
  className?: string
}

export function ContentCard({ item, size = 'default', className = '' }: ContentCardProps) {
  const gradient = GRADIENTS_BY_TYPE[item.type]
  const isFeatured = size === 'featured'
  const action = ACTION_LABELS[item.type]

  return (
    <Link
      to={item.href}
      aria-label={`${isEN ? action.en : action.pl}: ${item.title}`}
      className={`group flex flex-col rounded-2xl border border-black/[0.08] bg-white overflow-hidden h-full
        hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${className}`}
    >
      {/* Thumbnail — gradient placeholder with SVG pattern */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${
          isFeatured ? 'aspect-[16/9]' : 'aspect-[16/10]'
        }`}
      >
        {item.heroImage ? (
          <img
            src={item.heroImage}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <>
            <svg
              className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id={`pattern-${item.slug}`}
                  x="0"
                  y="0"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="20" cy="20" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#pattern-${item.slug})`} />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" aria-hidden="true" />
          </>
        )}
        {item.isFeatured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
            ★ {isEN ? 'Featured' : 'Polecane'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${isFeatured ? 'p-7 sm:p-8' : 'p-6'}`}>
        <div className="flex items-center gap-2.5 mb-3">
          <CategoryBadge type={item.type} />
          <span className="text-xs text-slate-500 line-clamp-1">{item.categoryLabel}</span>
        </div>

        <h3
          className={`font-bold font-display tracking-tight leading-tight line-clamp-2 mb-2 text-slate-900 group-hover:text-brand-600 transition-colors ${
            isFeatured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
          }`}
        >
          {item.title}
        </h3>

        <p
          className={`text-slate-600 leading-relaxed line-clamp-3 flex-1 ${
            isFeatured ? 'text-base' : 'text-sm'
          }`}
        >
          {item.excerpt}
        </p>

        <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            {item.readingTime && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <span>{item.readingTime}</span>
              </>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            {isEN ? action.en : action.pl}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ContentCard
