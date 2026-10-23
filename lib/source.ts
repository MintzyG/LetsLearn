import { llms, loader, type LoaderPlugin } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import { mintDark, mintLight } from './code-themes';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    mdxOptions: applyMdxPreset({
      rehypeCodeOptions: { themes: { light: mintLight, dark: mintDark } },
    }),
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// Every top-level folder in content/docs is a book, so it gets its own sidebar even when its
// meta.json leaves out "root": true (Fumadocs Studio writes new folders without it).
const booksAreRootsPlugin: LoaderPlugin = {
  name: 'letslearn:books-are-roots',
  transformPageTree: {
    folder(node, dir) {
      if (dir && !dir.includes('/')) node.root = true;
      return node;
    },
  },
};

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin(), booksAreRootsPlugin],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});
