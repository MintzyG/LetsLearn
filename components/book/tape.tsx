import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

export interface TapeStep {
  /** One symbol per character; `blank` marks empty cells. */
  tape: string;
  /** Index of the cell under the head. */
  head: number;
  /** The machine's state at this step, shown on the head. */
  state?: string;
  /** A line beside the row: the rule just applied, e.g. "q0, 1 → q1, 0, R". */
  note?: string;
}

function Row({ step, blank, first }: { step: TapeStep; blank: string; first: boolean }) {
  return (
    <li className="flex items-end gap-4">
      <div className="flex">
        {[...step.tape].map((ch, i) => {
          const here = i === step.head;
          return (
            <span key={i} className="relative">
              {here && (
                <span className="absolute -top-6 left-1/2 flex -translate-x-1/2 flex-col items-center">
                  {step.state && <span className="font-mono text-[0.6875rem] leading-none font-semibold text-fd-primary">{step.state}</span>}
                  <span className="mt-0.5 size-0 border-x-[5px] border-t-[6px] border-x-transparent border-t-fd-primary" />
                </span>
              )}
              <span
                className={cn(
                  'grid size-8 place-items-center border-y border-r font-mono text-sm',
                  i === 0 && 'border-l',
                  here ? 'border-fd-primary bg-fd-primary/15 font-semibold text-fd-primary' : 'border-fd-primary/35 bg-fd-background text-fd-foreground',
                )}
              >
                {ch === blank ? <span className="text-fd-muted-foreground/60">␣</span> : ch}
              </span>
            </span>
          );
        })}
        <span className="grid h-8 place-items-center px-1.5 font-mono text-sm text-fd-muted-foreground">…</span>
      </div>
      {step.note && <span className={cn('pb-1.5 font-mono text-[0.75rem] text-fd-muted-foreground', first && 'italic')}>{step.note}</span>}
    </li>
  );
}

/**
 * A Turing machine's tape with the head over one cell and the state on the head. Give one
 * `tape` + `head`, or a list of `steps` to show a run, one row per step.
 */
export function Tape({
  tape,
  head = 0,
  state,
  steps,
  blank = '_',
  caption,
}: {
  tape?: string;
  head?: number;
  state?: string;
  steps?: TapeStep[];
  /** The character that stands for a blank cell, drawn as ␣. */
  blank?: string;
  caption?: string;
}) {
  const rows = steps ?? [{ tape: tape ?? '', head, state }];
  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <ol className="w-max space-y-8 pt-6">
          {rows.map((s, i) => (
            <Row key={i} step={s} blank={blank} first={i === 0} />
          ))}
        </ol>
      </div>
    </Diagram>
  );
}
