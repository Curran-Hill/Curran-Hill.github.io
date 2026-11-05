import type { SiteData } from "../lib/site-schema";
import { pixelIcons as icons } from "../lib/pixel-icons";
export type PostSummary = {
  file: string;
  title: string;
  date: string;
  category: string;
  draft: boolean;
  url?: string;
  error?: string;
};
export type PostDocument = {
  file: string;
  revision: string;
  data: Record<string, unknown>;
  body: string;
  url: string;
};
export type EditorState = {
  site: { data: SiteData; revision: string };
  posts: PostSummary[];
};
export const state = {
  section: "posts",
  dirty: false,
  busy: false,
  snapshot: null as EditorState | null,
  post: null as PostDocument | null,
};
export const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  document.querySelector<T>(selector)!;
export const esc = (value: unknown = "") =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const icon = (name: string) => {
  const pixels = icons[name as keyof typeof icons] || icons.journal;
  return `<svg class="ui-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">${pixels.map((p) => `<rect x="${p.x}" y="${p.y}" width="${p.width}" height="1" fill="currentColor" opacity="${p.tone === 2 ? ".55" : "1"}"/>`).join("")}</svg>`;
};
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(
    "/__editor/" + path,
    body === undefined
      ? { cache: "no-store" }
      : {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Pond-Editor": $("meta[name=pond-editor-token]").getAttribute(
              "content",
            )!,
          },
          body: JSON.stringify(body),
        },
  );
  const result = await res.json();
  if (!res.ok)
    throw new Error(result.error || "The request failed. Try again.");
  return result;
}
export const status = (message: string) => {
  $("#feedback").textContent = message;
  $("#feedback").dataset.unsaved = String(state.dirty);
};
export const clearError = () => {
  $("#error").hidden = true;
  document
    .querySelectorAll("[aria-invalid]")
    .forEach((el) => el.removeAttribute("aria-invalid"));
};
export function showError(error: unknown) {
  const el = $("#error");
  el.textContent = error instanceof Error ? error.message : String(error);
  el.hidden = false;
  const match = el.textContent.match(/(?:site.json: )([a-zA-Z0-9_.]+) must/);
  if (match)
    document
      .querySelector(`[name="${CSS.escape(match[1])}"]`)
      ?.setAttribute("aria-invalid", "true");
  el.focus();
}
export function setDirty(dirty = true) {
  state.dirty = dirty;
  status(dirty ? "Unsaved changes" : "All changes saved locally");
  document
    .querySelectorAll<HTMLButtonElement>("[data-save]")
    .forEach((b) => (b.disabled = state.busy || !dirty));
}
export function setBusy(busy: boolean) {
  state.busy = busy;
  $("#content").setAttribute("aria-busy", String(busy));
  document
    .querySelectorAll<HTMLFieldSetElement>("fieldset")
    .forEach((f) => (f.disabled = busy));
  document.querySelectorAll<HTMLButtonElement>("[data-save]").forEach((b) => {
    b.disabled = busy || !state.dirty;
    b.textContent = busy ? "Saving…" : "Save changes";
  });
  document
    .querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement>(
      "[data-section],#new-post,#reload-post,#reload-settings,[data-file],#f-post-search,#f-post-filter",
    )
    .forEach((b) => (b.disabled = busy));
}
export async function canLeave() {
  if (!state.dirty) return true;
  const d = $<HTMLDialogElement>("#discard-dialog");
  d.returnValue = "cancel";
  d.showModal();
  return new Promise<boolean>((resolve) =>
    d.addEventListener("close", () => resolve(d.returnValue === "discard"), {
      once: true,
    }),
  );
}
export async function refresh() {
  state.snapshot = await api<EditorState>("state");
  return state.snapshot;
}
export function wireDirty() {
  const form = $<HTMLFormElement>("#editor-form");
  form.addEventListener("input", () => setDirty());
  form.addEventListener("change", () => setDirty());
}
export const field = (
  label: string,
  name: string,
  value: unknown = "",
  options: {
    type?: string;
    required?: boolean;
    hint?: string;
    full?: boolean;
    min?: number;
    max?: number;
    rows?: number;
  } = {},
) => {
  const attrs = `id="f-${esc(name)}" name="${esc(name)}" ${options.required ? "required" : ""} ${options.min !== undefined ? `min="${options.min}"` : ""} ${options.max !== undefined ? `max="${options.max}"` : ""}`;
  return `<div class="field ${options.full ? "full" : ""}"><label for="f-${esc(name)}">${esc(label)}</label>${options.type === "textarea" ? `<textarea ${attrs} rows="${options.rows || 3}">${esc(value)}</textarea>` : `<input ${attrs} type="${options.type || "text"}" value="${esc(value)}" />`}${options.hint ? `<p class="hint">${esc(options.hint)}</p>` : ""}</div>`;
};
export const select = (
  label: string,
  name: string,
  value: unknown,
  choices: { value: string; label: string }[],
) =>
  `<div class="field"><label for="f-${esc(name)}">${esc(label)}</label><select id="f-${esc(name)}" name="${esc(name)}">${choices.map((c) => `<option value="${esc(c.value)}" ${value === c.value ? "selected" : ""}>${esc(c.label)}</option>`).join("")}</select></div>`;
export async function upload(file: File) {
  if (file.size > 12 * 1024 * 1024)
    throw new Error("Choose an image smaller than 12 MB.");
  status("Adding image…");
  const content = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(new Error("The image could not be read."));
    r.readAsDataURL(file);
  });
  const result = await api<{ reference: string; url: string; name: string }>(
    "upload",
    { name: file.name, content },
  );
  status("Image added to Obsidian attachments. Save your changes to use it.");
  return result;
}
