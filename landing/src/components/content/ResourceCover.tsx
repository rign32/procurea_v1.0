import { cn } from "@/lib/utils"

interface ResourceCoverProps {
  slug: string
  title: string
  /** If true, applies hover lift. Off for static contexts. */
  hover?: boolean
  /** Thumb = small card in grid. Hero = big detail page. */
  size?: "thumb" | "hero"
  className?: string
}

/**
 * Renders the real cover.webp illustration for a lead magnet.
 * Flat editorial approach — no fake 3D, no spine tricks.
 * The illustrations themselves are the visual story.
 */
export function ResourceCover({
  slug,
  title,
  hover = true,
  size = "thumb",
  className,
}: ResourceCoverProps) {
  const src = `/resources/downloads/${slug}/cover.webp`

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-[#0b1a3d]",
        size === "hero"
          ? "shadow-[0_24px_64px_-16px_rgba(8,14,28,0.35),0_8px_24px_-8px_rgba(8,14,28,0.15)]"
          : "shadow-[0_8px_24px_-8px_rgba(8,14,28,0.2),0_2px_6px_rgba(8,14,28,0.08)]",
        hover && "transition-transform duration-300 will-change-transform hover:-translate-y-1",
        className
      )}
      style={{ aspectRatio: "16 / 9" }}
    >
      <img
        src={src}
        alt={`Okładka: ${title}`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
}

export default ResourceCover
