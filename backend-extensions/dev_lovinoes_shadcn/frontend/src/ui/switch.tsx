import type { ComponentProps, Ref } from 'react';
import { cn } from '../lib/cn.ts';

/**
 * shadcn/ui Switch, built on a native `<input type="checkbox">` rather than Radix, for the same reason
 * as `checkbox.tsx`: Mantine's `Switch` reports changes through a real `onChange` event and the panel
 * reads `e.target.checked` / `e.currentTarget.checked` from it in roughly thirty places.
 *
 * The track is the input itself with `appearance-none`; the thumb is a sibling moved with
 * `peer-checked:translate-x-*`. Sizes and colours are shadcn's, plus `lg`, which Mantine has.
 */

const TRACK_SIZES = {
  sm: 'h-3.5 w-6',
  default: 'h-[1.15rem] w-8',
  lg: 'h-6 w-11',
} as const;

const THUMB_SIZES = {
  sm: 'size-3 peer-checked:translate-x-2.5',
  default: 'size-4 peer-checked:translate-x-3.5',
  lg: 'size-5 peer-checked:translate-x-5',
} as const;

export type SwitchSize = keyof typeof TRACK_SIZES;

export function Switch({
  className,
  wrapperClassName,
  thumbClassName,
  size = 'default',
  ref,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'size'> & {
  size?: SwitchSize;
  wrapperClassName?: string;
  thumbClassName?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  return (
    <span
      data-slot='switch'
      data-size={size}
      className={cn('relative inline-flex shrink-0 items-center', wrapperClassName)}
    >
      <input
        ref={ref}
        type='checkbox'
        role='switch'
        data-slot='switch-input'
        className={cn(
          'peer inline-flex shrink-0 appearance-none items-center rounded-full border border-transparent bg-input shadow-xs transition-all outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'checked:bg-primary dark:bg-input/80 dark:checked:bg-primary',
          TRACK_SIZES[size],
          className,
        )}
        {...props}
      />
      <span
        aria-hidden='true'
        data-slot='switch-thumb'
        className={cn(
          'pointer-events-none absolute left-0.5 block rounded-full bg-background ring-0 transition-transform',
          'dark:bg-foreground dark:peer-checked:bg-primary-foreground',
          THUMB_SIZES[size],
          thumbClassName,
        )}
      />
    </span>
  );
}
