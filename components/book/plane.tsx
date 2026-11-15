import { cn } from '../../lib/cn';
import { Diagram, tones } from './diagram';

type Vec = [number, number];

export interface PlanePoint {
  at: Vec;
  label?: string;
  highlight?: boolean;
}

export interface PlaneVector {
  /** Tail; the origin when left out. */
  from?: Vec;
  to: Vec;
  label?: string;
  highlight?: boolean;
}

export interface PlaneShape {
  points: Vec[];
  label?: string;
  /** Join the last point back to the first and fill it. Default true. */
  closed?: boolean;
  highlight?: boolean;
}

const size = 480;

/**
 * A 2D coordinate plane with points, vectors and polygons: a triangle to rasterize, a
 * normal, a ray hitting a circle's bounding box. `yDown` flips the y axis for screen and
 * pixel coordinates. Values are given, never computed by the method the reader builds.
 */
export function Plane({
  x = [-1, 5],
  y = [-1, 5],
  step = 1,
  yDown = false,
  points = [],
  vectors = [],
  shapes = [],
  caption,
}: {
  /** Visible range of x, [min, max]. */
  x?: Vec;
  y?: Vec;
  /** Grid spacing, in units. */
  step?: number;
  yDown?: boolean;
  points?: PlanePoint[];
  vectors?: PlaneVector[];
  shapes?: PlaneShape[];
  caption?: string;
}) {
  const unit = size / Math.max(x[1] - x[0], y[1] - y[0]);
  const w = (x[1] - x[0]) * unit;
  const h = (y[1] - y[0]) * unit;
  const sx = (v: number) => (v - x[0]) * unit;
  const sy = (v: number) => (yDown ? (v - y[0]) * unit : (y[1] - v) * unit);
  const ticks = (range: Vec) => {
    const out: number[] = [];
    for (let v = Math.ceil(range[0] / step) * step; v <= range[1] + 1e-9; v += step) out.push(Number(v.toFixed(6)));
    return out;
  };
  const pad = 22;
  const ink = (on?: boolean) => (on ? 'stroke-fd-primary' : 'stroke-fd-foreground');
  const label = (text: string, at: Vec, on?: boolean, key?: string) => (
    <text key={key} x={sx(at[0]) + 7} y={sy(at[1]) - 7} className={cn('font-mono text-[12px] [paint-order:stroke] stroke-fd-card stroke-[3px]', on ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}>
      {text}
    </text>
  );

  return (
    <Diagram caption={caption}>
      <svg viewBox={`${-pad} ${-pad / 2} ${w + pad * 1.5} ${h + pad * 1.5}`} className="mx-auto block w-full max-w-xl" role="img" aria-label="Coordinate plane">
        <defs>
          {[true, false].map((on) => (
            <marker key={String(on)} id={`plane-arrow-${on ? 'on' : 'off'}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={on ? 'fill-fd-primary' : 'fill-fd-foreground'} />
            </marker>
          ))}
        </defs>
        {ticks(x).map((v) => (
          <g key={`x${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={0} y2={h} className={v === 0 ? 'stroke-fd-muted-foreground' : 'stroke-fd-border'} strokeWidth={v === 0 ? 1.25 : 1} />
            <text x={sx(v)} y={h + 14} textAnchor="middle" className="fill-fd-muted-foreground font-mono text-[10px]">
              {v}
            </text>
          </g>
        ))}
        {ticks(y).map((v) => (
          <g key={`y${v}`}>
            <line x1={0} x2={w} y1={sy(v)} y2={sy(v)} className={v === 0 ? 'stroke-fd-muted-foreground' : 'stroke-fd-border'} strokeWidth={v === 0 ? 1.25 : 1} />
            <text x={-6} y={sy(v)} textAnchor="end" dominantBaseline="central" className="fill-fd-muted-foreground font-mono text-[10px]">
              {v}
            </text>
          </g>
        ))}
        {shapes.map((s, i) => {
          const closed = s.closed ?? true;
          const tone = tones[i % tones.length];
          const d = s.points.map((p, k) => `${k ? 'L' : 'M'}${sx(p[0])},${sy(p[1])}`).join(' ') + (closed ? ' Z' : '');
          const cx = s.points.reduce((a, p) => a + p[0], 0) / s.points.length;
          const cy = s.points.reduce((a, p) => a + p[1], 0) / s.points.length;
          return (
            <g key={`s${i}`}>
              <path d={d} className={cn(closed ? (s.highlight ? 'fill-fd-primary/20' : tone.svgFill) : 'fill-none', s.highlight ? 'stroke-fd-primary' : tone.svgStroke)} strokeWidth={s.highlight ? 2 : 1.5} strokeLinejoin="round" />
              {s.label && (
                <text x={sx(cx)} y={sy(cy)} textAnchor="middle" dominantBaseline="central" className={cn('font-mono text-[12px]', s.highlight ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}>
                  {s.label}
                </text>
              )}
            </g>
          );
        })}
        {vectors.map((v, i) => {
          const from = v.from ?? [0, 0];
          return (
            <g key={`v${i}`}>
              <line x1={sx(from[0])} y1={sy(from[1])} x2={sx(v.to[0])} y2={sy(v.to[1])} className={ink(v.highlight)} strokeWidth={v.highlight ? 2.25 : 1.75} markerEnd={`url(#plane-arrow-${v.highlight ? 'on' : 'off'})`} />
              {v.label && label(v.label, [(from[0] + v.to[0]) / 2, (from[1] + v.to[1]) / 2], v.highlight)}
            </g>
          );
        })}
        {points.map((p, i) => (
          <g key={`p${i}`}>
            <circle cx={sx(p.at[0])} cy={sy(p.at[1])} r={p.highlight ? 4.5 : 3.5} className={p.highlight ? 'fill-fd-primary' : 'fill-fd-foreground'} />
            {p.label && label(p.label, p.at, p.highlight)}
          </g>
        ))}
      </svg>
    </Diagram>
  );
}
