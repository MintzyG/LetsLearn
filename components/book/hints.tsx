'use client';

import { Children, useState, type ReactNode } from 'react';

/**
 * Tiered hints. Each <Hint> stays hidden until the reader asks for it, one at a time, so the
 * smallest nudge comes first.
 */
export function Hints({ children }: { children: ReactNode }) {
  const hints = Children.toArray(children);
  const [shown, setShown] = useState(0);

  return (
    <div className="my-8">
      {shown > 0 && (
        <ol className="not-prose mb-4 space-y-3">
          {hints.slice(0, shown).map((hint, i) => (
            <li key={i} className="book-reveal flex gap-4 rounded-lg bg-fd-muted px-4 py-3">
              <span className="font-mono text-sm leading-7 font-semibold text-fd-primary">{i + 1}</span>
              <div className="prose prose-no-margin min-w-0 flex-1 text-[0.96875rem]">{hint}</div>
            </li>
          ))}
        </ol>
      )}
      {shown < hints.length ? (
        <button
          type="button"
          onClick={() => setShown(shown + 1)}
          className="inline-flex items-center gap-2 rounded-full border border-fd-primary/30 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
        >
          {shown === 0 ? 'Stuck? Show a hint' : 'Show the next hint'}
          <span className="text-fd-muted-foreground tabular-nums">
            {shown + 1} of {hints.length}
          </span>
        </button>
      ) : (
        <p className="text-sm text-fd-muted-foreground">That's every hint. The reference code is at the end of the chapter.</p>
      )}
    </div>
  );
}

/** One hint inside <Hints>. */
export function Hint({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
