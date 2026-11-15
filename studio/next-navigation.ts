// Stand-in for next/navigation inside Fumadocs Studio, which runs the book components
// in plain Vite without Next.js.
export function usePathname() {
  return typeof location === 'undefined' ? '/' : location.pathname;
}
