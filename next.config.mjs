import { createMDX } from 'fumadocs-mdx/next';

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

export default withMDX(config);
