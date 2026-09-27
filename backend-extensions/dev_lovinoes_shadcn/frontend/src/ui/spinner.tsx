import { LoaderCircleIcon } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../lib/cn.ts';

/**
 * shadcn's loading indicator: lucide's circle loader spun with `animate-spin`. There is no separate
 * registry component for it, but every shadcn example that needs a spinner does exactly this.
 */
export function Spinner({ className, ...props }: ComponentProps<typeof LoaderCircleIcon>) {
  return (
    <LoaderCircleIcon
      data-slot='spinner'
      role='status'
      aria-label='Loading'
      className={cn('size-4 shrink-0 animate-spin', className)}
      {...props}
    />
  );
}
