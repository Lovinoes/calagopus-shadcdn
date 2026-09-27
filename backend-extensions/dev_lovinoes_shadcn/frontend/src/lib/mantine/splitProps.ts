import { extractStyleProps, parseStyleProps, STYlE_PROPS_DATA, useMantineTheme } from '@mantine/core';
import type { CSSProperties } from 'react';

/**
 * Splits Mantine's style props (`mt`, `px`, `w`, `c`, `hiddenFrom`, `sx`, …) away from the rest.
 *
 * Every Mantine component accepts all 54 of them, and the panel uses them freely, so a replacement has
 * to handle them — both to honour them and to keep them off the DOM, where React would warn about
 * unknown attributes. In one case they actively collide: `MenuLabelProps` carries Mantine's `inset` style
 * prop, and shadcn's menu label has a boolean `inset` of its own, so the split has to be visible in the
 * types and not only at runtime.
 *
 * `extractStyleProps` and `parseStyleProps` are Mantine's own functions — the ones `Box` itself calls —
 * and are exported from `@mantine/core`, so the set of props and the theme lookups stay correct if
 * Mantine changes them.
 */

/** The keys `extractStyleProps` removes, so `rest` can be typed as what is actually left. */
type MantineStylePropKey =
  | 'm'
  | 'mx'
  | 'my'
  | 'mt'
  | 'mb'
  | 'ml'
  | 'mr'
  | 'me'
  | 'ms'
  | 'mis'
  | 'mie'
  | 'p'
  | 'px'
  | 'py'
  | 'pt'
  | 'pb'
  | 'pl'
  | 'pr'
  | 'pe'
  | 'ps'
  | 'pis'
  | 'pie'
  | 'bd'
  | 'bdrs'
  | 'bg'
  | 'c'
  | 'opacity'
  | 'ff'
  | 'fz'
  | 'fw'
  | 'lts'
  | 'ta'
  | 'lh'
  | 'fs'
  | 'tt'
  | 'td'
  | 'w'
  | 'miw'
  | 'maw'
  | 'h'
  | 'mih'
  | 'mah'
  | 'bgsz'
  | 'bgp'
  | 'bgr'
  | 'bga'
  | 'pos'
  | 'top'
  | 'left'
  | 'bottom'
  | 'right'
  | 'inset'
  | 'display'
  | 'flex'
  | 'hiddenFrom'
  | 'visibleFrom'
  | 'lightHidden'
  | 'darkHidden'
  | 'sx';

export interface SplitStyleProps<Rest> {
  styleProps: Record<string, unknown>;
  rest: Omit<Rest, MantineStylePropKey>;
}

/**
 * For a replacement whose root is a `Box`: hand `styleProps` straight to it and let Mantine parse them.
 */
export function splitStyleProps<T extends object>(props: T): SplitStyleProps<T> {
  return extractStyleProps(props as Record<string, unknown>) as unknown as SplitStyleProps<T>;
}

/**
 * For a replacement whose root is a Radix primitive, which cannot take Mantine props: resolves the style
 * props into a plain style object.
 *
 * Only the flat form is resolved. A responsive value (`p={{ base: 'xs', md: 'md' }}`) needs a generated
 * class and a `<style>` element, which is `Box`'s job; nothing in the panel passes one to a component in
 * this position, and dropping it beats emitting an object into the DOM.
 */
export function useStyleProps<T extends object>(
  props: T,
): { style: CSSProperties; rest: Omit<T, MantineStylePropKey> } {
  const theme = useMantineTheme();
  const { styleProps, rest } = extractStyleProps(props as Record<string, unknown>);
  const parsed = parseStyleProps({ styleProps, theme, data: STYlE_PROPS_DATA });

  return { style: parsed.inlineStyles as CSSProperties, rest: rest as Omit<T, MantineStylePropKey> };
}
