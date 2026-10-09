import Link from 'next/link';
import type { Folder, Node } from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';

// Each project is a folder in content/docs whose meta.json sets "root": true.
function getProjects(): Folder[] {
  return source
    .getPageTree()
    .children.filter((node): node is Folder => node.type === 'folder' && Boolean(node.root));
}

// The project's landing page: its folder index, or else its first page.
function firstPageUrl(nodes: Node[]): string | undefined {
  for (const node of nodes) {
    if (node.type === 'page') return node.url;
    if (node.type === 'folder') {
      const url = node.index?.url ?? firstPageUrl(node.children);
      if (url) return url;
    }
  }
}

export default function HomePage() {
  const projects = getProjects();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">LetsLearn</h1>
      <p className="mb-10 text-fd-muted-foreground">Learn by building, one project at a time.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.$id ?? String(project.name)}
            href={project.index?.url ?? firstPageUrl(project.children) ?? '#'}
            className="rounded-xl border bg-fd-card p-5 transition-colors hover:bg-fd-accent"
          >
            <h2 className="font-semibold">{project.name}</h2>
            {project.description && (
              <p className="mt-1 text-sm text-fd-muted-foreground">{project.description}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}
