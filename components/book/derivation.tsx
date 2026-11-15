import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

// `[...]` marks the symbol about to be rewritten; the rest prints as is.
function Form({ text, last }: { text: string; last: boolean }) {
  const parts = text.split(/(\[[^\]]*\])/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('[') ? (
          <span key={i} className="rounded bg-fd-primary/15 px-0.5 font-semibold text-fd-primary underline decoration-fd-primary/50 underline-offset-4">
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i} className={cn(last && 'font-semibold')}>
            {p}
          </span>
        ),
      )}
    </>
  );
}

/**
 * A derivation in a grammar, one sentential form per line: `E ⇒ E + T ⇒ …`. In each form,
 * wrap the symbol that gets rewritten next in brackets, e.g. "[E] + T". `rules` names the
 * rule used for each step (one fewer than the forms), printed beside the result.
 */
export function Derivation({ steps, rules = [], caption }: { steps: string[]; rules?: string[]; caption?: string }) {
  return (
    <Diagram caption={caption}>
      <ol className="grid grid-cols-[1.5rem_max-content_minmax(0,1fr)] gap-x-3 gap-y-1.5 overflow-x-auto font-mono text-[0.875rem] leading-relaxed text-fd-foreground">
        {steps.map((s, i) => (
          <li key={i} className="contents">
            <span className="text-right text-fd-muted-foreground">{i === 0 ? '' : '⇒'}</span>
            <span className="whitespace-pre">
              <Form text={s} last={i === steps.length - 1} />
            </span>
            <span className="self-center text-[0.75rem] text-fd-muted-foreground">{i > 0 && rules[i - 1]}</span>
          </li>
        ))}
      </ol>
    </Diagram>
  );
}
