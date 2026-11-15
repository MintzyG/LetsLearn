import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

// Default colors per character, all theme tokens. A `palette` prop adds or overrides them
// with any CSS color, for books where the colors are the data (an image, a framebuffer).
const themePalette: Record<string, string> = {
  '#': 'fill-fd-primary',
  o: 'fill-series-2',
  '+': 'fill-fd-foreground/45',
  '-': 'fill-fd-muted-foreground/25',
};

/**
 * A small framebuffer: one character per pixel, one string per row. `.` is an empty pixel,
 * `#` the accent, `o` the second series, `+` ink, `-` faint; `palette` maps more characters
 * to CSS colors. `overlay` draws polygons on top in pixel coordinates (y down, pixel centers
 * at .5), e.g. the triangle a rasterizer covers. Pixels come precomputed, never from the
 * method the reader builds.
 */
export function PixelGrid({
  pixels,
  palette = {},
  ruler = true,
  centers = false,
  overlay = [],
  caption,
}: {
  pixels: string[];
  palette?: Record<string, string>;
  /** Number the rows and columns. */
  ruler?: boolean;
  /** Dot every pixel center: where coverage is sampled. */
  centers?: boolean;
  overlay?: { points: [number, number][]; label?: string }[];
  caption?: string;
}) {
  const rows = pixels.length;
  const cols = Math.max(...pixels.map((r) => r.length));
  const cell = Math.max(10, Math.min(28, Math.floor(560 / cols)));
  const pad = ruler ? 18 : 1;
  const w = cols * cell;
  const h = rows * cell;

  return (
    <Diagram caption={caption}>
      <svg viewBox={`${-pad} ${-pad} ${w + pad + 1} ${h + pad + 1}`} width={w + pad + 1} className="mx-auto block h-auto max-w-full" role="img" aria-label={`${cols} by ${rows} pixel grid`}>
        {pixels.flatMap((row, r) =>
          [...row].map((ch, c) => {
            const custom = palette[ch];
            const themed = themePalette[ch];
            if (ch === '.' || ch === ' ') return null;
            return (
              <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell} height={cell} className={custom ? undefined : themed} fill={custom} />
            );
          }),
        )}
        {Array.from({ length: cols + 1 }, (_, c) => (
          <line key={`c${c}`} x1={c * cell} x2={c * cell} y1={0} y2={h} className="stroke-fd-border" />
        ))}
        {Array.from({ length: rows + 1 }, (_, r) => (
          <line key={`r${r}`} x1={0} x2={w} y1={r * cell} y2={r * cell} className="stroke-fd-border" />
        ))}
        {centers &&
          pixels.flatMap((row, r) =>
            Array.from({ length: cols }, (_, c) => (
              <circle key={`d${r}-${c}`} cx={(c + 0.5) * cell} cy={(r + 0.5) * cell} r={1.5} className={cn(row[c] && row[c] !== '.' ? 'fill-fd-background' : 'fill-fd-muted-foreground')} />
            )),
          )}
        {ruler && (
          <g className="fill-fd-muted-foreground font-mono text-[9px]">
            {Array.from({ length: cols }, (_, c) => (
              <text key={c} x={(c + 0.5) * cell} y={-6} textAnchor="middle">
                {c}
              </text>
            ))}
            {Array.from({ length: rows }, (_, r) => (
              <text key={r} x={-5} y={(r + 0.5) * cell} textAnchor="end" dominantBaseline="central">
                {r}
              </text>
            ))}
          </g>
        )}
        {overlay.map((o, i) => (
          <g key={`o${i}`}>
            <polygon points={o.points.map(([x, y]) => `${x * cell},${y * cell}`).join(' ')} className="fill-none stroke-series-2" strokeWidth={2} strokeLinejoin="round" />
            {o.points.map(([x, y], k) => (
              <circle key={k} cx={x * cell} cy={y * cell} r={3} className="fill-series-2" />
            ))}
            {o.label && (
              <text x={o.points[0][0] * cell + 6} y={o.points[0][1] * cell - 6} className="fill-series-2 font-mono text-[11px] font-semibold [paint-order:stroke] stroke-fd-card stroke-[3px]">
                {o.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Diagram>
  );
}
