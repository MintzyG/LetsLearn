'use client';

import { useState, type ReactNode } from 'react';
import { Eye } from 'lucide-react';

/**
 * "What does this print?": a code block (the children, a fenced block), a moment to guess,
 * then the real output and why. For the surprising corners of a language: shadowing,
 * integer division, closures capturing a loop variable.
 */
export function Predict({
  output,
  why,
  question = 'What does this print?',
  children,
}: {
  /** What the program really prints. */
  output: string;
  /** Why it prints that, in a sentence or two. */
  why?: ReactNode;
  question?: ReactNode;
  children: ReactNode;
}) {
  const [shown, setShown] = useState(false);
  return (
    <section className="not-prose my-8 overflow-hidden rounded-2xl border border-fd-primary/35 bg-fd-card">
      <p className="px-5 pt-4 font-display text-[1.25rem] leading-snug text-fd-foreground">{question}</p>
      <div className="px-5 pt-3 [&_figure]:my-0">{children}</div>
      {shown ? (
        <div className="mt-4 border-t border-dashed border-fd-primary/35 px-5 pt-3 pb-5">
          <p className="text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">It prints</p>
          <pre className="mt-1.5 overflow-x-auto rounded-lg bg-fd-background px-3 py-2 font-mono text-[0.8125rem] text-fd-primary">{output}</pre>
          {why && <div className="mt-3 text-[0.9375rem] leading-relaxed text-fd-foreground">{why}</div>}
        </div>
      ) : (
        <div className="px-5 pt-3 pb-5">
          <button
            type="button"
            onClick={() => setShown(true)}
            className="inline-flex items-center gap-2 rounded-full border border-fd-primary/35 px-3.5 py-1 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent"
          >
            <Eye aria-hidden className="size-4 text-fd-primary" />
            I&apos;ve guessed, show me
          </button>
        </div>
      )}
    </section>
  );
}
