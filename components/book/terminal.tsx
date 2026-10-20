import { cn } from '@/lib/cn';

// Lines a test run or a tool prints when things went right or wrong.
const good = /^(ok\b|PASS\b|--- PASS)/;
const bad = /^(FAIL\b|--- FAIL|panic:)/;

/**
 * A command and what it prints, e.g. a test run. Lines starting with ok/PASS turn green and
 * FAIL/panic turn amber, so a reader can compare their run at a glance.
 */
export function Terminal({ command, output, title }: { command: string; output?: string; title?: string }) {
  const lines = output?.replace(/^\n|\n$/g, '').split('\n') ?? [];
  return (
    <figure className="not-prose my-6 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      {title && (
        <figcaption className="border-b border-fd-border px-4 py-2 text-sm text-fd-muted-foreground">{title}</figcaption>
      )}
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[0.8125rem] leading-relaxed">
        <code>
          <span className="select-none text-fd-primary">$ </span>
          <span className="font-medium text-fd-foreground">{command}</span>
          {lines.map((line, i) => (
            <span
              key={i}
              className={cn(
                'block',
                good.test(line) ? 'text-fd-primary' : bad.test(line) ? 'text-warn' : 'text-fd-muted-foreground',
              )}
            >
              {line || ' '}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
