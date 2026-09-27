import type { MantineColorsTuple } from '@mantine/core';

/**
 * Mantine colour tuples built from Tailwind v4's palette, which is the palette shadcn/ui themes with.
 *
 * Hex rather than `oklch()` on purpose: Mantine runs its own colour maths over these values
 * (`autoContrast`/`luminanceThreshold`, and the `-light`/`-outline`/`-filled-hover` shades it derives
 * for every tuple), and that maths only reliably parses hex/rgb. The `oklch()` originals are used in
 * `app.css`, where nothing but the browser reads them.
 *
 * Index 0 is Tailwind's `50` through index 9 for `900`, matching Mantine's lightest-to-darkest order.
 * Values are the exact sRGB equivalents of Tailwind 4.3's oklch definitions.
 */

const zinc: MantineColorsTuple = [
  '#fafafa',
  '#f4f4f5',
  '#e4e4e7',
  '#d4d4d8',
  '#9f9fa9',
  '#71717b',
  '#52525c',
  '#3f3f46',
  '#27272a',
  '#18181b',
];

/**
 * Mantine's `dark` tuple does not describe a colour so much as the whole dark-mode surface set, and it
 * is read by index: 0 is body text, 2 dimmed text, 4 the default border, 5 the hover surface, 6 the
 * default surface (inputs, menus) and 7 the page background. Laid out to land on shadcn's zinc
 * surfaces: background `zinc-950`, card/popover `zinc-900`, muted/accent `zinc-800`.
 *
 * Indices 8 and 9 continue past Tailwind's scale toward black; Mantine wants ten steps and only uses
 * them for explicit `color='dark.8'`-style references.
 */
const dark: MantineColorsTuple = [
  '#fafafa',
  '#f4f4f5',
  '#9f9fa9',
  '#71717b',
  '#27272a',
  '#27272a',
  '#18181b',
  '#09090b',
  '#050506',
  '#000000',
];

const red: MantineColorsTuple = [
  '#fef2f2',
  '#ffe2e2',
  '#ffc9c9',
  '#ffa2a2',
  '#ff6467',
  '#fb2c36',
  '#e7000b',
  '#c10007',
  '#9f0712',
  '#82181a',
];

const pink: MantineColorsTuple = [
  '#fdf2f8',
  '#fce7f3',
  '#fccee8',
  '#fda5d5',
  '#fb64b6',
  '#f6339a',
  '#e60076',
  '#c6005c',
  '#a3004c',
  '#861043',
];

/** Mantine's `grape` sits between pink and violet; Tailwind's `fuchsia` is the closest match. */
const grape: MantineColorsTuple = [
  '#fdf4ff',
  '#fae8ff',
  '#f6cfff',
  '#f4a8ff',
  '#ed6aff',
  '#e12afb',
  '#c800de',
  '#a800b7',
  '#8a0194',
  '#721378',
];

const violet: MantineColorsTuple = [
  '#f5f3ff',
  '#ede9fe',
  '#ddd6ff',
  '#c4b4ff',
  '#a684ff',
  '#8e51ff',
  '#7f22fe',
  '#7008e7',
  '#5d0ec0',
  '#4d179a',
];

const indigo: MantineColorsTuple = [
  '#eef2ff',
  '#e0e7ff',
  '#c6d2ff',
  '#a3b3ff',
  '#7c86ff',
  '#615fff',
  '#4f39f6',
  '#432dd7',
  '#372aac',
  '#312c85',
];

const blue: MantineColorsTuple = [
  '#eff6ff',
  '#dbeafe',
  '#bedbff',
  '#8ec5ff',
  '#51a2ff',
  '#2b7fff',
  '#155dfc',
  '#1447e6',
  '#193cb8',
  '#1c398e',
];

const cyan: MantineColorsTuple = [
  '#ecfeff',
  '#cefafe',
  '#a2f4fd',
  '#53eafd',
  '#00d3f2',
  '#00b8db',
  '#0092b8',
  '#007595',
  '#005f78',
  '#104e64',
];

const teal: MantineColorsTuple = [
  '#f0fdfa',
  '#cbfbf1',
  '#96f7e4',
  '#46ecd5',
  '#00d5be',
  '#00bba7',
  '#009689',
  '#00786f',
  '#005f5a',
  '#0b4f4a',
];

const green: MantineColorsTuple = [
  '#f0fdf4',
  '#dcfce7',
  '#b9f8cf',
  '#7bf1a8',
  '#05df72',
  '#00c950',
  '#00a63e',
  '#008236',
  '#016630',
  '#0d542b',
];

const lime: MantineColorsTuple = [
  '#f7fee7',
  '#ecfcca',
  '#d8f999',
  '#bbf451',
  '#9ae600',
  '#7ccf00',
  '#5ea500',
  '#497d00',
  '#3c6300',
  '#35530e',
];

const yellow: MantineColorsTuple = [
  '#fefce8',
  '#fef9c2',
  '#fff085',
  '#ffdf20',
  '#fdc700',
  '#f0b100',
  '#d08700',
  '#a65f00',
  '#894b00',
  '#733e0a',
];

const orange: MantineColorsTuple = [
  '#fff7ed',
  '#ffedd4',
  '#ffd6a7',
  '#ffb86a',
  '#ff8904',
  '#ff6900',
  '#f54900',
  '#ca3500',
  '#9f2d00',
  '#7e2a0c',
];

export const shadcnColors: Record<string, MantineColorsTuple> = {
  dark,
  gray: zinc,
  zinc,
  red,
  pink,
  grape,
  violet,
  indigo,
  blue,
  cyan,
  teal,
  green,
  lime,
  yellow,
  orange,
};
