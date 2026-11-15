import { cn } from '../../lib/cn';
import { Diagram } from './diagram';

interface Rule {
  name: string;
  body: string;
}

// One rule per line: `name = body`, `name ::= body` or `name → body`, with an optional `;`.
// A line starting with whitespace or `|` carries on the rule above it.
function parseRules(source: string): Rule[] {
  const rules: Rule[] = [];
  for (const raw of source.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const head = line.match(/^([A-Za-z_][\w-]*'?)\s*(?:::=|=|→|->)\s*(.*)$/);
    if (head && !/^\s/.test(line)) rules.push({ name: head[1], body: head[2] });
    else if (rules.length) rules[rules.length - 1].body += `\n${line.trim()}`;
  }
  return rules.map((r) => ({ ...r, body: r.body.replace(/;\s*$/, '') }));
}

const piece = /("[^"]*"|'[^']*'|[A-Za-z_][\w-]*'?|[{}[\]()|*+?]|\n|\s+|.)/g;

/**
 * A grammar in BNF or EBNF, one rule per line. Every nonterminal that has a rule links to it,
 * terminals in quotes stand out, and `highlight` picks out rules by name.
 */
export function Grammar({
  rules,
  highlight = [],
  id = 'rule',
  caption,
}: {
  /** The rules, e.g. `expr = term { ("+" | "-") term } ;` one per line. */
  rules: string;
  highlight?: string[];
  /** Prefix for the rules' anchors, when one page holds two grammars. */
  id?: string;
  caption?: string;
}) {
  const parsed = parseRules(rules);
  const names = new Set(parsed.map((r) => r.name));

  return (
    <Diagram caption={caption}>
      <dl className="grid grid-cols-[max-content_max-content_minmax(0,1fr)] gap-x-3 gap-y-2 overflow-x-auto font-mono text-[0.8125rem] leading-relaxed">
        {parsed.map((r) => {
          const on = highlight.includes(r.name);
          return (
            <div key={r.name} id={`${id}-${r.name}`} className="contents">
              <dt className={cn('scroll-mt-24 text-right', on ? 'font-semibold text-fd-primary' : 'text-fd-foreground')}>{r.name}</dt>
              <span className="text-fd-muted-foreground">::=</span>
              <dd className={cn('whitespace-pre-wrap', on && 'rounded bg-fd-primary/10 px-1.5')}>
                {r.body.match(piece)?.map((p, i) => {
                  if (p === '\n') return <br key={i} />;
                  if (/^["']/.test(p)) return <span key={i} className="text-series-2">{p}</span>;
                  if (names.has(p))
                    return (
                      <a key={i} href={`#${id}-${p}`} className="text-fd-primary underline decoration-fd-primary/30 underline-offset-2 hover:decoration-fd-primary">
                        {p}
                      </a>
                    );
                  if (/^[A-Za-z_]/.test(p)) return <span key={i} className="text-fd-foreground">{p}</span>;
                  return <span key={i} className="text-fd-muted-foreground">{p}</span>;
                })}
              </dd>
            </div>
          );
        })}
      </dl>
    </Diagram>
  );
}
