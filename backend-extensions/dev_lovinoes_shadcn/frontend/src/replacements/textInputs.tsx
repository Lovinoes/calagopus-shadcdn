import {
  Box,
  type NumberInputProps,
  type PasswordInputProps,
  type TextareaProps,
  type TextInputProps,
} from '@mantine/core';
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { type ReactNode, type Ref, useState } from 'react';
import NumberInputElement from '@/elements/input/NumberInput.tsx';
import PasswordInputElement from '@/elements/input/PasswordInput.tsx';
import TextAreaElement from '@/elements/input/TextArea.tsx';
import TextInputElement from '@/elements/input/TextInput.tsx';
import { cn } from '../lib/cn.ts';
import {
  hasError,
  InputChrome,
  InputSection,
  inputSizeClasses,
  sectionPaddingClasses,
  useInputId,
} from '../lib/mantine/InputChrome.tsx';
import { radiusStyle, resolveSize, type ShadcnSize } from '../lib/mantine/scales.ts';
import { type ResolvedSlots, useMantineSlots } from '../lib/mantine/slots.ts';
import { splitStyleProps } from '../lib/mantine/splitProps.ts';
import { Input } from '../ui/input.tsx';
import { Textarea } from '../ui/textarea.tsx';

/**
 * Mantine's text-input family.
 *
 * All four originals share one habit worth keeping: they default the placeholder to the label when the
 * label is a plain string, so a field reads the same whether or not its label is visible.
 */

/** `variant='unstyled'` strips the field's chrome; Mantine's `filled` gives it a muted surface. */
const VARIANT_CLASSES: Record<string, string> = {
  unstyled: 'rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent',
  filled: 'border-transparent bg-muted dark:bg-muted',
};

/** Static, because Tailwind cannot see a class name that is built at runtime. */
const RESIZE_CLASSES: Record<string, string> = {
  none: 'resize-none',
  both: 'resize',
  horizontal: 'resize-x',
  vertical: 'resize-y',
};

const TEXT_SIZE_CLASSES: Record<ShadcnSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  default: 'text-sm',
  lg: 'text-base',
  xl: 'text-base',
};

function labelPlaceholder(label: ReactNode, placeholder: string | undefined): string | undefined {
  if (placeholder !== undefined) {
    return placeholder;
  }
  return typeof label === 'string' ? label : undefined;
}

/** The classes the control itself needs: size, variant, and padding to clear any section beside it. */
function controlClasses({
  size,
  variant,
  hasLeftSection,
  hasRightSection,
  pointer,
  slots,
}: {
  size: ShadcnSize;
  variant: string | undefined;
  hasLeftSection: boolean;
  hasRightSection: boolean;
  pointer: boolean | undefined;
  slots: ResolvedSlots;
}): string {
  return cn(
    inputSizeClasses[size],
    hasLeftSection && sectionPaddingClasses[size].left,
    hasRightSection && sectionPaddingClasses[size].right,
    variant && VARIANT_CLASSES[variant],
    pointer && 'cursor-pointer',
    slots.className('input'),
  );
}

function ShadcnTextInput({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  placeholder,
  required,
  withAsterisk,
  size,
  radius,
  variant,
  leftSection,
  rightSection,
  leftSectionPointerEvents,
  rightSectionPointerEvents,
  leftSectionWidth,
  rightSectionWidth,
  leftSectionProps,
  rightSectionProps,
  wrapperProps,
  labelProps,
  descriptionProps,
  errorProps,
  inputWrapperOrder,
  withErrorStyles,
  pointer,
  inputSize,
  inputContainer,
  value,
  id,
  ...others
}: TextInputProps & { ref?: Ref<HTMLInputElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, variant });
  const { token } = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  const { styleProps, rest } = splitStyleProps(others);

  return (
    <Box
      className={cn('flex w-full flex-col gap-1.5', slots.className('root'), className)}
      style={[slots.style('root') ?? {}, style ?? {}]}
      data-slot='text-field'
      {...styleProps}
      {...wrapperProps}
    >
      <InputChrome
        id={inputId}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        slots={slots}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        errorProps={errorProps}
      >
        <div className={cn('relative', slots.className('wrapper'))} style={slots.style('wrapper')}>
          {leftSection ? (
            <InputSection side='left' size={token} pointerEvents={leftSectionPointerEvents} {...leftSectionProps}>
              {leftSection}
            </InputSection>
          ) : null}
          <Input
            ref={ref}
            id={inputId}
            value={value ?? undefined}
            placeholder={labelPlaceholder(label, placeholder)}
            required={required}
            size={inputSize ? Number(inputSize) : undefined}
            aria-invalid={(invalid && withErrorStyles !== false) || undefined}
            className={controlClasses({
              size: token,
              variant,
              hasLeftSection: Boolean(leftSection),
              hasRightSection: Boolean(rightSection),
              pointer,
              slots,
            })}
            style={{ ...radiusStyle(radius), ...slots.style('input') }}
            {...rest}
          />
          {rightSection ? (
            <InputSection
              side='right'
              size={token}
              pointerEvents={rightSectionPointerEvents ?? 'auto'}
              {...rightSectionProps}
            >
              {rightSection}
            </InputSection>
          ) : null}
        </div>
      </InputChrome>
    </Box>
  );
}

