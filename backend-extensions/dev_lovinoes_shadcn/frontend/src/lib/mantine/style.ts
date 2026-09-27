import { getStyleObject, type MantineStyleProp, useMantineTheme } from '@mantine/core';
import type { CSSProperties } from 'react';

/**
 * Flattens Mantine's `style` prop into a plain style object.
 *
 * Mantine accepts a style object, a function of the theme, or an array of either, and `Box` resolves all
 * three itself. A replacement whose root is a Radix primitive or a plain element has to do it here
 * instead, or the array lands on the DOM as-is. `getStyleObject` is Mantine's own resolver, exported
 * from `@mantine/core`.
 *
 * Arguments are merged left to right, so a caller's `style` goes last and wins.
 */
export function useResolvedStyle(
  ...styles: (MantineStyleProp | CSSProperties | undefined)[]
): CSSProperties | undefined {
  const theme = useMantineTheme();
  let merged: CSSProperties | undefined;

  for (const style of styles) {
    if (style === undefined || style === null) {
      continue;
    }
    merged = { ...merged, ...getStyleObject(style as MantineStyleProp, theme) };
  }

  return merged;
}
