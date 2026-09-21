/**
 * Formats a count with the right noun form: `count(1, 'ENTRY', 'ENTRIES')`.
 *
 * Four places were doing this by hand and two of them were wrong — the home
 * page read "1 ENTRIES", and the command palette dodged the problem with
 * "RECORD(S)", which reads like a form letter rather than an instrument. The
 * boot overlay and the blog index each had their own correct copy.
 */
export function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
