import { cn } from "@/lib/utils"

/**
 * Case Study Thumbnails
 * ----------------------
 * 16:9 emerald-themed thumbnails for case study cards on the content hub,
 * index pages, and related-content rails. Each uses a distinct motif for
 * its industry while sharing the same emerald palette + layout.
 *
 * Usage:
 *   <div className="aspect-video rounded-2xl overflow-hidden">
 *     <AutomotiveThumbnail className="w-full h-full" />
 *   </div>
 *
 *   // Or via registry:
 *   const Thumb = CASE_STUDY_THUMBNAILS[caseStudy.slug]
 *
 * All SVGs have role="img" + aria-label. No external images.
 */

interface ThumbProps {
  className?: string
  ariaLabel?: string
}

/* ------------------------------------------------------------------ */
/* Shared emerald frame                                                 */
/* ------------------------------------------------------------------ */
function EmeraldFrame({
  children,
  className,
  ariaLabel,
  industryLabel,
  statValue,
  statLabel,
}: {
  children: React.ReactNode
  className?: string
  ariaLabel: string
  industryLabel: string
  statValue: string
  statLabel: string
}) {
  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, #064E3B 0%, #047857 45%, #022C22 100%)",
      }}
      role="img"
      aria-label={ariaLabel}
    >
      {/* mesh highlights */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(52,211,153,0.28) 0px, transparent 42%), radial-gradient(circle at 85% 90%, rgba(16,185,129,0.22) 0px, transparent 38%)",
        }}
      />

      {/* grid pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="cs-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cs-grid)" />
      </svg>

      {/* top-left industry pill */}
      <div className="absolute top-5 left-5 z-10">
        <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.16em] bg-emerald-400/20 backdrop-blur-sm text-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300/40">
          Case Study · {industryLabel}
        </span>
      </div>

      {/* motif — center/right */}
      <div className="absolute inset-0 flex items-center justify-end pr-[8%]">
        <div className="w-[42%] max-w-[220px] opacity-95">{children}</div>
      </div>

      {/* stat bottom-left */}
      <div className="absolute bottom-5 left-5 z-10 text-white">
        <div className="font-display font-bold leading-none tracking-tight text-emerald-300" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
          {statValue}
        </div>
        <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
          {statLabel}
        </div>
      </div>

      {/* wordmark bottom-right */}
      <div className="absolute bottom-5 right-5 z-10 text-[11px] font-semibold text-white/80 tracking-tight font-display">
        Procurea
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 1. Automotive — gear/cog                                            */
/* ------------------------------------------------------------------ */
export function AutomotiveThumbnail({
  className,
  ariaLabel = "Automotive manufacturing case study thumbnail",
}: ThumbProps) {
  return (
    <EmeraldFrame
      className={className}
      ariaLabel={ariaLabel}
      industryLabel="Automotive"
      statValue="8"
      statLabel="suppliers in 5 days"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* big gear */}
        <g transform="translate(110 100)">
          {/* teeth ring */}
          <g fill="rgba(255,255,255,0.9)">
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 360) / 12
              return (
                <rect
                  key={i}
                  x="-8"
                  y="-76"
                  width="16"
                  height="18"
                  rx="3"
                  transform={`rotate(${angle})`}
                />
              )
            })}
          </g>
          <circle r="58" fill="rgba(255,255,255,0.95)" />
          <circle r="58" fill="none" stroke="rgba(6,78,59,0.25)" strokeWidth="2" />
          <circle r="20" fill="#064E3B" />
          <circle r="10" fill="#10B981" />
        </g>
        {/* small gear */}
        <g transform="translate(38 142)">
          <g fill="rgba(52,211,153,0.95)">
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8
              return (
                <rect
                  key={i}
                  x="-4"
                  y="-34"
                  width="8"
                  height="10"
                  rx="2"
                  transform={`rotate(${angle})`}
                />
              )
            })}
          </g>
          <circle r="24" fill="rgba(52,211,153,0.95)" />
          <circle r="8" fill="#022C22" />
        </g>
      </svg>
    </EmeraldFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Event Agency — calendar grid                                      */
