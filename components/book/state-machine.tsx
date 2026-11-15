import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Diagram, monoWidth } from './diagram';

export interface MachineState {
  id: string;
  /** Shown in the circle; the id when left out. */
  label?: string;
  /** The start state: an arrow comes in from the left. */
  initial?: boolean;
  /** An accepting (final) state: drawn as a double circle. */
  accepting?: boolean;
  highlight?: boolean;
}

export interface MachineTransition {
  from: string;
  to: string;
  /** The input or event, e.g. "a", "ε", "SYN / SYN+ACK". */
  label: string;
  highlight?: boolean;
}

const cy = 0;
const minGap = 64;

/**
 * A state machine or automaton: states in a row, in the order given, transitions as arcs.
 * Arcs that go right run above the states, arcs that go left run below, and a state's
 * transitions to itself loop over its top. Mark `initial` and `accepting` states for a DFA
 * or NFA; any label works for a protocol (TCP, a parser's modes).
 */
export function StateMachine({ states, transitions, caption }: { states: MachineState[]; transitions: MachineTransition[]; caption?: string }) {
  const index = new Map(states.map((s, i) => [s.id, i]));
  const radius = states.map((s) => Math.max(20, monoWidth(s.label ?? s.id) / 2 + 10));
  const between = (i: number) => {
    const labels = transitions.filter((t) => {
      const a = index.get(t.from)!;
      const b = index.get(t.to)!;
      return Math.min(a, b) === i && Math.abs(a - b) === 1;
    });
    const longest = Math.max(0, ...labels.map((t) => monoWidth(t.label, 11)));
    return Math.max(radius[i] + radius[i + 1] + minGap, longest + radius[i] + radius[i + 1] + 16);
  };
  const xs: number[] = [];
  states.forEach((_, i) => xs.push(i === 0 ? radius[0] + (states.some((s) => s.initial) ? 40 : 4) : xs[i - 1] + between(i - 1)));

  let top = 0;
  let bottom = 0;
  const arcs: ReactNode[] = [];
  const labels: ReactNode[] = [];
  transitions.forEach((t, k) => {
    const a = index.get(t.from);
    const b = index.get(t.to);
    if (a === undefined || b === undefined) throw new Error(`StateMachine: no state "${a === undefined ? t.from : t.to}"`);
    const stroke = t.highlight ? 'stroke-fd-primary' : 'stroke-fd-foreground/70';
    const marker = `url(#sm-arrow-${t.highlight ? 'on' : 'off'})`;
    const text = (x: number, y: number) => (
      <text key={`l${k}`} x={x} y={y} textAnchor="middle" dominantBaseline="central" className={cn('font-mono text-[11px] [paint-order:stroke] stroke-fd-card stroke-[4px]', t.highlight ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}>
        {t.label}
      </text>
    );
    if (a === b) {
      const r = radius[a];
      const x = xs[a];
      const d = `M${x - r * 0.5},${cy - r * 0.87} C${x - r * 0.9},${cy - r - 34} ${x + r * 0.9},${cy - r - 34} ${x + r * 0.5},${cy - r * 0.87}`;
      arcs.push(<path key={k} d={d} fill="none" className={stroke} strokeWidth={t.highlight ? 1.75 : 1.25} markerEnd={marker} />);
      labels.push(text(x, cy - r - 34));
      top = Math.max(top, r + 44);
      return;
    }
    const right = b > a;
    const span = Math.abs(b - a);
    const sign = right ? -1 : 1;
    const [ra, rb] = [radius[a], radius[b]];
    // Leave and enter from the side (45°), clear of the self-loops on top.
    const x1 = xs[a] + (right ? ra : -ra) * 0.71;
    const x2 = xs[b] + (right ? -rb : rb) * 0.71;
    const y1 = cy + sign * ra * 0.71;
    const y2 = cy + sign * rb * 0.71;
    const lift = 26 + 30 * (span - 1);
    const ctrlY = cy + sign * (Math.max(ra, rb) + lift * 2 - 10);
    const mx = (x1 + x2) / 2;
    const apex = (y1 + 2 * ctrlY + y2) / 4;
    arcs.push(<path key={k} d={`M${x1},${y1} Q${mx},${ctrlY} ${x2},${y2}`} fill="none" className={stroke} strokeWidth={t.highlight ? 1.75 : 1.25} markerEnd={marker} />);
    labels.push(text(mx, apex));
    if (right) top = Math.max(top, -apex + 12);
    else bottom = Math.max(bottom, apex + 12);
  });
  top = Math.max(top, Math.max(...radius) + 4);
  bottom = Math.max(bottom, Math.max(...radius) + 4);
  const width = xs[xs.length - 1] + radius[radius.length - 1] + 4;

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <svg viewBox={`0 ${-top} ${width} ${top + bottom}`} width={width} style={{ minWidth: Math.min(width, 340) }} className="mx-auto block h-auto max-w-full" role="img" aria-label={`State machine with states ${states.map((s) => s.label ?? s.id).join(', ')}`}>
          <defs>
            {[true, false].map((on) => (
              <marker key={String(on)} id={`sm-arrow-${on ? 'on' : 'off'}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" className={on ? 'fill-fd-primary' : 'fill-fd-foreground/70'} />
              </marker>
            ))}
          </defs>
          {arcs}
          {states.map((s, i) => {
            const r = radius[i];
            return (
              <g key={s.id}>
                {s.initial && <line x1={xs[i] - r - 36} x2={xs[i] - r - 1} y1={cy} y2={cy} className="stroke-fd-foreground/70" strokeWidth={1.25} markerEnd="url(#sm-arrow-off)" />}
                <circle cx={xs[i]} cy={cy} r={r} className={cn(s.highlight ? 'fill-fd-primary/15 stroke-fd-primary' : 'fill-fd-background stroke-fd-primary/60')} strokeWidth={s.highlight ? 2 : 1.5} />
                {s.accepting && <circle cx={xs[i]} cy={cy} r={r - 4} className={cn('fill-none', s.highlight ? 'stroke-fd-primary' : 'stroke-fd-primary/60')} strokeWidth={1.25} />}
                <text x={xs[i]} y={cy} textAnchor="middle" dominantBaseline="central" className={cn('font-mono text-[12px]', s.highlight ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}>
                  {s.label ?? s.id}
                </text>
              </g>
            );
          })}
          {labels}
        </svg>
      </div>
    </Diagram>
  );
}
