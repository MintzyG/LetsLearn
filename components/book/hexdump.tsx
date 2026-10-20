'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export interface HexRange {
  /** Offset of the first byte. */
  start: number;
  /** Number of bytes. */
  length: number;
  label: string;
}

// Ranges cycle through the two chart series and a neutral ink, so neighbours never share a color.
const tints = ['bg-fd-primary/15 text-fd-foreground', 'bg-series-2/20 text-fd-foreground', 'bg-fd-foreground/10 text-fd-foreground'];
const swatches = ['bg-fd-primary/60', 'bg-series-2/70', 'bg-fd-foreground/40'];

/**
 * Bytes as a hex dump, with labelled ranges. Pointing at a byte or a legend entry picks out
 * its whole range. `bytes` is hex, whitespace ignored, e.g. "45 00 00 54".
 */
export function HexDump({ bytes, ranges = [], columns = 16 }: { bytes: string; ranges?: HexRange[]; columns?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const data = bytes.replace(/\s+/g, '').match(/../g) ?? [];
  const rangeOf = (i: number) => ranges.findIndex((r) => i >= r.start && i < r.start + r.length);
  const rows = Array.from({ length: Math.ceil(data.length / columns) }, (_, r) => data.slice(r * columns, (r + 1) * columns));

  return (
    <figure className="not-prose my-8 rounded-2xl border border-fd-primary/35 bg-fd-card p-4 sm:p-6">
      <div className="overflow-x-auto">
        <div className="w-max font-mono text-[0.8125rem] leading-none tabular-nums" onMouseLeave={() => setActive(null)}>
          {rows.map((row, r) => (
            <div key={r} className="flex items-center">
              <span className="w-12 shrink-0 text-fd-muted-foreground select-none">{(r * columns).toString(16).padStart(4, '0')}</span>
              {row.map((byte, c) => {
                const i = r * columns + c;
                const range = rangeOf(i);
                return (
                  <span
                    key={c}
                    onMouseEnter={() => setActive(range >= 0 ? range : null)}
                    className={cn(
                      'px-[0.3rem] py-1.5 transition-opacity motion-reduce:transition-none',
                      c > 0 && c % 8 === 0 && 'ml-2',
                      range >= 0 ? tints[range % tints.length] : 'text-fd-muted-foreground',
                      active !== null && range !== active && 'opacity-30',
                    )}
                  >
                    {byte.toLowerCase()}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {ranges.length > 0 && (
        <ul className="mt-4 list-none p-0 flex flex-wrap gap-x-5 gap-y-1.5 border-t border-fd-border pt-3 text-sm">
          {ranges.map((range, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className={cn(
                  'flex items-center gap-2 rounded-sm transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring',
                  active !== null && active !== i && 'opacity-40',
                )}
              >
                <span className={cn('size-2.5 rounded-sm', swatches[i % swatches.length])} />
                <span className="text-fd-foreground">{range.label}</span>
                <span className="font-mono text-xs text-fd-muted-foreground">
                  {range.length} byte{range.length === 1 ? '' : 's'} at {range.start}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
