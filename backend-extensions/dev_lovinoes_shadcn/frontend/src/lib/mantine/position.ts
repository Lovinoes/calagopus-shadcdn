/**
 * Mantine names a floating position with one string (`'bottom-start'`); Radix splits it into `side` and
 * `align`. Every overlay replacement goes through this.
 */
export interface FloatingPlacement {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
}

const SIDES = new Set(['top', 'right', 'bottom', 'left']);

export function splitPosition(
  position: string | undefined,
  fallback: FloatingPlacement = { side: 'bottom', align: 'center' },
): FloatingPlacement {
  if (!position) {
    return fallback;
  }

  const [rawSide, rawAlign] = position.split('-');
  const side = SIDES.has(rawSide) ? (rawSide as FloatingPlacement['side']) : fallback.side;
  const align = rawAlign === 'start' ? 'start' : rawAlign === 'end' ? 'end' : 'center';

  return { side, align };
}