function ShadcnTextArea({
  ref,
  className,
  style,
  styles,
  classNames,
  label,
  description,
  error,
  placeholder,
  required,
  withAsterisk,
  size,
  radius,
  variant,
  wrapperProps,
  labelProps,
  descriptionProps,
  errorProps,
  inputWrapperOrder,
  withErrorStyles,
  autosize,
  minRows,
  maxRows,
  resize,
  leftSection,
  rightSection,
  inputContainer,
  inputSize,
  pointer,
  value,
  id,
  ...others
}: TextareaProps & { ref?: Ref<HTMLTextAreaElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, variant });
  const { token } = resolveSize(size);
  const inputId = useInputId(id);
  const invalid = hasError(error);
  const { styleProps, rest } = splitStyleProps(others);

  return (
    <Box
      className={cn('flex w-full flex-col gap-1.5', slots.className('root'), className)}
      style={[slots.style('root') ?? {}, style ?? {}]}
      data-slot='textarea-field'
      {...styleProps}
      {...wrapperProps}
    >
      <InputChrome
        id={inputId}
        label={label}
        description={description}
        error={error}
        required={required}
        withAsterisk={withAsterisk}
        slots={slots}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        errorProps={errorProps}
      >
        <Textarea
          ref={ref}
          id={inputId}
          value={value ?? undefined}
          placeholder={labelPlaceholder(label, placeholder)}
          required={required}
          rows={minRows}
          aria-invalid={(invalid && withErrorStyles !== false) || undefined}
          className={cn(
            // shadcn's Textarea already grows with its content via `field-sizing-content`, which is what
            // Mantine's `autosize` does, so a non-autosize field is the one that needs pinning.
            !autosize && 'field-sizing-fixed',
            resize && RESIZE_CLASSES[resize],
            TEXT_SIZE_CLASSES[token],
            variant && VARIANT_CLASSES[variant],
            slots.className('input'),
          )}
          style={{
            ...radiusStyle(radius),
            ...(autosize && maxRows ? { maxHeight: `calc(${maxRows} * 1.5rem + 1rem)` } : undefined),
            ...slots.style('input'),
          }}
          {...rest}
        />
      </InputChrome>
    </Box>
  );
}

function PasswordVisibilityIcon({ reveal }: { reveal: boolean }) {
  return reveal ? <EyeOffIcon className='size-4' /> : <EyeIcon className='size-4' />;
}

function ShadcnPasswordInput({
  ref,
  visible,
  defaultVisible,
  onVisibilityChange,
  visibilityToggleIcon,
  visibilityToggleButtonProps,
  visibilityToggleFocusable,
  rightSection,
  ...others
}: PasswordInputProps & { ref?: Ref<HTMLInputElement> }) {
  const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible ?? false);
  const isVisible = visible ?? uncontrolledVisible;

  const toggle = () => {
    const next = !isVisible;
    if (visible === undefined) {
      setUncontrolledVisible(next);
    }
    onVisibilityChange?.(next);
  };

  const ToggleIcon = visibilityToggleIcon ?? PasswordVisibilityIcon;

  return (
    <ShadcnTextInput
      ref={ref}
      type={isVisible ? 'text' : 'password'}
      rightSection={
        <button
          type='button'
          tabIndex={visibilityToggleFocusable ? undefined : -1}
          onClick={toggle}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          className='inline-flex size-full items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground'
          {...visibilityToggleButtonProps}
        >
          <ToggleIcon reveal={isVisible} />
        </button>
      }
      {...(others as TextInputProps)}
    />
  );
}

/**
 * Mantine's NumberInput over a plain text field.
 *
 * `onChange` keeps Mantine's contract of `number | string`: a complete number goes out as a number, and
 * a half-typed value such as `'-'` or `'1.'` as the raw string, which is what Mantine does and what
 * makes the field typeable at all.
 *
 * The number-formatting props (`prefix`, `suffix`, `thousandSeparator`, `decimalScale`,
 * `fixedDecimalScale`, `decimalSeparator`, …) and the press-and-hold stepping props are accepted and
 * ignored rather than leaked to the DOM: Mantine implements them through react-number-format, nothing in
 * the panel uses them, and a half-working imitation would be worse than none. See docs/COMPONENTS.md.
 */
