import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

// A diagram drawn on the paper: the grid runs the whole way down, faint.
const fullPaper = { '--paper-mask': 'none', '--paper-ink': '8%' } as CSSProperties;

export interface LadderMessage {
  from: string;
  to: string;
  label: string;
  /** A second, smaller line under the label: a field value, a timer. */
  note?: string;
  /** The message never arrives: drawn dashed, ending in a cross halfway. */
  lost?: boolean;
}

/**
 * A ladder (message sequence) diagram: who sends what to whom, in order, time running down.
 * For handshakes, request and reply, retransmissions.
 */
export function Ladder({ parties, messages, caption }: { parties: string[]; messages: LadderMessage[]; caption?: string }) {
  const center = (name: string) => ((parties.indexOf(name) + 0.5) / parties.length) * 100;

  return (
    <figure className="not-prose my-8">
      <div style={fullPaper} className="book-paper rounded-2xl border border-fd-primary/35 px-2 pt-5 pb-6">
        {/* Lifelines */}
        {parties.map((p) => (
          <span
            key={p}
            aria-hidden
            className="absolute top-15 bottom-4 w-px border-l border-dashed border-fd-muted-foreground/40"
            style={{ left: `${center(p)}%` }}
          />
        ))}
        <div className="relative grid" style={{ gridTemplateColumns: `repeat(${parties.length}, minmax(0, 1fr))` }}>
          {parties.map((p) => (
            <span key={p} className="mx-auto rounded-full border border-fd-primary/40 bg-fd-background px-4 py-1 text-sm font-medium text-fd-foreground">
              {p}
            </span>
          ))}
        </div>
        <ol className="relative mt-4">
          {messages.map((m, i) => {
            const a = center(m.from);
            const b = center(m.to);
            const right = b > a;
            const left = Math.min(a, b);
            const width = Math.abs(b - a) * (m.lost ? 0.55 : 1);
            const start = m.lost && !right ? a - width : left;
            return (
              <li key={i} className="relative h-16">
                <span
                  className="absolute top-2 px-2 text-center font-mono [text-shadow:0_0_6px_var(--color-fd-card)] text-[0.75rem] leading-tight text-fd-foreground"
                  style={{ left: `${left}%`, width: `${Math.abs(b - a)}%` }}
                >
                  {m.label}
                  {m.note && <span className="block text-fd-muted-foreground">{m.note}</span>}
                </span>
                <span
                  aria-hidden
                  className={cn('absolute top-11 border-t-2', m.lost ? 'border-dashed border-warn' : 'border-fd-primary')}
                  style={{ left: `${start}%`, width: `${width}%` }}
                >
                  {m.lost ? (
                    <span className={cn('absolute -top-[0.8rem] font-mono text-base font-bold text-warn', right ? '-right-2' : '-left-2')}>
                      ×
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'absolute -top-[6px] size-0 border-y-[5px] border-y-transparent',
                        right ? '-right-px border-l-[8px] border-l-fd-primary' : '-left-px border-r-[8px] border-r-fd-primary',
                      )}
                    />
                  )}
                </span>
                <span className="sr-only">
                  {m.from} sends {m.to}: {m.label}
                  {m.lost ? ' (lost)' : ''}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
