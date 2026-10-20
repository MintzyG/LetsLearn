'use client';

import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * "You're done when": the checks that say a section is finished. Ticks stay in
 * this browser (localStorage), per page. Where storage is blocked, the boxes stay unticked.
 */
// Ticks live in localStorage. Same-tab writes announce themselves with this event; other tabs
// fire 'storage'. Every access is guarded: storage can be blocked or missing.
const changed = 'done-when-change';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(changed, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(changed, onChange);
  };
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parse(saved: string | null, length: number): boolean[] {
  try {
    const list = JSON.parse(saved ?? '[]');
    return Array.from({ length }, (_, i) => Array.isArray(list) && Boolean(list[i]));
  } catch {
    return Array.from({ length }, () => false);
  }
}

export function DoneWhen({ title = "You're done when", items }: { title?: string; items: string[] }) {
  const key = `done-when:${usePathname()}:${title}`;
  const saved = useSyncExternalStore(subscribe, () => read(key), () => null);
  const done = parse(saved, items.length);

  function toggle(i: number) {
    try {
      localStorage.setItem(key, JSON.stringify(done.map((d, j) => (j === i ? !d : d))));
      window.dispatchEvent(new Event(changed));
    } catch {}
  }

  const count = done.filter(Boolean).length;

  return (
    <section className="book-paper not-prose my-8 rounded-2xl border border-fd-primary/35 px-6 py-6 sm:px-8">
      <p className="mb-3 flex items-baseline justify-between gap-4">
        <span className="font-display text-[1.5rem] leading-tight text-fd-foreground">{title}</span>
        <span className="text-sm text-fd-muted-foreground tabular-nums">
          {count} of {items.length}
        </span>
      </p>
      <ul>
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 py-1.5 leading-6">
              <input type="checkbox" checked={done[i]} onChange={() => toggle(i)} className="peer sr-only" />
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fd-ring',
                  done[i] ? 'border-fd-primary bg-fd-primary text-fd-primary-foreground' : 'border-fd-primary/50 bg-fd-background',
                )}
              >
                {done[i] && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className={cn('text-[0.96875rem]', done[i] ? 'text-fd-muted-foreground line-through decoration-fd-primary/60' : 'text-fd-foreground')}>
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
