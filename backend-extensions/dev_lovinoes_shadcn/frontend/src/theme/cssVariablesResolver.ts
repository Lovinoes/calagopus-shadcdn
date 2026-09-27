import type { CSSVariablesResolver } from '@mantine/core';

/**
 * The panel's chart colours are plain CSS variables (`--chart-series-1..4`, `--chart-grid-color`,
 * `--chart-tick-color`, defined in the panel's own `app.css`), not part of the Mantine theme, so the
 * theme object cannot reach them. They are also the one thing here worth deriving from the resolved
 * theme rather than hardcoding, because a later extension can change `primaryColor` and the first
 * series should follow it.
 *
 * Everything else the extension re-tokenises lives in `app.css`, deliberately: the docs are explicit
 * that only the *first* extension returning a non-null resolver is used and the rest are ignored
 * outright, so a resolver is not a safe place to keep anything the theme depends on to look right.
 *
 * `app.css` sets the same variables at plain `:root[data-mantine-color-scheme=…]` specificity as a
 * fallback. Mantine renders resolver output into its own style element, which comes later in the
 * document, so when this resolver does run it wins; when another extension pre-empts it, the static
 * values in `app.css` still apply.
 */
export const shadcnCssVariablesResolver: CSSVariablesResolver = (theme) => {
  const primary = theme.colors[theme.primaryColor] ?? theme.colors.blue;

  return {
    variables: {},
    light: {
      '--chart-grid-color': 'var(--border)',
      '--chart-tick-color': 'var(--muted-foreground)',
      '--chart-series-1': primary[6],
      '--chart-series-2': theme.colors.orange[6],
      '--chart-series-3': theme.colors.violet[6],
      '--chart-series-4': theme.colors.teal[6],
    },
    dark: {
      '--chart-grid-color': 'var(--border)',
      '--chart-tick-color': 'var(--muted-foreground)',
      '--chart-series-1': primary[4],
      '--chart-series-2': theme.colors.orange[4],
      '--chart-series-3': theme.colors.violet[4],
      '--chart-series-4': theme.colors.teal[4],
    },
  };
};
