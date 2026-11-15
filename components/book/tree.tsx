import { cn } from '../../lib/cn';
import { Diagram, monoWidth } from './diagram';

export interface TreeNode {
  label: string;
  children?: TreeNode[];
  highlight?: boolean;
}

// Reads an S-expression: `(+ 1 (* 2 3))` is a node "+" with children "1" and "*". A leading
// `!` highlights a node (`!(* 2 3)`, `!x`); quote labels with spaces or parens ("if else").
export function parseTree(source: string): TreeNode {
  const tokens = source.match(/!?"[^"]*"|!?\(|\)|[^\s()]+/g) ?? [];
  let i = 0;
  const atom = (t: string): TreeNode => {
    const highlight = t.startsWith('!') && t.length > 1;
    const body = highlight ? t.slice(1) : t;
    return { label: body.startsWith('"') ? body.slice(1, -1) : body, highlight };
  };
  const read = (): TreeNode => {
    const t = tokens[i++];
    if (t === undefined) throw new Error(`Tree: unexpected end of "${source}"`);
    if (t === '(' || t === '!(') {
      const head = read();
      const node: TreeNode = { label: head.label, highlight: t === '!(' || head.highlight, children: [] };
      while (tokens[i] !== ')') {
        if (i >= tokens.length) throw new Error(`Tree: missing ")" in "${source}"`);
        node.children!.push(read());
      }
      i++;
      return node;
    }
    if (t === ')') throw new Error(`Tree: unexpected ")" in "${source}"`);
    return atom(t);
  };
  return read();
}

interface Placed {
  node: TreeNode;
  x: number;
  y: number;
  w: number;
  kids: Placed[];
}

const gap = 14;
const levelHeight = 62;
const boxHeight = 28;

const boxWidth = (n: TreeNode) => Math.max(28, monoWidth(n.label) + 18);

// Each subtree gets a span as wide as itself or its children side by side, whichever is
// wider; children are centered in it. Simple, and subtrees never overlap.
function span(n: TreeNode): number {
  const kids = n.children ?? [];
  const sum = kids.reduce((s, k) => s + span(k), 0) + gap * Math.max(0, kids.length - 1);
  return Math.max(boxWidth(n), sum);
}

function place(n: TreeNode, left: number, depth: number): Placed {
  const total = span(n);
  const kids = n.children ?? [];
  const sum = kids.reduce((s, k) => s + span(k), 0) + gap * Math.max(0, kids.length - 1);
  let x = left + (total - sum) / 2;
  const placed: Placed[] = kids.map((k) => {
    const p = place(k, x, depth + 1);
    x += span(k) + gap;
    return p;
  });
  return { node: n, x: left + total / 2, y: depth * levelHeight, w: boxWidth(n), kids: placed };
}

function flatten(p: Placed): Placed[] {
  return [p, ...p.kids.flatMap(flatten)];
}

/**
 * A tree drawn top-down: a syntax tree, a B-tree, a scene graph, a computation graph.
 * Written as an S-expression, `(+ 1 (* 2 3))`, or as nested `{ label, children }` objects.
 */
export function Tree({ data, caption }: { data: string | TreeNode; caption?: string }) {
  const root = typeof data === 'string' ? parseTree(data) : data;
  const tree = place(root, 0, 0);
  const nodes = flatten(tree);
  const width = span(root);
  const height = Math.max(...nodes.map((n) => n.y)) + boxHeight;
  const pad = 4;

  return (
    <Diagram caption={caption}>
      <div className="overflow-x-auto">
        <svg
          viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
          width={width + pad * 2}
          className="mx-auto block max-w-full font-mono text-[12px]"
          style={{ minWidth: Math.min(width, 480) }}
          role="img"
          aria-label={`Tree with root ${root.label}`}
        >
          {nodes.flatMap((p) =>
            p.kids.map((k, i) => (
              <line
                key={`${p.x}-${p.y}-${i}`}
                x1={p.x}
                y1={p.y + boxHeight}
                x2={k.x}
                y2={k.y}
                className={cn(k.node.highlight ? 'stroke-fd-primary' : 'stroke-fd-muted-foreground/60')}
                strokeWidth={k.node.highlight ? 1.75 : 1}
              />
            )),
          )}
          {nodes.map((p, i) => {
            const leaf = !p.kids.length;
            return (
              <g key={i}>
                <rect
                  x={p.x - p.w / 2}
                  y={p.y}
                  width={p.w}
                  height={boxHeight}
                  rx={leaf ? 6 : 14}
                  className={cn(
                    p.node.highlight ? 'fill-fd-primary/15 stroke-fd-primary' : leaf ? 'fill-fd-background stroke-fd-border' : 'fill-fd-background stroke-fd-primary/45',
                  )}
                  strokeWidth={p.node.highlight ? 1.75 : 1}
                />
                <text
                  x={p.x}
                  y={p.y + boxHeight / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={cn(p.node.highlight ? 'fill-fd-primary font-semibold' : 'fill-fd-foreground')}
                >
                  {p.node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Diagram>
  );
}
