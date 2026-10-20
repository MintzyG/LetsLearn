import type { ReactNode } from 'react';

/** A key to press. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-[5px] border border-b-2 border-fd-border bg-fd-card px-1.5 py-px font-mono text-[0.8em] text-fd-foreground">
      {children}
    </kbd>
  );
}
