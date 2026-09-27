import { type ActionIconProps, Box, type MantineStyleProp, type PolymorphicComponentProps } from '@mantine/core';
import { XIcon } from 'lucide-react';
import type { CSSProperties, MouseEvent as ReactMouseEvent, ReactNode, Ref } from 'react';
import ActionIconElement from '@/elements/buttons/ActionIcon.tsx';
import ButtonElement, { type ButtonProps } from '@/elements/buttons/Button.tsx';
import CloseButtonElement, { type ButtonProps as CloseButtonProps } from '@/elements/buttons/CloseButton.tsx';
import { cn } from '../lib/cn.ts';
import { colorVars, radiusStyle, resolveSize, resolveVariant, variantExtraClasses } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { buttonVariants, compactSizeClasses } from '../ui/button.tsx';
import { Spinner } from '../ui/spinner.tsx';

/**
 * Mantine renders the button label through a flex container whose `justify` is configurable; the panel
 * leans on it for full-width buttons with an icon pushed to one side.
 */
const JUSTIFY_CLASSES: Record<string, string> = {
  center: 'justify-center',
  'space-between': 'justify-between',
  'flex-start': 'justify-start',
  start: 'justify-start',
  'flex-end': 'justify-end',
  end: 'justify-end',
};

/**
 * Mantine's `style` prop accepts a function of the theme and arrays of those, and `Box` merges them
 * left to right with style props winning last. Passing our computed styles as the first entry keeps a
 * caller's `style` able to override us, which is the behaviour the original components had.
 */
function mergedStyle(ours: CSSProperties | undefined, callers: MantineStyleProp | undefined): MantineStyleProp {
  return [ours ?? {}, callers ?? {}];
}

function ShadcnButton({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  variant = 'filled',
  color,
  size,
  radius,
  leftSection,
  rightSection,
  justify = 'center',
  fullWidth,
  loading,
  loaderProps,
  autoContrast,
  gradient,
  unstyled,
  type = 'button',
  onClick,
  disabled,
  ...rest
}: ButtonProps & {
  ref?: Ref<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void | Promise<void>;
}) {
  const slots = useMantineSlots(classNames, styles, { variant, color, size });
  const resolved = resolveSize(size);
  // Matches the original wrapper: an explicitly disabled button is not also a loading button.
  const isLoading = disabled ? false : Boolean(loading);

  const iconSizeClass = resolved.token === 'xs' ? 'size-3' : 'size-4';

  return (
    <Box
      component='button'
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      data-slot='button'
      data-loading={isLoading || undefined}
      onClick={onClick}
      className={cn(
        !unstyled &&
          buttonVariants({
            variant: resolveVariant(variant),
            size: resolved.token,
          }),
        !unstyled && resolved.compact && compactSizeClasses[resolved.token],
        !unstyled && variantExtraClasses(variant),
        !unstyled && fullWidth && 'w-full',
        !unstyled && JUSTIFY_CLASSES[justify],
        isLoading && 'cursor-wait',
        slots.className('root'),
        className,
      )}
      style={mergedStyle(
        {
          ...colorVars(color),
          ...radiusStyle(radius),
          ...slots.style('root'),
        },
        style,
      )}
      {...rest}
    >
      {isLoading ? (
        <Spinner className={cn(iconSizeClass, loaderProps?.className)} />
      ) : (
        leftSection && (
          <span data-slot='button-section' className={cn('inline-flex shrink-0 items-center')}>
            {leftSection}
          </span>
        )
      )}
      {/*
       * Mantine wraps the label in its own element, and callers style that slot — `elements/navigation/
       * Sidebar.tsx` passes `styles={{ label: { width: '100%' } }}` to make a sidebar link's contents
       * left-aligned. The wrapper is only added when a caller actually targets the slot, so the common
       * case keeps shadcn's flat DOM and its `has-[>svg]` padding rule.
       */}
      {slots.className('label') || slots.style('label') ? (
        <span className={slots.className('label')} style={slots.style('label')}>
          {children as ReactNode}
        </span>
      ) : (
        (children as ReactNode)
      )}
      {rightSection && (
        <span data-slot='button-section' className='inline-flex shrink-0 items-center'>
          {rightSection}
        </span>
      )}
    </Box>
  );
}

/**
 * ActionIcon is a square icon-only button. The panel calls it with numeric sizes as well as keywords,
 * which `resolveSize` surfaces as `custom` and is applied as an explicit width/height.
 */
function ShadcnActionIcon({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  variant = 'subtle',
  color,
  size,
  radius,
  loading,
  loaderProps,
  autoContrast,
  gradient,
  unstyled,
  disabled,
  component,
  ...rest
}: PolymorphicComponentProps<'button', ActionIconProps> & { ref?: Ref<HTMLButtonElement> }) {
  const slots = useMantineSlots(classNames, styles, { variant, color, size });
  const resolved = resolveSize(size);
  const isLoading = disabled ? false : Boolean(loading);

  const iconSizeToken =
    resolved.token === 'xs'
      ? 'icon-xs'
      : resolved.token === 'sm'
        ? 'icon-sm'
        : resolved.token === 'lg' || resolved.token === 'xl'
          ? 'icon-lg'
          : 'icon';

  return (
    <Box
      component={component ?? 'button'}
      ref={ref}
      type={component ? undefined : 'button'}
      disabled={Boolean(disabled) || isLoading}
      aria-busy={isLoading || undefined}
      data-slot='action-icon'
      data-loading={isLoading || undefined}
      className={cn(
        !unstyled &&
          buttonVariants({
            variant: resolveVariant(variant),
            size: iconSizeToken,
          }),
        !unstyled && variantExtraClasses(variant),
        isLoading && 'cursor-wait',
        slots.className('root'),
        className,
      )}
      style={mergedStyle(
        {
          ...colorVars(color),
          ...radiusStyle(radius),
          ...(resolved.custom ? { width: resolved.custom, height: resolved.custom } : undefined),
          ...slots.style('root'),
        },
        style,
      )}
      {...rest}
    >
      {isLoading ? <Spinner className={cn('size-4', loaderProps?.className)} /> : children}
    </Box>
  );
}

function ShadcnCloseButton({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  variant = 'subtle',
  size,
  radius,
  iconSize,
  icon,
  disabled,
  onClick,
  ...rest
}: CloseButtonProps & { ref?: Ref<HTMLButtonElement> }) {
  const slots = useMantineSlots(classNames, styles, { variant, size });
  const resolved = resolveSize(size);
  const iconSizeToken = resolved.token === 'xs' ? 'icon-xs' : resolved.token === 'sm' ? 'icon-sm' : 'icon';

  return (
    <Box
      component='button'
      ref={ref}
      type='button'
      disabled={disabled}
      data-slot='close-button'
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: resolveVariant(variant), size: iconSizeToken }),
        'opacity-70 hover:opacity-100',
        slots.className('root'),
        className,
      )}
      style={mergedStyle({ ...radiusStyle(radius), ...slots.style('root') }, style)}
      {...rest}
    >
      {children ?? icon ?? <XIcon style={iconSize ? { width: iconSize, height: iconSize } : undefined} />}
      <span className='sr-only'>Close</span>
    </Box>
  );
}

export function registerButtonReplacements(): void {
  ButtonElement.replaceBaseComponent(ShadcnButton);
  ActionIconElement.replaceBaseComponent(ShadcnActionIcon);
  CloseButtonElement.replaceBaseComponent(ShadcnCloseButton);
}
