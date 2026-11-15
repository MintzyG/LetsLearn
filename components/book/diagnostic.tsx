import { cn } from '../../lib/cn';

export interface DiagnosticLabel {
  /** Line number, as in `source` (counting from `firstLine`). */
  line: number;
  /** Column of the first marked character, counting from 1. */
  col: number;
  /** How many characters to mark. Default 1. */
  len?: number;
  text?: string;
  /** The main problem, marked ^^^; others are marked --- as context. */
  primary?: boolean;
}

const levelInk = { error: 'text-series-2', warning: 'text-warn', note: 'text-fd-primary', help: 'text-fd-primary' } as const;

/**
 * A compiler error or warning drawn the way rustc (and Elm, and newer Go and TypeScript
 * tools) print them: the message, where it is, the source lines with the problem marked
 * under them, and help. For teaching how to read the errors a language gives you.
 */
export function Diagnostic({
  level = 'error',
  code,
  message,
  file,
  source,
  firstLine = 1,
  labels = [],
  notes = [],
}: {
  level?: 'error' | 'warning' | 'note';
  /** The error's code, e.g. "E0382". */
  code?: string;
  message: string;
  /** Where, e.g. "src/main.rs:5:20". */
  file?: string;
  /** The source lines to show. */
  source: string;
  firstLine?: number;
  labels?: DiagnosticLabel[];
  /** Lines after the source: "help: …", "note: …". The word before the colon is colored. */
  notes?: string[];
}) {
  const lines = source.replace(/^\n|\n$/g, '').split('\n');
  const gutter = String(firstLine + lines.length - 1).length;
  const pad = (s: string) => s.padStart(gutter, ' ');
  const bar = <span className="text-fd-primary/70">{pad('')} |</span>;

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-fd-border bg-fd-card">
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[0.8125rem] leading-relaxed">
        <code>
          <span className={cn('font-semibold', levelInk[level])}>
            {level}
            {code && `[${code}]`}
          </span>
          <span className="font-semibold text-fd-foreground">: {message}</span>
          {'\n'}
          {file && (
            <>
              <span className="text-fd-primary/70">{pad('')}--&gt; </span>
              <span className="text-fd-muted-foreground">{file}</span>
              {'\n'}
            </>
          )}
          {bar}
          {'\n'}
          {lines.map((text, i) => {
            const n = firstLine + i;
            return (
              <span key={n}>
                <span className="text-fd-primary/70">{pad(String(n))} | </span>
                <span className="text-fd-foreground">{text}</span>
                {'\n'}
                {labels
                  .filter((l) => l.line === n)
                  .map((l, k) => (
                    <span key={k}>
                      {bar}
                      <span className={l.primary ? levelInk[level] : 'text-fd-primary'}>
                        {' '.repeat(l.col)}
                        {(l.primary ? '^' : '-').repeat(l.len ?? 1)}
                        {l.text && ` ${l.text}`}
                      </span>
                      {'\n'}
                    </span>
                  ))}
              </span>
            );
          })}
          {notes.length > 0 && (
            <>
              {bar}
              {'\n'}
            </>
          )}
          {notes.map((note, i) => {
            const [word, ...rest] = note.split(':');
            return (
              <span key={i}>
                <span className="text-fd-primary/70">{pad('')} = </span>
                {rest.length ? (
                  <>
                    <span className="font-semibold text-fd-foreground">{word}:</span>
                    <span className="text-fd-foreground">{rest.join(':')}</span>
                  </>
                ) : (
                  <span className="text-fd-foreground">{note}</span>
                )}
                {'\n'}
              </span>
            );
          })}
        </code>
      </pre>
    </figure>
  );
}
