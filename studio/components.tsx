import { Component, createElement, type ComponentType, type ReactNode } from 'react';
import { Blocks } from 'lucide-react';
import { emptyComponent, type ComponentRenderProps, type UiComponentSpec } from '@fumadocs-editor/ui';
import * as book from '../components/book';
import { catalog, type CatalogEntry } from '../components/book/catalog';

// The book components, registered with Fumadocs Studio so they can be inserted from its
// menu and edited with a live preview. Everything comes from components/book/catalog.ts:
// add a component there and it shows up here.

const components = book as unknown as Record<string, ComponentType<Record<string, unknown>>>;

/** Shown instead of the preview while the props don't render (yet). */
// New props get a fresh try: the error is cleared whenever the preview's element changes.
class Preview extends Component<{ name: string; children: ReactNode }, { error?: string; children?: ReactNode }> {
  state: { error?: string; children?: ReactNode } = {};

  static getDerivedStateFromProps(props: { children: ReactNode }, state: { children?: ReactNode }) {
    return props.children === state.children ? null : { children: props.children, error: undefined };
  }

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div contentEditable={false} className="my-4 rounded-xl border border-dashed border-fd-border p-4 text-sm text-fd-muted-foreground">
        <p className="font-mono font-semibold text-fd-foreground">&lt;{this.props.name}&gt;</p>
        <p className="mt-1">Can&apos;t preview these props yet: {this.state.error}</p>
      </div>
    );
  }
}

/** Builds a JSX attribute for an insert: strings as strings, anything else as an expression. */
function attribute(name: string, value: unknown) {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: typeof value === 'string' ? value : { type: 'mdxJsxAttributeValueExpression', value: JSON.stringify(value), literal: value },
  };
}

function specFor(entry: Pick<CatalogEntry, 'name' | 'purpose' | 'studio'>): UiComponentSpec {
  const Book = components[entry.name];
  const { children, childComponent, starter = {} } = entry.studio ?? {};
  const spec: UiComponentSpec = {
    name: entry.name,
    label: entry.name,
    icon: <Blocks size={13} />,
    ...(children ? { childrenRegion: { region: 'body', placeholder: children } } : {}),
    ...(childComponent ? { childComponent, listLike: true } : {}),
    props: Object.entries(starter).map(([name, value]) => ({
      name,
      type: typeof value === 'string' ? 'string' : typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'expression',
    })),
    render: ({ props, literals, children: regions }: ComponentRenderProps) => (
      <Preview name={entry.name}>
        {createElement(Book, { ...props, ...literals, ...(children || childComponent ? { children: regions } : {}) })}
      </Preview>
    ),
    insert: (specs) => emptyComponent(spec, specs, Object.entries(starter).map(([name, value]) => attribute(name, value)) as never),
  };
  return spec;
}

// Parts that only live inside another component, so the catalog doesn't list them.
const parts = [
  { name: 'Spec', purpose: 'One thing the reader builds, inside a Task.', studio: { children: 'What it takes, returns and reports…', starter: { name: 'Name', kind: 'function' } } },
  { name: 'Hint', purpose: 'One hint, inside Hints.', studio: { children: 'A nudge…' } },
];

export const bookComponents: UiComponentSpec[] = [...catalog.filter((c) => !c.inline), ...parts].map(specFor);
