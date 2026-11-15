import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

export type Pin = string | { name: string; /** Alternate functions or a short role, e.g. "UART TX". */ note?: string; highlight?: boolean };

interface Numbered {
  n: number;
  name: string;
  note?: string;
  highlight?: boolean;
}

const norm = (p: Pin, n: number): Numbered => (typeof p === 'string' ? { n, name: p } : { n, ...p });

function Side({ pins, side }: { pins: Numbered[]; side: 'left' | 'right' }) {
  return (
    <ol className="flex flex-col py-3">
      {pins.map((p) => (
        <li key={p.n} className={cn('flex h-9 items-center gap-2', side === 'left' ? 'flex-row' : 'flex-row-reverse')}>
          <span className={cn('min-w-0 flex-1', side === 'left' ? 'text-right' : 'text-left')}>
            <span className={cn('block font-mono text-[0.8125rem] leading-tight', p.highlight ? 'font-semibold text-fd-primary' : 'text-fd-foreground')}>{p.name}</span>
            {p.note && <span className="block text-[0.6875rem] leading-tight text-fd-muted-foreground">{p.note}</span>}
          </span>
          <span className={cn('h-2.5 w-5 shrink-0 rounded-[2px] border', p.highlight ? 'border-fd-primary bg-fd-primary' : 'border-fd-muted-foreground/60 bg-fd-muted')} />
          <span className="w-5 shrink-0 text-center font-mono text-[0.625rem] text-fd-muted-foreground tabular-nums">{p.n}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * A chip or a board header with labelled pins. Give `pins` in package order and they are
 * laid out like a DIP: pin 1 at the top left, down the left side, then up the right.
 * Or give `left` and `right` (each top to bottom) for a board's two headers.
 */
export function Pinout({
  name,
  pins,
  left,
  right,
  caption,
}: {
  /** Printed on the chip, e.g. "ATmega328P". */
  name?: string;
  pins?: Pin[];
  left?: Pin[];
  right?: Pin[];
  caption?: string;
}) {
  let l: Numbered[];
  let r: Numbered[];
  if (pins) {
    const half = Math.ceil(pins.length / 2);
    l = pins.slice(0, half).map((p, i) => norm(p, i + 1));
    r = pins
      .slice(half)
      .map((p, i) => norm(p, half + i + 1))
      .reverse();
  } else {
    l = (left ?? []).map((p, i) => norm(p, i + 1));
    r = (right ?? []).map((p, i) => norm(p, l.length + i + 1));
  }

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <div className="mx-auto grid w-max min-w-[24rem] grid-cols-[minmax(9rem,max-content)_7rem_minmax(9rem,max-content)]">
          <Side pins={l} side="left" />
          <div className="relative -mx-px flex items-center justify-center rounded-md border border-fd-foreground/40 bg-fd-foreground/[0.07]">
            {pins && <span aria-hidden className="absolute top-[-1px] left-1/2 h-3 w-6 -translate-x-1/2 rounded-b-full border border-t-0 border-fd-foreground/40 bg-fd-card" />}
            {pins && <span aria-hidden className="absolute top-3 left-3 size-1.5 rounded-full bg-fd-muted-foreground/60" />}
            {name && <span className="rotate-90 font-mono text-xs whitespace-nowrap text-fd-muted-foreground">{name}</span>}
          </div>
          <Side pins={r} side="right" />
        </div>
      </div>
    </Diagram>
  );
}
