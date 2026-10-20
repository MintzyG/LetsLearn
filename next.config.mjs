import { createMDX } from 'fumadocs-mdx/next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

const withMDX = createMDX();

// Set in CI when deploying to GitHub Pages (served under /<repo>); empty locally.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Static HTML export, so the site can be hosted on GitHub Pages.
  output: 'export',
  basePath,
  images: { unoptimized: true },
};

// Files named page.dev.tsx are routes only under `next dev` (e.g. the component showcase),
// so they never reach the static build.
export default function nextConfig(phase) {
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  return withMDX({
    ...config,
    pageExtensions: dev ? ['dev.tsx', 'mdx', 'md', 'jsx', 'js', 'tsx', 'ts'] : ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  });
}
