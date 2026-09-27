import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';
import { Extension, type ExtensionContext } from 'shared';
import { registerShadcnComponents } from './register.ts';
import { shadcnCssVariablesResolver } from './theme/cssVariablesResolver.ts';
import { shadcnMantineTheme } from './theme/mantineTheme.ts';

/**
 * Reskins the panel with shadcn/ui.
 *
 * Uses all three theming layers the panel offers, broadest first: the Mantine theme for the palette and
 * scales, the CSS variables resolver for the chart colours, `app.css` for the shadcn design tokens, and
 * `replaceBaseComponent()` on the hookable elements for the components themselves.
 */
class ShadcnThemeExtension extends Extension {
  public initialize(_ctx: ExtensionContext): void {
    registerShadcnComponents();
  }

  public initializeMantineTheme(_ctx: ExtensionContext): MantineThemeOverride {
    return shadcnMantineTheme;
  }

  public initializeMantineCssResolver(_ctx: ExtensionContext): CSSVariablesResolver | null {
    return shadcnCssVariablesResolver;
  }
}

export default new ShadcnThemeExtension();
