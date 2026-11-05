import { localCalendarDate } from "../lib/calendar";
import {
  $,
  api,
  canLeave,
  clearError,
  esc,
  field,
  icon,
  refresh,
  select,
  setBusy,
  setDirty,
  showError,
  state,
  status,
  upload,
  wireDirty,
} from "./ui";
import type { PostDocument } from "./ui";
const categories = [
  { value: "blog", label: "Blog" },
  { value: "htb", label: "HTB write-up" },
  { value: "ctf", label: "CTF write-up" },
];
let search = "",
  filter = "all";
export function renderPosts() {
  $("#content").innerHTML =
    `<div class="section-heading"><div><h2 tabindex="-1" id="section-title">Posts</h2><p>Write in Markdown. Keep your Obsidian vault.</p></div><button type="button" id="new-post">${icon("plus")} New post</button></div><div class="post-desk"><aside class="post-list" aria-label="Post library">${field("Find a post", "post-search", search, { type: "search" })}${select("Section", "post-filter", filter, [{ value: "all", label: "All sections" }, ...categories])}<ul id="post-list"></ul><p class="hint" id="post-count" role="status"></p><p class="hint">Drafts appear in local preview and are excluded from the published build.</p></aside><section id="post-editor" class="editor-paper" aria-label="Post editor"></section></div>`;
  renderList();
  renderDocument();
  $("#new-post").onclick = () => {
    void (async () => {
      if (!(await canLeave())) return;
      state.post = {
        file: "",
        revision: "",
        url: "",
        data: {
          title: "",
          date: localCalendarDate(),
          categories: "blog",
          tags: [],
          published: false,
        },
        body: "## Overview\n\n",
      };
      clearError();
      renderDocument();
      renderList();
      setDirty();
      $<HTMLInputElement>("[name=title]").focus();
    })().catch(showError);
  };
  $<HTMLInputElement>("[name=post-search]").oninput = (e) => {
    search = (e.target as HTMLInputElement).value;
    renderList();
  };
  $<HTMLSelectElement>("[name=post-filter]").onchange = (e) => {
    filter = (e.target as HTMLSelectElement).value;
    renderList();
  };
}
function renderList() {
  const posts = state.snapshot!.posts.filter(
    (p) =>
      (filter === "all" || p.category === filter) &&
      p.title.toLowerCase().includes(search.toLowerCase()),
  );
  $("#post-count").textContent =
    `${posts.length} of ${state.snapshot!.posts.length} posts`;
  $("#post-list").innerHTML = posts.length
    ? posts
        .map(
          (p) =>
            `<li><button class="post-row" type="button" data-file="${esc(p.file)}" aria-label="Edit ${esc(p.title)}" ${p.file === state.post?.file ? 'aria-current="true"' : ""}><strong>${esc(p.title)}</strong><small>${esc(p.category.toUpperCase())} · ${esc(p.date)}${p.error ? " · Needs attention" : p.draft ? " · Draft" : ""}</small></button></li>`,
        )
        .join("")
    : `<li class="list-empty">${state.snapshot!.posts.length ? "No matching posts. Try another search or section." : "No posts yet. Start with a draft."}</li>`;
  document.querySelectorAll<HTMLButtonElement>("[data-file]").forEach(
    (b) =>
      (b.onclick = () => {
        void (async () => {
          if (!(await canLeave())) return;
          status("Opening post…");
          state.post = await api<PostDocument>(
            "post?file=" + encodeURIComponent(b.dataset.file!),
          );
          renderDocument();
          renderList();
          setDirty(false);
          clearError();
          $<HTMLInputElement>("[name=title]").focus();
        })().catch(showError);
      }),
  );
}
function postInput() {
  const f = $<HTMLFormElement>("#editor-form"),
    values = new FormData(f),
    data: Record<string, unknown> = {};
  for (const key of [
    "title",
    "date",
    "categories",
    "thumbnail",
    "difficulty",
    "os",
    "event",
    "ctf_category",
  ])
    if (values.has(key)) data[key] = String(values.get(key));
  data.tags = String(values.get("tags") || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  data.published = values.get("published") === "on";
  return {
    file: state.post!.file || undefined,
    revision: state.post!.revision || undefined,
    data,
    body: String(values.get("body") || ""),
  };
}
function categoryFields(category: string) {
  const d = state.post!.data;
  return category === "htb"
    ? select("Difficulty", "difficulty", d.difficulty || "", [
        { value: "", label: "Not set" },
        ...["Easy", "Medium", "Hard", "Insane"].map((value) => ({
          value,
          label: value,
        })),
      ]) +
        select("Operating system", "os", d.os || "", [
          { value: "", label: "Not set" },
          ...["Linux", "Windows"].map((value) => ({ value, label: value })),
        ])
    : category === "ctf"
      ? field("CTF event", "event", d.event) +
        field("Challenge category", "ctf_category", d.ctf_category)
      : "";
}
function renderDocument() {
  if (!state.post) {
    $("#post-editor").innerHTML =
      `<div class="empty-editor">${icon("journal")}<h3>A place for your field notes</h3><p>Choose a post on the left, or create a draft. Existing article addresses and extra frontmatter are preserved when you save.</p><button type="button" id="start-post">Create a draft</button></div>`;
    $("#start-post").onclick = () => $("#new-post").click();
    return;
  }
  const p = state.post,
    d = p.data;
  $("#post-editor").innerHTML =
    `<form id="editor-form"><header class="editor-toolbar"><div><h3 tabindex="-1">${p.file ? "Edit post" : "New draft"}</h3><p class="file-name">${p.file ? esc("_posts/" + p.file) : "A new Markdown file will be created when you save."}</p></div><div class="toolbar-actions">${p.file ? '<button type="button" class="secondary" id="reload-post">Reload file</button>' : ""}<button type="submit" data-save disabled>Save changes</button></div></header><fieldset class="edit-fields"><div class="fields">${field("Title", "title", d.title, { required: true, full: true })}${field("Date", "date", d.date, { type: "date", required: true })}${select("Section", "categories", d.categories, categories)}<div class="fields full" id="category-fields">${categoryFields(String(d.categories))}</div>${field("Tags", "tags", Array.isArray(d.tags) ? d.tags.join(", ") : "", { hint: "Separate tags with commas.", full: true })}${field("Thumbnail image", "thumbnail", d.thumbnail, { hint: "Optional. Use an existing image path or upload one below.", full: true })}<div class="field full"><label for="thumbnail-upload">Upload a thumbnail</label><input id="thumbnail-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></div></div><div class="check"><input type="checkbox" id="published" name="published" ${d.published ? "checked" : ""}/><label for="published">Include in published site<span class="hint">Unchecked means draft. Future-dated posts also stay out of production. This saves locally; it does not publish to GitHub.</span></label></div><div class="field body-field"><label for="f-body">Post body · Markdown</label><div class="format-tools" aria-label="Markdown formatting"><button type="button" class="secondary" data-format="heading">Heading</button><button type="button" class="secondary" data-format="bold">Bold</button><button type="button" class="secondary" data-format="link">Link</button><button type="button" class="secondary" data-format="code">Code</button></div><textarea class="markdown" id="f-body" name="body" spellcheck="false" rows="18" aria-describedby="body-help">${esc(p.body)}</textarea><p class="hint" id="body-help">Markdown and Obsidian image embeds both work. Paste an image or upload one to insert it at your cursor.</p><div class="upload-line"><label for="body-upload">Insert image<input id="body-upload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label><button type="button" id="preview-post" class="secondary">Preview reading view</button></div></div></fieldset><div class="reading-link hint">${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">Open saved post in local site</a>` : "Save this draft to open it in the local site."}</div></form><section id="reading-preview" class="article-preview" aria-label="Reading preview" hidden><header><h3>Reading preview</h3><button type="button" class="secondary" id="close-preview">Close preview</button></header><iframe title="Post reading preview" sandbox="" referrerpolicy="no-referrer"></iframe><p class="hint">Preview includes your unsaved text. Links open only in the saved site view.</p></section>`;
  wireDirty();
  $<HTMLSelectElement>("[name=categories]").onchange = (e) => {
    state.post!.data = { ...state.post!.data, ...postInput().data };
    $("#category-fields").innerHTML = categoryFields(
      (e.target as HTMLSelectElement).value,
    );
  };
  $("#reload-post")?.addEventListener("click", () => {
    void (async () => {
      if (!(await canLeave())) return;
      state.post = await api<PostDocument>(
        "post?file=" + encodeURIComponent(p.file),
      );
      renderDocument();
      setDirty(false);
      clearError();
    })().catch(showError);
  });
  $<HTMLFormElement>("#editor-form").onsubmit = (e) => {
    e.preventDefault();
    void savePost();
  };
  document.querySelectorAll<HTMLButtonElement>("[data-format]").forEach(
    (b) =>
      (b.onclick = () => {
        const t = $<HTMLTextAreaElement>("[name=body]"),
          v = t.value.slice(t.selectionStart, t.selectionEnd),
          formats: Record<string, string> = {
            heading: "\n## " + (v || "Heading") + "\n",
            bold: "**" + (v || "bold text") + "**",
            link: "[" + (v || "link text") + "](https://)",
            code: "\n```text\n" + (v || "code") + "\n```\n",
          };
        insert(formats[b.dataset.format!]);
      }),
  );
  const addImage = async (file?: File, thumbnail = false) => {
    if (!file) return;
    try {
      const image = await upload(file);
      if (thumbnail) {
        $<HTMLInputElement>("[name=thumbnail]").value = image.reference;
        setDirty();
      } else
        insert(
          `\n![${image.name.replace(/[\[\]]/g, "")}](${encodeURI(image.reference).replaceAll("(", "%28").replaceAll(")", "%29")})\n`,
        );
    } catch (error) {
      showError(error);
    }
  };
  $<HTMLInputElement>("#body-upload").onchange = (e) => {
    void addImage((e.target as HTMLInputElement).files?.[0]);
  };
  $<HTMLInputElement>("#thumbnail-upload").onchange = (e) => {
    void addImage((e.target as HTMLInputElement).files?.[0], true);
  };
  $<HTMLTextAreaElement>("[name=body]").onpaste = (e) => {
    const f = Array.from(e.clipboardData?.files || []).find((f) =>
      f.type.startsWith("image/"),
    );
    if (f) {
      e.preventDefault();
      void addImage(f);
    }
  };
  $("#preview-post").onclick = () => {
    void previewPost();
  };
  $("#close-preview").onclick = () => {
    $("#reading-preview").hidden = true;
    $("#preview-post").focus();
  };
}
function insert(text: string) {
  const t = $<HTMLTextAreaElement>("[name=body]");
  t.setRangeText(text, t.selectionStart, t.selectionEnd, "end");
  t.focus();
  setDirty();
}
async function savePost() {
  clearError();
  if (!$<HTMLFormElement>("#editor-form").reportValidity()) return;
  const input = postInput();
  setBusy(true);
  try {
    state.post = await api<PostDocument>("post", input);
    await refresh();
    renderList();
    renderDocument();
    setDirty(false);
    $(".editor-toolbar h3").focus();
    status("Saved to _posts/" + state.post.file + ". Local preview updated.");
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}
async function previewPost() {
  clearError();
  const b = $<HTMLButtonElement>("#preview-post");
  b.disabled = true;
  b.textContent = "Preparing preview…";
  try {
    const input = postInput(),
      result = await api<{ html: string }>("preview", input);
    const frame = $<HTMLIFrameElement>("#reading-preview iframe");
    frame.srcdoc = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><base href="${esc(location.origin)}/"><style>body{margin:0;padding:24px;color:#2e3d35;background:#fffaf0;font:16px/1.7 system-ui,sans-serif;overflow-wrap:anywhere}h1,h2,h3{line-height:1.25;color:#294b38}h1{font-size:28px}a{color:#276457;pointer-events:none}img{max-width:100%;height:auto}pre{overflow:auto;padding:16px;background:#e4dcc8!important;color:#2e3d35!important;font-size:13px}code{font-family:monospace}pre span{color:var(--shiki-light)!important}table{border-collapse:collapse;max-width:100%;display:block;overflow:auto}td,th{border:1px solid #b6b59c;padding:8px}blockquote{border-left:4px solid #829474;padding-left:16px;margin-left:0}.heading-anchor{display:none}</style><h1>${esc(input.data.title)}</h1>${result.html}</html>`;
    $("#reading-preview").hidden = false;
    frame.scrollIntoView({ block: "nearest" });
    status("Preview updated with your current edits.");
  } catch (error) {
    showError(error);
  } finally {
    b.disabled = false;
    b.textContent = "Preview reading view";
  }
}
