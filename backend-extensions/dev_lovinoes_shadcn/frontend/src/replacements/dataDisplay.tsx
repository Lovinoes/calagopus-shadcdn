import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  type AvatarProps,
  type BadgeProps,
  Box,
  type BreadcrumbsProps,
  type CodeProps,
  type KbdProps,
  type PolymorphicComponentProps,
  type ThemeIconProps,
} from '@mantine/core';
import { Children, type CSSProperties, type ReactNode, type Ref } from 'react';
import AvatarElement from '@/elements/data-display/Avatar.tsx';
import BadgeElement from '@/elements/data-display/Badge.tsx';
import BreadcrumbsElement from '@/elements/data-display/Breadcrumbs.tsx';
import CardElement, { type CardProps } from '@/elements/data-display/Card.tsx';
import ThemeIconElement from '@/elements/data-display/ThemeIcon.tsx';
import TitleCardElement, { type TitleCardProps } from '@/elements/data-display/TitleCard.tsx';
import CodeElement from '@/elements/typography/Code.tsx';
import KbdElement from '@/elements/typography/Kbd.tsx';
import KbdKeyElement from '@/elements/typography/KbdKey.tsx';
import { usagePercent } from '@/lib/format/usage.ts';
import { cn } from '../lib/cn.ts';
import { colorVars, radiusStyle, resolveSize, resolveVariant, variantExtraClasses } from '../lib/mantine/scales.ts';
import { useMantineSlots } from '../lib/mantine/slots.ts';
import { useResolvedStyle } from '../lib/mantine/style.ts';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.tsx';
import { badgeVariants } from '../ui/badge.tsx';
import { Kbd, KbdKey } from '../ui/kbd.tsx';
import { Progress } from '../ui/progress.tsx';

/** Avatar / ThemeIcon box sizes across Mantine's scale. */
const BOX_SIZES: Record<string, string> = {
  xs: 'size-5',
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
  xl: 'size-14',
};

/**
 * Mantine's `color='initials'` derives a stable colour per name — the panel's Avatar wrapper relies on
 * it for every user without a picture. Reproduced by hashing the name into the theme palette, so a given
 * user keeps a consistent colour.
 */
const INITIALS_PALETTE = [
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
];

function initialsColor(name: string): string {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100000;
  }
  return INITIALS_PALETTE[hash % INITIALS_PALETTE.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * The panel's Card: a shadcn card that also carries the extras the original added — a hover surface, a
 * coloured stripe down the left edge, and a usage bar along the bottom.
 *
 * Padding stays on the root rather than moving to shadcn's `CardHeader`/`CardContent` slots, because
 * callers put raw content inside and set `p`/`padding` themselves at 22 call sites. The usage bar is
 * positioned against the card's bottom edge instead of being appended in flow, so it does not have to
 * guess the padding back off again.
 */
function ShadcnCard({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  hoverable = false,
  leftStripeClassName,
  progress,
  total,
  progressColor,
  withBorder,
  radius = 'md',
  shadow,
  padding,
  p,
  pl,
  ...rest
}: CardProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { radius });
  const percent = usagePercent(progress, total);
  // The stripe sits inside the card, so the left padding has to clear it.
  const resolvedPaddingLeft = typeof pl === 'number' && leftStripeClassName ? pl + 4 : leftStripeClassName ? 20 : pl;

  return (
    <Box
      ref={ref}
      data-slot='card'
      className={cn(
        'relative flex flex-col gap-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        hoverable && 'cursor-pointer transition-colors duration-150 hover:bg-accent/40',
        slots.className('root'),
        className,
      )}
      style={[{ ...radiusStyle(radius), ...slots.style('root') }, style ?? {}]}
      p={p ?? padding ?? 'md'}
      pl={resolvedPaddingLeft}
      {...rest}
    >
      {leftStripeClassName ? (
        <div className={cn('absolute top-0 left-0 h-full w-1 rounded-l-xl', leftStripeClassName)} />
      ) : null}
      {children}
      {percent !== null ? (
        <Progress
          value={percent}
          className='absolute inset-x-0 bottom-0 h-1.5 rounded-none rounded-b-xl bg-muted'
          style={progressColor ? ({ '--primary': progressColor } as CSSProperties) : undefined}
        />
      ) : null}
    </Box>
  );
}

