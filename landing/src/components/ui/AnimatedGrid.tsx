interface AnimatedGridProps {
  /** Dot size in pixels (default 1) */
  dotSize?: number
  /** Grid spacing in pixels (default 32) */
  spacing?: number
  /** Dot color (default "rgba(255,255,255,0.08)") */
  color?: string
  /** Additional classes */
  className?: string
  /** Enable subtle drift animation (default true) */
  animate?: boolean
}

/**
 * Reusable animated dot grid background — CSS-only, zero JS overhead.
 * Renders a radial-gradient dot pattern with optional slow drift animation.
 */
export function AnimatedGrid({
  dotSize = 1,
  spacing = 32,
  color = "rgba(255,255,255,0.08)",
  className = "",
  animate = true,
}: AnimatedGridProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${animate ? "animate-drift" : ""} ${className}`}
      style={{
        backgroundImage: `radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
      }}
      aria-hidden="true"
    />
  )
}
