import { cn } from "@/lib/utils"

/**
 * Author Avatars — initial-based
 * -------------------------------
 * Procurea has no stock/founder photography yet, so authors are represented
 * by clean initial-based avatars. Two concrete avatars today:
 *
 *   - RafalAvatar ("RI") — brand teal gradient (Rafał Ignaczak, founder)
 *   - ProcureaResearchAvatar ("PR") — sage gradient (editorial/research team)
 *
 * And a factory:
 *   <AuthorAvatar name="Rafał Ignaczak" size="md" />
 *
 * Accessibility: every SVG has role="img" + aria-label derived from `name`.
 */

export type AvatarSize = "sm" | "md" | "lg"

const SIZE_PX: Record<AvatarSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
}

interface AvatarProps {
  className?: string
  size?: AvatarSize
  ariaLabel?: string
}

/* ------------------------------------------------------------------ */
/* Shared initial-avatar primitive                                      */
/* ------------------------------------------------------------------ */
interface InitialAvatarProps extends AvatarProps {
  initials: string
  gradient: [string, string]
  name: string
  ringClass?: string
}

function InitialAvatar({
  className,
  size = "md",
  ariaLabel,
  initials,
  gradient,
  name,
  ringClass,
}: InitialAvatarProps) {
  const px = SIZE_PX[size]
  const fontSize = px * 0.42
  // unique gradient id per avatar pair so multiple avatars can coexist on one page
  const gradientId = `avatar-grad-${initials.toLowerCase()}`

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full flex-shrink-0",
        ringClass,
        className
      )}
      style={{ width: px, height: px }}
      role="img"
      aria-label={ariaLabel ?? name}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill={`url(#${gradientId})`} />
        {/* inner soft highlight */}
        <circle
          cx="24"
          cy="22"
          r="14"
          fill="rgba(255,255,255,0.18)"
        />
        <text
          x="32"
          y="38"
          textAnchor="middle"
          fontFamily="Inter Tight, Inter, sans-serif"
          fontWeight="700"
          fontSize={(fontSize * 64) / px}
          fill="white"
          letterSpacing="-0.02em"
        >
          {initials}
        </text>
      </svg>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Concrete avatars                                                     */
/* ------------------------------------------------------------------ */
export function RafalAvatar({
  className,
  size = "md",
  ariaLabel = "Rafał Ignaczak",
}: AvatarProps) {
  return (
    <InitialAvatar
      className={className}
      size={size}
      ariaLabel={ariaLabel}
      initials="RI"
      gradient={["#7AADAF", "#2A5C5D"]}
      name="Rafał Ignaczak"
    />
  )
}

export function ProcureaResearchAvatar({
  className,
  size = "md",
  ariaLabel = "Procurea Research team",
}: AvatarProps) {
  return (
    <InitialAvatar
      className={className}
      size={size}
      ariaLabel={ariaLabel}
      initials="PR"
      gradient={["#CDD1B0", "#6F7A52"]}
      name="Procurea Research"
    />
  )
}

/* ------------------------------------------------------------------ */
/* Factory — pick the right avatar by author name                       */
/* ------------------------------------------------------------------ */
interface AuthorAvatarProps extends AvatarProps {
  /** Full author name — e.g. "Rafał Ignaczak" or "Procurea Research". */
  name: string
}

/**
 * Resolve name → initials. Handles:
 *   - "Rafał Ignaczak" → "RI"
 *   - "Procurea Research" → "PR"
 *   - "Maria da Silva" → "MS"
 *   - single-word names → first two chars uppercased
 */
function computeInitials(name: string): string {
  const cleaned = name.trim()
  if (!cleaned) return "??"
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Stable hash → gradient index. Same name always maps to same palette.
 */
function hashToIndex(str: string, buckets: number): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % buckets
}

const FALLBACK_GRADIENTS: Array<[string, string]> = [
  ["#7AADAF", "#2A5C5D"], // brand teal
  ["#CDD1B0", "#6F7A52"], // sage
  ["#F5C451", "#8F5E0E"], // amber
  ["#E7A3BE", "#7B3A5C"], // rose
  ["#34D399", "#047857"], // emerald
  ["#A5A7C7", "#4C3A7A"], // lavender/indigo
]

export function AuthorAvatar({
  name,
  size = "md",
  className,
  ariaLabel,
}: AuthorAvatarProps) {
  // known authors → dedicated components
  const lower = name.trim().toLowerCase()
  if (lower === "rafał ignaczak" || lower === "rafal ignaczak") {
    return <RafalAvatar className={className} size={size} ariaLabel={ariaLabel ?? name} />
  }
  if (lower === "procurea research" || lower === "procurea editorial") {
    return <ProcureaResearchAvatar className={className} size={size} ariaLabel={ariaLabel ?? name} />
  }

  // fallback — deterministic gradient
  const initials = computeInitials(name)
  const gradient = FALLBACK_GRADIENTS[hashToIndex(name, FALLBACK_GRADIENTS.length)]
  return (
    <InitialAvatar
      className={className}
      size={size}
      ariaLabel={ariaLabel ?? name}
      initials={initials}
      gradient={gradient}
      name={name}
    />
  )
}

export default AuthorAvatar
