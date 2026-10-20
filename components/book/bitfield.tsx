import { cn } from '@/lib/cn';

export interface BitfieldField {
  name: string;
  /** Width in bits, or 'variable' for a field whose length depends on the data. */
  bits: number | 'variable';
  /** Draw this field in the accent color: the one the text is talking about. */
  highlight?: boolean;
}

interface Cell {
  name: string;
  span: number;
  bits: number | 'variable';
  part: 'whole' | 'first' | 'rest';
  highlight?: boolean;
}

// Lays the fields out in rows of `width` bits, splitting a field that runs past the end of a row.
function layout(fields: BitfieldField[], width: number): Cell[][] {
  const rows: Cell[][] = [[]];
  let used = 0;
  for (const field of fields) {
    if (field.bits === 'variable') {
      if (used > 0) rows.push([]);
      rows[rows.length - 1].push({ ...field, span: width, part: 'whole' });
      rows.push([]);
      used = 0;
      continue;
    }
    let left = field.bits;
    let first = true;
    while (left > 0) {
      const span = Math.min(left, width - used);
      left -= span;
      const part = first && left === 0 ? 'whole' : first ? 'first' : 'rest';
      rows[rows.length - 1].push({ name: field.name, span, bits: field.bits, part, highlight: field.highlight });
      first = false;
      used += span;
      if (used === width) {
        rows.push([]);
        used = 0;
      }
    }
  }
  return rows.filter((row) => row.length > 0);
}

/**
 * A header or record laid out bit by bit, the way RFCs draw them: one row per `width` bits,
 * with a ruler of bit numbers on top. Facts from the spec, never the reader's parsing code.
 */
export function Bitfield({ fields, width = 32, caption }: { fields: BitfieldField[]; width?: number; caption?: string }) {
  const rows = layout(fields, width);
  const columns = { gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))` };

  return (
    <figure className="not-prose my-8">
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[36rem]">
          <div className="grid font-mono text-[0.625rem] text-fd-muted-foreground tabular-nums" style={columns}>
            {Array.from({ length: width }, (_, i) => (
              <span key={i} className={cn('pb-1 text-center', i % 8 === 0 ? 'text-fd-foreground' : 'opacity-60')}>
                {i}
              </span>
            ))}
          </div>
          <div className="border-t border-l border-fd-primary/35">
            {rows.map((row, r) => (
              <div key={r} className="grid" style={columns}>
                {row.map((cell, c) => (
                  <div
                    key={c}
                    style={{ gridColumn: `span ${cell.span}` }}
                    className={cn(
                      'flex min-h-14 flex-col items-center justify-center border-r border-b border-fd-primary/35 px-1 py-2 text-center',
                      cell.highlight ? 'bg-fd-primary/12' : 'bg-fd-card',
                      cell.bits === 'variable' && 'border-dashed bg-transparent',
                    )}
                  >
                    <span className={cn('text-sm leading-tight', cell.highlight ? 'font-semibold text-fd-primary' : 'text-fd-foreground')}>
                      {cell.name}
                      {cell.part === 'rest' && <span className="text-fd-muted-foreground"> (cont.)</span>}
                    </span>
                    {cell.part !== 'rest' && cell.span >= 4 && (
                      <span className="mt-0.5 font-mono text-[0.6875rem] text-fd-muted-foreground">
                        {cell.bits === 'variable' ? 'variable length' : `${cell.bits} bit${cell.bits === 1 ? '' : 's'}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
