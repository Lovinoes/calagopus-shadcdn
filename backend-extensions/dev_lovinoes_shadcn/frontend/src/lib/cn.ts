import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui's class helper. tailwind-merge is what lets a caller's `className` beat the class strings
 * baked into these components, which matters more here than in a stock shadcn app: the panel's pages
 * pass Tailwind utilities into the components they render all over the place.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
