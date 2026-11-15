import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

// Shared bits for the diagram components: the figure frame and the color tones.

/**
 * The tones a diagram can paint things in. They cycle in this order, so neighbours never
 * share a color: the accent, the second chart series, a neutral ink, then the same three as
 * dashed outlines.
 */
export const tones = [
  { fill: 'bg-fd-primary/15', ink: 'text-fd-primary', svgFill: 'fill-fd-primary/15', svgStroke: 'stroke-fd-primary', svgInk: 'fill-fd-primary' },
  { fill: 'bg-series-2/20', ink: 'text-series-2', svgFill: 'fill-series-2/20', svgStroke: 'stroke-series-2', svgInk: 'fill-series-2' },
  { fill: 'bg-fd-foreground/10', ink: 'text-fd-foreground', svgFill: 'fill-fd-foreground/10', svgStroke: 'stroke-fd-foreground', svgInk: 'fill-fd-foreground' },
  // Past three, the same colors again as outlines, so up to six things stay apart.
  { fill: 'border border-dashed border-fd-primary/70', ink: 'text-fd-primary', svgFill: 'fill-transparent', svgStroke: 'stroke-fd-primary', svgInk: 'fill-fd-primary' },
  { fill: 'border border-dashed border-series-2/80', ink: 'text-series-2', svgFill: 'fill-transparent', svgStroke: 'stroke-series-2', svgInk: 'fill-series-2' },
  { fill: 'border border-dashed border-fd-foreground/50', ink: 'text-fd-foreground', svgFill: 'fill-transparent', svgStroke: 'stroke-fd-foreground', svgInk: 'fill-fd-foreground' },
] as const;

export type Tone = (typeof tones)[number];

/** A diagram in a card, with an optional caption under it. */
export function Diagram({
  caption,
  children,
  className,
  bare,
}: {
  caption?: ReactNode;
  children: ReactNode;
  className?: string;
  /** No card behind it: for diagrams that draw their own frame. */
  bare?: boolean;
}) {
  return (
    <figure className="not-prose my-8">
      <div className={cn(!bare && 'rounded-2xl border border-fd-primary/35 bg-fd-card p-4 sm:p-6', className)}>{children}</div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

/** Width of `text` in px at the diagrams' 12px monospace, for laying out SVG boxes. */
export function monoWidth(text: string, size = 12) {
  return text.length * size * 0.6;
}

/** Parses "0x4002_0000", "0b1010", "1_024" or a number. Underscores are digit separators. */
export function parseNumber(value: string | number): bigint {
  if (typeof value === 'number') return BigInt(value);
  return BigInt(value.replace(/_/g, '').trim());
}

/** A byte count the way datasheets write it: 512 B, 7.5 KiB, 1 MiB, 4 GiB. */
export function formatSize(bytes: bigint) {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];
  let i = 0;
  let value = Number(bytes);
  while (i < units.length - 1 && value >= 1024) {
    value /= 1024;
    i++;
  }
  return `${Number(value.toFixed(1))} ${units[i]}`;
}

/** Hex with an underscore every four digits, as datasheets print addresses: 0x4002_0000. */
export function formatHex(value: bigint, digits = 8) {
  const hex = value.toString(16).toUpperCase().padStart(digits, '0');
  return `0x${hex.replace(/\B(?=([0-9A-F]{4})+$)/g, '_')}`;
}
