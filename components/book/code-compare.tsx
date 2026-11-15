import type { ReactNode } from 'react';

/**
 * The same thing written in two or three languages side by side, for learning a new language
 * from one you know. The children are ordinary fenced code blocks; give each a title
 * (```py title="Python") so readers know which is which. Stacks on narrow screens.
 */
export function CodeCompare({ children, caption }: { children: ReactNode; caption?: ReactNode }) {
  return (
    <figure className="not-prose my-8">
      <div className="grid gap-3 md:auto-cols-fr md:grid-flow-col [&_figure]:my-0 [&_figure]:h-full">{children}</div>
      {caption && <figcaption className="mt-2.5 text-sm text-fd-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
