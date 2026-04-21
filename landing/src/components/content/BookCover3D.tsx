import { ReactNode } from "react"
import styles from "./BookCover3D.module.css"
import { cn } from "@/lib/utils"

export type BookVariant = "hardcover" | "thick" | "thin" | "workbook" | "magazine"
export type BookMotif = "map" | "grid" | "rows" | "radar" | "none"

export interface BookCover3DProps {
  /** Book body style — controls spine depth + page edge treatment */
  variant?: BookVariant
  /** Full CSS background shorthand for the cover face (use gradients) */
  coverBg?: string
  /** Full CSS background shorthand for the spine */
  spineBg?: string
  /** Text along the spine (vertical) */
  spineText?: string
  /** Small uppercase label above the title */
  kicker?: string
  /** Title — em tags get yellow italic styling */
  title: ReactNode
  /** Secondary line beneath title */
  dek?: ReactNode
  /** Brand label — defaults to "Procurea" with P-mark */
  brand?: string
  /** Small pill on top-right of brand row (e.g. "v1.0", "Flagship") */
  pill?: string
  /** Bottom-left foot label */
  footLabel?: string
  /** Big page count number — bottom-right (omit for no count) */
  pageCount?: number | string
  /** Units for page count (e.g. "pages", "tabs", "categories") */
  pageUnit?: string
  /** Decorative motif */
  motif?: BookMotif
  /** "Coming soon" banner overlay */
  comingSoonLabel?: string
  /** Disable 3D tilt (useful in constrained layouts) */
  static?: boolean
  /** Extra classes on outer wrapper */
  className?: string
  /** Accessible label for the whole cover */
  ariaLabel?: string
}

/**
 * 3D book cover — renders a tilted standing book with spine, pages, cover art.
 * Drives via CSS custom properties for coverBg / spineBg, so you can pass
 * any gradient or solid color from a config registry.
 */
export function BookCover3D({
  variant = "hardcover",
  coverBg,
  spineBg,
  spineText = "Procurea",
  kicker,
  title,
  dek,
  brand = "Procurea",
  pill,
  footLabel,
  pageCount,
  pageUnit = "pages",
  motif = "none",
  comingSoonLabel,
  static: isStatic = false,
  className,
  ariaLabel,
}: BookCover3DProps) {
  const motifNode =
    motif === "map" ? <div className={styles.motifMap} aria-hidden="true" /> :
    motif === "grid" ? <div className={styles.motifGrid} aria-hidden="true" /> :
    motif === "rows" ? <div className={styles.motifRows} aria-hidden="true" /> :
    motif === "radar" ? <div className={styles.motifRadar} aria-hidden="true" /> :
    null

  const variantClass = variant === "hardcover" ? "" : styles[variant]

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? (typeof title === "string" ? `Cover: ${title}` : "Lead magnet cover")}
      className={cn(styles.book, variantClass, isStatic && styles.static, className)}
      style={
        {
          "--cover-bg": coverBg,
          "--spine-bg": spineBg,
        } as React.CSSProperties
      }
    >
      <div className={styles.stage}>
        <span className={styles.spine} aria-hidden="true">
          <span className={styles.spineText}>{spineText}</span>
        </span>
        <span className={styles.pages} aria-hidden="true" />

        <div className={styles.face}>
          {comingSoonLabel && <span className={styles.comingSoon}>{comingSoonLabel}</span>}

          {variant === "workbook" && (
            <span className={styles.spiral} aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i /><i />
            </span>
          )}

          <div className={styles.brand}>
            <span className={styles.brandMark}>P</span>
            <span>{brand}</span>
            {pill && <span className={styles.pill}>{pill}</span>}
          </div>

          {motifNode}

          {kicker && <div className={styles.kicker}>{kicker}</div>}
          <h3 className={styles.title}>{title}</h3>
          {dek && <div className={styles.dek}>{dek}</div>}

          <div className={styles.foot}>
            {footLabel && <span>{footLabel}</span>}
            {pageCount !== undefined && (
              <div className={styles.pagesBadge}>
                {pageCount}
                <small>{pageUnit}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookCover3D
