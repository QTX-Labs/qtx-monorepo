import * as React from 'react';
import { cn } from '@workspace/ui/lib/utils';

type VisualBreakProps = {
  variant?: 'gradient' | 'dots' | 'wave' | 'simple';
  className?: string;
};

export function VisualBreak({ variant = 'gradient', className }: VisualBreakProps): React.JSX.Element {
  if (variant === 'dots') {
    return (
      <div className={cn('relative py-16', className)}>
        <div className="container">
          <div className="flex items-center justify-center gap-3">
            <div className="size-2 animate-pulse rounded-full bg-neon-lime" />
            <div className="size-2 animate-pulse rounded-full bg-sunny-yellow delay-150" />
            <div className="size-2 animate-pulse rounded-full bg-warm-orange delay-300" />
            <div className="size-2 animate-pulse rounded-full bg-cool-cyan delay-500" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'wave') {
    return (
      <div className={cn('relative overflow-hidden py-24', className)}>
        <svg
          className="w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            className="fill-primary/5"
          />
        </svg>
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <div className={cn('relative py-12', className)}>
        <div className="container">
          <div className="relative">
            <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary" />
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  // gradient (default)
  return (
    <div className={cn('relative overflow-hidden py-20', className)}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      <div className="container relative">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-lime to-transparent" />
          <div className="flex gap-2">
            <div className="size-2 rounded-full bg-neon-lime animate-pulse" />
            <div className="size-2 rounded-full bg-sunny-yellow animate-pulse delay-150" />
            <div className="size-2 rounded-full bg-cool-cyan animate-pulse delay-300" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cool-cyan to-transparent" />
        </div>
      </div>
    </div>
  );
}
