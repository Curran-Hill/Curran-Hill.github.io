import "./editor.css";
import {
  $,
  canLeave,
  clearError,
  icon,
  refresh,
  setDirty,
  showError,
  state,
  status,
} from "./ui";
import { renderPosts } from "./posts";
import { renderSettings, stopSample } from "./settings";

document
  .querySelectorAll<HTMLElement>("[data-icon]")
  .forEach((el) => (el.innerHTML = icon(el.dataset.icon!)));
function render() {
  if (state.section === "posts") renderPosts();
  else renderSettings();
  $("#content").setAttribute("aria-busy", "false");
}
document.querySelectorAll<HTMLButtonElement>("[data-section]").forEach(
  (button) =>
    (button.onclick = () => {
      void (async () => {
        if (button.dataset.section === state.section || state.busy) return;
        if (!(await canLeave())) return;
        if (state.dirty && state.section === "posts") state.post = null;
        stopSample();
        state.section = button.dataset.section!;
        clearError();
        setDirty(false);
        document
          .querySelectorAll("[data-section]")
          .forEach((b) => b.removeAttribute("aria-current"));
        button.setAttribute("aria-current", "page");
        render();
        $("#section-title").focus();
      })().catch(showError);
    }),
);
window.addEventListener("beforeunload", (event) => {
  if (state.dirty) {
    event.preventDefault();
  }
});
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    if (state.dirty && !state.busy)
      $<HTMLFormElement>("#editor-form")?.requestSubmit();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopSample();
});
void refresh()
  .then(() => {
    render();
    status("Choose a post or a section to edit.");
  })
  .catch((error) => {
    $("#content").setAttribute("aria-busy", "false");
    showError(error);
    status(
      "Could not open the content files. Correct the file named above and reload.",
    );
  });
