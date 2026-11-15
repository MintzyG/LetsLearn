'use client';

import { useState, type ReactNode } from 'react';
import { EyeOff } from 'lucide-react';
import { asset } from '../../lib/asset';
import { cn } from '../../lib/cn';

/**
 * Hides an image (or anything) behind a blur until the reader clicks it: the expected
 * output of a renderer, the answer to "what do you think this prints?". Give `src` for an
 * image, or children for any content. Once shown it can be hidden again.
 */
export function Spoiler({
  src,
  alt,
  label = 'Click to reveal',
  caption,
  children,
}: {
  src?: string;
  alt?: string;
  /** Shown over the blur, e.g. "Your render should look like this". */
  label?: string;
  caption?: ReactNode;
  children?: ReactNode;
}) {
  const [shown, setShown] = useState(false);

  return (
    <figure className="not-prose my-8">
      <div className="relative overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        <div aria-hidden={!shown} inert={!shown} className={cn('transition-[filter] duration-300', !shown && 'pointer-events-none blur-xl select-none')}>
          {/* Static export: next/image would not optimize anyway. */}
          {/* oxlint-disable-next-line next/no-img-element */}
          {src ? <img src={asset(src)} alt={alt ?? ''} className="block w-full" /> : <div className="p-6">{children}</div>}
        </div>
        {shown ? (
          <button
            type="button"
            onClick={() => setShown(false)}
            className="absolute top-2 right-2 flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-background/85 px-2.5 py-1 text-xs text-fd-muted-foreground backdrop-blur hover:text-fd-foreground"
          >
            <EyeOff aria-hidden className="size-3.5" />
            Hide
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShown(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-fd-background/30 text-fd-foreground transition-colors hover:bg-fd-background/15 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fd-primary"
          >
            <span className="grid size-11 place-items-center rounded-full border border-fd-primary/50 bg-fd-background/85 text-fd-primary">
              <EyeOff aria-hidden className="size-5" />
            </span>
            <span className="rounded-full bg-fd-background/85 px-3 py-1 text-sm font-medium">{label}</span>
          </button>
        )}
      </div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
