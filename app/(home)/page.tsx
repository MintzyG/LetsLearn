import Link from 'next/link';
import type { Folder, Node } from 'fumadocs-core/page-tree';
import { ArrowRight } from 'lucide-react';
import { source } from '@/lib/source';
import { gitConfig } from '@/lib/shared';

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

const steps = [
  {
    title: 'Read the spec',
    text: 'Each chapter explains the concepts and describes what to build. It never shows you the code.',
  },
  {
    title: 'Build it yourself',
    text: 'Write it your own way, at your own pace. Hints are there when you get stuck.',
  },
  {
    title: 'Verify it',
    text: 'Tests and checks against the real thing tell you when it actually works.',
  },
  {
    title: 'Compare',
    text: 'A reference implementation waits at the end of every chapter, whenever you want it.',
  },
];

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

function countPages(folder: Folder): number {
  let count = folder.index ? 1 : 0;
  for (const node of folder.children) {
    if (node.type === 'page') count++;
    if (node.type === 'folder') count += countPages(node);
  }
  return count;
}

export default function HomePage() {
  const projects = getProjects();

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-fd-primary/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
          <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-fd-primary">
            Learn by building
          </p>
          <h1 className="mb-5 font-mono text-4xl font-semibold tracking-tight sm:text-6xl">LetsLearn</h1>
          <p className="mx-auto mb-9 max-w-xl text-lg text-fd-muted-foreground">
            Books where you build real things from the bottom up. Every chapter describes what to build
            and leaves the building to you.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#books"
              className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse the books
              <ArrowRight className="size-4" />
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border bg-fd-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-8 font-mono text-xs font-medium uppercase tracking-[0.15em] text-fd-primary">
          How it works
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-xl border bg-fd-card p-5">
              <span className="font-mono text-xs font-medium text-fd-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 mb-1.5 font-mono font-medium">{step.title}</h3>
              <p className="text-sm text-fd-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="books" className="mx-auto max-w-5xl scroll-mt-20 px-4 pb-20">
        <h2 className="mb-8 font-mono text-xs font-medium uppercase tracking-[0.15em] text-fd-primary">
          Books
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => {
            const pages = countPages(project);
            return (
              <Link
                key={project.$id ?? String(project.name)}
                href={project.index?.url ?? firstPageUrl(project.children) ?? '#'}
                className="group flex flex-col rounded-xl border bg-fd-card p-6 transition-colors hover:border-fd-primary/50 hover:bg-fd-accent"
              >
                <div className="mb-3 flex items-center gap-3">
                  {project.icon && (
                    <span className="flex size-9 items-center justify-center rounded-lg border bg-fd-background text-fd-primary [&_svg]:size-4.5">
                      {project.icon}
                    </span>
                  )}
                  <h3 className="font-mono text-lg font-medium">{project.name}</h3>
                </div>
                {project.description && (
                  <p className="mb-5 text-sm text-fd-muted-foreground">{project.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between font-mono text-xs text-fd-muted-foreground">
                  <span>
                    {pages} {pages === 1 ? 'page' : 'pages'}
                  </span>
                  <span className="flex items-center gap-1 text-fd-primary">
                    Start reading
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Code under MIT, content under CC BY 4.0. © 2026 Sophia Hoffmann.
          </p>
          <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-fd-primary">
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
