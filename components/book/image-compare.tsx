'use client';

import { useState, type ReactNode } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import { asset } from '../../lib/asset';

/**
 * Two images of the same size, one over the other, with a bar to slide between them:
 * aliased vs antialiased, nearest vs bilinear, before vs after a filter. Drag anywhere on
 * the image, or focus it and use the arrow keys.
 */
export function ImageCompare({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  alt = '',
  start = 50,
  pixelated = false,
  caption,
}: {
  /** Image on the left of the bar. */
  before: string;
  /** Image on the right of the bar. */
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt?: string;
  /** Where the bar starts, in percent. */
  start?: number;
  /** Scale without smoothing, so single pixels stay crisp squares. */
  pixelated?: boolean;
  caption?: ReactNode;
}) {
  const [at, setAt] = useState(start);
  const img = `block w-full select-none ${pixelated ? '[image-rendering:pixelated]' : ''}`;

  return (
    <figure className="not-prose my-8">
      <div className="relative overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        {/* Static export: next/image would not optimize anyway. */}
        {/* oxlint-disable-next-line next/no-img-element */}
        <img src={asset(after)} alt={`${afterLabel}: ${alt}`} className={img} draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - at}% 0 0)` }}>
          {/* oxlint-disable-next-line next/no-img-element */}
          <img src={asset(before)} alt={`${beforeLabel}: ${alt}`} className={img} draggable={false} />
        </div>
        <span className="pointer-events-none absolute top-2 left-2 rounded-full bg-fd-background/85 px-2.5 py-0.5 text-xs font-medium text-fd-foreground">{beforeLabel}</span>
        <span className="pointer-events-none absolute top-2 right-2 rounded-full bg-fd-background/85 px-2.5 py-0.5 text-xs font-medium text-fd-foreground">{afterLabel}</span>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-fd-primary" style={{ left: `${at}%` }}>
          <span className="absolute top-1/2 left-1/2 grid size-8 -translate-1/2 place-items-center rounded-full border-2 border-fd-primary bg-fd-background text-fd-primary shadow">
            <ChevronsLeftRight className="size-4" />
          </span>
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={at}
          onChange={(e) => setAt(Number(e.target.value))}
          aria-label={`Slide between ${beforeLabel} and ${afterLabel}`}
          className="peer absolute inset-0 h-full w-full cursor-ew-resize appearance-none opacity-0"
        />
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-fd-primary" />
      </div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
