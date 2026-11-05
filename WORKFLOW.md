# Writing and publishing

See [README.md](README.md) for setup, Obsidian screenshots, draft previews, frontmatter, and deployment.

For browser editing, run `npm run admin` and follow [EDITING.md](EDITING.md). It saves the same files and supports About, awards, Contact and pond settings. Publishing still follows steps 5–6 below; [PUBLISHING.md](PUBLISHING.md) gives exact commands for the connected release checkout.

1. Open `_posts` as your Obsidian vault.
2. Create a post with `npm run new -- htb "Box Name"` (or `ctf` / `blog`).
3. Write Markdown and paste screenshots normally.
4. Run `npm run dev` to preview the draft and check its images. Saving notes or pasting images refreshes the preview automatically.
5. Set `published: true`, then run `npm run check`, `npm test`, and `npm run build`.
6. Commit and push to the existing GitHub repository when ready. The configured Pages workflow publishes pushes to `main`.

Existing published filenames and dates determine their URLs. Keep them stable. Personal Obsidian workspace files, templates, and drafts are excluded from the website output. Drafts committed to the public GitHub repository are still readable on GitHub. The production build also checks every local page, image, and heading link.
