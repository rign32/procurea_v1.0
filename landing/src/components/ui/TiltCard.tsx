import { useRef, type ReactNode, type MouseEvent } from "react"

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Max tilt angle in degrees (default 4) */
  maxTilt?: number
}

/**
 * Subtle 3D perspective tilt on hover. Resets smoothly on mouse leave.
 * Uses CSS transform only — no layout shifts, GPU-accelerated.
 */
export function TiltCard({ children, className = "", maxTilt = 4 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale3d(1.01, 1.01, 1.01)`
  }

  function handleMouseLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)"
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ transition: "transform 0.3s ease-out", willChange: "transform" }}
    >
      {children}
    </div>
  )
}
