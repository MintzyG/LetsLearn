'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { codeLines, lineRange } from './code-lines';

export interface CodeNote {
  /** The line it explains, or [from, to] for a range. Lines count from 1. */
  line: number | [number, number];
  text: ReactNode;
}

/**
 * A code block (the children, a fenced block) with numbered notes on its lines, the way a
 * book walks through a first program. Each note puts its number on its line; pointing at a
 * note, or its number, lights up the lines it's about.
 */
export function CodeNotes({ notes, children }: { notes: CodeNote[]; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const lines = codeLines(root.current);
    notes.forEach((note, i) => {
      const [first] = lineRange(note.line);
      lines[first - 1]?.setAttribute('data-note', String(i + 1));
    });
    return () => lines.forEach((l) => l.removeAttribute('data-note'));
  }, [notes]);

  useEffect(() => {
    const lines = codeLines(root.current);
    const on = active === null ? [] : lineRange(notes[active].line);
    lines.forEach((l, i) => l.toggleAttribute('data-lit', on.includes(i + 1)));
  }, [active, notes]);

  return (
    <div ref={root} className="code-notes not-prose my-8" onMouseLeave={() => setActive(null)}>
      <div className="[&_figure]:my-0">{children}</div>
      <ol className="mt-3 space-y-1.5">
        {notes.map((n, i) => (
          <li key={i}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={cn('flex w-full items-start gap-3 rounded-lg px-2 py-1.5 text-left text-[0.9375rem] leading-relaxed transition-colors', active === i && 'bg-fd-primary/10')}
            >
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-fd-primary font-mono text-[0.6875rem] font-semibold text-fd-primary-foreground">{i + 1}</span>
              <span className="text-fd-foreground">{n.text}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
