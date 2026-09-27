import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Gallery } from './Gallery.tsx';

import './preview.css';

/** The panel switches schemes with an attribute on <html>, and the tokens are scoped to it. */
function useColorScheme() {
  const [scheme, setScheme] = useState<'light' | 'dark'>(
    (document.documentElement.dataset.mantineColorScheme as 'light' | 'dark') ?? 'dark',
  );

  const apply = (next: 'light' | 'dark') => {
    document.documentElement.dataset.mantineColorScheme = next;
    setScheme(next);
  };

  return { scheme, apply };
}

function App() {
  const { scheme, apply } = useColorScheme();

  return (
    <>
      <header className='sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur'>
        <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'>
          <div>
            <h1 className='text-sm font-semibold'>Calagopus shadcn theme</h1>
            <p className='text-xs text-muted-foreground'>
              src/ui — the shadcn primitives the replacements are built from
            </p>
          </div>
          <div className='inline-flex items-center gap-0.5 rounded-lg bg-muted p-[3px] text-muted-foreground'>
            {(['dark', 'light'] as const).map((option) => (
              <button
                key={option}
                type='button'
                onClick={() => apply(option)}
                className={
                  scheme === option
                    ? 'rounded-md bg-background px-3 py-1 text-xs font-medium text-foreground shadow-sm'
                    : 'rounded-md px-3 py-1 text-xs font-medium hover:text-foreground'
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </header>
      <Gallery />
    </>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
