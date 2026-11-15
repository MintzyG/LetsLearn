import { defineConfig } from '@fumadocs-editor/studio';
import { admonitionSpec, filesFenceSpecs, fumadocsUiComponents } from '@fumadocs-editor/ui';
import { bookComponents } from './studio/components';

// Every project is a root folder inside content/docs, so the studio edits them all.
// The book components (studio/components.tsx) come with a live preview; $math$ is typeset.
export default defineConfig({
  root: 'content/docs',
  components: [...fumadocsUiComponents, admonitionSpec, ...filesFenceSpecs, ...bookComponents],
  syntax: { math: true },
  styles: ['./studio/studio.css'],
  server: './studio.server.ts',
});
