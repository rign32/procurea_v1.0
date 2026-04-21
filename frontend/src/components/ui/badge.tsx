import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',

        /* ── new product chips (Wave 2+) — match redesign/tokens.css §245-263 ── */
        good: 'bg-good-soft text-good border-good-border',
        warn: 'bg-warn-soft text-warn border-warn-border',
        bad: 'bg-bad-soft text-bad border-bad-border',
        info: 'bg-info-soft text-info border-info-border',
        'brand-chip': 'bg-brand-soft text-brand border-[#c8d4ea]',
        mono: 'bg-bg-2 text-ink-2 border-rule font-mono text-[10.5px] tracking-[0.02em] px-2',
        neutral: 'bg-bg-2 text-ink-2 border-rule',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
