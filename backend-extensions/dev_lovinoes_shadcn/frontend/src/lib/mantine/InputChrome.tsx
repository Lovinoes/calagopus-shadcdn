import type { CSSProperties, ReactNode } from 'react';
import { useId } from 'react';
import { Label } from '../../ui/label.tsx';
import { cn } from '../cn.ts';
import type { ShadcnSize } from './scales.ts';
import type { ResolvedSlots } from './slots.ts';

/**
 * The chrome Mantine wraps every form control in: label, description, the control, then the error.
 *
 * Mantine calls this `Input.Wrapper`, and its slot names (`label`, `required`, `description`, `error`,
 * `wrapper`, `input`, `section`) are the ones a caller's `classNames`/`styles` will use, so they are
 * honoured here under the same names.
 *
 * The order is Mantine's default (label, description, input, error). `inputWrapperOrder` is not
 * supported because nothing in the panel passes it.
 */

/** Control heights across Mantine's size scale, with shadcn's `h-9` as the middle. */
export const inputSizeClasses: Record<ShadcnSize, string> = {
  xs: 'h-7 px-2 text-xs',
  sm: 'h-8 px-2.5 text-sm',
  default: 'h-9 px-3 text-sm',
  lg: 'h-10 px-3.5 text-base',
  xl: 'h-11 px-4 text-base',
};

/** Widths reserved for a left/right section, matched to the control height. */
const sectionWidthClasses: Record<ShadcnSize, string> = {
  xs: 'w-7',
  sm: 'w-8',
  default: 'w-9',
  lg: 'w-10',
  xl: 'w-11',
};

/** Padding added to the control when a section occupies one side. */
export const sectionPaddingClasses: Record<ShadcnSize, { left: string; right: string }> = {
  xs: { left: 'pl-7', right: 'pr-7' },
  sm: { left: 'pl-8', right: 'pr-8' },
  default: { left: 'pl-9', right: 'pr-9' },
  lg: { left: 'pl-10', right: 'pr-10' },
  xl: { left: 'pl-11', right: 'pr-11' },
};

export interface InputChromeProps {
  /** Id shared by the label's `htmlFor` and the control. */
  id: string;
  label?: ReactNode;
  description?: ReactNode;
  /** Mantine allows a bare `true` to mark the field invalid without a message. */
  error?: ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  slots: ResolvedSlots;
  /** Passed straight through; Mantine types these per component, so the shape is intentionally open. */
  labelProps?: object;
  descriptionProps?: object;
  errorProps?: object;
  children: ReactNode;
}

/** True when Mantine would consider the field invalid. `error` is often a boolean from a form resolver. */
export function hasError(error: ReactNode): boolean {
  return error !== undefined && error !== null && error !== false && error !== '';
}

/** Whether the error carries a message worth rendering, as opposed to just flagging invalidity. */
function hasErrorMessage(error: ReactNode): boolean {
  return hasError(error) && error !== true;
}

export function InputChrome({
  id,
  label,
  description,
  error,
  required,
  withAsterisk,
  slots,
  labelProps,
  descriptionProps,
  errorProps,
  children,
}: InputChromeProps) {
  const showAsterisk = withAsterisk ?? required;

  return (
    <>
      {label ? (
        <Label
          htmlFor={id}
          className={cn('gap-1', slots.className('label'))}
          style={slots.style('label')}
          {...labelProps}
        >
          {label}
          {showAsterisk ? (
            <span
              aria-hidden='true'
              className={cn('text-destructive', slots.className('required'))}
              style={slots.style('required')}
            >
              *
            </span>
          ) : null}
        </Label>
      ) : null}

      {description ? (
        <p
          className={cn('text-xs text-muted-foreground', slots.className('description'))}
          style={slots.style('description')}
          {...descriptionProps}
        >
          {description}
        </p>
      ) : null}

      {children}

      {hasErrorMessage(error) ? (
        <p
          className={cn('text-xs text-destructive', slots.className('error'))}
          style={slots.style('error')}
          {...errorProps}
        >
          {error}
        </p>
      ) : null}
    </>
  );
}

export interface InputSectionProps {
  side: 'left' | 'right';
  size: ShadcnSize;
  /** Mantine's `rightSectionPointerEvents`; a section holding a button needs events, an icon does not. */
  pointerEvents?: CSSProperties['pointerEvents'];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Mantine positions sections absolutely inside the input wrapper and pads the control to clear them.
 * Reproduced here rather than using a flex row, so the control keeps its own border and focus ring.
 */
export function InputSection({ side, size, pointerEvents, className, style, children }: InputSectionProps) {
  return (
    <div
      data-slot='input-section'
      className={cn(
        'absolute inset-y-0 z-10 flex items-center justify-center text-muted-foreground',
        sectionWidthClasses[size],
        side === 'left' ? 'left-0' : 'right-0',
        side === 'left' && 'pointer-events-none',
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      style={{ pointerEvents, ...style }}
    >
      {children}
    </div>
  );
}

/** Mantine generates an id for the label/control pair when the caller does not supply one. */
export function useInputId(explicit: string | undefined): string {
  const generated = useId();
  return explicit ?? generated;
}
