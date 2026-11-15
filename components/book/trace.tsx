'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/cn';
import { codeLines } from './code-lines';

export interface TraceStep {
  /** The line about to run (or just run), counting from 1. */
  line: number;
  /** Every variable in scope and its value at this step, as text. */
  vars?: Record<string, string>;
  /** What this step prints, added to the output so far. */
  out?: string;
  note?: string;
}

/**
 * Steps through a program line by line: the current line lit in the code (the children, a
 * fenced block), the variables and their values, and the output so far. Values that changed
 * since the last step stand out. The steps are written by hand from running the program.
 */
export function Trace({ steps, children }: { steps: TraceStep[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const step = steps[at];
  const prev = at > 0 ? steps[at - 1].vars ?? {} : {};
  const output = steps
    .slice(0, at + 1)
    .map((s) => s.out ?? '')
    .join('');

  useEffect(() => {
    const lines = codeLines(root.current);
    lines.forEach((l, i) => l.toggleAttribute('data-lit', i + 1 === step.line));
  }, [step.line]);

  const go = (i: number) => setAt(Math.max(0, Math.min(steps.length - 1, i)));

  return (
    <div
      ref={root}
      className="code-notes not-prose my-8 rounded-2xl border border-fd-primary/35 bg-fd-card p-3 sm:p-4"
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(at + 1);
        if (e.key === 'ArrowLeft') go(at - 1);
      }}
    >
      <div className="[&_figure]:my-0">{children}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => go(at - 1)} disabled={at === 0} aria-label="Previous step" className="grid size-8 place-items-center rounded-full border border-fd-border text-fd-foreground disabled:opacity-40">
          <ChevronLeft className="size-4" />
        </button>
        <button type="button" onClick={() => go(at + 1)} disabled={at === steps.length - 1} aria-label="Next step" className="grid size-8 place-items-center rounded-full border border-fd-primary bg-fd-primary text-fd-primary-foreground disabled:opacity-40">
          <ChevronRight className="size-4" />
        </button>
        <input
          type="range"
          min={0}
          max={steps.length - 1}
          value={at}
          onChange={(e) => go(Number(e.target.value))}
          aria-label="Step"
          className="h-1 min-w-24 flex-1 accent-fd-primary"
        />
        <span className="font-mono text-xs text-fd-muted-foreground tabular-nums">
          step {at + 1}/{steps.length} · line {step.line}
        </span>
        <button type="button" onClick={() => go(0)} aria-label="Back to the start" className="grid size-8 place-items-center rounded-full text-fd-muted-foreground hover:text-fd-foreground">
          <RotateCcw className="size-3.5" />
        </button>
      </div>
      {step.note && <p className="mt-2 text-[0.9375rem] text-fd-foreground">{step.note}</p>}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">Variables</p>
          <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-lg bg-fd-background px-3 py-2 font-mono text-[0.8125rem]">
            {Object.entries(step.vars ?? {}).map(([k, v]) => {
              const changed = prev[k] !== v;
              return (
                <div key={k} className="contents">
                  <dt className="text-fd-muted-foreground">{k}</dt>
                  <dd className={cn('break-all', changed ? 'font-semibold text-fd-primary' : 'text-fd-foreground')}>{v}</dd>
                </div>
              );
            })}
            {!Object.keys(step.vars ?? {}).length && <span className="col-span-2 text-fd-muted-foreground">none yet</span>}
          </dl>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium tracking-wide text-fd-muted-foreground uppercase">Output</p>
          <pre className="min-h-9 overflow-x-auto rounded-lg bg-fd-background px-3 py-2 font-mono text-[0.8125rem] text-fd-foreground">{output || ' '}</pre>
        </div>
      </div>
    </div>
  );
}
