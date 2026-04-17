import { useEffect, useRef } from "react"

const COLORS = ["#5E8C8F", "#7AADAF", "#C5E0E2", "#10b981", "#f59e0b", "#a78bfa"]
const PARTICLE_COUNT = 60
const DURATION = 2500

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  color: string
  rotation: number
  rotationSpeed: number
  opacity: number
}

/**
 * Lightweight canvas confetti burst — fires once on mount, then unmounts.
 */
export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: canvas.width / 2,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -14 - 4,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      opacity: 1,
    }))

    const start = performance.now()
    let raf: number

    function animate(now: number) {
      const elapsed = now - start
      if (elapsed > DURATION) return

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      const progress = elapsed / DURATION

      for (const p of particles) {
        p.x += p.vx
        p.vy += 0.25 // gravity
        p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity = Math.max(0, 1 - progress * 1.2)

        ctx!.save()
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rotation * Math.PI) / 180)
        ctx!.globalAlpha = p.opacity
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx!.restore()
      }

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden="true"
    />
  )
}
