import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type AlertProps, Box, type MantineColor, type NotificationProps, type ProgressRootProps } from '@mantine/core';
import { XIcon } from 'lucide-react';
import { type ReactNode, type Ref, Suspense } from 'react';
import AlertErrorElement from '@/elements/alerts/AlertError.tsx';
import AlertElement from '@/elements/feedback/Alert.tsx';
import AnimatedHourglass from '@/elements/feedback/AnimatedHourglass.tsx';
import EmptyStateElement, { type EmptyStateProps } from '@/elements/feedback/EmptyState.tsx';
import NotificationElement from '@/elements/feedback/Notification.tsx';
import ProgressElement from '@/elements/feedback/Progress.tsx';
import ScreenBlockElement from '@/elements/feedback/ScreenBlock.tsx';
import SpinnerElement from '@/elements/feedback/Spinner.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { cn } from '../lib/cn.ts';
import { colorVars, radiusStyle } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { useResolvedStyle } from '../lib/mantine/style.ts';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert.tsx';
import { buttonVariants } from '../ui/button.tsx';
import { Progress } from '../ui/progress.tsx';
import { Spinner } from '../ui/spinner.tsx';

/**
 * Mantine's `light` variant — the default — is a tinted panel; `filled` is solid. shadcn's Alert has no
 * colour axis at all, so the `tinted` variant added in `ui/alert.tsx` carries Mantine's `color` through
 * the `--primary` override that `colorVars` sets.
 */
function alertVariantFor(variant: string | undefined, color: string | undefined): 'default' | 'tinted' | 'destructive' {
  if (color === 'red') {
    return 'destructive';
  }
  if (variant === 'default' || variant === 'white' || variant === 'transparent') {
    return 'default';
  }
  return color ? 'tinted' : 'default';
}

function ShadcnAlert({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  title,
  icon,
  color,
  variant = 'light',
  radius,
  withCloseButton,
  onClose,
  closeButtonLabel,
  autoContrast,
  ...rest
}: AlertProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { variant, color });
  const resolvedStyle = useResolvedStyle(
    { ...colorVars(color), ...radiusStyle(radius), ...slots.style('root') },
    style,
  );

  return (
    <Box
      ref={ref}
      className={cn(
        // Same class string as ui/alert.tsx's `Alert`, applied through Box so Mantine style props work.
        'relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border border-border px-4 py-3 text-sm',
        'has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5',
        alertVariantFor(variant, color) === 'destructive' && 'bg-card text-destructive',
        alertVariantFor(variant, color) === 'tinted' && 'border-primary/30 bg-primary/10 text-foreground',
        alertVariantFor(variant, color) === 'default' && 'bg-card text-card-foreground',
        withCloseButton && 'pr-10',
        slots.className('root'),
        className,
      )}
      style={resolvedStyle}
      role='alert'
      data-slot='alert'
      {...rest}
    >
      {icon ? (
        <span
          className={cn('col-start-1 row-start-1 flex size-4 translate-y-0.5 items-center', slots.className('icon'))}
          style={slots.style('icon')}
        >
          {icon}
        </span>
      ) : null}
      <div className={cn('col-start-2 grid gap-1', slots.className('body'))} style={slots.style('body')}>
        {title ? (
          <div
            className={cn('min-h-4 font-medium tracking-tight', slots.className('title'))}
            style={slots.style('title')}
          >
            {title}
          </div>
        ) : null}
        {children ? (
          <div
            className={cn('text-sm [&_p]:leading-relaxed', !title && 'text-current', slots.className('message'))}
            style={slots.style('message')}
          >
            {children}
          </div>
        ) : null}
      </div>
      {withCloseButton ? (
        <button
          type='button'
          onClick={onClose}
          aria-label={closeButtonLabel ?? 'Close'}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
            'absolute top-2.5 right-2.5 opacity-70 hover:opacity-100',
            slots.className('closeButton'),
          )}
        >
          <XIcon />
        </button>
      ) : null}
    </Box>
  );
}

/** The panel's error banner. Rebuilt on the shadcn alert so it matches the rest of the theme. */
function ShadcnAlertError({ error, setError }: { error: string; setError: (error: string) => void }) {
  const { t } = useTranslations();

  return (
    <Alert variant='destructive'>
      <FontAwesomeIcon icon={faExclamationTriangle} />
      <AlertTitle>{t('common.alert.error', {})}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
      <button
        type='button'
        onClick={() => setError('')}
        aria-label='Close'
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
          'absolute top-2.5 right-2.5 opacity-70 hover:opacity-100',
        )}
      >
        <XIcon />
      </button>
    </Alert>
  );
}

/**
 * The surface every toast renders through. The original pinned `radius='md'` and
 * `withCloseButton={false}`, and the toast provider supplies its own dismiss affordance, so those
 * defaults are kept.
 */
