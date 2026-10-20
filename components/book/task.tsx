import type { CSSProperties, ReactNode } from 'react';
import { Hammer } from 'lucide-react';

// Paper only behind the heading, like the top of a spec sheet.
const header = { '--paper-mask': 'linear-gradient(to bottom, #000, transparent 7rem)' } as CSSProperties;

/** What the reader builds next, described in prose. Holds the section's Spec entries. */
export function Task({ title = 'What to build', children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section style={header} className="book-paper my-8 rounded-2xl border border-fd-primary/35 px-6 py-6 sm:px-8 sm:py-7">
      <h4 className="not-prose mb-3 flex items-center gap-3 font-display font-normal text-[1.5rem] leading-tight text-fd-foreground">
        <span className="grid size-8 place-items-center rounded-lg bg-fd-primary text-fd-primary-foreground">
          <Hammer aria-hidden className="size-4" />
        </span>
        {title}
      </h4>
      <div className="prose-no-margin">{children}</div>
    </section>
  );
}

/**
 * One thing the reader's code must provide, described like a man page: its name, what kind
 * of thing it is, and in the body what it takes, returns and reports. Never a signature to copy.
 */
export function Spec({ name, kind, children }: { name: string; kind?: string; children: ReactNode }) {
  return (
    <div className="mt-5 border-t border-fd-border pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <p className="not-prose mb-1.5 flex flex-wrap items-baseline gap-x-3">
        <code className="font-mono text-[0.9375rem] font-semibold text-fd-primary">{name}</code>
        {kind && <span className="text-sm text-fd-muted-foreground">{kind}</span>}
      </p>
      <div className="prose-no-margin text-[0.96875rem]">{children}</div>
    </div>
  );
}
