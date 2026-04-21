import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.06em] leading-none',
  {
    variants: {
      state: {
        live: 'bg-brand-soft text-brand border-[#c7d3e6]',
        done: 'bg-good-soft text-good border-good-border',
        err: 'bg-bad-soft text-bad border-bad-border',
        warn: 'bg-warn-soft text-warn border-warn-border',
        idle: 'bg-bg-2 text-muted-ink border-rule',
      },
    },
    defaultVariants: {
      state: 'idle',
    },
  }
);

export interface StatusProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusVariants> {
  /** Show pulsing ring around the dot. Use for `state="live"` active operations. */
  pulse?: boolean;
  /** Hide the leading dot (e.g. for compact layouts). */
  noDot?: boolean;
}

function Status({ className, state, pulse, noDot, children, ...props }: StatusProps) {
  const showPulse = pulse ?? state === 'live';
  return (
    <span className={cn(statusVariants({ state }), className)} {...props}>
      {!noDot && (
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current">
          {showPulse && (
            <span
              aria-hidden
              className="absolute -inset-[3px] rounded-full border-2 border-current opacity-60 animate-ds-pulse"
            />
          )}
        </span>
      )}
      {children}
    </span>
  );
}

export { Status, statusVariants };
