import Link from 'next/link';
import type { Folder, Node } from 'fumadocs-core/page-tree';
import { source } from '@/lib/source';
import { gitConfig } from '@/lib/shared';

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

const steps: { title: string; text: string }[] = [
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

// The book's chapters: its top-level pages and folders, in sidebar order, without its landing page.
function getChapters(folder: Folder, landing: string): { name: string; url: string }[] {
  const chapters: { name: string; url: string }[] = [];
  for (const node of folder.children) {
    const url = node.type === 'page' ? node.url : node.type === 'folder' ? (node.index?.url ?? firstPageUrl(node.children)) : undefined;
    if (url && url !== landing) chapters.push({ name: String(node.name), url });
  }
  return chapters;
}

export default function HomePage() {
  const projects = getProjects();

  return (
    <main className="flex-1">
      <section className="mint-grid border-b">
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-16 sm:pt-28 sm:pb-20">
          <h1 className="font-display text-[clamp(4.25rem,16vw,11.5rem)] leading-[0.9] tracking-tight text-fd-foreground">
            LetsLearn
          </h1>
          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-xl text-xl leading-relaxed text-fd-muted-foreground sm:text-2xl">
              Books where you learn how something works by building it yourself.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#books"
                className="inline-flex items-center rounded-full bg-fd-primary px-6 py-3 font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
              >
                Browse the books
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-fd-primary/30 bg-fd-background px-6 py-3 font-medium transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-fd-muted">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="mb-12 font-display text-4xl">How a chapter works</h2>
          <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t border-fd-primary/30 pt-5">
                <span className="font-display text-4xl text-fd-primary">{i + 1}</span>
                <h3 className="mt-3 mb-2 font-display text-xl">{step.title}</h3>
                <p className="leading-relaxed text-fd-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="books" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <h2 className="mb-8 font-display text-4xl">Books</h2>
        <ul>
          {projects.map((project) => {
            const url = project.index?.url ?? firstPageUrl(project.children) ?? '#';
            const chapters = getChapters(project, url);
            return (
              <li
                key={project.$id ?? String(project.name)}
                className="grid gap-8 border-t border-fd-primary/25 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16"
              >
                <div>
                  <h3 className="font-display text-4xl">
                    <Link href={url} className="hover:text-fd-primary focus-visible:outline-2 focus-visible:outline-fd-ring">
                      {project.name}
                    </Link>
                  </h3>
                  {project.description && (
                    <p className="mt-3 max-w-md text-lg leading-relaxed text-fd-muted-foreground">{project.description}</p>
                  )}
                  <Link
                    href={url}
                    className="mt-6 inline-flex items-center rounded-full border border-fd-primary/30 px-5 py-2 text-sm font-medium transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
                  >
                    Start reading
                  </Link>
                </div>
                {chapters.length > 0 ? (
                  <ol className="divide-y divide-fd-border self-start">
                    {chapters.map((chapter, i) => (
                      <li key={chapter.url}>
                        <Link
                          href={chapter.url}
                          className="flex items-baseline gap-5 py-3 transition-colors hover:text-fd-primary focus-visible:outline-2 focus-visible:outline-fd-ring"
                        >
                          <span className="w-6 shrink-0 font-display text-lg text-fd-primary tabular-nums">{i + 1}</span>
                          <span className="text-lg">{chapter.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="pt-3 text-lg text-fd-muted-foreground">No chapters yet.</p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-fd-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Code under MIT, content under CC BY 4.0. © 2026 Sophia Hoffmann.</p>
          <a href={githubUrl} target="_blank" rel="noreferrer" className="hover:text-fd-primary">
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
