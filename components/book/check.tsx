import type { CSSProperties, ReactNode } from 'react';

// The answer is written on the paper; the question sits above it, plain.
const answerPaper = { '--paper-mask': 'linear-gradient(to bottom, #000, transparent)' } as CSSProperties;

/** A self-check: a question to answer in your head before reading on, with the answer folded away. */
export function Check({ question, children }: { question: ReactNode; children: ReactNode }) {
  return (
    <details className="group my-8 overflow-hidden rounded-2xl border border-fd-primary/35 bg-fd-card">
      <summary className="block cursor-pointer list-none px-6 py-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fd-ring [&::-webkit-details-marker]:hidden">
        <span className="not-prose block text-sm text-fd-muted-foreground">Check yourself</span>
        <span className="not-prose mt-1 block font-display text-[1.3125rem] leading-snug text-fd-foreground">{question}</span>
        <span className="not-prose mt-3 inline-flex items-center rounded-full border border-fd-primary/35 px-3.5 py-1 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-accent group-open:hidden">
          Show the answer
        </span>
      </summary>
      <div style={answerPaper} className="book-paper prose-no-margin border-t border-dashed border-fd-primary/35 px-6 pt-4 pb-6">
        {children}
      </div>
    </details>
  );
}
