import { useState, useEffect, useRef } from "react"

export function useAnimatedCounter(target: number, duration = 2000, isTriggered = false, decimals = 0) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!isTriggered || startedRef.current) return
    startedRef.current = true

    const startTime = performance.now()
    const multiplier = Math.pow(10, decimals)

    function update(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target * multiplier) / multiplier)

      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    requestAnimationFrame(update)
  }, [isTriggered, target, duration, decimals])

  return count
}
