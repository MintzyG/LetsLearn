import { Fragment } from 'react';
import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

export interface PipelineStage {
  name: string;
  /** A line under the name: what the stage does. */
  note?: string;
  /** What this stage hands the next one, written on the arrow after it. */
  out?: string;
  highlight?: boolean;
}

/**
 * Stages in a row and what flows between them: source → tokens → AST → bytecode, or
 * vertex → raster → fragment. Wraps onto more lines on a narrow screen.
 */
export function Pipeline({ stages, caption }: { stages: PipelineStage[]; caption?: string }) {
  return (
    <Diagram caption={caption}>
      <ol className="flex flex-wrap items-center gap-y-4">
        {stages.map((s, i) => (
          <Fragment key={i}>
            <li
              className={cn(
                'rounded-xl border px-4 py-2.5 text-center',
                s.highlight ? 'border-fd-primary bg-fd-primary/12' : 'border-fd-primary/35 bg-fd-background',
              )}
            >
              <span className={cn('block text-sm font-medium', s.highlight ? 'text-fd-primary' : 'text-fd-foreground')}>{s.name}</span>
              {s.note && <span className="mt-0.5 block max-w-44 text-xs leading-snug text-fd-muted-foreground">{s.note}</span>}
            </li>
            {i < stages.length - 1 && (
              <li aria-hidden={!s.out} className="flex min-w-14 flex-col items-center px-1.5">
                {s.out && <span className="mb-0.5 font-mono text-[0.6875rem] text-fd-muted-foreground">{s.out}</span>}
                <span className="relative block h-0.5 w-full min-w-10 bg-fd-primary/60">
                  <span className="absolute -top-[4px] -right-px size-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-fd-primary/60" />
                </span>
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </Diagram>
  );
}
