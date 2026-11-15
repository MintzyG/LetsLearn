// Prefixes a root-relative asset path ("/images/x.png") with the deploy's base path, which
// Next.js adds to its own links but not to a plain <img src>. Other URLs pass through.
export function asset(src: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return src.startsWith('/') && !src.startsWith('//') && !src.startsWith(`${base}/`) ? `${base}${src}` : src;
}