/** The original added `font-semibold!` on top of Mantine's badge; shadcn badges are `font-medium`. */
function ShadcnBadge({
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
  circle,
  fullWidth,
  autoContrast,
  gradient,
  ...rest
}: BadgeProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { variant, color, size });
  const { token } = resolveSize(size);

  return (
    <Box
      ref={ref}
      data-slot='badge'
      className={cn(
        badgeVariants({ variant: resolveVariant(variant), size: token }),
        variantExtraClasses(variant),
        'font-semibold',
        circle && 'aspect-square px-0',
        fullWidth && 'w-full',
        slots.className('root'),
        className,
      )}
      style={[{ ...colorVars(color), ...radiusStyle(radius), ...slots.style('root') }, style ?? {}]}
      {...rest}
    >
      {leftSection ? <span className={cn('shrink-0', slots.className('section'))}>{leftSection}</span> : null}
      {children ? <span className={cn('truncate', slots.className('label'))}>{children}</span> : null}
      {rightSection ? <span className={cn('shrink-0', slots.className('section'))}>{rightSection}</span> : null}
    </Box>
  );
}

/**
 * The original defaults `src` to the app icon when there is no name and asks Mantine for
 * initials-coloured fallbacks; both behaviours are kept.
 */
function ShadcnAvatar({
  ref,
  src,
  name,
  alt,
  className,
  style,
  styles,
  classNames,
  size,
  radius,
  color,
  variant,
  children,
  autoContrast,
  gradient,
  ...rest
}: PolymorphicComponentProps<'div', AvatarProps> & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { size, color });
  const { token, custom } = resolveSize(size);
  const resolvedSrc = src ?? (name ? null : '/icon.svg');
  const paletteColor = color === 'initials' ? (name ? initialsColor(name) : undefined) : color;
  const resolvedStyle = useResolvedStyle(
    {
      ...colorVars(paletteColor),
      ...radiusStyle(radius),
      ...(custom ? { width: custom, height: custom } : undefined),
      ...slots.style('root'),
    },
    style,
  );

  return (
    <Avatar
      ref={ref}
      size={token}
      className={cn(BOX_SIZES[token], custom && 'size-auto', slots.className('root'), className)}
      style={resolvedStyle}
      {...rest}
    >
      {resolvedSrc ? (
        <AvatarImage src={resolvedSrc} alt={alt ?? name ?? ''} className={slots.className('image')} />
      ) : null}
      <AvatarFallback
        className={cn(
          'uppercase',
          paletteColor && 'bg-primary/15 font-medium text-primary',
          slots.className('placeholder'),
        )}
      >
        {children ?? (name ? initialsOf(name) : null)}
      </AvatarFallback>
    </Avatar>
  );
}

const THEME_ICON_SURFACES: Record<string, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border text-foreground',
  ghost: 'text-primary',
  destructive: 'bg-destructive text-white',
  link: 'text-primary',
};

function ShadcnThemeIcon({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  variant = 'filled',
  color,
  size,
  radius = 'md',
  autoContrast,
  gradient,
  ...rest
}: ThemeIconProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, { variant, color, size });
  const { token, custom } = resolveSize(size);

  return (
    <Box
      ref={ref}
      data-slot='theme-icon'
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md',
        BOX_SIZES[token],
        THEME_ICON_SURFACES[resolveVariant(variant)],
        "[&_svg:not([class*='size-'])]:size-1/2",
        slots.className('root'),
        className,
      )}
      style={[
        {
          ...colorVars(color),
          ...radiusStyle(radius),
          ...(custom ? { width: custom, height: custom } : undefined),
          ...slots.style('root'),
        },
        style ?? {},
      ]}
      {...rest}
    >
      {children}
    </Box>
  );
}

