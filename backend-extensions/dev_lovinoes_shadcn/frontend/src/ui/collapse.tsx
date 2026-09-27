import type { ComponentProps, CSSProperties } from 'react';
import { cn } from '../lib/cn.ts';

/**
 * An animated show/hide region, standing in for Mantine's `Collapse`.
 *
 * Built on a `grid-template-rows` transition between `0fr` and `1fr` rather than Radix's Collapsible:
 * Radix animates with keyframes that read `--radix-collapsible-content-height`, which would pull in
 * another set of keyframes, and Mantine's `Collapse` has no trigger to pair with a Collapsible root —
 * it is driven purely by its `in` prop.
 */
export function Collapse({
  open,
  duration = 200,
  easing = 'ease',
  animateOpacity = true,
  className,
  children,
  style,
  ...props
}: Omit<ComponentProps<'div'>, 'style'> & {
  open: boolean;
  duration?: number;
  easing?: string;
  animateOpacity?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      data-slot='collapse'
      data-state={open ? 'open' : 'closed'}
      aria-hidden={!open}
      className={cn('grid data-[state=closed]:grid-rows-[0fr] data-[state=open]:grid-rows-[1fr]', className)}
      style={{
        transitionProperty: animateOpacity ? 'grid-template-rows, opacity' : 'grid-template-rows',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: easing,
        opacity: animateOpacity && !open ? 0 : 1,
        ...style,
      }}
      {...props}
    >
      <div className='overflow-hidden'>{children}</div>
    </div>
  );
}
