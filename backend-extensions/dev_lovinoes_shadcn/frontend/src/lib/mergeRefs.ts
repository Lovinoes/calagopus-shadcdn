import type { Ref } from 'react';

/**
 * Assigns a node to several refs at once.
 *
 * Needed because a few replacements keep an internal ref (to drive `indeterminate`, to focus a hidden
 * input) while still having to forward the ref the caller passed: the originals were `forwardRef`
 * components and callers rely on getting the DOM node.
 */
export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') {
    ref(node);
  } else if (ref && typeof ref === 'object') {
    (ref as { current: T | null }).current = node;
  }
}
