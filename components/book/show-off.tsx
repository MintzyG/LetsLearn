import type { ReactNode } from 'react';

/**
 * The moment the reader's code meets the real thing: their router, their phone, a real server.
 * The loudest block in a chapter: the book's paper at full strength.
 */
export function ShowOff({ title = 'Show it off', children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section className="book-paper my-10 overflow-hidden rounded-2xl border border-fd-primary/35 px-6 py-7 sm:px-9 sm:py-9">
      <h4 className="not-prose mb-3 font-display font-normal text-[1.75rem] leading-tight text-fd-foreground">{title}</h4>
      <div className="prose-no-margin">{children}</div>
    </section>
  );
}
