import { CheckIcon, MinusIcon } from 'lucide-react';
import { type ComponentProps, type ReactNode, type Ref, useCallback, useEffect, useRef } from 'react';
import { cn } from '../lib/cn.ts';
import { assignRef } from '../lib/mergeRefs.ts';

/**
 * shadcn/ui Checkbox, built on a native `<input type="checkbox">` instead of Radix.
 *
 * This is one of two places the extension deliberately leaves shadcn's implementation behind, and the
 * reason is the props contract. Mantine's `Checkbox` takes a real `onChange` event handler, and the
 * panel reads both `e.target.checked` and `e.currentTarget.checked` from it — see
 * `elements/data-display/Table.tsx` and the file-manager row components. Radix's `Checkbox.Root`
 * reports changes as `onCheckedChange(boolean)`, so a Radix-based replacement would have to fabricate a
 * synthetic event, and any caller reaching for a field we did not fake would break.
 *
 * The visual result is shadcn's: the same class strings, applied to an `appearance-none` input with the
 * tick and dash as siblings driven by `peer-checked` / `peer-indeterminate`. A native checkbox is also
 * better for labels, forms and assistive tech.
 */

const BOX_SIZES = {
  xs: 'size-3.5',
  sm: 'size-4',
  default: 'size-4.5',
  lg: 'size-5',
  xl: 'size-6',
} as const;

const ICON_SIZES = {
  xs: 'size-3',
  sm: 'size-3.5',
  default: 'size-3.5',
  lg: 'size-4',
  xl: 'size-4.5',
} as const;

export type CheckboxSize = keyof typeof BOX_SIZES;

export function Checkbox({
  className,
  wrapperClassName,
  size = 'default',
  indeterminate = false,
  icon,
  ref,
  ...props
}: Omit<ComponentProps<'input'>, 'type' | 'size'> & {
  size?: CheckboxSize;
  /** Mirrors the DOM property, which has no attribute equivalent and must be set imperatively. */
  indeterminate?: boolean;
  /** Mantine's `icon` render prop, kept so callers passing a custom tick keep working. */
  icon?: (props: { indeterminate: boolean | undefined; className: string }) => ReactNode;
  wrapperClassName?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  const innerRef = useRef<HTMLInputElement | null>(null);

  const setRef = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const iconClassName = cn('pointer-events-none absolute text-primary-foreground', ICON_SIZES[size]);

  return (
    <span data-slot='checkbox' className={cn('relative inline-grid shrink-0 place-items-center', wrapperClassName)}>
      <input
        ref={setRef}
        type='checkbox'
        data-slot='checkbox-input'
        className={cn(
          'peer shrink-0 appearance-none rounded-[4px] border border-input shadow-xs transition-shadow outline-none',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
          'checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary',
          'dark:bg-input/30 dark:checked:bg-primary dark:indeterminate:bg-primary',
          BOX_SIZES[size],
          className,
        )}
        {...props}
      />
      {icon ? (
        <span className={cn(iconClassName, 'hidden peer-checked:block peer-indeterminate:block')}>
          {icon({ indeterminate, className: ICON_SIZES[size] })}
        </span>
      ) : (
        <>
          <CheckIcon className={cn(iconClassName, 'hidden peer-checked:block peer-indeterminate:hidden')} />
          <MinusIcon className={cn(iconClassName, 'hidden peer-indeterminate:block')} />
        </>
      )}
    </span>
  );
}
