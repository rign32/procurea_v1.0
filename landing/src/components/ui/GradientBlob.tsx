import { cn } from "@/lib/utils"

interface GradientBlobProps {
  className?: string
  colors?: string
}

export function GradientBlob({ className, colors }: GradientBlobProps) {
  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-20 animate-gradient-x",
        className
      )}
      style={{
        background: colors || "linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6)",
        backgroundSize: "200% 200%",
      }}
    />
  )
}
