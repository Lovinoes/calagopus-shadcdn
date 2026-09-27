import type { MantineThemeOverride } from '@mantine/core';
import { shadcnColors } from './colors.ts';

/**
 * The stock Tailwind sans/mono stacks, which is what an unconfigured shadcn/ui project renders in.
 * Kept as a system stack rather than shipping Geist or Inter as a webfont, so the theme costs no
 * extra download. See the README for swapping a real webfont in.
 */
const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, ' +
  '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

const FONT_FAMILY_MONOSPACE =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/**
 * The Mantine half of the theme.
 *
 * This is the layer underneath the replaced components: anything the extension does *not* swap for a
 * shadcn component (the layout primitives, the date pickers, charts, `Table`) still renders through
 * Mantine and picks its look up from here plus the `--mantine-color-*` bridge in `app.css`.
 *
 * Radii mirror shadcn's `--radius` ladder (`--radius: 0.625rem`, scaled 0.6/0.8/1/1.4), so a Mantine
 * `radius='md'` and a shadcn `rounded-md` come out at the same 8px.
 *
 * Deliberately conservative about type and spacing: the values here match Mantine's own defaults, which
 * is what the panel's ~900 page files were laid out against. shadcn's tighter density is applied inside
 * the replaced components instead, where it cannot reflow pages that were never touched.
 */
export const shadcnMantineTheme: MantineThemeOverride = {
  colors: shadcnColors,
  primaryColor: 'blue',
  // blue-600 on light, blue-500 on dark — the same pair `--primary` uses in app.css.
  primaryShade: { light: 6, dark: 5 },
  autoContrast: true,
  luminanceThreshold: 0.45,
  // shadcn draws focus with a ring utility on the element itself, not with Mantine's focus outline.
  focusRing: 'never',
  cursorType: 'pointer',
  fontFamily: FONT_FAMILY,
  fontFamilyMonospace: FONT_FAMILY_MONOSPACE,
  headings: {
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
  },
  defaultRadius: 'md',
  radius: {
    xs: '0.25rem',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.625rem',
    xl: '0.875rem',
  },
  // Tailwind's shadow scale, which is what shadcn's `shadow-xs`/`shadow-sm`/`shadow-md` resolve to.
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  other: {
    shadcnTheme: true,
  },
};
