import { cn } from '../../lib/cn';
import { Diagram, formatHex, parseNumber } from './diagram';

export interface RegisterField {
  /** Optional only for reserved bits. */
  name?: string;
  bits: number;
  /** How software may touch it, as the datasheet writes it: rw, r, w, rc_w1, ... */
  access?: string;
  /** Bits the datasheet marks reserved: drawn hatched, name optional. */
  reserved?: boolean;
  highlight?: boolean;
}

interface Cell extends RegisterField {
  /** Bit number of the cell's leftmost (highest) bit. */
  top: number;
  span: number;
  part: 'whole' | 'first' | 'rest';
}

// Fields come most significant first, as in a datasheet; rows hold `row` bits each.
function layout(fields: RegisterField[], width: number, row: number): Cell[][] {
  const rows: Cell[][] = [];
  let bit = width - 1;
  for (const field of fields) {
    let left = field.bits;
    let first = true;
    while (left > 0) {
      const used = (width - 1 - bit) % row;
      if (used === 0) rows.push([]);
      const span = Math.min(left, row - used);
      left -= span;
      rows[rows.length - 1].push({ ...field, top: bit, span, part: first && left === 0 ? 'whole' : first ? 'first' : 'rest' });
      bit -= span;
      first = false;
    }
  }
  return rows;
}

/**
 * A memory-mapped register as a datasheet draws it: bit numbers running down from the top
 * bit, each field's access, and the reset value bit by bit. Fields are listed most
 * significant first, and must add up to `width`.
 */
export function Register({
  name,
  address,
  reset,
  fields,
  width = 32,
  row = 16,
  caption,
}: {
  name: string;
  /** Address or offset, e.g. "0x4002_0000" or "+0x14". */
  address?: string;
  /** Value after reset, e.g. "0x0000_0000"; shown under every bit. */
  reset?: string;
  fields: RegisterField[];
  width?: number;
  /** Bits per row: 16 splits a 32-bit register in two, the way most datasheets do. */
  row?: number;
  caption?: string;
}) {
  const total = fields.reduce((s, f) => s + f.bits, 0);
  if (total !== width) throw new Error(`Register ${name}: fields add up to ${total} bits, not ${width}`);
  const rows = layout(fields, width, Math.min(row, width));
  const resetValue = reset !== undefined ? parseNumber(reset) : undefined;
  const bitOf = (n: number) => (resetValue === undefined ? undefined : Number((resetValue >> BigInt(n)) & 1n));
  const columns = { gridTemplateColumns: `repeat(${Math.min(row, width)}, minmax(0, 1fr))` };

  return (
    <Diagram caption={caption}>
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-sm">
        <span className="font-semibold text-fd-foreground">{name}</span>
        {address && <span className="text-fd-muted-foreground">{address}</span>}
        {resetValue !== undefined && <span className="text-fd-muted-foreground">reset {formatHex(resetValue, Math.ceil(width / 4))}</span>}
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[32rem] space-y-3">
          {rows.map((cells, r) => {
            const high = cells[0].top;
            const count = cells.reduce((s, c) => s + c.span, 0);
            return (
              <div key={r}>
                <div className="grid font-mono text-[0.625rem] text-fd-muted-foreground tabular-nums" style={columns}>
                  {Array.from({ length: count }, (_, i) => (
                    <span key={i} className="pb-1 text-center">
                      {high - i}
                    </span>
                  ))}
                </div>
                <div className="grid border-t border-l border-fd-primary/35" style={columns}>
                  {cells.map((c, i) => (
                    <div
                      key={i}
                      style={{ gridColumn: `span ${c.span}` }}
                      className={cn(
                        'flex min-h-12 flex-col items-center justify-center border-r border-b border-fd-primary/35 px-0.5 py-1.5 text-center',
                        c.reserved
                          ? 'bg-[repeating-linear-gradient(135deg,transparent_0_5px,color-mix(in_srgb,var(--color-fd-muted-foreground)_18%,transparent)_5px_6px)]'
                          : c.highlight
                            ? 'bg-fd-primary/12'
                            : 'bg-fd-background',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[0.75rem] leading-tight break-all',
                          c.reserved ? 'text-fd-muted-foreground' : c.highlight ? 'font-semibold text-fd-primary' : 'text-fd-foreground',
                        )}
                      >
                        {c.reserved ? (c.name ?? 'Reserved') : c.name}
                        {c.part === 'rest' && <span className="text-fd-muted-foreground"> (cont.)</span>}
                      </span>
                      {c.access && !c.reserved && <span className="font-mono text-[0.625rem] text-fd-muted-foreground">{c.access}</span>}
                    </div>
                  ))}
                </div>
                {resetValue !== undefined && (
                  <div className="grid font-mono text-[0.625rem] text-fd-muted-foreground tabular-nums" style={columns}>
                    {Array.from({ length: count }, (_, i) => (
                      <span key={i} className="pt-1 text-center">
                        {bitOf(high - i)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Diagram>
  );
}