/* ------------------------------------------------------------------ */
export function EventAgencyThumbnail({
  className,
  ariaLabel = "Event agency case study thumbnail",
}: ThumbProps) {
  return (
    <EmeraldFrame
      className={className}
      ariaLabel={ariaLabel}
      industryLabel="Events"
      statValue="72h"
      statLabel="full vendor stack"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* calendar card */}
        <g transform="translate(28 28)">
          <rect
            x="0"
            y="8"
            width="144"
            height="136"
            rx="10"
            fill="rgba(255,255,255,0.95)"
          />
          {/* binder rings */}
          <rect x="30" y="0" width="6" height="22" rx="2" fill="rgba(255,255,255,0.95)" />
          <rect x="108" y="0" width="6" height="22" rx="2" fill="rgba(255,255,255,0.95)" />
          {/* header */}
          <rect x="0" y="8" width="144" height="30" rx="10" fill="#047857" />
          <rect x="0" y="28" width="144" height="10" fill="#047857" />
          <text
            x="72"
            y="29"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="11"
            fontWeight="700"
            fill="white"
            letterSpacing="0.08em"
          >
            BARCELONA · Q3
          </text>

          {/* 4×5 grid of day cells */}
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 5 }).map((__, c) => {
              const x = 10 + c * 26
              const y = 50 + r * 18
              const day = r * 5 + c + 1
              const isEvent = day === 7 || day === 8 || day === 9
              return (
                <g key={`${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width="22"
                    height="14"
                    rx="3"
                    fill={isEvent ? "#10B981" : "rgba(4,120,87,0.08)"}
                  />
                  <text
                    x={x + 11}
                    y={y + 10}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontSize="7"
                    fontWeight="600"
                    fill={isEvent ? "white" : "#064E3B"}
                  >
                    {day}
                  </text>
                </g>
              )
            })
          )}
        </g>
      </svg>
    </EmeraldFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Construction — building outline                                   */
/* ------------------------------------------------------------------ */
export function ConstructionThumbnail({
  className,
  ariaLabel = "Construction case study thumbnail",
}: ThumbProps) {
  return (
    <EmeraldFrame
      className={className}
      ariaLabel={ariaLabel}
      industryLabel="Construction"
      statValue="15"
      statLabel="subcontractors · 2 weeks"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* blueprint grid */}
        <g transform="translate(20 30)" opacity="0.4">
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 20}
              y1="0"
              x2={i * 20}
              y2="150"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={i * 20}
              x2="160"
              y2={i * 20}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="0.5"
            />
          ))}
        </g>

        {/* building silhouettes — three towers */}
        <g>
          {/* tall building */}
          <rect x="50" y="60" width="40" height="110" fill="rgba(255,255,255,0.95)" rx="2" />
          {/* windows */}
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 3 }).map((__, c) => (
              <rect
                key={`tall-${r}-${c}`}
                x={54 + c * 12}
                y={66 + r * 12}
                width="8"
                height="6"
                rx="1"
                fill={(r + c) % 3 === 0 ? "#10B981" : "#064E3B"}
              />
            ))
          )}
          {/* short building */}
          <rect x="96" y="90" width="34" height="80" fill="rgba(52,211,153,0.95)" rx="2" />
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 2 }).map((__, c) => (
              <rect
                key={`mid-${r}-${c}`}
                x={102 + c * 14}
                y={96 + r * 14}
                width="10"
                height="8"
                rx="1"
                fill={(r + c) % 2 === 0 ? "white" : "#022C22"}
              />
            ))
          )}
          {/* wide building */}
          <rect x="136" y="100" width="40" height="70" fill="rgba(255,255,255,0.85)" rx="2" />
          {Array.from({ length: 4 }).map((_, r) =>
            Array.from({ length: 3 }).map((__, c) => (
              <rect
                key={`wide-${r}-${c}`}
                x={140 + c * 12}
                y={106 + r * 14}
                width="8"
                height="8"
                rx="1"
                fill={(r + c) % 2 === 0 ? "#10B981" : "#064E3B"}
              />
            ))
          )}
        </g>

        {/* crane */}
        <g stroke="rgba(255,255,255,0.85)" strokeWidth="2" fill="none" strokeLinecap="round">
          <line x1="70" y1="60" x2="70" y2="20" />
          <line x1="40" y1="22" x2="110" y2="22" />
          <line x1="70" y1="22" x2="76" y2="14" />
          <line x1="70" y1="22" x2="64" y2="14" />
          <line x1="95" y1="22" x2="95" y2="34" />
          <rect x="90" y="34" width="10" height="6" rx="1" fill="rgba(255,255,255,0.85)" />
        </g>
      </svg>
    </EmeraldFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 4. Restaurant — plate + utensils                                     */
/* ------------------------------------------------------------------ */
export function RestaurantThumbnail({
  className,
  ariaLabel = "Restaurant case study thumbnail",
}: ThumbProps) {
  return (
    <EmeraldFrame
      className={className}
      ariaLabel={ariaLabel}
      industryLabel="HoReCa"
      statValue="14%"
      statLabel="cost reduction · 12 vendors"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* fork (left) */}
        <g transform="translate(32 100)" fill="rgba(255,255,255,0.95)">
          <rect x="-3" y="-60" width="6" height="130" rx="3" />
          <rect x="-16" y="-60" width="4" height="40" rx="2" />
          <rect x="-8" y="-60" width="4" height="40" rx="2" />
          <rect x="0" y="-60" width="4" height="40" rx="2" />
          <rect x="8" y="-60" width="4" height="40" rx="2" />
          <rect x="-16" y="-22" width="28" height="8" rx="3" />
        </g>

        {/* plate (center) */}
        <g transform="translate(108 100)">
          <circle r="72" fill="rgba(255,255,255,0.95)" />
          <circle r="72" fill="none" stroke="rgba(6,78,59,0.2)" strokeWidth="2" />
          <circle r="56" fill="none" stroke="rgba(6,78,59,0.4)" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* food dots */}
          <circle cx="-22" cy="-14" r="8" fill="#10B981" />
          <circle cx="16" cy="-18" r="6" fill="#F5C451" />
          <circle cx="24" cy="10" r="9" fill="#064E3B" />
          <circle cx="-12" cy="22" r="5" fill="#C76F96" />
          <circle cx="0" cy="-4" r="4" fill="#047857" />
        </g>

        {/* knife (right) */}
        <g transform="translate(184 100)" fill="rgba(255,255,255,0.95)">
          <rect x="-3" y="-60" width="6" height="130" rx="3" />
          <path d="M -10 -60 Q 0 -50 -4 -20 L 4 -20 Q 8 -50 10 -60 Z" />
        </g>
      </svg>
    </EmeraldFrame>
  )
}

/* ------------------------------------------------------------------ */
/* 5. Cosmetics — shopping bag                                          */
/* ------------------------------------------------------------------ */
export function CosmeticsThumbnail({
  className,
  ariaLabel = "Cosmetics case study thumbnail",
}: ThumbProps) {
  return (
    <EmeraldFrame
      className={className}
      ariaLabel={ariaLabel}
      industryLabel="D2C Retail"
      statValue="18"
      statLabel="EU makers · 3 weeks"
    >
      <svg viewBox="0 0 200 200" className="w-full h-full" aria-hidden="true">
        {/* shopping bag body */}
        <g transform="translate(100 108)">
          {/* handle */}
          <path
            d="M -28 -58 Q -28 -82 0 -82 Q 28 -82 28 -58"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* bag */}
          <path
            d="M -54 -58 L 54 -58 L 46 66 L -46 66 Z"
            fill="rgba(255,255,255,0.95)"
          />
          {/* fold detail */}
          <path
            d="M -54 -58 L 54 -58 L 54 -50 L -54 -50 Z"
            fill="rgba(52,211,153,0.3)"
          />
          {/* GOTS / COSMOS badge on bag */}
          <g transform="translate(0 8)">
            <circle r="22" fill="#10B981" />
            <text
              textAnchor="middle"
              y="-3"
              fontFamily="Inter Tight, Inter, sans-serif"
              fontSize="9"
              fontWeight="800"
              fill="white"
              letterSpacing="0.05em"
            >
              GOTS
            </text>
            <text
              textAnchor="middle"
              y="8"
              fontFamily="Inter, sans-serif"
              fontSize="6"
              fontWeight="600"
              fill="white"
              letterSpacing="0.1em"
            >
              COSMOS
            </text>
          </g>
          {/* tag */}
          <g transform="translate(-38 -40)">
            <rect x="-10" y="-4" width="20" height="14" rx="2" fill="#F5C451" />
            <circle cx="0" cy="-4" r="2" fill="#064E3B" />
            <text
              x="0"
              y="7"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="6"
              fontWeight="700"
              fill="#064E3B"
            >
              EU
            </text>
          </g>
        </g>

        {/* sparkle accents */}
        <g fill="rgba(255,255,255,0.7)">
          <path d="M 36 44 L 38 50 L 44 52 L 38 54 L 36 60 L 34 54 L 28 52 L 34 50 Z" />
          <path d="M 168 48 L 169 52 L 173 53 L 169 54 L 168 58 L 167 54 L 163 53 L 167 52 Z" />
          <path d="M 176 150 L 178 156 L 184 158 L 178 160 L 176 166 L 174 160 L 168 158 L 174 156 Z" />
        </g>
      </svg>
    </EmeraldFrame>
  )
}

/* ------------------------------------------------------------------ */
/* Registry — map case study slug to thumbnail component               */
/* ------------------------------------------------------------------ */
export const CASE_STUDY_THUMBNAILS: Record<
  string,
  React.FC<{ className?: string }>
> = {
  "automotive-8-suppliers-5-days": AutomotiveThumbnail,
  "event-agency-barcelona-72h": EventAgencyThumbnail,
  "hvac-subcontractors-developer": ConstructionThumbnail,
  "restaurant-chain-12-vendors": RestaurantThumbnail,
  "d2c-cosmetics-nearshore-migration": CosmeticsThumbnail,
}

export default CASE_STUDY_THUMBNAILS
