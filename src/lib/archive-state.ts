// URL state is portable across refresh, Back/Forward, and shared archive links.
export type ArchiveState = { query: string; filters: Record<string, string> };
export type FilterOptions = Record<string, string[]>;
export function matchesArchiveSearch(text: string, query: string) {
  const haystack = text.toLowerCase();
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}
export function readArchiveState(
  params: URLSearchParams,
  options: FilterOptions,
): ArchiveState {
  const filters: Record<string, string> = {};
  for (const [key, values] of Object.entries(options)) {
    const value = params.get(key) || "";
    if (value && values.includes(value)) filters[key] = value;
  }
  return { query: params.get("q") || "", filters };
}
export function archiveParams(
  current: URLSearchParams,
  state: ArchiveState,
  options: FilterOptions,
) {
  const params = new URLSearchParams(current);
  if (state.query.trim()) params.set("q", state.query.trim());
  else params.delete("q");
  for (const [key, values] of Object.entries(options)) {
    const value = state.filters[key];
    if (value && values.includes(value)) params.set(key, value);
    else params.delete(key);
  }
  return params;
}
