# Coverage

What this theme replaces, what it only restyles, and why.

The panel's component library lives in `frontend/src/elements/**`, and 105 of those wrappers are
*hookable*: each ends in `export default makeComponentHookable(X)`, a process-wide singleton whose
`replaceBaseComponent()` swaps the implementation everywhere it is imported — core pages included.
That is the documented theming path (`/docs/panel/extensions/concepts/theming`) and it is what the
first column below uses.

## Replaced with shadcn/ui

Registered in `frontend/src/register.ts`. Each honours the original's full Mantine props contract; the
adapters in `frontend/src/lib/mantine/` do the translation.

| Group | Components |
| --- | --- |
| Buttons | `Button`, `ActionIcon`, `CloseButton` |
| Text inputs | `TextInput`, `TextArea`, `PasswordInput`, `NumberInput` |
| Toggles | `Checkbox`, `Switch` |
| Comboboxes | `Select`, `MultiSelect`, `Autocomplete` |
| Data display | `Card`, `Badge`, `Avatar`, `ThemeIcon`, `Breadcrumbs`, `TitleCard`, `Code`, `Kbd`, `KbdKey` |
| Feedback | `Alert`, `AlertError`, `Notification`, `Progress`, `Spinner` (+ `.Centered`, `.Suspense`), `EmptyState`, `ScreenBlock` |
| Overlays | `Modal`, `ModalFooter`, `Drawer`, `Tooltip`, `ConditionalTooltip`, `Menu` (+ `.Target`, `.Dropdown`, `.Item`, `.Label`, `.Divider`), `Popover` (+ `.Target`, `.Dropdown`) |
| Navigation | `Tabs` (+ `.List`, `.Tab`, `.Panel`), `NavLink`, `SegmentedControl`, `Collapse` |

That is 43 exported components, 54 counting subcomponents.

The comboboxes are the most involved of them, built on Radix's Popover with [cmdk](https://cmdk.paco.me)
doing grouping and keyboard navigation — the same pair shadcn's own combobox uses. Three details were
load-bearing:

- **`data` is parsed by Mantine, not by us.** It arrives as `string[]`, `ComboboxItem[]` or groups of
  either, interchangeably, across 132 call sites. `lib/mantine/comboboxData.ts` hands it to Mantine's
  exported `getParsedComboboxData` / `getOptionsLockup` / `defaultOptionsFilter`, so it behaves
  identically and keeps up if Mantine changes.
- **`filter` and `searchValue` / `onSearchChange` still work.** `elements/input/ServerSelect.tsx` and
  `ServerMultiSelect.tsx` pass `filter={({ options }) => options}` and drive the search themselves so the
  *server* filters. cmdk therefore runs with `shouldFilter={false}` and filtering happens outside it.
- **`renderOption` is honoured**, because six files use it.

Compound components are always replaced as a set. `Menu.Target` reads a context that `Menu` provides,
and so does Radix's trigger; replacing only the root would leave the parts looking for a context that is
no longer there.

## Restyled, still rendered by Mantine

These keep Mantine's implementation and get the shadcn look from the token bridge and the CSS at the
bottom of `frontend/src/app.css`.

