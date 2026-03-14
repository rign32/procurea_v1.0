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
        background: colors || "linear-gradient(135deg, #5E8C8F, #2A5C5D, #7AADAF)",
        backgroundSize: "200% 200%",
      }}
    />
  )
}
