import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    // /docs has no page of its own; the project list lives on the home page.
    return [{ source: '/docs', destination: '/', permanent: false }];
  },
};

export default withMDX(config);
