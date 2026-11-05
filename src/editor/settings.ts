import {
  $,
  api,
  canLeave,
  clearError,
  esc,
  field,
  select,
  setBusy,
  setDirty,
  showError,
  state,
  status,
  upload,
  wireDirty,
} from "./ui";
import type { SiteData } from "../lib/site-schema";
let draft: SiteData;
const set = (obj: unknown, path: string, value: unknown) => {
  const keys = path.split(".");
  let current = obj as Record<string, unknown>;
  for (const key of keys.slice(0, -1))
    current = current[key] as Record<string, unknown>;
  current[keys.at(-1)!] = value;
};
function collect() {
  const form = $<HTMLFormElement>("#editor-form");
  for (const [path, value] of new FormData(form)) {
    if (path === "pond.quackVolume") set(draft, path, Number(value) / 100);
    else if (path.startsWith("pond.") || /\.(width|height)$/.test(path))
      set(draft, path, value === "" ? undefined : Number(value));
    else
      set(
        draft,
        path,
        /\.(image|alt)$/.test(path) && value === "" ? undefined : String(value),
      );
  }
  return draft;
}
const imageFields = (
  path: string,
  row: { image?: string; alt?: string; width?: number; height?: number },
) =>
  `<details class="full image-details"><summary>${row.image ? "Image attached" : "Add an image"}</summary><div class="fields"><div class="field full image-field">${field("Image path", path + ".image", row.image, { hint: "Optional. Existing assets and shared attachments are supported." })}<div class="upload-line"><label for="upload-${esc(path)}">Upload image<input type="file" id="upload-${esc(path)}" data-upload="${esc(path)}" accept="image/png,image/jpeg,image/webp,image/gif" /></label></div></div>${field("Image description", path + ".alt", row.alt, { hint: "Describe the image for visitors who cannot see it.", full: true })}${field("Image width", path + ".width", row.width, { type: "number", min: 1, max: 20000 })}${field("Image height", path + ".height", row.height, { type: "number", min: 1, max: 20000 })}</div></details>`;
const headings: Record<string, { title: string; intro: string; url: string }> =
  {
    about: {
      title: "About & awards",
      intro: "Your introduction, certifications, and achievements.",
      url: "/about/",
    },
    contact: {
      title: "Contact",
      intro: "Keep the ways people can reach you up to date.",
      url: "/contact/",
    },
    pond: {
      title: "Pond settings",
      intro: "The first words visitors see, and the quacks they hear.",
      url: "/",
    },
  };