function ShadcnNotification({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  title,
  icon,
  color,
  radius = 'md',
  loading,
  withCloseButton = false,
  withBorder = true,
  onClose,
  closeButtonProps,
  ...rest
}: NotificationProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { color });
  const resolvedStyle = useResolvedStyle(
    { ...colorVars(color), ...radiusStyle(radius), ...slots.style('root') },
    style,
  );

  return (
    <Box
      ref={ref}
      data-slot='notification'
      className={cn(
        'relative flex w-full items-start gap-3 rounded-md bg-popover px-4 py-3 text-popover-foreground shadow-lg',
        withBorder && 'border border-border',
        // A colour accent down the leading edge, which is how Mantine marks a notification's colour.
        color && 'before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-primary',
        withCloseButton && 'pr-10',
        slots.className('root'),
        className,
      )}
      style={resolvedStyle}
      {...rest}
    >
      {loading ? (
        <Spinner className='mt-0.5 text-primary' />
      ) : icon ? (
        <span
          className={cn('mt-0.5 flex size-4 items-center text-primary', slots.className('icon'))}
          style={slots.style('icon')}
        >
          {icon}
        </span>
      ) : null}
      <div className={cn('min-w-0 flex-1', slots.className('body'))} style={slots.style('body')}>
        {title ? (
          <div className={cn('text-sm font-medium', slots.className('title'))} style={slots.style('title')}>
            {title}
          </div>
        ) : null}
        {children ? (
          <div
            className={cn('text-sm text-muted-foreground', !title && 'text-foreground', slots.className('description'))}
            style={slots.style('description')}
          >
            {children}
          </div>
        ) : null}
      </div>
      {withCloseButton ? (
        <button
          type='button'
          onClick={onClose}
          aria-label='Close'
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon-xs' }),
            'absolute top-2.5 right-2.5 opacity-70 hover:opacity-100',
          )}
          {...closeButtonProps}
        >
          <XIcon />
        </button>
      ) : null}
    </Box>
  );
}

/**
 * The panel's progress bar, which shows the percentage twice — once in the body colour and once in white
 * clipped to the filled width — so the number stays legible over both halves of the track. That trick is
 * worth keeping, so it is reproduced over a shadcn Progress.
 */
function ShadcnProgress({
  value = 0,
  color = 'blue',
  indeterminate = false,
  className,
  style,
  hourglass = true,
  withLabel = true,
  ...rest
}: ProgressRootProps & {
  value?: number;
  color?: MantineColor;
  indeterminate?: boolean;
  hourglass?: boolean;
  withLabel?: boolean;
}) {
  const isIndeterminate = indeterminate || !Number.isFinite(value);
  const clamped = isIndeterminate ? 0 : Math.min(100, Math.max(0, value));
  const label = clamped >= 100 ? '100%' : `${clamped.toFixed(1)}%`;

  return (
    <div className={cn('flex flex-row items-center', className)}>
      {hourglass ? (
        <span className='mr-2'>
          <AnimatedHourglass />
        </span>
      ) : null}

      <Box className='relative grow' style={[colorVars(color) ?? {}, style ?? {}]} {...rest}>
        <Progress value={clamped} indeterminate={isIndeterminate} className='h-5 rounded-full bg-muted' />
        {!isIndeterminate && withLabel ? (
          <>
            <span className='pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] leading-none font-semibold tabular-nums text-foreground'>
              {label}
            </span>
            <span
              className='pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] leading-none font-semibold tabular-nums text-primary-foreground'
              style={{
                clipPath: `inset(0 ${100 - clamped}% 0 0)`,
                transition: 'clip-path 100ms ease',
              }}
            >
              {label}
            </span>
          </>
        ) : null}
      </Box>
    </div>
  );
}

function ShadcnSpinner({ size }: { size?: number }) {
  return <Spinner style={size ? { width: size, height: size } : undefined} className='text-foreground' />;
}

function ShadcnSpinnerCentered({ size, className }: { size?: number; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-6', className)}>
      <ShadcnSpinner size={size} />
    </div>
  );
}

function ShadcnSpinnerSuspense({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Suspense
      fallback={
        <div className={cn('flex items-center justify-center', className)}>
          <ShadcnSpinner />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

function ShadcnEmptyState({ icon, title, description, flush = false, children }: EmptyStateProps) {
  const content = (
    <>
      <div className='mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
        <FontAwesomeIcon icon={icon as IconDefinition} className='text-lg' />
      </div>
      <h3 className='mb-2 text-lg font-semibold'>{title}</h3>
      <p className='mb-4 max-w-prose text-sm text-muted-foreground'>{description}</p>
      {children}
    </>
  );

  return (
    <div
      data-slot='empty-state'
      className={cn(
        'flex flex-col items-center justify-center text-center',
        flush ? 'py-6' : 'rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm',
      )}
    >
      {content}
    </div>
  );
}

function ShadcnScreenBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className='mt-2 flex items-center justify-center lg:mt-6'>
      <div className='w-full max-w-md rounded-xl border border-border bg-card p-6 text-center text-card-foreground shadow-sm'>
        <h2 className='text-xl font-semibold'>{title}</h2>
        <p className='mt-2 text-sm text-muted-foreground'>{content}</p>
      </div>
    </div>
  );
}

export function registerFeedbackReplacements(): void {
  AlertElement.replaceBaseComponent(ShadcnAlert);
  AlertErrorElement.replaceBaseComponent(ShadcnAlertError);
  NotificationElement.replaceBaseComponent(ShadcnNotification);
  ProgressElement.replaceBaseComponent(ShadcnProgress);
  SpinnerElement.replaceBaseComponent(ShadcnSpinner);
  SpinnerElement.Centered.replaceBaseComponent(ShadcnSpinnerCentered);
  SpinnerElement.Suspense.replaceBaseComponent(ShadcnSpinnerSuspense);
  EmptyStateElement.replaceBaseComponent(ShadcnEmptyState);
  ScreenBlockElement.replaceBaseComponent(ShadcnScreenBlock);
}
