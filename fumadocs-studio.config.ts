import { defineConfig } from '@fumadocs-editor/studio';

// Every project is a root folder inside content/docs, so the studio edits them all.
export default defineConfig({
  root: 'content/docs',
});
