import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                /* ── shadcn legacy (maps to navy via primary) ── */
                default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-md",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-destructive/20 hover:shadow-md",
                outline:
                    "border border-input/50 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-input",
                secondary:
                    "bg-secondary/50 text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent/50 hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",

                /* ── new product design system (Wave 2+) ── */
                cta: "bg-cta text-cta-ink shadow-[inset_0_-2px_0_rgba(14,22,20,0.1)] hover:bg-cta-hover font-semibold",
                accent: "bg-brand text-brand-ink hover:bg-brand-2 font-semibold",
                ink: "bg-ink text-surface hover:bg-ink-2 font-semibold",
                quiet: "bg-transparent text-ink-2 hover:bg-bg-2 hover:text-ink",
                "ds-ghost": "bg-surface text-ink-2 border border-rule-2 hover:border-ink-3 hover:text-ink",
                "ds-danger": "bg-transparent text-bad hover:bg-bad-soft border border-transparent",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
                /* ── new product sizes ── */
                ds: "h-9 px-3.5 py-2 text-[13px] rounded-[8px]",
                "ds-sm": "h-7 px-2.5 text-[12px] rounded-[6px]",
                "ds-lg": "h-11 px-4.5 text-sm rounded-[10px]",
                "ds-icon": "h-7 w-7 p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
