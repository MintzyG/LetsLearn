'use client';

import { useId, type ReactNode } from 'react';

/** A word with its definition one hover (or focus) away. */
export function Term({ children, def }: { children: ReactNode; def: ReactNode }) {
  const id = useId();
  return (
    <span className="group/term relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help underline decoration-fd-primary/60 decoration-dotted decoration-2 underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-fd-ring"
      >
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        className="not-prose invisible absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg border border-fd-border bg-fd-popover px-3 py-2 text-sm leading-snug font-normal text-fd-popover-foreground opacity-0 shadow-lg transition-opacity group-focus-within/term:visible group-focus-within/term:opacity-100 group-hover/term:visible group-hover/term:opacity-100 motion-reduce:transition-none"
      >
        {def}
      </span>
    </span>
  );
}
