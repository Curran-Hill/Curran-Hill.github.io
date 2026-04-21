# Site Workflow

## Writing Posts

Posts live in `_posts/`. Use Obsidian with the vault set to `_posts/`.

Templates are in `_posts/Templates/`:
- `YYYY-MM-DD-HTB-title.md` — for HTB write-ups
- `YYYY-MM-DD-blog-title.md` — for blog posts

### HTB Post Frontmatter
```yaml
---
layout: post
title: Box Name
date: YYYY-MM-DD
categories: htb
difficulty: Easy | Medium | Hard | Insane
os: Linux | Windows
tags:
  - Tag1
  - Tag2
thumbnail: assets/images/htb_imgs/BoxName/thumbnail.png
---
```

### Blog Post Frontmatter
```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
categories: blog
tags:
  - Tag1
---
```

### To suppress a draft without deleting it
Add `published: false` to the frontmatter.

---

## Local Development (no publishing)

```bash
bundle exec jekyll serve
```

Site runs at `http://localhost:4000`. Live-reloads on file save.

First time only (install dependencies):
```bash
bundle install
```

---

## Publishing

```bash
git add .
git commit -m "your message"
git push origin main
```

GitHub Actions builds and deploys automatically. Live within ~1-2 minutes at `https://Curran-Hill.github.io`.