export function renderSettings(reset = true) {
  if (reset) draft = structuredClone(state.snapshot!.site.data);
  const heading = headings[state.section];
  $("#content").innerHTML =
    `<div class="section-heading"><div class="workspace-heading"><h2 id="section-title" tabindex="-1">${heading.title}</h2><p>${heading.intro}</p></div><a class="button secondary" href="${heading.url}" target="_blank" rel="noopener">View page</a></div><section class="editor-paper settings-form"><form id="editor-form"><header class="editor-toolbar"><div><h3 tabindex="-1">${state.section === "pond" ? "At the pond" : state.section === "contact" ? "Open the mailbox" : "Behind the pond"}</h3><p class="file-name">_data/site.json</p></div><div class="toolbar-actions"><button type="button" class="secondary" id="reload-settings">Reload file</button><button type="submit" data-save ${state.dirty ? "" : "disabled"}>Save changes</button></div></header><fieldset class="edit-fields">${state.section === "about" ? aboutForm() : state.section === "contact" ? contactForm() : pondForm()}</fieldset><p class="section-note">Saved locally, with a backup of the previous file. Your public website changes after its next GitHub deployment.</p></form></section>`;
  wireDirty();
  $<HTMLFormElement>("#editor-form").onsubmit = (e) => {
    e.preventDefault();
    void save();
  };
  $("#reload-settings").onclick = () => {
    void (async () => {
      if (!(await canLeave())) return;
      const result = await api<{ site: { data: SiteData; revision: string } }>(
        "state",
      );
      state.snapshot!.site = result.site;
      setDirty(false);
      renderSettings();
      clearError();
      status("Reloaded site settings from disk.");
    })().catch(showError);
  };
  document.querySelectorAll<HTMLButtonElement>("[data-add]").forEach(
    (b) =>
      (b.onclick = () => {
        collect();
        const key = b.dataset.add!;
        if (key === "certifications")
          draft.about.certifications.push({
            name: "",
            completed: "",
            expires: "",
          });
        else if (key === "awards")
          draft.about.awards.push({
            title: "",
            role: "Participant",
            date: "",
            body: "",
          });
        else
          draft.contact.links.push({
            name: "",
            label: "",
            href: "https://",
            icon: "mail",
          });
        setDirty();
        renderSettings(false);
        const rows = document.querySelectorAll(
          `[data-list="${key}"] .repeat-row`,
        );
        rows[rows.length - 1]?.querySelector("input")?.focus();
      }),
  );
  document.querySelectorAll<HTMLButtonElement>("[data-remove]").forEach(
    (b) =>
      (b.onclick = () => {
        collect();
        const [key, index] = b.dataset.remove!.split(":");
        const rows =
          key === "links"
            ? draft.contact.links
            : key === "awards"
              ? draft.about.awards
              : draft.about.certifications;
        rows.splice(Number(index), 1);
        setDirty();
        renderSettings(false);
        $<HTMLButtonElement>(`[data-add="${key}"]`).focus();
      }),
  );
  document.querySelectorAll<HTMLInputElement>("[data-upload]").forEach(
    (input) =>
      (input.onchange = () => {
        void (async () => {
          const file = input.files?.[0];
          if (!file) return;
          input.disabled = true;
          try {
            const added = await upload(file),
              path = input.dataset.upload!;
            $<HTMLInputElement>(`[name="${path}.image"]`).value =
              added.reference;
            const dimensions = await new Promise<{
              width: number;
              height: number;
            } | null>((resolve) => {
              const img = new Image();
              img.onload = () =>
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
              img.onerror = () => resolve(null);
              img.src = added.url;
            });
            if (dimensions) {
              $<HTMLInputElement>(`[name="${path}.width"]`).value = String(
                dimensions.width,
              );
              $<HTMLInputElement>(`[name="${path}.height"]`).value = String(
                dimensions.height,
              );
            }
            setDirty();
            $<HTMLInputElement>(`[name="${path}.alt"]`).focus();
          } finally {
            input.disabled = false;
          }
        })().catch(showError);
      }),
  );
  const volume = $<HTMLInputElement>('[name="pond.quackVolume"]');
  if (volume)
    volume.oninput = () => {
      $("#volume-output").textContent = volume.value + "%";
    };
  $("#test-quack")?.addEventListener("click", () => {
    void testQuack();
  });
}
function aboutForm() {
  const a = draft.about;
  return `<div class="fields">${field("Page title", "about.title", a.title, { required: true, full: true })}${field("Short introduction", "about.subtitle", a.subtitle, { required: true, full: true })}${field("About text · Markdown", "about.body", a.body, { required: true, type: "textarea", rows: 8, full: true })}</div><section class="repeat-list" aria-label="Certifications"><div class="repeat-heading"><h3>Certifications</h3><button type="button" class="secondary" data-add="certifications">Add certification</button></div><div data-list="certifications">${a.certifications.map((c, i) => `<section class="repeat-row"><header><h4>Certification ${i + 1}</h4><button type="button" class="secondary" data-remove="certifications:${i}" aria-label="Remove certification ${i + 1}">Remove</button></header><div class="fields">${field("Certification name", `about.certifications.${i}.name`, c.name, { required: true, full: true })}${field("Completed", `about.certifications.${i}.completed`, c.completed, { required: true, hint: "For example, May 15, 2026." })}${field("Expires", `about.certifications.${i}.expires`, c.expires, { hint: "Leave blank if it does not expire." })}${imageFields(`about.certifications.${i}`, c)}</div></section>`).join("") || '<p class="hint">No certifications listed.</p>'}</div></section><section class="repeat-list" aria-label="Awards"><div class="repeat-heading"><h3>Awards & achievements</h3><button type="button" class="secondary" data-add="awards">Add award</button></div><div data-list="awards">${a.awards.map((a, i) => `<section class="repeat-row"><header><h4>Award ${i + 1}</h4><button type="button" class="secondary" data-remove="awards:${i}" aria-label="Remove award ${i + 1}">Remove</button></header><div class="fields">${field("Award title", `about.awards.${i}.title`, a.title, { required: true, full: true })}${field("Role", `about.awards.${i}.role`, a.role, { required: true })}${field("Date", `about.awards.${i}.date`, a.date, { required: true })}${field("Description", `about.awards.${i}.body`, a.body, { type: "textarea", required: true, full: true })}${imageFields(`about.awards.${i}`, a)}</div></section>`).join("") || '<p class="hint">No awards listed.</p>'}</div></section>`;
}
function contactForm() {
  const c = draft.contact;
  return `<div class="fields">${field("Page title", "contact.title", c.title, { required: true, full: true })}${field("Introduction", "contact.subtitle", c.subtitle, { required: true, type: "textarea", full: true })}${field("Closing note", "contact.note", c.note, { required: true, type: "textarea", full: true })}</div><section class="repeat-list" aria-label="Contact links"><div class="repeat-heading"><h3>Contact links</h3><button type="button" class="secondary" data-add="links">Add link</button></div><div data-list="links">${
    c.links
      .map(
        (l, i) =>
          `<section class="repeat-row"><header><h4>Contact ${i + 1}</h4><button type="button" class="secondary" data-remove="links:${i}" aria-label="Remove contact ${i + 1}">Remove</button></header><div class="fields">${field("Name", `contact.links.${i}.name`, l.name, { required: true })}${select(
            "Icon",
            `contact.links.${i}.icon`,
            l.icon,
            [
              { value: "mail", label: "Mailbox" },
              { value: "code", label: "Code" },
              { value: "profile", label: "Profile" },
              { value: "box", label: "HTB box" },
            ],
          )}${field("Displayed address or username", `contact.links.${i}.label`, l.label, { required: true, full: true })}${field("Link address", `contact.links.${i}.href`, l.href, { required: true, full: true, hint: "Start with https:// or mailto: for email." })}</div></section>`,
      )
      .join("") || '<p class="hint">No contact links listed.</p>'
  }</div></section>`;
}
function pondForm() {
  const p = draft.pond;
  return `<div class="fields">${field("Site name", "name", draft.name, { required: true })}${field("Your name", "owner", draft.owner, { required: true })}${field("Homepage subtitle", "homeSubtitle", draft.homeSubtitle, { required: true, full: true })}${field("Directory introduction", "directorySubtitle", draft.directorySubtitle, { required: true, full: true })}</div><section class="repeat-list" aria-labelledby="sound-heading"><h3 id="sound-heading">Your voice quacks</h3><p class="hint">Your four recordings play at their natural pitch. Visitors can mute them, and the pond stays quiet while the journal is open.</p><div class="field"><label for="quack-volume">Quack volume</label><div class="sound-control"><input id="quack-volume" name="pond.quackVolume" type="range" min="0" max="100" value="${Math.round(p.quackVolume * 100)}" aria-describedby="volume-output"/><output id="volume-output" for="quack-volume">${Math.round(p.quackVolume * 100)}%</output></div><button type="button" class="secondary" id="test-quack">Play a sample quack</button></div><div class="fields">${field("Shortest gap · seconds", "pond.quackIntervalMin", p.quackIntervalMin, { type: "number", min: 10, max: 600, required: true })}${field("Longest gap · seconds", "pond.quackIntervalMax", p.quackIntervalMax, { type: "number", min: 10, max: 900, required: true })}</div><p class="hint">Each call waits a random interval within this range. The current default is 35 to 60 seconds.</p></section>`;
}
async function save() {
  clearError();
  if (!$<HTMLFormElement>("#editor-form").reportValidity()) return;
  const data = structuredClone(collect());
  setBusy(true);
  try {
    state.snapshot!.site = await api("site", {
      data,
      revision: state.snapshot!.site.revision,
    });
    setDirty(false);
    renderSettings();
    $(".editor-toolbar h3").focus();
    status("Saved site settings. Local preview updated.");
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}
let sample: HTMLAudioElement | undefined;
async function testQuack() {
  const button = $<HTMLButtonElement>("#test-quack");
  button.disabled = true;
  button.textContent = "Playing…";
  sample?.pause();
  sample = new Audio("/audio/quack-01.mp3");
  sample.volume =
    Number($<HTMLInputElement>('[name="pond.quackVolume"]').value) / 100;
  const done = () => {
    button.disabled = false;
    button.textContent = "Play a sample quack";
  };
  sample.onended = done;
  try {
    await sample.play();
    status("Sample uses the volume shown above. Save to apply it to the pond.");
  } catch {
    done();
    showError(
      new Error(
        "The sample could not play. Check your browser audio settings and try again.",
      ),
    );
  }
}
export const stopSample = () => {
  sample?.pause();
};
