import { BookOpen } from 'lucide-react';

/** An inline pointer to the source of a claim: an RFC, a spec section, a man page. */
export function Cite({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="not-prose mx-0.5 inline-flex items-baseline gap-1 rounded-md border border-fd-primary/25 px-1.5 font-mono text-[0.78em] whitespace-nowrap text-fd-primary no-underline transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-fd-ring"
    >
      <BookOpen aria-hidden className="size-[0.95em] self-center" />
      {children}
    </a>
  );
}
