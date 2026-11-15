// Finds the lines of the first code block under `root`. Shiki (behind every fenced block and
// ServerCodeBlock) renders each line as <span class="line">; lines are numbered from 1.
export function codeLines(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>('pre code .line')) : [];
}

/** Every line number in a note's range: 4, or [4, 6] for 4 to 6. */
export function lineRange(line: number | [number, number]): number[] {
  const [from, to] = typeof line === 'number' ? [line, line] : line;
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
