# Edit DuckP0nd in your browser

From this project folder, run:

```sh
npm run admin
```

Open the **Pond keeper** URL printed in the terminal. The editor is at `/admin/` on the local development server. The current editor uses http://127.0.0.1:4323/admin/ and saves into the connected `outputs/duckpond-release` checkout. Use that checkout for publishing and future editing; see [PUBLISHING.md](PUBLISHING.md). You can also use `/admin/` while `npm run dev` is running. Node 24 or newer and the existing `npm ci` dependencies are sufficient; no additional service, login or package is needed.

## What you can edit

- **Posts:** create or edit HTB write-ups, CTF write-ups and blog entries, search your library, set tags and category-specific metadata, and preview Markdown before saving.
- **About & awards:** introduction, certifications, completion/expiry text, awards, descriptions and certificate images. Expand **Image attached** or **Add an image** for paths, descriptions, upload and dimensions.
- **Contact:** introduction, closing note and contact links/icons.
- **Pond settings:** site/owner names, homepage/directory text, quack volume and random intervals. **Play a sample quack** lets you hear the selected level before saving. Your four original recordings retain their natural pitch and speed.

Use **Save changes** or Ctrl/Cmd+S. The green Save button stays visible as you scroll a long form. New post dates use your local calendar day. A successful save updates the files and the local website preview. **View page**, **View pond**, and the saved-post link open a separate tab, keeping your editor open.

## Posts, drafts and images

New posts start as drafts. Leave **Include in published site** unchecked until ready. Drafts and future-dated posts appear only in local development and stay out of the production site, feed and sitemap. This checkbox prepares a post for the next build; it does not publish anything online.

The post body uses ordinary Markdown. The Heading, Bold, Link and Code buttons insert syntax at the cursor. Upload or paste an image into the body to save it in the shared Obsidian attachments folder and insert a Markdown reference. PNG, JPEG, WebP and GIF up to 12 MB are supported. Add useful image descriptions. Filenames with spaces are retained; identical uploads are reused and different images with the same name receive a suffix. Existing Obsidian embeds such as `![[Attachments/screenshot.png]]` continue to work.

**Preview reading view** renders current unsaved text, code highlighting and images in a sandboxed reading area. **Open saved post in local site** shows the real field-journal page, including heading navigation, code copying and expandable images. Save first to update that page. The internal reading preview intentionally does not run embedded scripts or follow links.

Posts remain `.md` files in `_posts`; Obsidian and the existing `npm run new` workflow still work. The editor preserves extra frontmatter such as `layout` and custom fields. Existing filenames, capitalization and article addresses remain stable. If category/date changes would alter a published URL, the editor retains the previous address using `permalink`.

## Avoid losing work

Switching posts or sections asks before discarding unsaved text. Closing/reloading the tab uses the browser's unsaved-change prompt. **Keep editing** and Escape cancel; **Discard changes** continues. **Reload file** reads changes made in Obsidian.

A save checks whether the original file has changed on disk. If it has, the save is refused and your unsaved form stays intact. Copy anything you need to retain, reload the disk version, and combine the edits before saving again. There is no autosave that can overwrite another editor.

Every overwritten file is copied first to `.editor-backups/` in the project. Backup names contain the timestamp and original basename. To recover, stop editing that file, copy the desired backup over the corresponding `_posts/...md` or `_data/site.json` file, then use **Reload file**. Backups are private local recovery files: excluded from Git, source delivery archives and static output. They do not include a copy of every uploaded image. Files are never deleted by the panel.

## Publishing

Saving in Pond keeper changes this isolated project copy only. Your live domain still updates through the existing GitHub Pages workflow:

```sh
npm run check
npm test
npm run build
```

Review and commit the changes, then push to the existing site's repository when ready. The connected `duckpond-release` checkout has the verified GitHub remote and an uncommitted release branch. The earlier `duckpond` review copy still has no remote. Neither has been deployed. The original `/home/ducky/Site` and rollback archive are preserved.

## Local operation and limits

The editor accepts only loopback Host/client addresses and same-origin requests; writes also require a per-server token and revision hash. It is a local development tool, not an online account system. `/admin/`, its API, source settings and backups are absent from `dist/`. Public pages continue to work independently of the editor and without JavaScript.

`npm run admin` tolerates content-check errors so you can repair a post's title/date/category in the form. Invalid YAML syntax or a manually broken site JSON document still needs correction in a text editor using the named file. Missing images and invalid metadata prevent saving and report the affected file/reference. Keep the folder structure intact.

Artwork, sprite geometry, pond boundaries and page/component structure remain source-code edits. Changing voice recordings themselves still uses the documented workflow in `AUDIO.md`; this panel controls their playback level and intervals.
