import type { CSSProperties, ReactNode } from 'react';

// The paper rises from the bottom left, the mirror of ShowOff's: the chapter closing.
const rising = { '--paper-mask': 'radial-gradient(ellipse 90% 130% at 0% 100%, #000 15%, transparent 80%)' } as CSSProperties;

/** What the reader has now, at the end of a chapter. Write the children as a Markdown list. */
export function Recap({ title = 'What you have now', children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section style={rising} className="book-paper book-recap my-10 rounded-2xl border border-fd-primary/35 px-6 py-7 sm:px-9 sm:py-8">
      <h4 className="not-prose mb-5 font-display font-normal text-[1.75rem] leading-tight text-fd-foreground">{title}</h4>
      <div className="not-prose text-[1.0625rem] text-fd-foreground">{children}</div>
    </section>
  );
}
