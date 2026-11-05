import {
  archiveParams,
  matchesArchiveSearch,
  readArchiveState,
  type FilterOptions,
} from "../lib/archive-state";

export function initArchive() {
  const search = document.querySelector<HTMLInputElement>("#post-search");
  const groups = [
    ...document.querySelectorAll<HTMLElement>("[data-filter-group]"),
  ];
  const cards = [...document.querySelectorAll<HTMLElement>("[data-post]")];
  const options: FilterOptions = Object.fromEntries(
    groups.map((group) => [
      group.dataset.filterGroup!,
      [...group.querySelectorAll<HTMLButtonElement>("button")].map(
        (b) => b.dataset.value!,
      ),
    ]),
  );
  let filters: Record<string, string> = {};
  const archiveKey = (path: string) => `duckpond:archive:${path}`;
  function filter(save = true) {
    const query = search?.value.trim().toLowerCase() || "";
    let count = 0;
    for (const card of cards) {
      const matches =
        matchesArchiveSearch(card.dataset.search || "", query) &&
        Object.entries(filters).every(
          ([key, value]) =>
            !value || card.getAttribute(`data-${key}`) === value,
        );
      card.hidden = !matches;
      if (matches) count++;
    }
    const active = Object.values(filters).filter(Boolean).length;
    const constrained = !!query || active > 0;
    const status = document.querySelector("[data-results]");
    if (status)
      status.textContent = `${count} ${constrained ? "matching " : ""}${count === 1 ? "entry" : "entries"}`;
    const empty = document.querySelector<HTMLElement>("[data-no-results]");
    if (empty) empty.hidden = count > 0;
    document
      .querySelectorAll<HTMLElement>("[data-filter-count]")
      .forEach((n) => {
        n.textContent = String(active);
        n.hidden = active === 0;
      });
    document
      .querySelector(".archive-filters > summary")
      ?.setAttribute(
        "aria-label",
        active ? `Filters, ${active} active` : "Filters",
      );
    const selection = document.querySelector<HTMLElement>(".archive-selection");
    if (selection) {
      selection.hidden = !constrained;
      const labels = groups.flatMap((group) =>
        [...group.querySelectorAll<HTMLButtonElement>("button")]
          .filter(
            (b) =>
              !!b.dataset.value &&
              b.dataset.value === filters[group.dataset.filterGroup!],
          )
          .map((b) => b.textContent!.trim()),
      );
      selection.querySelector("[data-current-filters]")!.textContent = [
        query ? `Search: “${search!.value.trim()}”` : "",
        ...labels,
      ]
        .filter(Boolean)
        .join(" · ");
    }
    if (!search || !save) return;
    const params = archiveParams(
      new URLSearchParams(location.search),
      { query: search.value, filters },
      options,
    );
    const suffix = params.size ? `?${params}` : "";
    history.replaceState(
      null,
      "",
      `${location.pathname}${suffix}${location.hash}`,
    );
    try {
      sessionStorage.setItem(archiveKey(location.pathname), suffix);
    } catch {}
  }
  function restore() {
    if (!search) return;
    const state = readArchiveState(
      new URLSearchParams(location.search),
      options,
    );
    search.value = state.query;
    filters = state.filters;
    groups.forEach((group) =>
      group
        .querySelectorAll<HTMLButtonElement>("button")
        .forEach((button) =>
          button.setAttribute(
            "aria-pressed",
            String(
              button.dataset.value ===
                (filters[group.dataset.filterGroup!] || ""),
            ),
          ),
        ),
    );
    filter();
  }
  search?.addEventListener("input", () => filter());
  groups.forEach((group) =>
    group.querySelectorAll<HTMLButtonElement>("button").forEach((button) =>
      button.addEventListener("click", () => {
        filters[group.dataset.filterGroup!] = button.dataset.value!;
        group
          .querySelectorAll("button")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        filter();
      }),
    ),
  );
  document.querySelectorAll(".clear-filters,.reset-filters").forEach((button) =>
    button.addEventListener("click", () => {
      if (search) search.value = "";
      filters = {};
      groups.forEach((group) =>
        group
          .querySelectorAll<HTMLButtonElement>("button")
          .forEach((b) =>
            b.setAttribute("aria-pressed", String(b.dataset.value === "")),
          ),
      );
      filter();
      search?.focus();
    }),
  );
  window.addEventListener("popstate", restore);
  window.addEventListener("pageshow", restore);
  restore();
  // A dedicated return link preserves the chosen archive without changing article permalinks.
  document
    .querySelectorAll<HTMLAnchorElement>("[data-archive-return]")
    .forEach((link) => {
      try {
        const url = new URL(link.href);
        const saved = sessionStorage.getItem(archiveKey(url.pathname));
        if (saved?.startsWith("?")) {
          url.search = saved;
          link.href = url.href;
        }
      } catch {}
    });
}
