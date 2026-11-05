import { updateHuntUI } from "./state";
updateHuntUI();
import { initArchive } from "./archive";
initArchive();

const dialog = document.createElement("dialog");
dialog.className = "lightbox";
dialog.setAttribute("aria-label", "Expanded image");
const close = document.createElement("button");
const closeIcon =
  document.querySelector<HTMLTemplateElement>("#image-close-icon");
if (closeIcon) close.append(closeIcon.content.cloneNode(true));
else close.textContent = "Close";
close.setAttribute("aria-label", "Close expanded image");
const image = document.createElement("img"),
  caption = document.createElement("p");
const status = document.createElement("p"),
  original = document.createElement("a"),
  retry = document.createElement("button");
status.className = "image-status";
status.setAttribute("role", "status");
original.className = "image-original";
original.textContent = "Open original image";
retry.className = "image-retry text-button";
retry.textContent = "Try again";
retry.hidden = true;
dialog.append(close, status, image, caption, retry, original);
document.body.append(dialog);
let previousFocus: HTMLElement | null = null;
function loadImage(src: string) {
  image.hidden = false;
  retry.hidden = true;
  status.hidden = false;
  status.textContent = "Loading image…";
  dialog.setAttribute("aria-busy", "true");
  image.src = src;
}
image.addEventListener("load", () => {
  status.hidden = true;
  dialog.removeAttribute("aria-busy");
  if (document.activeElement === retry) close.focus();
});
image.addEventListener("error", () => {
  image.hidden = true;
  retry.hidden = false;
  status.hidden = false;
  status.textContent =
    "Image couldn’t load. Try again or open the original image.";
  dialog.removeAttribute("aria-busy");
});
function openImage(src: string, alt: string) {
  previousFocus = document.activeElement as HTMLElement;
  image.alt = alt;
  caption.textContent = alt;
  original.href = src;
  dialog.showModal();
  loadImage(src);
  close.focus();
}
retry.addEventListener("click", () => loadImage(original.href));
close.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  )
    dialog.close();
});
dialog.addEventListener("close", () =>
  previousFocus?.focus({ preventScroll: true }),
);
document
  .querySelectorAll<HTMLAnchorElement>("[data-expand-image]")
  .forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      openImage(link.href, link.dataset.alt || "Screenshot");
    });
  });
const copyStatus = document.createElement("p");
copyStatus.className = "sr-only";
copyStatus.setAttribute("role", "status");
document.body.append(copyStatus);
document
  .querySelectorAll<HTMLElement>(".article-body pre")
  .forEach((pre, index) => {
    // Keep the copy action outside the horizontally scrolling code region.
    const block = document.createElement("div"),
      toolbar = document.createElement("div");
    block.className = "code-block";
    toolbar.className = "code-toolbar";
    const label = document.createElement("span"),
      button = document.createElement("button");
    label.textContent = "Code";
    button.textContent = "Copy code";
    button.setAttribute("aria-label", `Copy code block ${index + 1}`);
    pre.tabIndex = 0;
    pre.setAttribute("role", "region");
    pre.setAttribute(
      "aria-label",
      `Code block ${index + 1}, scroll horizontally to read`,
    );
    pre.before(block);
    toolbar.append(label, button);
    block.append(toolbar, pre);
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Copying…";
      try {
        await navigator.clipboard.writeText(
          pre.querySelector("code")?.textContent || "",
        );
        button.textContent = "Copied";
        copyStatus.textContent = `Code block ${index + 1} copied to clipboard`;
      } catch {
        button.textContent = "Code selected";
        const range = document.createRange();
        range.selectNodeContents(pre.querySelector("code") || pre);
        getSelection()?.removeAllRanges();
        getSelection()?.addRange(range);
        copyStatus.textContent =
          "Clipboard unavailable. Code selected; press Control C or Command C to copy.";
      } finally {
        button.disabled = false;
        setTimeout(() => {
          button.textContent = "Copy code";
          copyStatus.textContent = "";
        }, 2200);
      }
    });
  });
