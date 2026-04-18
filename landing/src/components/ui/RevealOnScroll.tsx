import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, type ReactNode } from "react"

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "left" | "right"
  scale?: boolean
  /** Subtle parallax Y-offset on scroll (default false). GPU-composited. */
  parallax?: boolean
}

export function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  scale = false,
  parallax = false,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [8, -8])

  const directionOffset = {
    up: { y: 30, x: 0 },
    left: { y: 0, x: -30 },
    right: { y: 0, x: 30 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
        ...(scale && { scale: 0.97 }),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        ...(scale && { scale: 1 }),
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      }}
      style={parallax ? { y: parallaxY } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  )
}
