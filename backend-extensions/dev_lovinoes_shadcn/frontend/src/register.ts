import { registerButtonReplacements } from './replacements/buttons.tsx';
import { registerComboboxReplacements } from './replacements/comboboxes.tsx';
import { registerDataDisplayReplacements } from './replacements/dataDisplay.tsx';
import { registerFeedbackReplacements } from './replacements/feedback.tsx';
import { registerNavigationReplacements } from './replacements/navigation.tsx';
import { registerOverlayReplacements } from './replacements/overlays.tsx';
import { registerTextInputReplacements } from './replacements/textInputs.tsx';
import { registerToggleReplacements } from './replacements/toggles.tsx';

/**
 * Every `replaceBaseComponent()` call lives here, and nowhere else.
 *
 * Called once from the extension's `initialize()`, which runs before React renders anything, so the
 * swaps are in place for the first paint. The hookable wrappers are process-wide singletons with
 * append-only hook lists, so this must never run from inside a component.
 */
export function registerShadcnComponents(): void {
  registerButtonReplacements();
  registerTextInputReplacements();
  registerToggleReplacements();
  registerComboboxReplacements();
  registerDataDisplayReplacements();
  registerFeedbackReplacements();
  registerOverlayReplacements();
  registerNavigationReplacements();
}
