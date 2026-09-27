import {
  type ComboboxItem,
  type ComboboxParsedItem,
  defaultOptionsFilter,
  getOptionsLockup,
  getParsedComboboxData,
  isOptionsGroup,
  type OptionsFilter,
} from '@mantine/core';
import type { ReactNode } from 'react';

/** Exactly what Mantine's own parser accepts: `data` differs subtly between Select and Autocomplete. */
export type ComboboxDataInput = Parameters<typeof getParsedComboboxData<string>>[0];

/**
 * Mantine's `data` prop takes three shapes at once — `string[]`, `ComboboxItem[]`, and groups of either —
 * and 132 call sites in the panel use them interchangeably. Rather than reimplement that, this uses
 * Mantine's own parser, lockup builder and default filter, all exported from `@mantine/core`. It is the
 * same code Mantine's own Select runs, so `data` behaves identically and stays correct if Mantine changes
 * it.
 *
 * Everything is pinned to string values, which is what `SelectProps`, `MultiSelectProps` and
 * `AutocompleteProps` default to and what every call site in the panel uses.
 */

export interface ComboboxGroup {
  /** Undefined for ungrouped options. Mantine allows any node as a group heading. */
  group?: ReactNode;
  items: ComboboxItem[];
}

/** Flattens Mantine's parsed data into groups, with ungrouped options collected into a leading group. */
export function toGroups(parsed: ComboboxParsedItem[]): ComboboxGroup[] {
  const groups: ComboboxGroup[] = [];
  let ungrouped: ComboboxGroup | undefined;

  for (const entry of parsed) {
    if (isOptionsGroup(entry)) {
      groups.push({ group: entry.group, items: entry.items });
    } else {
      if (!ungrouped) {
        ungrouped = { items: [] };
        groups.unshift(ungrouped);
      }
      ungrouped.items.push(entry);
    }
  }

  return groups.filter((group) => group.items.length > 0);
}

export interface ResolvedComboboxData {
  /** value → option, for turning a stored value back into a label. */
  lockup: Record<PropertyKey, ComboboxItem>;
  /** Everything that survived the filter, ungrouped-first, ready to render. */
  groups: ComboboxGroup[];
  isEmpty: boolean;
}

export function resolveComboboxData({
  data,
  search,
  filter,
  limit,
  searchable,
}: {
  data: ComboboxDataInput;
  search: string;
  filter: OptionsFilter | undefined;
  limit: number | undefined;
  /** A non-searchable select shows every option regardless of what is in the field. */
  searchable: boolean;
}): ResolvedComboboxData {
  const parsed = getParsedComboboxData<string>(data);
  const lockup = getOptionsLockup(parsed);

  // A caller-supplied filter always runs, even without `searchable`: `elements/input/ServerSelect.tsx`
  // passes `filter={({ options }) => options}` precisely to stop the client filtering a server-fed list.
  // `defaultOptionsFilter` is generic over Mantine's `Primitive`; everything here is string-valued.
  const applyFilter: OptionsFilter = filter ?? (defaultOptionsFilter as OptionsFilter);
  const filtered =
    searchable || filter ? applyFilter({ options: parsed, search, limit: limit ?? Number.POSITIVE_INFINITY }) : parsed;

  const groups = toGroups(filtered);

  return { lockup, groups, isEmpty: groups.length === 0 };
}

export type { ComboboxItem };
