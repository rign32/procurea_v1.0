import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Note: Radix UI is standard for shadcn, but for now I'll simulate it or use standard HTML attributes if I don't want to install @radix-ui/react-slot yet.
// Actually, let's install class-variance-authority and @radix-ui/react-slot for true premium feel if we want to follow shadcn perfectly. 
// For this MVP step, I'll stick to simple props but structure it like shadcn.
// Wait, I missed installing `class-variance-authority` in the previous step. I should efficiently add it or implement a simpler version. 
// Let's implement a simpler version without CVA for now to save a step, or better yet, install it quickly because it's worth it for "Premium".

// Decision: Install class-variance-authority and @radix-ui/react-slot. It's robust.
// Command: npm install class-variance-authority @radix-ui/react-slot

// For this specific file write, I will write the component assuming CVA is there, and then run the install command immediately after.

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-md",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-destructive/20 hover:shadow-md",
                outline:
                    "border border-input/50 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-input",
                secondary:
                    "bg-secondary/50 text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent/50 hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
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
