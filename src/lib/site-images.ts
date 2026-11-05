import path from "node:path";
import { imageUrl, renderMarkdown } from "./content.ts";
import type { SiteData } from "./site-schema.ts";
export const siteImageSource = path.join(
  process.cwd(),
  "_posts",
  "site-profile.md",
);
export const siteImage = (reference: string) =>
  imageUrl(reference, siteImageSource);
export async function prepareSiteAssets(site: SiteData, root = process.cwd()) {
  for (const row of [...site.about.certifications, ...site.about.awards])
    if (row.image)
      imageUrl(row.image, path.join(root, "_posts/site-profile.md"), root);
  await renderMarkdown(
    site.about.body,
    path.join(root, "_posts/site-profile.md"),
    root,
  );
}
