import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { isEN } from "@/i18n"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Locale-aware number formatting. PL uses spaces as thousand separators. */
export function formatNumber(value: number | null | undefined): string {
    if (value == null) return '—'
    return value.toLocaleString(isEN ? 'en-US' : 'pl-PL')
}

/** Locale-aware short date (e.g. "Apr 21" / "21 kwi"). */
export function formatShortDate(value: string | Date): string {
    const d = value instanceof Date ? value : new Date(value)
    return d.toLocaleDateString(isEN ? 'en-US' : 'pl-PL', { month: 'short', day: 'numeric' })
}

/** Locale-aware HH:mm time label. */
export function formatTime(value: string | Date): string {
    const d = value instanceof Date ? value : new Date(value)
    return d.toLocaleTimeString(isEN ? 'en-US' : 'pl-PL', { hour: '2-digit', minute: '2-digit' })
}

/** Human relative time: "3m ago", "2h ago", "yesterday". */
export function formatRelative(value: string | Date): string {
    const d = value instanceof Date ? value : new Date(value)
    const diff = Date.now() - d.getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return isEN ? 'just now' : 'przed chwilą'
    if (minutes < 60) return isEN ? `${minutes}m ago` : `${minutes} min temu`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return isEN ? `${hours}h ago` : `${hours} godz. temu`
    const days = Math.floor(hours / 24)
    if (days === 1) return isEN ? 'yesterday' : 'wczoraj'
    if (days < 7) return isEN ? `${days}d ago` : `${days} dni temu`
    return formatShortDate(d)
}
