import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { defineServerConfig } from '@fumadocs-editor/studio';

// Node-only Studio options: compile the components' Tailwind classes and resolve the
// site's imports (`@/...`, next/navigation) so the components preview live.
export default defineServerConfig({
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@/': fileURLToPath(new URL('./', import.meta.url)),
        'next/navigation': fileURLToPath(new URL('./studio/next-navigation.ts', import.meta.url)),
      },
    },
  },
});
