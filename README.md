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

The **first** build processes every image (WebP at several widths) and can take a few minutes. Results are cached in `.cache/`, so later builds are quick.
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
| **Disciplines** | Name, short name, symbol, optional box colour for the School of Design page, **Pages live** switch (see below), banners, intro, video and the **carousel**. |
| **Events** | Poster, top-menu and footer labels, dates, description, dates banner, **carousel**, YouTube/Vimeo address. |
| **Pages** | Front page (including the walkthrough video on/off switch), About the School of Design, All Graduates and Events banners, Archive menu links. |
| **Design → Colour palette** | Colour pickers for every colour on the site, plus four optional ones (carousel caption background/text, `dark-text`, `cream-text`) that stay unset unless you fill them in. |
| **Design → Custom CSS** | A CSS code box loaded after everything else, for small style tweaks without touching code. Empty by default. |
| **Design → Typography** | Heading font and body font (23 choices). From Google fonts. |
| **Design → SEO & head code** | A code window whose contents go in the `<head>` of every page. To help with SEO and accessibility. |
| **Site settings** | Site name, description, logos, footer note, social links. |

**Carousel on/off:** Disciplines or Events → pick one → **Show the carousel on this page**. Off = hidden (the slides are kept). There's also an "advance automatically" option with a pause button; automatic advance is ignored for visitors who have "reduce motion" switched on.

**Pages live (disciplines):** every discipline appears in the menus, footer and the School of Design page, exactly as in Maxis' design. A discipline's own graduates page and About page are only built once its **Pages live** switch is on; until then those links lead nowhere, as they did on the original site. Communication Design is live; Fashion, Product and Postgraduate are waiting for content.

**Dates banners:** in the title, a new line is a line break on desktop only. In the details, a new line is a line break, and `//` is a line break on phones only (matching Maxis' markup).

**SEO:** page titles, descriptions, canonical links and social-share tags are generated for every page. Set the **Site web address** in Site settings for canonical links, and use the code window for anything extra (JSON-LD, og:image, verification tags, analytics). Anything pasted there is added to every page exactly as written, so it's for trusted admins only.

**Fonts:** chosen fonts are built into the site and served from our own server (nothing is requested from Google). Both `latin` and `latin-ext` are included, so macrons (ā ē ī ō ū) display correctly in every font on the list.

### Images
Editors upload normal images (any size). The build makes WebP versions at **400, 800, 1200, 1600 and 2000 px wide** (never enlarged beyond the original; transparency is kept), writes `width`/`height` so there is no layout jump, and the browser downloads only the size it needs. The page markup stays exactly as Maxis wrote it (plain `<img>` tags). Keep originals **at least 2000 px wide** for full-width banners.
Add a description (alt text) for every image in the dashboard, for people using screen readers.

The front-page logo animations are SVG files and are used as they are. Their embedded textures were converted from PNG to WebP (23 MB → 6 MB each), and each visitor downloads only the version for their screen size.

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
  _data/                         site settings, colours.json, typography.json, seo.json, front page, banners, archive links
  _includes/layouts/             page layouts (graduate, event, school of design, base)
  _includes/partials/            header, footer, carousel, dates banner, video, student grid, SEO head
  images/                        site-wide images (logos, logo animations, placeholders)
  css/stylesheet.css             Maxis' stylesheet (see docs/CHANGES-FROM-STUDENT-SITE.md)
  css/base.css                   one image rule, loaded before the stylesheet
  css/carousel.css               the carousel (styled to match Flickity)
  css/icons.css                  Material Symbols icon font (menu / close / dropdown arrows)
  css/design.css.njk             GENERATED from colours + typography (don't edit design.css)
  fonts/                         the cut-down Material Symbols font
  js/                            main.js (menus), carousel.js, lightbox.js
  admin/config.txt               the dashboard definition (.txt because SiteGround blocks .yml)
lib/                             font + helper code
```

**Adding a discipline:** Disciplines → New. Give it a *web address key* (lowercase, e.g. `textiles`); it appears in the menus, footer and School of Design page straight away, and its own pages once **Pages live** is on. (The School of Design grid colours come from Maxis' CSS, which colours the first four boxes.)
**Adding a new colour to the palette:** add a `widget: "color"` field in `src/admin/config.txt` (Design → Colour palette) and a matching default in `src/_data/colours.json`; then use `var(--your-name)` in the CSS.
**Adding a font:** `npm install @fontsource-variable/<name>`, add a line to `FONTS` in `lib/fonts.js`, and add the same value to the two font lists in `src/admin/config.txt`.

---

## Going live (later;)

1. **Repo:** done: `OP-school-of-design/debrief-2026` (already set as `backend.repo` in `src/admin/config.txt`).
2. **Site address:** the GitHub repository variable `SITE_BASE` is `/debrief/2026/`. When building locally for upload, use `SITE_BASE=debrief/2026 npm run build` (PowerShell: `$env:SITE_BASE="debrief/2026"; npm run build`).
3. **Dashboard login (OAuth):** Decap's GitHub login needs a small OAuth helper when you're *not* on Netlify. A free Cloudflare Worker (`sveltia-cms-auth`) does the job; add `base_url: https://YOUR-WORKER.workers.dev` under `backend` in `src/admin/config.txt`. Faculty staff then need GitHub accounts with write access to the repo.
4. **Approval workflow:** add `publish_mode: editorial_workflow` at the top level of `src/admin/config.txt`. Staff save as **Draft**, move to **In review**, and an admin moves it to **Ready** to publish. It needs the GitHub login above (not available locally).
5. **Site web address:** set it in the dashboard (Site settings) to `https://design.ac.nz/debrief/2026` for canonical links.
6. **Deploy to SiteGround:** in SiteGround Site Tools create an FTP account limited to the target folder. In GitHub → Settings → Secrets add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`; add variables `FTP_SERVER_DIR` (`/` when the FTP account is limited to the site folder, as ours is) and `DEPLOY_ENABLED` = `true`. The workflow (`.github/workflows/deploy.yml`) then builds and uploads on every push to `main`. It's set to FTPS; the deploy step is written to the action's documentation but hasn't been run against your server, so watch the first run.

---

## What was changed from the Maxis' site
See [docs/CHANGES-FROM-STUDENT-SITE.md](docs/CHANGES-FROM-STUDENT-SITE.md).

## Licences
Site code: see `LICENSE`. Fonts: SIL Open Font Licence (via Fontsource). Icons: Font Awesome Free 6.5.2 (icons CC BY 4.0, fonts SIL OFL; attribution in `fontawesome/css/all.min.css`) and Material Symbols (Apache 2.0).
