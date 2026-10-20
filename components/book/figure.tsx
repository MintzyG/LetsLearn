import type { ReactNode } from 'react';

/** An image or a diagram with a caption under it. */
export function Figure({ src, alt, caption, children }: { src?: string; alt?: string; caption?: ReactNode; children?: ReactNode }) {
  return (
    <figure className="my-8">
      <div className="not-prose overflow-hidden rounded-xl border border-fd-border bg-fd-card">
        {/* Static export: next/image would not optimize anyway. */}
        {/* oxlint-disable-next-line next/no-img-element */}
        {src ? <img src={src} alt={alt ?? ''} className="block w-full" /> : children}
      </div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
