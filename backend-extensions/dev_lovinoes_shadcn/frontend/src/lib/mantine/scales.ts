import type { CSSProperties } from 'react';

/**
 * Translation between Mantine's prop vocabulary and shadcn's.
 *
 * `replaceBaseComponent()` hands a replacement the props the original was called with, so these
 * components are called with `variant='light'`, `size='compact-xs'` and `color='red'`, not with shadcn
 * variants. Nothing about the panel's ~900 page files changes; the mapping happens here.
 *
 * The values covered are the ones the panel actually uses. Taken from the current tree:
 *   variant  default (198x) · light (121x) · subtle (105x) · outline (32x) · transparent (10x) · unstyled
 *   size     sm (380x) · xs (227x) · md (52x) · lg (47x) · input-sm (22x) · xl (14x) · compact-xs · compact-sm
 *   color    red (158x) · blue (107x) · gray (103x) · yellow (81x) · green (29x) · orange · violet · teal · grape · cyan
 */

export type ShadcnVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

export type ShadcnSize = 'xs' | 'sm' | 'default' | 'lg' | 'xl';

/** Mantine colour names that resolve to a palette in the theme, so `--mantine-color-<name>-*` exists. */
const THEME_COLORS = new Set([
  'dark',
  'gray',
  'zinc',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
]);

const VARIANT_MAP: Record<string, ShadcnVariant> = {
  // Mantine's solid button.
  filled: 'default',
  // A tinted surface with matching text — shadcn's `secondary`, once the tint is swapped in below.
  light: 'secondary',
  outline: 'outline',
  // Mantine's `default` is the neutral bordered button, which is shadcn's `outline`.
  default: 'outline',
  subtle: 'ghost',
  transparent: 'ghost',
  white: 'secondary',
  // No gradients in shadcn; solid is the honest fallback.
  gradient: 'default',
};

/**
 * `transparent` differs from `subtle` only in that it has no hover surface, and `white` pins the
 * surface to the page background rather than the muted one.
 */
const VARIANT_EXTRA_CLASSES: Record<string, string> = {
  transparent: 'shadow-none hover:bg-transparent dark:hover:bg-transparent',
  white: 'bg-background text-foreground shadow-xs hover:bg-accent',
};

export function resolveVariant(variant: string | undefined): ShadcnVariant {
  return VARIANT_MAP[variant ?? 'filled'] ?? 'default';
}

export function variantExtraClasses(variant: string | undefined): string | undefined {
  return variant ? VARIANT_EXTRA_CLASSES[variant] : undefined;
}

export interface ResolvedSize {
  /** The nearest shadcn size token. */
  token: ShadcnSize;
  /** True for Mantine's `compact-*` sizes, which keep the font size but shed vertical padding. */
  compact: boolean;
  /**
   * The raw value when `size` was not a Mantine keyword — a number, `'2rem'`, `'95%'`. Components that
   * take a free-form dimension (ActionIcon, Avatar, ThemeIcon, Spinner) use this as a width/height.
   */
  custom?: string;
}

const SIZE_MAP: Record<string, ShadcnSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'default',
  lg: 'lg',
  xl: 'xl',
  // Mantine's Input-specific scale.
  'input-xs': 'xs',
  'input-sm': 'sm',
  'input-md': 'default',
  'input-lg': 'lg',
  'input-xl': 'xl',
};

const COMPACT_MAP: Record<string, ShadcnSize> = {
  'compact-xs': 'xs',
  'compact-sm': 'sm',
  'compact-md': 'default',
  'compact-lg': 'lg',
  'compact-xl': 'xl',
};

export function resolveSize(size: string | number | undefined): ResolvedSize {
  if (size === undefined || size === null || size === 'none') {
    return { token: 'default', compact: false };
  }
  if (typeof size === 'number') {
    return { token: 'default', compact: false, custom: `${size}px` };
  }
  const compact = COMPACT_MAP[size];
  if (compact) {
    return { token: compact, compact: true };
  }
  const mapped = SIZE_MAP[size];
  if (mapped) {
    return { token: mapped, compact: false };
  }
  // A CSS length or percentage: '2rem', '95%', '24'.
  return { token: 'default', compact: false, custom: /^\d+$/.test(size) ? `${size}px` : size };
}

/**
 * Retints a shadcn component for a Mantine `color`.
 *
 * `app.css` maps the shadcn tokens with `@theme inline`, so `bg-primary` compiles to
 * `background-color: var(--primary)` rather than to a fixed colour. Overriding `--primary` and friends
 * on the element itself therefore recolours every class in the component at once, without needing a
 * CVA variant per palette entry.
 *
 * The values come from Mantine's own derived per-colour variables, so the shade picked for each colour
 * scheme, and `autoContrast` deciding between light and dark text, both stay Mantine's decision.
 */
export function colorVars(color: string | undefined): CSSProperties | undefined {
  if (!color || color === 'blue') {
    // `blue` is the theme's primary, which is what the tokens already point at.
    return undefined;
  }

  if (!THEME_COLORS.has(color)) {
    // A raw CSS colour (`color='#ff0000'`). Mantine would accept it, so we do too; there is no
    // palette to derive a readable foreground from, so fall back to the theme's contrast colour.
    return {
      '--primary': color,
      '--ring': color,
      '--secondary': `color-mix(in oklab, ${color} 15%, transparent)`,
      '--secondary-foreground': color,
      '--accent': `color-mix(in oklab, ${color} 15%, transparent)`,
      '--accent-foreground': color,
    } as CSSProperties;
  }

  return {
    '--primary': `var(--mantine-color-${color}-filled)`,
    '--primary-foreground': `var(--mantine-color-${color}-contrast, var(--mantine-color-white))`,
    '--ring': `var(--mantine-color-${color}-filled)`,
    '--secondary': `var(--mantine-color-${color}-light)`,
    '--secondary-foreground': `var(--mantine-color-${color}-light-color)`,
    '--accent': `var(--mantine-color-${color}-light)`,
    '--accent-foreground': `var(--mantine-color-${color}-light-color)`,
    '--input': `var(--mantine-color-${color}-outline)`,
    '--border': `var(--mantine-color-${color}-outline)`,
  } as CSSProperties;
}

/**
 * Mantine's `radius` prop as an inline style. The extension's Mantine theme defines the same radius
 * ladder shadcn uses, so `radius='md'` and `rounded-md` land on the same 8px.
 */
export function radiusStyle(radius: string | number | undefined): CSSProperties | undefined {
  if (radius === undefined || radius === null) {
    return undefined;
  }
  if (typeof radius === 'number') {
    return { borderRadius: `${radius}px` };
  }
  if (['xs', 'sm', 'md', 'lg', 'xl'].includes(radius)) {
    return { borderRadius: `var(--mantine-radius-${radius})` };
  }
  return { borderRadius: radius };
}
