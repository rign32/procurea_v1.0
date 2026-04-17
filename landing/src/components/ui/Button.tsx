import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "default" | "lg"
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-glow-primary hover:scale-[1.02] active:scale-[0.98]",
        variant === "secondary" &&
          "border border-border bg-background text-foreground hover:bg-accent hover:border-primary/30",
        variant === "ghost" &&
          "text-foreground hover:bg-accent",
        size === "default" && "px-6 py-2.5 text-sm",
        size === "lg" && "px-8 py-3.5 text-base",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
