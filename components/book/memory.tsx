import { cn } from '../../lib/cn';
import { Diagram, monoWidth } from './diagram';

export interface MemoryVar {
  name: string;
  /** What's stored in the variable itself. Leave out for a pure pointer. */
  value?: string;
  /** The id of the heap block it points to: draws an arrow. */
  to?: string;
  highlight?: boolean;
}

export interface MemoryFrame {
  /** The function, e.g. "main". */
  name: string;
  vars: MemoryVar[];
}

export interface HeapBlock {
  id: string;
  /** Shown above the block, e.g. "String" or "[]int, cap 4". */
  label?: string;
  /** The block's contents, one box each: bytes, elements, fields. */
  cells: string[];
  /** Already freed (or moved out of): drawn dashed. */
  freed?: boolean;
  highlight?: boolean;
}

const row = 30;
const head = 24;
const gap = 14;
const arrowGap = 90;

/**
 * Stack and heap, the way books draw them to explain values and pointers: stack frames with
 * their variables on the left, heap blocks on the right, an arrow from each pointer to what it
 * points at. For ownership and borrowing (Rust), slices and maps (Go), references (anything).
 */
export function Memory({ stack, heap = [], caption }: { /** Innermost frame first. */ stack: MemoryFrame[]; heap?: HeapBlock[]; caption?: string }) {
  const vars = stack.flatMap((f) => f.vars);
  const nameW = Math.max(40, ...vars.map((v) => monoWidth(v.name))) + 16;
  const valueW = Math.max(56, ...vars.map((v) => monoWidth(v.value ?? '') + 20));
  const stackW = nameW + valueW;
  const heapX = stackW + arrowGap;

  // Stack frames, top to bottom.
  const frames: { f: MemoryFrame; top: number }[] = [];
  let y = 18;
  for (const f of stack) {
    frames.push({ f, top: y });
    y += head + f.vars.length * row + gap;
  }
  const varY = new Map<MemoryVar, number>();
  frames.forEach(({ f, top }) => f.vars.forEach((v, i) => varY.set(v, top + head + i * row + row / 2)));

  // Heap blocks, top to bottom.
  const blocks = heap.map((b, i) => ({ b, top: 18 + i * (18 + row + gap), cellW: Math.max(28, ...b.cells.map((c) => monoWidth(c) + 14)) }));
  const hy = 18 + heap.length * (18 + row + gap);
  const blockAt = new Map(blocks.map((x) => [x.b.id, x]));
  const width = Math.max(stackW, heap.length ? heapX + Math.max(...blocks.map((x) => Math.max(x.b.cells.length * x.cellW, monoWidth(`${x.b.label ?? x.b.id}${x.b.freed ? ' (freed)' : ''}`, 11)))) : 0) + 4;
  const height = Math.max(y, hy);

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ minWidth: Math.min(width, 340) }} className="mx-auto block h-auto max-w-full font-mono text-[12px]" role="img" aria-label="Stack and heap">
          <defs>
            {[true, false].map((on) => (
              <marker key={String(on)} id={`mem-arrow-${on ? 'on' : 'off'}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={on ? 'fill-fd-primary' : 'fill-fd-foreground/70'} />
              </marker>
            ))}
          </defs>
          <text x={0} y={10} className="fill-fd-muted-foreground text-[10px] tracking-wider uppercase">
            stack
          </text>
          {heap.length > 0 && (
            <text x={heapX} y={10} className="fill-fd-muted-foreground text-[10px] tracking-wider uppercase">
              heap
            </text>
          )}
          {frames.map(({ f, top }) => (
            <g key={f.name + top}>
              <rect x={0.5} y={top} width={stackW} height={head + f.vars.length * row} rx={8} className="fill-fd-background stroke-fd-primary/45" />
              <text x={10} y={top + head / 2 + 1} dominantBaseline="central" className="fill-fd-muted-foreground">
                {f.name}()
              </text>
              {f.vars.map((v, i) => {
                const vy = top + head + i * row;
                return (
                  <g key={v.name}>
                    <line x1={0.5} x2={stackW + 0.5} y1={vy} y2={vy} className="stroke-fd-border" />
                    <text x={10} y={vy + row / 2} dominantBaseline="central" className={cn(v.highlight ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}>
                      {v.name}
                    </text>
                    <rect x={nameW} y={vy + 4} width={valueW - 8} height={row - 8} rx={4} className={cn(v.highlight ? 'fill-fd-primary/15 stroke-fd-primary' : 'fill-fd-card stroke-fd-border')} />
                    {v.value && (
                      <text x={nameW + 8} y={vy + row / 2} dominantBaseline="central" className="fill-fd-foreground">
                        {v.value}
                      </text>
                    )}
                    {!v.value && v.to && <circle cx={nameW + (valueW - 8) / 2} cy={vy + row / 2} r={3} className={v.highlight ? 'fill-fd-primary' : 'fill-fd-foreground/70'} />}
                  </g>
                );
              })}
            </g>
          ))}
          {blocks.map(({ b, top, cellW }) => (
            <g key={b.id}>
              <text x={heapX} y={top + 9} className="fill-fd-muted-foreground text-[11px]">
                {b.label ?? b.id}
                {b.freed ? ' (freed)' : ''}
              </text>
              {b.cells.map((c, i) => (
                <g key={i}>
                  <rect
                    x={heapX + i * cellW}
                    y={top + 16}
                    width={cellW}
                    height={row - 4}
                    className={cn(b.freed ? 'fill-transparent stroke-fd-muted-foreground/50' : b.highlight ? 'fill-fd-primary/15 stroke-fd-primary' : 'fill-fd-background stroke-fd-primary/45')}
                    strokeDasharray={b.freed ? '4 3' : undefined}
                  />
                  <text x={heapX + i * cellW + cellW / 2} y={top + 16 + (row - 4) / 2} textAnchor="middle" dominantBaseline="central" className={b.freed ? 'fill-fd-muted-foreground' : 'fill-fd-foreground'}>
                    {c}
                  </text>
                </g>
              ))}
            </g>
          ))}
          {vars
            .filter((v) => v.to && blockAt.has(v.to))
            .map((v) => {
              const target = blockAt.get(v.to!)!;
              const x1 = v.value ? stackW : nameW + (valueW - 8) / 2;
              const y1 = varY.get(v)!;
              const x2 = heapX - 2;
              const y2 = target.top + 16 + (row - 4) / 2;
              const d = v.value
                ? `M${x1},${y1} C${x1 + arrowGap / 2},${y1} ${x2 - arrowGap / 2},${y2} ${x2},${y2}`
                : `M${x1},${y1} C${stackW + arrowGap / 2},${y1} ${x2 - arrowGap / 2},${y2} ${x2},${y2}`;
              return <path key={v.name} d={d} fill="none" className={v.highlight ? 'stroke-fd-primary' : 'stroke-fd-foreground/70'} strokeWidth={v.highlight ? 1.75 : 1.25} markerEnd={`url(#mem-arrow-${v.highlight ? 'on' : 'off'})`} />;
            })}
        </svg>
      </div>
    </Diagram>
  );
}
