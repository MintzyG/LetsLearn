import type { CSSProperties, ReactNode } from 'react';

// The paper fades out from the top right corner: lighter than ShowOff, it's optional.
const corner = { '--paper-mask': 'radial-gradient(circle at 100% 0%, #000, transparent 65%)' } as CSSProperties;
// A finer grid that fades downward, like looking further in.
const fine = { '--paper-size': '14px', '--paper-ink': '10%' } as CSSProperties;

/** An optional extra: something to build with what the reader knows now. A dashed outline: a sketch to fill in. */
export function Challenge({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section
      style={corner}
      className="book-paper my-10 rounded-2xl border-[1.5px] border-dashed border-fd-primary/45 px-6 py-6 sm:px-8 sm:py-7"
    >
      <p className="not-prose text-sm text-fd-muted-foreground">Challenge</p>
      <h4 className="not-prose mt-0.5 mb-2.5 font-display font-normal text-[1.5rem] leading-tight text-fd-foreground">{title}</h4>
      <div className="prose-no-margin">{children}</div>
    </section>
  );
}

/** An optional extra: a way to dig further into how the real thing works. A stack of sheets: there's more below. */
export function Deepening({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <section className="book-stack relative my-10 mr-4 mb-14">
      <div style={fine} className="book-paper rounded-2xl border border-fd-primary/35 px-6 py-6 sm:px-8 sm:py-7">
        <p className="not-prose text-sm text-fd-muted-foreground">Deepening</p>
        <h4 className="not-prose mt-0.5 mb-2.5 font-display font-normal text-[1.5rem] leading-tight text-fd-foreground">{title}</h4>
        <div className="prose-no-margin">{children}</div>
      </div>
    </section>
  );
}
