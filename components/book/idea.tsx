import type { ReactNode } from 'react';

/** The one idea a section rests on, said once and large enough to remember. */
export function Idea({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-10 border-t border-fd-primary/40 pt-5">
      <p className="font-display text-[1.6rem] leading-snug text-fd-foreground sm:text-[1.85rem]">{children}</p>
    </div>
  );
}
