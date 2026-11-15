import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { Diagram, tones } from './diagram';

export interface TimingSignal {
  name: string;
  /**
   * One character per clock period, as in WaveDrom: `p`/`n` a clock starting with a
   * rising/falling edge, `0`/`1` (or `l`/`h`) low/high, `=` (or `2`–`9` for other colors) a
   * value from `data`, `x` unknown, `z` high impedance, `.` the same as before.
   */
  wave: string;
  /** Labels for the `=` periods, in order. */
  data?: string[];
  highlight?: boolean;
}

const cell = 34;
const rowHeight = 34;
const high = 7;
const low = 27;
const mid = (high + low) / 2;
const slant = 3;

function signalShapes(s: TimingSignal, top: number, hatch: string): ReactNode[] {
  const out: ReactNode[] = [];
  const stroke = s.highlight ? 'stroke-fd-primary' : 'stroke-fd-foreground';
  const width = s.highlight ? 1.75 : 1.25;
  const y = (v: number) => top + v;
  let data = 0;
  let prevLevel: number | undefined;

  // Group the wave into runs: a character and the `.`s after it.
  const runs: { c: string; start: number; len: number }[] = [];
  [...s.wave].forEach((c, i) => {
    if (c === '.' && runs.length) runs[runs.length - 1].len++;
    else runs.push({ c: c === '.' ? 'x' : c, start: i, len: 1 });
  });

  runs.forEach((r, k) => {
    const x0 = r.start * cell;
    const x1 = (r.start + r.len) * cell;
    const c = r.c === 'h' ? '1' : r.c === 'l' ? '0' : r.c;

    if (c === 'p' || c === 'n') {
      for (let i = 0; i < r.len; i++) {
        const a = x0 + i * cell;
        const [first, second] = c === 'p' ? [high, low] : [low, high];
        const points = [
          [a, y(second)],
          [a, y(first)],
          [a + cell / 2, y(first)],
          [a + cell / 2, y(second)],
          [a + cell, y(second)],
        ];
        out.push(<polyline key={`${k}-${i}`} points={points.join(' ')} fill="none" className={stroke} strokeWidth={width} />);
      }
      prevLevel = c === 'p' ? low : high;
      return;
    }

    if (c === '0' || c === '1') {
      const level = c === '1' ? high : low;
      const from = prevLevel ?? level;
      const d = `M${x0},${y(from)} L${x0 + (from === level ? 0 : slant)},${y(level)} L${x1},${y(level)}`;
      out.push(<path key={k} d={d} fill="none" className={stroke} strokeWidth={width} />);
      prevLevel = level;
      return;
    }

    if (c === 'z') {
      out.push(<line key={k} x1={x0} x2={x1} y1={y(mid)} y2={y(mid)} className="stroke-fd-muted-foreground" strokeWidth={width} />);
      prevLevel = undefined;
      return;
    }

    // A bus value (`=`, `2`-`9`) or unknown (`x`): a box with pinched ends.
    const box = `M${x0},${y(mid)} L${x0 + slant},${y(high)} L${x1 - slant},${y(high)} L${x1},${y(mid)} L${x1 - slant},${y(low)} L${x0 + slant},${y(low)} Z`;
    if (c === 'x') {
      out.push(<path key={k} d={box} fill={`url(#${hatch})`} className="stroke-fd-muted-foreground" strokeWidth={1} />);
    } else {
      const tone = tones[c === '=' ? 0 : (Number(c) - 2) % tones.length] ?? tones[0];
      const label = s.data?.[data++];
      out.push(
        <g key={k}>
          <path d={box} className={cn(tone.svgFill, stroke)} strokeWidth={width} />
          {label && (
            <text x={(x0 + x1) / 2} y={y(mid)} textAnchor="middle" dominantBaseline="central" className="fill-fd-foreground font-mono text-[11px]">
              {label}
            </text>
          )}
        </g>,
      );
    }
    prevLevel = undefined;
  });
  return out;
}

/**
 * A digital timing diagram: clock, chip select, data lines, one row per signal, time running
 * right. Waves are written WaveDrom-style, one character per period: `p.......` for a clock,
 * `1.0....1` for an active-low select, `x=.=.=.x` for data with `data={['A','B','C']}`.
 */
export function Timing({ signals, ticks, caption }: { signals: TimingSignal[]; /** Labels under the periods, e.g. bit numbers. */ ticks?: string[]; caption?: string }) {
  const periods = Math.max(...signals.map((s) => s.wave.length));
  const nameWidth = Math.max(...signals.map((s) => s.name.length)) * 7.2 + 16;
  const width = nameWidth + periods * cell + 2;
  const height = signals.length * rowHeight + (ticks ? 18 : 4);
  const hatch = `hatch-${signals.map((s) => s.name).join('-').replace(/[^\w-]/g, '')}`;

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} style={{ minWidth: Math.min(width, 340) }} className="block h-auto max-w-full font-mono text-[12px]" role="img" aria-label={`Timing diagram of ${signals.map((s) => s.name).join(', ')}`}>
          <defs>
            <pattern id={hatch} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" className="stroke-fd-muted-foreground/50" strokeWidth="1.5" />
            </pattern>
          </defs>
          <g transform={`translate(${nameWidth},0)`}>
            {Array.from({ length: periods + 1 }, (_, i) => (
              <line key={i} x1={i * cell} x2={i * cell} y1={0} y2={signals.length * rowHeight} className="stroke-fd-border" strokeDasharray="2 3" />
            ))}
            {ticks?.map((t, i) => (
              <text key={i} x={i * cell + cell / 2} y={signals.length * rowHeight + 12} textAnchor="middle" className="fill-fd-muted-foreground text-[10px]">
                {t}
              </text>
            ))}
          </g>
          {signals.map((s, i) => (
            <g key={s.name}>
              <text x={nameWidth - 10} y={i * rowHeight + mid} textAnchor="end" dominantBaseline="central" className={cn(s.highlight ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}>
                {s.name}
              </text>
              <g transform={`translate(${nameWidth},0)`}>{signalShapes(s, i * rowHeight, hatch)}</g>
            </g>
          ))}
        </svg>
      </div>
    </Diagram>
  );
}