function ShadcnBreadcrumbs({
  ref,
  children,
  className,
  style,
  styles,
  classNames,
  separator,
  separatorMargin,
  ...rest
}: BreadcrumbsProps & { ref?: Ref<HTMLDivElement> }) {
  const slots = useMantineSlots(classNames, styles, {});
  const items = Children.toArray(children);

  return (
    <Box
      ref={ref}
      component='nav'
      aria-label='breadcrumb'
      data-slot='breadcrumb'
      className={cn(slots.className('root'), className)}
      style={[slots.style('root') ?? {}, style ?? {}]}
      {...rest}
    >
      <ol
        data-slot='breadcrumb-list'
        className='flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5'
      >
        {items.map((item, index) => (
          <li
            key={index}
            data-slot='breadcrumb-item'
            className={cn('inline-flex items-center gap-1.5', slots.className('breadcrumb'))}
          >
            {item}
            {index < items.length - 1 ? (
              <span
                data-slot='breadcrumb-separator'
                aria-hidden='true'
                className={cn('[&>svg]:size-3.5', slots.className('separator'))}
                style={separatorMargin ? { marginInline: separatorMargin as string | number } : undefined}
              >
                {separator ?? '/'}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </Box>
  );
}

/**
 * A card with a header strip, used for most panel sections. Rebuilt on shadcn's card so the header reads
 * as a card header rather than as a tinted `Group`.
 */
function ShadcnTitleCard({
  title,
  icon,
  children,
  className,
  titleClassName,
  iconClassName,
  wrapperClassName,
  leftSection,
  rightSection,
}: TitleCardProps) {
  return (
    <div
      data-slot='title-card'
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm',
        className,
      )}
    >
      <div
        id='title-card-header'
        className={cn('flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3', titleClassName)}
      >
        {leftSection}
        {icon ? (
          <div
            id='title-card-icon'
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-foreground',
              iconClassName,
            )}
          >
            {icon}
          </div>
        ) : null}
        <h3 className='text-base font-semibold'>{title}</h3>
        {rightSection}
      </div>
      <div className={cn('h-full p-4', wrapperClassName)}>{children}</div>
    </div>
  );
}

function ShadcnCode({
  ref,
  children,
  className,
  style,
  block,
  color,
  ...rest
}: CodeProps & { ref?: Ref<HTMLElement> }) {
  const shared = 'rounded-md border border-border bg-muted font-mono text-foreground';

  if (block) {
    return (
      <Box
        ref={ref as Ref<HTMLPreElement>}
        component='pre'
        data-slot='code-block'
        className={cn(shared, 'overflow-x-auto p-3 text-sm leading-relaxed', className)}
        style={[color ? { backgroundColor: color } : {}, style ?? {}]}
        {...rest}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      ref={ref}
      component='code'
      data-slot='code'
      className={cn(shared, 'px-1.5 py-0.5 text-[0.8125rem]', className)}
      style={[color ? { backgroundColor: color } : {}, style ?? {}]}
      {...rest}
    >
      {children}
    </Box>
  );
}

function ShadcnKbd({ ref, children, className, size, style, ...rest }: KbdProps & { ref?: Ref<HTMLElement> }) {
  const { token } = resolveSize(size);
  const resolvedStyle = useResolvedStyle(style);

  return (
    <Kbd
      ref={ref}
      style={resolvedStyle}
      className={cn(
        token === 'xs' && 'h-4 min-w-4 px-1 text-[0.625rem]',
        (token === 'lg' || token === 'xl') && 'h-6 px-2 text-xs',
        className,
      )}
      {...rest}
    >
      {children}
    </Kbd>
  );
}

function ShadcnKbdKey({
  children,
  className,
  icon,
}: {
  children: ReactNode;
  className?: string;
  icon?: IconDefinition;
}) {
  return <KbdKey className={className}>{icon ? <FontAwesomeIcon icon={icon} size='sm' /> : children}</KbdKey>;
}

export function registerDataDisplayReplacements(): void {
  CardElement.replaceBaseComponent(ShadcnCard);
  BadgeElement.replaceBaseComponent(ShadcnBadge);
  AvatarElement.replaceBaseComponent(ShadcnAvatar);
  ThemeIconElement.replaceBaseComponent(ShadcnThemeIcon);
  BreadcrumbsElement.replaceBaseComponent(ShadcnBreadcrumbs);
  TitleCardElement.replaceBaseComponent(ShadcnTitleCard);
  CodeElement.replaceBaseComponent(ShadcnCode);
  KbdElement.replaceBaseComponent(ShadcnKbd);
  KbdKeyElement.replaceBaseComponent(ShadcnKbdKey);
}
