import { cn } from '../../lib/cn';
import { Diagram, tones } from './diagram';

/** One token: its kind, then its text exactly as it appears in the source. */
export type Token = [kind: string, text: string];

/**
 * A line of source cut into tokens, each with its kind under it: what a lexer hands the
 * parser. Kinds get a color each, in order of first appearance, and `highlight` picks out
 * tokens by index. The tokens are written by hand, never produced by a lexer here.
 */
export function Tokens({
  tokens,
  source,
  highlight = [],
  caption,
}: {
  tokens: Token[];
  /** The source line the tokens came from, shown above them. */
  source?: string;
  highlight?: number[];
  caption?: string;
}) {
  const kinds = [...new Set(tokens.map(([kind]) => kind))];
  const toneOf = (kind: string) => tones[kinds.indexOf(kind) % tones.length];

  return (
    <Diagram caption={caption}>
      {source && (
        <pre className="mb-4 overflow-x-auto border-b border-fd-border pb-4 font-mono text-[0.8125rem] text-fd-foreground">{source}</pre>
      )}
      <ol className="flex flex-wrap gap-x-1.5 gap-y-3">
        {tokens.map(([kind, text], i) => {
          const tone = toneOf(kind);
          const on = highlight.includes(i);
          return (
            <li key={i} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'min-w-7 rounded-md px-2 py-1 text-center font-mono text-[0.8125rem] whitespace-pre',
                  tone.fill,
                  tone.ink,
                  on && 'ring-2 ring-fd-primary',
                )}
              >
                {text}
              </span>
              <span className={cn('font-mono text-[0.625rem] tracking-wide uppercase', on ? 'font-semibold text-fd-primary' : 'text-fd-muted-foreground')}>
                {kind}
              </span>
            </li>
          );
        })}
      </ol>
    </Diagram>
  );
}
