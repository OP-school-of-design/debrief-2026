# DEBRIEF 2026 – Otago Polytechnic School of Design graduate showcase

Maxis' hand-coded site, converted to [Eleventy](https://www.11ty.dev) with a [Decap CMS](https://decapcms.org) dashboard.
No database and no server: content lives as small files in this repo, the site builds to plain HTML, and a dashboard at `/admin/` lets faculty staff edit it.
The site will be hosted via Siteground to maintain consistency with the address https://design.ac.nz/debrief/2026

Kia ora! Start with **Quick start**, then have a poke around the dashboard.

---

## Quick start (local testing)

You need [Node.js 22 or newer](https://nodejs.org).

```bash
npm install          # once
npm run dev          # runs the site AND the dashboard server together
```

* Site: <http://localhost:8080>
* Dashboard: <http://localhost:8080/admin/> (no login when running locally: it edits the files on your computer directly)

Prefer two terminals? `npm start` (site) and `npm run cms` (dashboard server).

The **first** build processes every image (AVIF, WebP and JPEG/PNG at several widths) and can take a few minutes. Results are cached in `.cache/`, so later builds are quick.
While `npm start` is running, images are processed on request, so it starts fast.

| Command | What it does |
|---|---|
| `npm start` | Dev server with live reload |
| `npm run build` | Full build into `_site/` (this is what gets deployed, i.e. the files in the folder '_site' are all html/css/js ) |
| `npm run cms` | Local dashboard server (Decap) |
| `npm run check` | Lists any file names with capitals or spaces |
| `npm run clean` | Deletes `_site/` and the image cache, a reset before attempting an new build (not necessary every time, just in case of build problems) |

---

## What's in the dashboard

| Section | What staff/admin can do |
|---|---|
| **Graduates** | Add/edit graduates: discipline (dropdown), block order (**Project first** or **Profile first** — both show the same information, just in a different order), card image, hero image, headshot, gallery images, links, quote, bio. Untick **Published** to hide someone without deleting them. |
| **Disciplines** | Name, colour, symbol, banner, intro, and the **carousel** (see below). |
| **Events** | Poster, description, image, YouTube/Vimeo address. |
| **Pages** | Front page, About the School of Design, Events banner, Archive links. |
| **Design → Colour palette** | Colour pickers for every colour on the site. |
| **Design → Typography** | Heading font and body font (23 choices). From Google fonts. |
| **Design → SEO & head code** | A code window whose contents go in the `<head>` of every page. To help with SEO and accessibility. |
| **Site settings** | Site name, description, logos, footer note, social links. |

**Carousel on/off:** Disciplines → pick one → **Show the carousel on this discipline's page**. Off = hidden (the slides are kept). There's also an "advance automatically" option with a pause button; automatic advance is ignored for visitors who have "reduce motion" switched on.

**SEO:** page titles, descriptions, canonical links and social-share tags are generated for every page. Set the **Site web address** in Site settings for canonical links, and use the code window for anything extra (JSON-LD, og:image, verification tags, analytics). Anything pasted there is added to every page exactly as written, so it's for trusted admins only.

**Fonts:** chosen fonts are built into the site and served from our own server (nothing is requested from Google). Both `latin` and `latin-ext` are included, so macrons (ā ē ī ō ū) display correctly in every font on the list.

### Images
Editors upload normal images (any size). The build makes AVIF + WebP + original-format versions at **400, 800, 1200, 1600 and 2000 px wide** (never enlarged beyond the original), writes `width`/`height` so there is no layout jump, and the browser downloads only the size it needs. Keep originals **at least 2000 px wide** for full-width banners. Logos and symbols stay PNG (they need transparency).
Every image needs a description (alt text) in the dashboard; the build stops if one is missing.

### File names
Use **lowercase-with-hyphens** (`aroha-portrait.jpg`, not `Aroha Portrait.JPG`). Windows and Mac ignore capitals; the live server doesn't, and a mismatch means a broken image. `npm run build` warns about any offenders.

---

## Folder guide

```
src/
  graduates/<name>/index.md      one folder per graduate: text + their images together
  disciplines/<key>/index.md     one folder per discipline (carousel slides live here too)
  events/<name>/index.md         one folder per event
  pages/                         page templates + About the School content
  _data/                         site settings, colours.json, typography.json, seo.json, front page, archive
  _includes/layouts/             page layouts (graduate, event, school of design, base)
  _includes/partials/            header, footer, carousel, student grid, SEO head
  css/stylesheet.css             the students' stylesheet (see docs/CHANGES-FROM-STUDENT-SITE.md)
  css/additions.css              carousel, icons, image handling, accessibility
  css/design.css.njk             GENERATED from colours + typography (don't edit design.css)
  js/                            main.js, carousel.js, lightbox.js, masonry-grid-script.js
  admin/config.yml               the dashboard definition
lib/                             font + helper code
```

**Adding a discipline:** Disciplines → New. Give it a *web address key* (lowercase, e.g. `textiles`) and a colour; it appears in the menus, footer, grids and About pages automatically.
**Adding a new colour to the palette:** add a `widget: "color"` field in `src/admin/config.yml` (Design → Colour palette) and a matching default in `src/_data/colours.json`; then use `var(--your-name)` in the CSS.
**Adding a font:** `npm install @fontsource-variable/<name>`, add a line to `FONTS` in `lib/fonts.js`, and add the same value to the two font lists in `config.yml`.

---

## Going live (later;)

1. **New repo:** in this folder run `git init`, commit, create an *empty* repo on GitHub, then `git remote add origin <url>`, `git branch -M main`, `git push -u origin main`. Your students' original repo is never touched.
2. **Point the dashboard at it:** in `src/admin/config.yml` set `backend.repo` to `your-account/your-new-repo`.
3. **Dashboard login (OAuth):** Decap's GitHub login needs a small OAuth helper when you're *not* on Netlify. A free Cloudflare Worker or similar does the job; put its address in `backend.base_url` in `config.yml`. Faculty staff then need GitHub accounts with write access to the repo.
4. **Approval workflow:** uncomment `publish_mode: editorial_workflow` in `config.yml`. Staff save as **Draft**, move to **In review**, and an admin moves it to **Ready** to publish. It needs the GitHub login above (not available locally).
5. **Site address:** if the site lives in a sub-folder (e.g. `https://design.ac.nz/debrief/2026/`), add a GitHub repository *variable* `SITE_BASE` = `/debrief/2026/`, and set **Site web address** in the dashboard to the full address.
6. **Deploy to SiteGround:** in SiteGround Site Tools create an FTP account limited to the target folder. In GitHub → Settings → Secrets add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`; add variables `FTP_SERVER_DIR` (e.g. `/public_html/debrief/2026/`) and `DEPLOY_ENABLED` = `true`. The workflow (`.github/workflows/deploy.yml`) then builds and uploads on every push to `main`. It's set to FTPS; the deploy step is written to the action's documentation but hasn't been run against your server, so watch the first run.

---

## What was changed from the Maxis' site
See [docs/CHANGES-FROM-STUDENT-SITE.md](docs/CHANGES-FROM-STUDENT-SITE.md).

## Licences
Site code: see `LICENSE`. Fonts: SIL Open Font Licence (via Fontsource). Icons: Font Awesome Free (CC BY 4.0) – attribution is in the footer markup.
