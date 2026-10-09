import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

// Exported once at build time; the browser downloads the index and searches locally.
export const revalidate = false;
export const { staticGET: GET } = createFromSource(source);
