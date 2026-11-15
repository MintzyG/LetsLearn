import { cn } from '../../lib/cn';
import { Diagram, tones } from './diagram';

export interface Opcode {
  /** The encoding: a pattern like "8XY4" (list) or the byte, e.g. "0x3E" (grid). */
  code: string;
  /** The mnemonic, e.g. "ADD Vx, Vy". */
  name: string;
  /** What it does, in words or notation from the spec. List layout only. */
  effect?: string;
  /** A key of `groups`: colors the cell in the grid layout. */
  group?: string;
  highlight?: boolean;
}

/**
 * An instruction set as a table. The list layout suits small ISAs (CHIP-8): pattern, mnemonic,
 * effect, with the pattern's operand letters (anything not a hex digit) in color. The grid
 * layout is the 16×16 opcode map of a byte-coded CPU (Game Boy, 6502), high nibble down
 * and low nibble across, colored by `groups`. Opcodes left out of `ops` stay empty cells.
 */
export function OpcodeTable({
  ops,
  layout = 'list',
  groups = {},
  caption,
}: {
  ops: Opcode[];
  layout?: 'list' | 'grid';
  /** Group key → label, for the grid's legend. */
  groups?: Record<string, string>;
  caption?: string;
}) {
  if (layout === 'grid') {
    const keys = Object.keys(groups);
    const at = new Map(ops.map((o) => [parseInt(o.code.replace(/^0x/i, ''), 16), o]));
    const hex = (n: number) => n.toString(16).toUpperCase();
    return (
      <Diagram caption={caption}>
        {keys.length > 0 && (
          <ul className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-fd-foreground">
            {keys.map((k, i) => (
              <li key={k} className="flex items-center gap-2">
                <span className={cn('size-3 rounded-sm', tones[i % tones.length].fill)} />
                {groups[k]}
              </li>
            ))}
          </ul>
        )}
        <div className="overflow-x-auto">
          <table className="w-max border-collapse font-mono text-[0.625rem] leading-tight">
            <thead>
              <tr>
                <th />
                {Array.from({ length: 16 }, (_, c) => (
                  <th key={c} className="px-1 pb-1 font-normal text-fd-muted-foreground">
                    x{hex(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, r) => (
                <tr key={r}>
                  <th className="pr-1.5 text-right font-normal text-fd-muted-foreground">{hex(r)}x</th>
                  {Array.from({ length: 16 }, (_, c) => {
                    const o = at.get(r * 16 + c);
                    const g = o?.group ? keys.indexOf(o.group) : -1;
                    return (
                      <td
                        key={c}
                        title={o ? `0x${hex(r)}${hex(c)}: ${o.name}` : `0x${hex(r)}${hex(c)}: not listed`}
                        className={cn(
                          'h-9 w-[4.5rem] border border-fd-border px-1 text-center',
                          o ? (g >= 0 ? tones[g % tones.length].fill : 'bg-fd-background') : 'bg-transparent',
                          o?.highlight && 'outline-2 -outline-offset-2 outline-fd-primary',
                          'text-fd-foreground',
                        )}
                      >
                        {o?.name}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Diagram>
    );
  }

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-fd-border text-left text-xs text-fd-muted-foreground">
              <th className="py-1.5 pr-4 font-medium">Opcode</th>
              <th className="py-1.5 pr-4 font-medium">Mnemonic</th>
              {ops.some((o) => o.effect) && <th className="py-1.5 font-medium">Effect</th>}
            </tr>
          </thead>
          <tbody>
            {ops.map((o, i) => (
              <tr key={i} className={cn('border-b border-fd-border/60 last:border-0', o.highlight && 'bg-fd-primary/10')}>
                <td className="py-1.5 pr-4 font-mono whitespace-nowrap">
                  {[...o.code].map((ch, k) => (
                    <span key={k} className={/[0-9A-F]/.test(ch) ? 'text-fd-foreground' : 'text-series-2'}>
                      {ch}
                    </span>
                  ))}
                </td>
                <td className={cn('py-1.5 pr-4 font-mono whitespace-nowrap', o.highlight ? 'font-semibold text-fd-primary' : 'text-fd-foreground')}>{o.name}</td>
                {ops.some((op) => op.effect) && <td className="py-1.5 text-fd-muted-foreground">{o.effect}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Diagram>
  );
}