| Component | Why |
| --- | --- |
| `TagsInput` | Nothing to replace. `elements/input/TagsInput.tsx` never used Mantine's TagsInput — it is a bespoke component built out of `TextInput`, `Button`, `ActionIcon`, `Card` and `Menu`, all of which *are* replaced, so it already renders as shadcn. Only its `Input.Label` / `Input.Description` / `Input.Error` come from Mantine, and the CSS covers those. |
| `DatePicker`, `DateTimePicker`, `TimeInput`, `TimePicker`, `YearPicker` | `@mantine/dates`. Each is a combobox-like field wrapped around a calendar with its own date arithmetic, locale handling and range logic; the field chrome, calendar surface, selected day and header controls are restyled instead. |
| `PinInput`, `FileInput`, `JsonInput` | Low reach, and each wraps a Mantine input whose chrome the CSS already covers. |
| `Box`, `Group`, `Stack`, `Flex`, `Center`, `Container`, `Paper`, `Divider`, `ScrollArea`, `List`, `Text`, `Title`, `Anchor`, `Timeline` | Layout and typography primitives. Replacing them means reimplementing Mantine's 54 style props across ~900 page files for no visual gain; they are already styleless or purely token-driven. |
| `UnstyledButton` | Has no styling to replace. |
| `RingProgress`, `SemiCircleProgress` | SVG driven by a `color` prop, which the palette already retargets. |
| `ContextMenu`, `Sidebar`, `SubNavigation`, `StatCard`, `TableLink`, the `*ContentContainer`s | Custom Tailwind compositions built out of components that *are* replaced, so they inherit the new look without being touched. `Sidebar` is a `Card` plus utilities; `SubNavigation` is a raw Mantine `Tabs`, which the CSS covers. |
| `Table` | Exported bare, without `makeComponentHookable`, so there is no hook to use. CSS is the only lever. Its checkboxes come from the replaced `Checkbox`. |
| Monaco / Pierre / YAML editors, charts, captchas | Third-party surfaces. Charts follow `--chart-series-1..4`, which `theme/cssVariablesResolver.ts` derives from the palette. |

## Deliberate departures

Things that behave or look differently on purpose. Everything else keeps the original's behaviour.

- **`Checkbox` and `Switch` are native inputs, not Radix.** Mantine reports changes through a real
  `onChange` event and the panel reads `e.target.checked` *and* `e.currentTarget.checked` from it in
  roughly thirty places. Radix reports `onCheckedChange(boolean)`, so a Radix build would have to
  fabricate a synthetic event and would break any caller reaching for a field we did not fake. The class
  strings are shadcn's, applied to an `appearance-none` input.
- **A loading `Button` shows a spinner beside its label.** Mantine hides the label behind a centred
  loader; shadcn's idiom keeps it. `disabled` still wins over `loading`, as before.
- **`Alert` is `text-sm`.** The original set `text-2xl` on the root.
- **Dark-mode primary buttons have dark text on blue.** This is shadcn's own blue theme: white on
  blue-500 is 3.8:1, zinc-900 on blue-500 is 4.8:1.
- **`Card`'s usage bar sits against the bottom edge** rather than being appended in flow, so it does not
  have to guess the card's padding back off again.
- **`NumberInput` ignores the number-formatting props** (`prefix`, `suffix`, `thousandSeparator`,
  `decimalScale`, `fixedDecimalScale`, `decimalSeparator`) and the press-and-hold stepping props. Mantine
  implements them through react-number-format; nothing in the panel uses them. They are accepted and
  dropped rather than leaked to the DOM.
- **`Modal` ignores `inputWrapperOrder`, `scrollAreaComponent` and the stack's z-index laddering.**
  Mantine's `Modal.Stack` is only a context for z-index bookkeeping and passes `{opened, onClose,
  stackId}` straight through, which the replacement honours; Radix stacks portals by DOM order anyway.
- **`Menu` has no hover trigger.** Radix's dropdown is click-only. Nothing in the panel sets
  `trigger='hover'`.
- **`Select` and `MultiSelect` render a button, not an input.** Mantine's trigger is a read-only `<input>`;
  a button is what the keyboard and screen-reader behaviour actually want for a picker. The forwarded
  `ref` and the `name`/`value` pair go to a hidden input beside it, which is what Mantine does for form
  submission anyway (`hiddenInputProps`), so posting a form still works. Nothing in the panel passes a
  `ref` to any of the three. `Autocomplete` is unaffected — it is text-first, so its field stays a real
  input and the ref goes straight to it.
- **`comboboxProps.withinPortal` is ignored.** The panel only ever sets that one field, and Radix always
  portals its popovers, which is the behaviour that survives being nested inside a modal or a drawer.
- **Responsive style props are dropped on the handful of components whose root is a Radix primitive**
  (`Menu.Dropdown`, `Popover.Dropdown`, `Modal`, `Drawer`, `Tabs`). The flat form works; the responsive
  object form needs a generated class and a `<style>` element, which is `Box`'s job. Nothing in the panel
  passes one to a component in that position. See `lib/mantine/splitProps.ts`.
