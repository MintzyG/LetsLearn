import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

/** The chapter's reference implementation, folded away until the reader opens it. */
export function Reference({
  title = 'Reference implementation',
  note = "Open it when you're done, or when you're truly stuck.",
  children,
}: {
  title?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className="group my-10 rounded-2xl border border-fd-primary/35 bg-fd-card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring [&::-webkit-details-marker]:hidden">
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-fd-primary transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
        <span className="not-prose">
          <span className="block font-semibold text-fd-foreground">{title}</span>
          <span className="block text-sm text-fd-muted-foreground">{note}</span>
        </span>
      </summary>
      <div className="prose-no-margin border-t border-dashed border-fd-primary/35 px-5 py-5">{children}</div>
    </details>
  );
}