function ShadcnNumberInput({
  ref,
  value,
  defaultValue,
  onChange,
  onValueChange,
  min,
  max,
  step = 1,
  clampBehavior = 'blur',
  allowDecimal = true,
  allowNegative = true,
  hideControls = false,
  decimalScale,
  fixedDecimalScale,
  prefix,
  suffix,
  thousandSeparator,
  thousandsGroupStyle,
  decimalSeparator,
  allowedDecimalSeparators,
  allowLeadingZeros,
  valueIsNumericString,
  isAllowed,
  startValue,
  trimLeadingZeroesOnBlur,
  handlersRef,
  stepHoldDelay,
  stepHoldInterval,
  withKeyboardEvents,
  selectAllOnFocus,
  onMinReached,
  onMaxReached,
  size,
  rightSection,
  onBlur,
  ...others
}: NumberInputProps & { ref?: Ref<HTMLInputElement> }) {
  /**
   * The field is driven from a local draft so that partial input survives a re-render, and so that an
   * uncontrolled caller (`defaultValue` with no `value`) still sees what it typed.
   */
  const [draft, setDraft] = useState<string | null>(
    defaultValue === undefined || defaultValue === null ? null : String(defaultValue),
  );

  const display = draft ?? (value === undefined || value === null || value === '' ? '' : String(value));

  const sanitize = (raw: string): string => {
    let out = '';
    for (const char of raw) {
      if (char >= '0' && char <= '9') {
        out += char;
      } else if (char === '-' && allowNegative && out.length === 0) {
        out += char;
      } else if (char === '.' && allowDecimal && !out.includes('.')) {
        out += char;
      }
    }
    return out;
  };

  const clamp = (num: number): number => {
    let next = num;
    if (typeof min === 'number' && next < min) {
      next = min;
    }
    if (typeof max === 'number' && next > max) {
      next = max;
    }
    return next;
  };

  const handleChange = (raw: string) => {
    const cleaned = sanitize(raw);
    setDraft(cleaned);

    if (cleaned === '' || cleaned === '-' || cleaned === '.' || cleaned.endsWith('.')) {
      onChange?.(cleaned);
      return;
    }

    const parsed = Number(cleaned);
    if (Number.isNaN(parsed)) {
      onChange?.(cleaned);
      return;
    }
    onChange?.(clampBehavior === 'strict' ? clamp(parsed) : parsed);
  };

  const stepBy = (direction: 1 | -1) => {
    const current = Number(display);
    const base = display === '' || Number.isNaN(current) ? (startValue ?? min ?? 0) : current;
    const next = clamp(base + direction * Number(step));
    setDraft(String(next));
    onChange?.(next);
    if (next === max) {
      onMaxReached?.();
    }
    if (next === min) {
      onMinReached?.();
    }
  };

  const atMax = typeof max === 'number' && display !== '' && Number(display) >= max;
  const atMin = typeof min === 'number' && display !== '' && Number(display) <= min;
  const stepperDisabled = Boolean(others.disabled) || Boolean(others.readOnly);

  const controls = hideControls ? null : (
    <div className='flex h-full flex-col justify-center'>
      <button
        type='button'
        tabIndex={-1}
        disabled={atMax || stepperDisabled}
        onClick={() => stepBy(1)}
        aria-label='Increment'
        className='flex flex-1 items-center justify-center px-1 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
      >
        <ChevronUpIcon className='size-3' />
      </button>
      <button
        type='button'
        tabIndex={-1}
        disabled={atMin || stepperDisabled}
        onClick={() => stepBy(-1)}
        aria-label='Decrement'
        className='flex flex-1 items-center justify-center px-1 text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40'
      >
        <ChevronDownIcon className='size-3' />
      </button>
    </div>
  );

  return (
    <ShadcnTextInput
      ref={ref}
      size={size}
      inputMode={allowDecimal ? 'decimal' : 'numeric'}
      value={display}
      onChange={(event) => handleChange(event.currentTarget.value)}
      onBlur={(event) => {
        setDraft(null);
        if (clampBehavior === 'blur' && display !== '' && !Number.isNaN(Number(display))) {
          const clamped = clamp(Number(display));
          if (clamped !== Number(display)) {
            onChange?.(clamped);
          }
        }
        onBlur?.(event);
      }}
      rightSection={rightSection ?? controls}
      rightSectionPointerEvents={rightSection ? undefined : 'auto'}
      {...(others as TextInputProps)}
    />
  );
}

export function registerTextInputReplacements(): void {
  TextInputElement.replaceBaseComponent(ShadcnTextInput);
  TextAreaElement.replaceBaseComponent(ShadcnTextArea);
  PasswordInputElement.replaceBaseComponent(ShadcnPasswordInput);
  NumberInputElement.replaceBaseComponent(ShadcnNumberInput);
}
