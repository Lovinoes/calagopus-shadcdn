import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * A standalone harness for looking at the shadcn components on their own.
 *
 * The panel cannot be started without a Rust backend, Postgres and Redis, so this is how the theme gets a
 * visual check. It imports `src/ui/*` from the extension directly — those files are pure shadcn and touch
 * no Mantine, which is exactly why they are kept apart from `src/replacements/*`.
 *
 * Run it from the repo root: `pnpm preview`.
 */
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@ext': fileURLToPath(new URL('../backend-extensions/dev_lovinoes_shadcn/frontend/src', import.meta.url)),
    },
  },
  server: { port: 5199 },
});
