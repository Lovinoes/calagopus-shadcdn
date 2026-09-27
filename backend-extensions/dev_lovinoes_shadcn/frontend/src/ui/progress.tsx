import { Progress as ProgressPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn.ts';

/**
 * shadcn/ui Progress.
 *
 * `indicatorClassName` is added so a caller can recolour the bar, which Mantine's Progress does through
 * its `color` prop, and the transform is left off when `indeterminate` is set so an animation can drive
 * it instead.
 */
export function Progress({
  className,
  indicatorClassName,
  value,
  indeterminate,
  ...props
}: ComponentProps<typeof ProgressPrimitive.Root> & {
  indicatorClassName?: string;
  indeterminate?: boolean;
}) {
  return (
    <ProgressPrimitive.Root
      data-slot='progress'
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      value={indeterminate ? null : value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot='progress-indicator'
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all',
          indeterminate && 'w-2/5 animate-sc-progress',
          indicatorClassName,
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
