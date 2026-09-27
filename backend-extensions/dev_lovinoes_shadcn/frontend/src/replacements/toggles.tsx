import { Box, type CheckboxProps, type SwitchProps } from '@mantine/core';
import type { ComponentProps, Ref } from 'react';
import CheckboxElement from '@/elements/input/Checkbox.tsx';
import SwitchElement from '@/elements/input/Switch.tsx';
import { cn } from '../lib/cn.ts';
import { hasError, useInputId } from '../lib/mantine/InputChrome.tsx';
import { colorVars, radiusStyle, resolveSize } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { splitStyleProps } from '../lib/mantine/splitProps.ts';
import { type CheckboxSize, Checkbox as ShadcnCheckboxControl } from '../ui/checkbox.tsx';
import { Switch as ShadcnSwitchControl, type SwitchSize } from '../ui/switch.tsx';

/**
 * Mantine lays both of these out as a row of [control, labelWrapper], with `labelPosition` deciding the
 * order and the label wrapper stacking label / description / error. Slot names are Mantine's, so a
 * caller's `classNames={{ input: … }}` lands where it did before.
 */

const CHECKBOX_SIZES: Record<string, CheckboxSize> = {
  xs: 'xs',
  sm: 'sm',
  default: 'default',
  lg: 'lg',
  xl: 'xl',
};

const SWITCH_SIZES: Record<string, SwitchSize> = {
  xs: 'sm',
  sm: 'sm',
  default: 'default',
  lg: 'lg',
  xl: 'lg',
};

const LABEL_TEXT_SIZES: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  default: 'text-sm',
  lg: 'text-base',
  xl: 'text-base',
};

function ShadcnCheckbox({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  size,
  color,
  radius,
  labelPosition = 'right',
  indeterminate,
  icon,
  iconColor,
  autoContrast,
  wrapperProps,
  id,
  disabled,
  ...others
}: CheckboxProps & { ref?: Ref<HTMLInputElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, color });
  const resolved = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  // Style props belong on the root, everything left over on the input itself.
  const { styleProps, rest } = splitStyleProps(others);

  return (
    <Box
      className={cn('flex flex-col gap-1', slots.className('root'), className)}
      style={[{ ...colorVars(color), ...slots.style('root') }, style ?? {}]}
      data-slot='checkbox-field'
      {...styleProps}
      {...wrapperProps}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          labelPosition === 'left' && 'flex-row-reverse justify-end',
          slots.className('body'),
        )}
        style={slots.style('body')}
      >
        <ShadcnCheckboxControl
          ref={ref}
          id={inputId}
          size={CHECKBOX_SIZES[resolved.token]}
          indeterminate={indeterminate}
          icon={icon as ComponentProps<typeof ShadcnCheckboxControl>['icon']}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          wrapperClassName={slots.className('inner')}
          className={slots.className('input')}
          style={{ ...radiusStyle(radius), ...(iconColor ? { color: iconColor } : undefined) }}
          {...rest}
        />
        {label || description ? (
          <div className={cn('flex flex-col gap-0.5', slots.className('labelWrapper'))}>
            {label ? (
              <label
                htmlFor={inputId}
                className={cn(
                  'leading-none font-medium select-none',
                  LABEL_TEXT_SIZES[resolved.token],
                  disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                  slots.className('label'),
                )}
                style={slots.style('label')}
              >
                {label}
              </label>
            ) : null}
            {description ? (
              <span
                className={cn('text-xs text-muted-foreground', slots.className('description'))}
                style={slots.style('description')}
              >
                {description}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {invalid && error !== true ? (
        <span className={cn('text-xs text-destructive', slots.className('error'))} style={slots.style('error')}>
          {error}
        </span>
      ) : null}
    </Box>
  );
}

/**
 * The original wrapper pulled `description` out of Mantine and rendered it under the switch in dimmed
 * extra-small text; that layout is kept so the ~25 pages using it are unaffected.
 */
function ShadcnSwitch({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  size,
  color,
  radius,
  labelPosition = 'right',
  onLabel,
  offLabel,
  thumbIcon,
  withThumbIndicator,
  rootRef,
  wrapperProps,
  id,
  disabled,
  ...others
}: SwitchProps & { ref?: Ref<HTMLInputElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, color });
  const resolved = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  const { styleProps, rest } = splitStyleProps(others);

  return (
    <Box
      className={cn('flex flex-col gap-1', slots.className('root'), className)}
      style={[{ ...colorVars(color), ...slots.style('root') }, style ?? {}]}
      data-slot='switch-field'
      ref={rootRef}
      {...styleProps}
      {...wrapperProps}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          labelPosition === 'left' && 'flex-row-reverse justify-end',
          slots.className('body'),
        )}
        style={slots.style('body')}
      >
        <ShadcnSwitchControl
          ref={ref}
          id={inputId}
          size={SWITCH_SIZES[resolved.token]}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          wrapperClassName={slots.className('track')}
          className={slots.className('input')}
          thumbClassName={slots.className('thumb')}
          style={radiusStyle(radius)}
          {...rest}
        />
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              'leading-none select-none',
              LABEL_TEXT_SIZES[resolved.token],
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              slots.className('label'),
            )}
            style={slots.style('label')}
          >
            {label}
          </label>
        ) : null}
      </div>
      {description ? (
        <div
          className={cn('text-xs text-muted-foreground', slots.className('description'))}
          style={slots.style('description')}
        >
          {description}
        </div>
      ) : null}
      {invalid && error !== true ? (
        <div className={cn('text-xs text-destructive', slots.className('error'))} style={slots.style('error')}>
          {error}
        </div>
      ) : null}
    </Box>
  );
}

export function registerToggleReplacements(): void {
  CheckboxElement.replaceBaseComponent(ShadcnCheckbox);
  SwitchElement.replaceBaseComponent(ShadcnSwitch);
}
