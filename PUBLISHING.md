# Publish DuckP0nd and edit it afterward

The audited release checkout is:

```text
/home/ducky/Documents/Codex/2026-11-04/this-is-my-current-website-https/outputs/duckpond-release
```

It is connected to **https://github.com/Curran-Hill/Curran-Hill.github.io** on a local `duckpond-16bit` branch, based on the repository's existing `main`. The changes are uncommitted for your review. No branch, pull request, commit, setting or deployment has been sent to GitHub by Codex. The original `/home/ducky/Site`, review source and rollback archive remain separate.

## First release

Open a terminal and run:

```sh
cd /home/ducky/Documents/Codex/2026-11-04/this-is-my-current-website-https/outputs/duckpond-release

git status --short
git diff --stat
```

The deletion of the old Jekyll workflow, layouts, Ruby files and generated `_site` copies is intentional. Their source remains in GitHub's history. Original article Markdown and public image URLs are preserved; the original images now live under `public/assets/images`. Personal Obsidian workspace state, local backups, generated attachments and `node_modules` are excluded from the release.

The audit ran the checks below. Run them again if you make changes before publishing (Node 24 or newer is required):

```sh
npm run check
npm test
npm run build
```

On a fresh clone or extracted source archive, first run `npm ci`. Review the site with `npm run admin` and the URL it prints; the local editor is at `/admin/` on that server. `npm run preview -- --port 4322` serves a production build if that port is free; use another port if your existing review preview is still running.

When the diff is ready, create the release commit and push the feature branch:

```sh
git add -A
git diff --cached --stat
git commit -m "Reimagine DuckP0nd as a 16-bit pond"
git push -u origin duckpond-16bit
```

Use the GitHub account that can write to `Curran-Hill/Curran-Hill.github.io`. If authentication is needed, sign in with `gh auth login` and configure Git with `gh auth setup-git`. Use your preferred commit identity if Git asks for a name/email. Do not force-push or replace the repository's history.

1. Open **https://github.com/Curran-Hill/Curran-Hill.github.io/compare/main...duckpond-16bit?expand=1** and create a pull request into `main`.
2. Wait for **Build and deploy DuckP0nd → build** to pass. Pull requests build and test the static site; they do not deploy it.
3. In **Settings → Pages**, verify Source is **GitHub Actions**, Custom domain is **www.duckp0nd.com**, and **Enforce HTTPS** is enabled when available. The existing site already uses an Actions workflow. Preserve its existing DNS; switching from Jekyll to Astro does not require changing the domain's DNS.
4. **Squash and merge** the pull request. This gives the initial migration one commit that is easy to revert.
5. In **Actions → Build and deploy DuckP0nd**, wait for both `build` and `deploy` to turn green on `main`.
6. Open **https://www.duckp0nd.com/**. Check the five destinations, both old article links, images, quacks after a click, and a phone layout. The editor should not exist on the public domain.

`public/CNAME` and Astro canonical metadata retain the production domain. With an Actions publishing source, the actual custom-domain setting is maintained in GitHub Pages settings; the CNAME file alone does not configure that setting. No separate deployment token is needed: the deploy job uses GitHub's built-in `GITHUB_TOKEN` with Pages/OIDC permissions.

## Use the editing site

Before the first release, the review editor is at **http://127.0.0.1:4323/admin/**. It now saves into the connected release checkout above. After merging, bring that same checkout onto `main`:

```sh
cd /home/ducky/Documents/Codex/2026-11-04/this-is-my-current-website-https/outputs/duckpond-release
git switch main
git pull --ff-only
npm run admin
```

Open the **Pond keeper** URL printed in the terminal. It normally uses port 4321, but an already-running editor may use 4323 or another printed port. Bookmark the printed URL. The server must be running on this computer; `duckp0nd.com/admin/` is not an editing login.

- **Posts:** choose an existing entry or **New post**. Set title, date, section and tags; write Markdown in the body. Upload/paste images, then use **Preview reading view**. **Open saved post in local site** opens the complete journal page.
- **About & awards:** edit your introduction, credentials and awards. Expand **Image attached / Add an image** to change certificate images and descriptions.
- **Contact:** update text, links and icons.
- **Pond settings:** update homepage text, quack volume and gaps. **Play a sample quack** previews the selected level.

Use **Save changes** or **Ctrl/Cmd+S**. Saving updates local files and the local preview. It does **not** update the live domain. New posts start as drafts; select **Include in published site** when ready for the next production build. Future-dated posts stay excluded until a build on/after their date (the build compares dates in UTC); there is no automatic scheduled rebuild. Draft exclusion applies to the website output: any Markdown committed to this **public** GitHub repository remains readable on GitHub, so keep private notes outside this repository.

Use this release checkout as your regular working folder. Opening `_posts` there as your Obsidian vault edits the same files as Pond keeper. Avoid editing the earlier isolated `outputs/duckpond` copy after publishing, because that copy has no GitHub remote.

## Publish later edits

Start with a clean, updated `main`, then make a small content branch:

```sh
git switch main
git pull --ff-only
git switch -c update-field-notes
npm run admin
```

After editing and saving:

```sh
npm run check
npm test
npm run build
git add -A
git diff --cached --stat
git commit -m "Update field notes"
git push -u origin update-field-notes
```

Open a pull request into `main`, wait for the build, merge, and wait for deployment. Choose a new branch name for each update if the previous name still exists. This flow keeps local drafts and public release decisions separate.

If you prefer direct pushes after the initial migration, saving on an up-to-date `main`, committing and running `git push origin main` triggers the same deployment; it publishes as soon as the checks pass. The pull request flow gives you a review step first.

## Conflicts, recovery and stopping

If the editor reports an external edit, your unsaved text remains in the form. Copy anything you need to retain, then **Reload file**, combine the changes and save again. Do not overwrite an Obsidian edit blindly. Every overwritten file has a local backup in `.editor-backups/`; see `EDITING.md` for restoration.

To stop the editor from this checkout:

```sh
node scripts/astro.mjs dev stop
```

A foreground server can also be stopped with Ctrl+C. `npm run admin` starts it again.

## Roll back a release

For later content changes, revert the offending commit on a branch and merge the revert; the normal build/deploy workflow publishes it.

For the initial migration, find its squash commit in GitHub's history and revert that commit:

```sh
git switch main
git pull --ff-only
git switch -c rollback-pond
git revert THE_MIGRATION_SQUASH_COMMIT_SHA
git push -u origin rollback-pond
```

Open and merge a pull request for the revert. This restores the original source and Jekyll workflow together. Watch the restored Jekyll deployment finish. Reverting the migration restores the **pre-migration** site; preserve any later content you need before rolling the entire migration back. Leave the domain/DNS settings intact. Never use a force-push or `git reset --hard` on production history for rollback.

## References and audit scope

- [GitHub: custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub: custom-domain settings](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Astro: GitHub Pages deployment](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub CLI authentication](https://cli.github.com/manual/gh_auth_login)

Local checks and a read-only comparison with current GitHub `main` were completed. The actual hosted Actions run, Pages environment permissions and final domain response after release can only be confirmed when you publish; they were not changed during the audit. See `FINAL-AUDIT.md` and `VERIFICATION.md` for exact results and limits.
