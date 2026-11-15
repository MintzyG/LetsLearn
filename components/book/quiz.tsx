'use client';

import { useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface QuizOption {
  text: string;
  correct?: boolean;
  /** Why this option is right or wrong, shown once it's picked. */
  why?: string;
}

/**
 * A multiple-choice question about the language, with an explanation for every option.
 * Picking one reveals whether it's right and why; picking a right one reveals them all.
 * Children (optional) go between the question and the options, e.g. a code block.
 */
export function Quiz({ question, options, children }: { question: ReactNode; options: QuizOption[]; children?: ReactNode }) {
  const [picked, setPicked] = useState<number[]>([]);
  const solved = picked.some((i) => options[i].correct);

  return (
    <section className="not-prose my-8 rounded-2xl border border-fd-primary/35 bg-fd-card p-5">
      <p className="font-display text-[1.25rem] leading-snug text-fd-foreground">{question}</p>
      {children && <div className="mt-3 [&_figure]:my-0">{children}</div>}
      <ol className="mt-4 space-y-2">
        {options.map((o, i) => {
          const open = solved || picked.includes(i);
          return (
            <li key={i}>
              <button
                type="button"
                disabled={solved}
                onClick={() => setPicked((p) => (p.includes(i) ? p : [...p, i]))}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border px-4 py-2.5 text-left text-[0.9375rem] transition-colors',
                  !open && 'border-fd-border bg-fd-background hover:border-fd-primary/50',
                  open && o.correct && 'border-fd-primary bg-fd-primary/10',
                  open && !o.correct && 'border-series-2/60 bg-series-2/10',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[0.6875rem]',
                    open ? (o.correct ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground' : 'border-series-2 bg-series-2 text-fd-background') : 'border-fd-muted-foreground/50 text-fd-muted-foreground',
                  )}
                >
                  {open ? o.correct ? <Check aria-hidden className="size-3" /> : <X aria-hidden className="size-3" /> : String.fromCharCode(97 + i)}
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[0.875rem] text-fd-foreground">{o.text}</span>
                  {open && o.why && <span className="mt-1 block text-sm text-fd-muted-foreground">{o.why}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {picked.length > 0 && !solved && <p className="mt-3 text-sm text-fd-muted-foreground">Not that one. Try another.</p>}
    </section>
  );
}
