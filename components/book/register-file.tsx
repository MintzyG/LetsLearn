import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

export interface CpuRegister {
  name: string;
  /** Width in bits; sets the box's width relative to the others. */
  bits: number;
  /** The value shown, as written, e.g. "0x01B0". */
  value?: string;
  /** A line under it: "accumulator", "flags: Z N H C". */
  note?: string;
  highlight?: boolean;
}

/**
 * A CPU's registers, one row per group: `rows={[[A, F], [B, C], [SP], [PC]]}` draws paired
 * 8-bit registers side by side and 16-bit ones full width, as emulator docs do.
 */
export function RegisterFile({ rows, caption }: { rows: CpuRegister[][]; caption?: string }) {
  const widest = Math.max(...rows.map((r) => r.reduce((s, x) => s + x.bits, 0)));
  return (
    <Diagram caption={caption}>
      <div className="mx-auto max-w-md space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${widest}, minmax(0, 1fr))` }}>
            {row.map((r) => (
              <div
                key={r.name}
                style={{ gridColumn: `span ${r.bits}` }}
                className={cn('flex items-baseline justify-between gap-3 rounded-lg border px-3 py-2', r.highlight ? 'border-fd-primary bg-fd-primary/12' : 'border-fd-primary/35 bg-fd-background')}
              >
                <span>
                  <span className={cn('block font-mono text-sm font-semibold', r.highlight ? 'text-fd-primary' : 'text-fd-foreground')}>{r.name}</span>
                  {r.note && <span className="block text-[0.6875rem] text-fd-muted-foreground">{r.note}</span>}
                </span>
                <span className="text-right font-mono text-[0.75rem] text-fd-muted-foreground tabular-nums">
                  {r.value ?? `${r.bits} bit`}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Diagram>
  );
}
