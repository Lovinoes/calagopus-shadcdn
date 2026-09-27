import type { ComponentProps } from 'react';
import { cn } from '../lib/cn.ts';

/**
 * A keyboard key, in shadcn's house style — a muted, bordered chip with a mono face. shadcn's registry
 * has no `kbd` component; this is the treatment its docs and the `command` dialog use for shortcut hints.
 */
export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot='kbd'
      className={cn(
        'pointer-events-none inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-1 rounded-sm border border-border bg-muted px-1.5 font-sans text-[0.6875rem] font-medium text-muted-foreground select-none',
        className,
      )}
      {...props}
    />
  );
}

/**
 * The larger, raised key the quick-actions palette uses. Keeps the original's physical-key look (a
 * bottom shadow and a top inner highlight) with shadcn's tokens.
 */
export function KbdKey({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='kbd-key'
      className={cn(
        'inline-flex h-8 w-11 items-center justify-center rounded-md border border-border bg-linear-to-b from-accent to-card font-sans text-xs font-semibold tracking-[0.02em] text-foreground uppercase',
        'shadow-[0_2px_0_var(--border),inset_0_1px_0_rgb(255_255_255/0.05)]',
        className,
      )}
      {...props}
    />
  );
}
