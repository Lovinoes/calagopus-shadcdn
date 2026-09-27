import { type MantineTheme, useMantineTheme } from '@mantine/core';
import type { CSSProperties } from 'react';

/**
 * Mantine's per-slot `classNames` / `styles` props.
 *
 * Callers in the panel really do use these, so a replacement that ignored them would break them:
 * `elements/data-display/Table.tsx` passes `classNames={{ input: 'cursor-pointer!' }}` to `Checkbox`,
 * and `elements/feedback/Alert.tsx` deep-merges into `styles`. Each replacement declares which slot
 * names it understands and applies them to the matching element.
 *
 * Both props also accept a function of the theme, which is why resolving them needs a hook.
 */

type SlotRecord<Value> = Partial<Record<string, Value>>;

/**
 * The function form's parameters are declared `never` so that every component's concrete signature
 * (`(theme, props: ButtonProps, ctx: unknown) => …`) is assignable here under `strictFunctionTypes`.
 */
type SlotFn<Value> = (theme: MantineTheme, props: never, ctx: never) => SlotRecord<Value>;

export type SlotProp<Value> = SlotRecord<Value> | SlotFn<Value> | undefined;

function resolveSlotProp<Value>(prop: SlotProp<Value>, theme: MantineTheme, props: unknown): SlotRecord<Value> {
  if (!prop) {
    return {};
  }
  if (typeof prop === 'function') {
    try {
      return prop(theme, props as never, undefined as never) ?? {};
    } catch {
      // A slot function written against a component's own `ctx` payload can throw when it reads a field
      // we cannot supply. Dropping the styles beats taking the page down with it.
      return {};
    }
  }
  return prop;
}

export interface ResolvedSlots {
  /** Class name registered for a slot, or undefined. */
  className: (slot: string) => string | undefined;
  /** Inline style registered for a slot, or undefined. */
  style: (slot: string) => CSSProperties | undefined;
}

/**
 * Resolves `classNames` and `styles` into plain per-slot lookups.
 *
 * `props` is passed through to the function form of either prop. The third `ctx` argument Mantine
 * supplies is component-internal state that a replacement has no way to reproduce, so it is passed as
 * `undefined` and a function that depends on it is skipped rather than allowed to throw.
 */
export function useMantineSlots(
  classNames: SlotProp<string>,
  styles: SlotProp<CSSProperties>,
  props: unknown,
): ResolvedSlots {
  const theme = useMantineTheme();
  const resolvedClassNames = resolveSlotProp(classNames, theme, props);
  const resolvedStyles = resolveSlotProp(styles, theme, props);

  return {
    className: (slot) => resolvedClassNames[slot],
    style: (slot) => resolvedStyles[slot],
  };
}
