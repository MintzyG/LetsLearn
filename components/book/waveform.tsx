import { cn } from '../../lib/cn';
import { Diagram, tones } from './diagram';

export interface WaveSignal {
  /** A textbook wave; leave out when giving `samples`. */
  wave?: 'sine' | 'square' | 'saw' | 'triangle';
  /** Cycles per unit of time. */
  freq?: number;
  amp?: number;
  /** In cycles: 0.25 shifts a quarter period. */
  phase?: number;
  /** Values spread evenly over the duration, e.g. a signal after the reader's filter, precomputed. */
  samples?: number[];
  /** Draw as discrete samples (stems and dots) instead of a line. */
  stems?: boolean;
  label?: string;
}

const w = 560;
const h = 180;

function textbook(kind: NonNullable<WaveSignal['wave']>, t: number) {
  const f = t - Math.floor(t);
  if (kind === 'sine') return Math.sin(2 * Math.PI * t);
  if (kind === 'square') return f < 0.5 ? 1 : -1;
  if (kind === 'saw') return 2 * f - 1;
  return 1 - 4 * Math.abs(f - 0.5);
}

/**
 * Signals over time: textbook waves (`sine`, `square`, `saw`, `triangle`) or precomputed
 * `samples`, as lines or as discrete stems. For oscillators, aliasing, filters, envelopes.
 */
export function Waveform({ signals, duration = 2, unit = 's', caption }: { signals: WaveSignal[]; /** Time shown, in `unit`s. */ duration?: number; unit?: string; caption?: string }) {
  const series = signals.map((s) => {
    if (s.samples) {
      const n = s.samples.length;
      return { s, pts: s.samples.map((v, i) => [(i / Math.max(1, n - 1)) * duration, v] as [number, number]) };
    }
    const n = s.stems ? 24 : 480;
    return {
      s,
      pts: Array.from({ length: n + 1 }, (_, i) => {
        const t = (i / n) * duration;
        return [t, (s.amp ?? 1) * textbook(s.wave ?? 'sine', t * (s.freq ?? 1) + (s.phase ?? 0))] as [number, number];
      }),
    };
  });
  const peak = Math.max(1, ...series.flatMap(({ pts }) => pts.map(([, v]) => Math.abs(v)))) * 1.1;
  const sx = (t: number) => (t / duration) * w;
  const sy = (v: number) => h / 2 - (v / peak) * (h / 2);
  const ticks = Array.from({ length: 5 }, (_, i) => (i / 4) * duration);

  return (
    <Diagram caption={caption}>
      {signals.some((s) => s.label) && (
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {signals.map((s, i) =>
            s.label ? (
              <li key={i} className="flex items-center gap-2 text-fd-foreground">
                <span className={cn('h-0.5 w-4 rounded', i % 3 === 0 ? 'bg-fd-primary' : i % 3 === 1 ? 'bg-series-2' : 'bg-fd-foreground')} />
                {s.label}
              </li>
            ) : null,
          )}
        </ul>
      )}
      <svg viewBox={`-30 -6 ${w + 40} ${h + 28}`} className="block w-full" role="img" aria-label={`Waveform: ${signals.map((s) => s.label ?? s.wave ?? 'samples').join(', ')}`}>
        <line x1={0} x2={w} y1={h / 2} y2={h / 2} className="stroke-fd-muted-foreground/60" />
        <line x1={0} x2={0} y1={0} y2={h} className="stroke-fd-muted-foreground/60" />
        {[peak / 1.1, -peak / 1.1].map((v) => (
          <g key={v}>
            <line x1={0} x2={w} y1={sy(v)} y2={sy(v)} className="stroke-fd-border" strokeDasharray="3 4" />
            <text x={-6} y={sy(v)} textAnchor="end" dominantBaseline="central" className="fill-fd-muted-foreground font-mono text-[10px]">
              {Number(v.toFixed(2))}
            </text>
          </g>
        ))}
        {ticks.map((t) => (
          <text key={t} x={sx(t)} y={h + 16} textAnchor="middle" className="fill-fd-muted-foreground font-mono text-[10px]">
            {Number(t.toFixed(3))}
            {t === duration ? ` ${unit}` : ''}
          </text>
        ))}
        {series.map(({ s, pts }, i) => {
          const tone = tones[i % tones.length];
          if (s.stems)
            return (
              <g key={i}>
                {pts.map(([t, v], k) => (
                  <g key={k}>
                    <line x1={sx(t)} x2={sx(t)} y1={h / 2} y2={sy(v)} className={tone.svgStroke} strokeWidth={1.25} />
                    <circle cx={sx(t)} cy={sy(v)} r={3} className={tone.svgInk} />
                  </g>
                ))}
              </g>
            );
          return <polyline key={i} points={pts.map(([t, v]) => `${sx(t).toFixed(2)},${sy(v).toFixed(2)}`).join(' ')} fill="none" className={tone.svgStroke} strokeWidth={2} strokeLinejoin="round" />;
        })}
      </svg>
    </Diagram>
  );
}
