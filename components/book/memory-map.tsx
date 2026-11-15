import { cn } from '../../lib/cn';
import { Diagram, formatHex, formatSize, parseNumber } from './diagram';

export interface MemoryRegion {
  name: string;
  /** First address, e.g. "0x0800_0000". */
  start: string;
  /** Last address, inclusive, e.g. "0x080F_FFFF". */
  end: string;
  note?: string;
  highlight?: boolean;
}

/**
 * An address space as a stack of regions, high addresses on top, as reference manuals draw
 * it. Rows are not to scale; each shows its range and size. Holes between regions are
 * drawn and labelled as unmapped, so nothing on the map goes unexplained.
 */
export function MemoryMap({
  regions,
  digits = 8,
  gapLabel = 'unmapped',
  caption,
}: {
  regions: MemoryRegion[];
  /** Hex digits per address: 8 for a 32-bit space, 16 for 64-bit. */
  digits?: number;
  gapLabel?: string;
  caption?: string;
}) {
  const sorted = regions
    .map((r) => ({ ...r, lo: parseNumber(r.start), hi: parseNumber(r.end) }))
    .sort((a, b) => (a.lo < b.lo ? -1 : 1));
  const rows: { name: string; lo: bigint; hi: bigint; note?: string; highlight?: boolean; gap?: boolean }[] = [];
  sorted.forEach((r, i) => {
    rows.push(r);
    const next = sorted[i + 1];
    if (next && next.lo > r.hi + 1n) rows.push({ name: gapLabel, lo: r.hi + 1n, hi: next.lo - 1n, gap: true });
  });
  rows.reverse();

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <ol className="grid min-w-[17rem] grid-cols-[max-content_minmax(0,1fr)] gap-x-2 font-mono text-[0.6875rem] tabular-nums sm:gap-x-4 sm:text-[0.75rem]">
          {rows.map((r, i) => (
            <li key={i} className="contents">
              <span className="flex flex-col justify-between py-0.5 text-right text-fd-muted-foreground">
                <span>{formatHex(r.hi, digits)}</span>
                <span>{formatHex(r.lo, digits)}</span>
              </span>
              <span
                className={cn(
                  'flex min-h-14 items-center justify-between gap-3 border-x border-t px-3 py-2 last:border-b sm:px-4',
                  r.gap
                    ? 'border-dashed border-fd-border bg-transparent text-fd-muted-foreground'
                    : r.highlight
                      ? 'border-fd-primary bg-fd-primary/12'
                      : 'border-fd-primary/35 bg-fd-background',
                  i === rows.length - 1 && 'border-b',
                )}
              >
                <span className="font-sans">
                  <span className={cn('block text-sm', r.gap ? 'italic' : r.highlight ? 'font-semibold text-fd-primary' : 'font-medium text-fd-foreground')}>
                    {r.name}
                  </span>
                  {r.note && <span className="block text-xs text-fd-muted-foreground">{r.note}</span>}
                </span>
                <span className="shrink-0 text-fd-muted-foreground">{formatSize(r.hi - r.lo + 1n)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Diagram>
  );
}
