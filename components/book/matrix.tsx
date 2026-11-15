import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

type Cell = string | number;

/**
 * A matrix in brackets, with optional row and column labels and highlighted cells:
 * a transform, a DCT block, a weight matrix. `highlight` takes [row, column] pairs; a whole
 * row or column is `highlightRows` / `highlightColumns`. For math in running text, use KaTeX.
 */
export function Matrix({
  rows,
  name,
  rowLabels,
  columnLabels,
  highlight = [],
  highlightRows = [],
  highlightColumns = [],
  caption,
}: {
  rows: Cell[][];
  /** Written before the matrix, e.g. "M =". */
  name?: string;
  rowLabels?: string[];
  columnLabels?: string[];
  highlight?: [number, number][];
  highlightRows?: number[];
  highlightColumns?: number[];
  caption?: string;
}) {
  const columns = Math.max(...rows.map((r) => r.length));
  const on = (r: number, c: number) => highlightRows.includes(r) || highlightColumns.includes(c) || highlight.some(([hr, hc]) => hr === r && hc === c);
  const edge = (r: number) => (rows.length === 1 ? '' : r === 0 ? 'border-b-0' : r === rows.length - 1 ? 'border-t-0' : 'border-y-0');
  const bracket = 'w-2 border-y-2 border-fd-foreground/70';

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <div className="mx-auto flex w-max items-center gap-3 font-mono text-[0.8125rem] tabular-nums">
          {name && <span className="text-sm text-fd-foreground">{name}</span>}
          <div className="grid items-center" style={{ gridTemplateColumns: `${rowLabels ? 'max-content ' : ''}auto repeat(${columns}, minmax(2.25rem, max-content)) auto` }}>
            {columnLabels && (
              <>
                {rowLabels && <span />}
                <span />
                {Array.from({ length: columns }, (_, c) => (
                  <span key={c} className={cn('px-2 pb-1 text-center text-[0.6875rem]', highlightColumns.includes(c) ? 'text-fd-primary' : 'text-fd-muted-foreground')}>
                    {columnLabels[c]}
                  </span>
                ))}
                <span />
              </>
            )}
            {rows.map((row, r) => (
              <div key={r} className="contents">
                {rowLabels && (
                  <span className={cn('pr-2 text-right text-[0.6875rem]', highlightRows.includes(r) ? 'text-fd-primary' : 'text-fd-muted-foreground')}>{rowLabels[r]}</span>
                )}
                <span className={cn('h-full border-l-2', bracket, edge(r))} />
                {Array.from({ length: columns }, (_, c) => (
                  <span
                    key={c}
                    className={cn('px-2 py-1.5 text-center', on(r, c) ? 'bg-fd-primary/15 font-semibold text-fd-primary' : 'text-fd-foreground')}
                  >
                    {row[c] ?? ''}
                  </span>
                ))}
                <span className={cn('h-full border-r-2', bracket, edge(r))} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Diagram>
  );
}
