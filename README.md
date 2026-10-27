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
| **Graduates** | Add/edit graduates: discipline (dropdown of the graduate categories, in menu order), block order (**Project first** or **Profile first** — both show the same information, just in a different order), card image, hero image, headshot, gallery images, links, quote, bio. Untick **Published** to hide someone without deleting them. Images are optional until supplied, so the text can go in first: the grids show a plain grey card and a grey head-and-shoulders headshot until they're added, and a graduate's page simply has no hero image until one is added. Uploads are limited to 10 MB. Graduates are listed in alphabetical order of last name: the last word of the name, with a prefix such as Te, van or de (Aria Te Rangi is listed under Te Rangi). Where that is wrong, fill in **Last name (for alphabetical order)**. |
| **Disciplines** | The graduate categories and the School of Design disciplines: name, where it appears (switches, see below), graduates-page banner, and for the School of Design side the symbol, box colour, About page, video and **carousel**. |
| **Events** | Poster, top-menu and footer labels, dates, description, dates banner, **carousel**, YouTube/Vimeo address. |
| **Pages** | Front page (including the walkthrough video on/off switch), About the School of Design, All Graduates page (title, also the menu label, and the optional banner; the grid lists every graduate in alphabetical order of last name), Events listing page (the banner on /events/; each event's own page is edited in Events), Archive menu links. |
| **Design → Colour palette** | Colour pickers for every colour on the site, plus four optional ones (carousel caption background/text, `dark-text`, `cream-text`) that stay unset unless you fill them in. |
| **Design → Custom CSS** | A CSS code box loaded after everything else, for small style tweaks without touching code. Empty by default. |
| **Design → Typography** | Heading font and body font (23 choices). From Google fonts. |
| **Site settings** | Site name, description, logos, **favicon**, footer note, social links. |

**Carousel on/off:** Disciplines or Events → pick one → **Show the carousel on this page**. Off = hidden (the slides are kept). There's also an "advance automatically" option with a pause button; automatic advance is ignored for visitors who have "reduce motion" switched on.

**Graduate categories (Disciplines):** Communication, Fashion and Product Design, the three Graduate Diplomas, Bachelor of Design (Honours) and Masters, in that order (the **Order** number). Each has its own graduates page at `/graduates/<key>/` with its own banner (**Graduates page: banner image**; a placeholder is used until one is added). The switches on each one:
* **Show in the All Graduates menu**: it's a graduate category (top menu, footer, its own page, and the graduate Discipline dropdown).
* **Only show when it has published graduates**: on (the default) for the Graduate Diplomas, Honours and Masters, and marked "(only shown when it has published graduates)" in the Disciplines list. The menu item, footer link and page exist only while at least one *published* graduate is in that category, and disappear again on the next build if they're all removed or unpublished.
* **Show on the School of Design page**: Communication, Fashion and Product (its coloured boxes and "About ..." menu). **About page live** switches on that discipline's About page; Communication's is live.

Adding a new graduate category: add it in Disciplines, then add the same name and key to the graduate Discipline list in `src/admin/config.txt` (a fixed list, so the dropdown keeps your order).

**Dates banners:** in the title, a new line is a line break on desktop only. In the details, a new line is a line break, and `//` is a line break on phones only (matching Maxis' markup).

**SEO:** page titles, descriptions, canonical links and social-share tags are generated for every page (`src/_includes/partials/head-seo.njk`). Set the **Site web address** in Site settings: share images and structured data need it.
* **Descriptions:** each entry's Meta description; when empty, one is written from the page (a graduate's name, discipline and project; an event's subtitle and dates; a discipline's introduction).
* **Share images** (link previews in messages, email, social media, and some search results), made at build time in `img/og/` by `lib/share.js`, 1200 × 630 and under 300 KB: a graduate's card image on the **Share image frame** (DEBRIEF yellow with the four shapes, `images/share-frame.jpg`), or their hero image; an event's whole poster on the frame; other pages their banner; anything else the **Share image** in Site settings (default: the first frame of the logo animation, `images/share-default.jpg`).
* **Structured data** (JSON-LD, `lib/seo.js`): graduates are profile pages of a person (with their links and project), every page has breadcrumbs, and events with the **Search listing** dates and venue filled in can appear in Google's event listings.
* **sitemap.xml** lists every public page; submit it in Google Search Console. `robots.txt` takes effect once the site is at the domain root.

Anything extra (verification tags, analytics) goes in `src/_includes/head-code.html`, edited in the repo rather than the dashboard because it runs on every page. Anything loaded from another website also needs adding to the security policy in `src/.htaccess` (see docs/SECURITY.md).

**Fonts:** chosen fonts are built into the site and served from our own server (nothing is requested from Google). Both `latin` and `latin-ext` are included, so macrons (ā ē ī ō ū) display correctly in every font on the list.

### Images
Editors upload normal images (any size). The build makes WebP versions at **400, 800, 1200, 1600 and 2000 px wide** (never enlarged beyond the original; transparency is kept), writes `width`/`height` so there is no layout jump, and the browser downloads only the size it needs. The page markup stays exactly as Maxis wrote it (plain `<img>` tags). Keep originals **at least 2000 px wide** for full-width banners.
Add a description (alt text) for every image in the dashboard, for people using screen readers.

The front-page logo animations are SVG files. Their two embedded greyscale textures are stored as lossless WebP with 16 grey levels, and the small-pattern texture at the size it's actually drawn (1600 px desktop, 1000 px phones): 6.2 MB → 2.0 MB (desktop) and 1.5 MB (phones), sent compressed (1.5 / 1.2 MB), with no visible difference side by side. One `<picture>` loads only the version for the screen, straight away; a tiny still of the first frame shows while it loads, and browsers keep the animation for a year (its link carries a content stamp, so a new upload is fetched at once). The stills in `images/stills/` are named after the SVG they belong to: a newly uploaded animation works straight away but has no still until new ones are made.

### Caching on SiteGround
`src/.htaccess` (deployed next to `index.html`) tells browsers and SiteGround to check for a newer copy of every page on each visit, and every CSS/JS link carries a version stamp that changes on each build (`src/_data/build.js`). Together these mean a deploy should show up without purging caches. If pages still look stale after a deploy, SiteGround's **NGINX Direct Delivery** (Site Tools → Speed → Caching) may be ignoring `.htaccess` for static files. Turning it off routes those files through `.htaccess`, but it applies to the whole design.ac.nz site, so check with whoever manages that first.

### Favicon
Site settings → **Favicon**. Upload a square PNG or SVG (at least 512 × 512 px) that still reads at tab size. The build makes a 32 px tab icon, a 192 px icon and a 180 px phone home-screen icon from it (into `/favicon/`). A see-through icon is put on white for phones, because phones show transparent icons on black. Clear the field to have no favicon. Browsers hold on to favicons, so a new one can take a refresh or two to appear in the tab.

### Image paths in the dashboard
Site-wide files (logos, page banners, the favicon, the walkthrough video) are stored without a leading slash, e.g. `images/landscape_placeholder.jpeg`. That lets the dashboard show their thumbnails; the templates add the slash back (the `siteImg` filter). `src/admin/image-thumbnail-fix.js` works around a Decap bug that otherwise left those thumbnails blank.

### Phone menu
When its sections are expanded, the phone/tablet menu can be taller than the screen; it scrolls on its own so everything (Events, Archive) can be reached, and the close button stays on top.

### Top menu spacing
The "All Graduates and Postgraduates" label is longer than Maxis' "All Graduates". Labels never wrap, and between 1171px and 1365px wide (just above the hamburger menu) the gaps and side padding are tightened so the menu still fits (`css/additions.css`). Wider than that, the spacing is exactly Maxis'.

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
  favicon/                       the favicon image chosen in Site settings (tab icons are made from it)
  css/stylesheet.css             Maxis' stylesheet (see docs/CHANGES-FROM-STUDENT-SITE.md)
  css/base.css                   one image rule, loaded before the stylesheet
  css/carousel.css               the carousel (styled to match Flickity)
  css/additions.css              new elements: plain page heading, menu spacing for the longer label
  css/icons.css                  Material Symbols icon font (menu / close / dropdown arrows)
  css/design.css.njk             GENERATED from colours + typography (don't edit design.css)
  fonts/                         the cut-down Material Symbols font
  js/                            main.js (menus), carousel.js, lightbox.js
  admin/config.txt               the dashboard definition (YAML). Built into admin/index.html, so the
                                 dashboard opens without fetching it (see src/_data/cmsconfig.js)
  admin/start.js                 starts the dashboard with those built-in settings; clearer loading messages
  admin/previews.js              the labelled preview panes (right-hand side while editing)
  admin/decap-3.16.3/            the dashboard's own code (Decap CMS), served from this site
  admin/.htaccess                the dashboard's security rules
  .htaccess                      caching, security headers, crawler and hotlink rules (docs/SECURITY.md)
  _includes/head-code.html       extra <head> code for every page (edit here, not in the dashboard)
  admin/image-thumbnail-fix.js   makes site-wide image thumbnails show in the dashboard
lib/                             font, favicon + helper code
```

**Adding a discipline:** Disciplines → New. Give it a *web address key* (lowercase, e.g. `textiles`); it appears in the menus, footer and School of Design page straight away, and its own pages once **Pages live** is on. (The School of Design grid colours come from Maxis' CSS, which colours the first four boxes.)
**Adding a new colour to the palette:** add a `widget: "color"` field in `src/admin/config.txt` (Design → Colour palette) and a matching default in `src/_data/colours.json`; then use `var(--your-name)` in the CSS.
**Bulk import of graduates** from the Microsoft Form: see `docs/IMPORTING-GRADUATES.md` (`npm run import`).

**Uploading several images at once:** in any image's "Choose an image" dialog, click Upload and select several files (Shift- or Cmd/Ctrl-click). They upload one after another; the first one picked ends up at the top, selected. They all stay in the dialog for that graduate's other image fields (`src/admin/multi-upload.js`).

**Responsive CSS:** Design > Responsive CSS has one box per screen size. Type only the rules; the build wraps each box in its `@media` block and adds it after Custom CSS, smallest screens first. A box with a missing `{` or `}` is left out (the preview says so) so it can't break the rest.

**Students' own typefaces:** in the dashboard, Design > Typography > Custom typefaces > Add typeface. Give it a name, upload the .woff2 (and .woff if you have it; never the original .otf/.ttf, which the site doesn't need), and list the CSS classes it should be used for, e.g. `student-quote-sn, student-quote` for graduate quotes. The files go to `src/fonts/custom/`; the build adds the `@font-face` and class rules to `css/design.css`. For anything finer (size, spacing, one page only), use the typeface's name in Custom CSS: `font-family: "AbbyHand";`.

**Adding a font:** `npm install @fontsource-variable/<name>`, add a line to `FONTS` in `lib/fonts.js`, and add the same value to the two font lists in `src/admin/config.txt`.

---

## Going live (later;)

1. **Repo:** done: `OP-school-of-design/debrief-2026` (already set as `backend.repo` in `src/admin/config.txt`).
2. **Site address:** the GitHub repository variable `SITE_BASE` is `/debrief/2026/`. When building locally for upload, use `SITE_BASE=debrief/2026 npm run build` (PowerShell: `$env:SITE_BASE="debrief/2026"; npm run build`).
3. **Dashboard login (OAuth):** Decap's GitHub login needs a small OAuth helper when you're *not* on Netlify. A free Cloudflare Worker (`sveltia-cms-auth`) does the job; add `base_url: https://YOUR-WORKER.workers.dev` under `backend` in `src/admin/config.txt`. Faculty staff then need GitHub accounts with write access to the repo.
4. **Approval workflow:** add `publish_mode: editorial_workflow` at the top level of `src/admin/config.txt`. Staff save as **Draft**, move to **In review**, and an admin moves it to **Ready** to publish. It needs the GitHub login above (not available locally).
5. **Site web address:** set it in the dashboard (Site settings) to `https://design.ac.nz/debrief/2026` for canonical links.
6. **Deploy to SiteGround:** in SiteGround Site Tools create an FTP account limited to the target folder. In GitHub → Settings → Secrets add `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`; add variables `FTP_SERVER_DIR` (`/` when the FTP account is limited to the site folder, as ours is) and `DEPLOY_ENABLED` = `true`. The workflow (`.github/workflows/deploy.yml`) then builds and uploads on every push to `main`. It uses FTPS and checks the server's certificate (`security: strict`). If a run fails with a certificate or hostname mismatch, set `FTP_SERVER` to the server name the error shows (the one on SiteGround's certificate); as a last resort the variable `FTP_SECURITY` = `loose` switches the check off. See docs/SECURITY.md.

---

## Security
See [docs/SECURITY.md](docs/SECURITY.md): what protects the site, the dashboard and the deploy, and how to set up the GitHub organisation.

## What was changed from the Maxis' site
See [docs/CHANGES-FROM-STUDENT-SITE.md](docs/CHANGES-FROM-STUDENT-SITE.md).

## Licences
Site code: see `LICENSE`. Fonts: SIL Open Font Licence (via Fontsource). Icons: Font Awesome Free 6.5.2 (icons CC BY 4.0, fonts SIL OFL; attribution in `fontawesome/css/all.min.css`) and Material Symbols (Apache 2.0).
