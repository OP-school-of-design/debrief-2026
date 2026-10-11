# What changed from the students' HTML/CSS site

The visual design, class names, markup structure and layout CSS are the students'. The changes below are what conversion required.

## Structure
* Header/nav and footer are written once (`src/_includes/partials/`) instead of copied onto every page; menus build themselves from the dashboard content.
* Repeated cards, grids and lists are loops over content. Four discipline pages (Communication, Fashion, Product, Postgraduate), four About pages, and the Archive page are generated automatically from the one template each; the original only had Communication.
* `portfolio-studentname.html` and `project-studentname.html` are now one graduate template with a **Gallery layout** switch (Masonry or Stacked). `debrief.html` and `collections.html` are one event template.
* Inline `<script>` blocks repeated on every page are now `js/main.js`, `js/lightbox.js`.
* Page titles, descriptions and canonical/social tags were placeholders ("Website Template", `@YourName`); they are now generated per page. `lang="en-NZ"` on every page.

## Removed
* **Flickity** (unpkg link, the local `flickity.pkgd.js`, and its initialisation, including a script on the School of Design page that pointed at a carousel that wasn't there). Replaced by a custom carousel (`js/carousel.js` + CSS scroll-snap) that keeps the students' `.main-carousel`, `.carousel-cell` and `.caption` names.
* **Google Fonts, Material Symbols and Font Awesome CDN links.** Fonts are self-hosted from the dashboard choice; icons are inline SVG.
* The Netlify contact form (there is no contact page in this project), and the Facebook link whose address was `#` (add it back under Site settings when there's a real address).

## Fixes
* File names lowercased (e.g. `DEBRIEF_discipline_shapes.png` → `debrief_discipline_shapes.png`); the page asked for a lowercase name that didn't exist, which works on Windows/Mac but breaks on Linux servers.
* Images: 8334 px / 12.7 MB / 7.9 MB PNG logos and other oversize originals are processed into small responsive versions. Unused originals (`DEBRIEFlogo_Screen.png`, `debrieflogo_communication.png`, `debrieflogo_landscape.*`, `discipline_shapes.svg`) were not carried over.

## `stylesheet.css` edits (everything else is untouched)
* :root colour block moved to generated design.css: 1 change(s)
* body text + page background -> variables (+ body font): 1 change(s)
* h3 font -> --font-heading: 1 change(s)
* h2 font -> --font-heading: 1 change(s)
* h1 font -> --font-heading: 1 change(s)
* remaining Google Sans -> --font-body: 6 change(s)
* undefined --typeface-open-sans -> --font-body: 1 change(s)
* undefined --slide-out-menu-background -> --caption-background: 1 change(s)
* undefined --description-text-colour -> --caption-text: 1 change(s)
* contents-list carousel entry renamed: 1 change(s)
* carousel heading renamed: 1 change(s)
* discipline :nth-child colour rules removed: 8 (replaced by --discipline-colour)
* mobile dropdown arrow selector: .material-symbols-outlined -> .icon-svg: 1 change(s)

Other notes on the stylesheet:
* The `:root` colour block was removed because those values now come from the dashboard (Design → Colour palette) via the generated `css/design.css`. Every colour variable is included, including four that the stylesheet used but never defined (`--dark-text`, `--cream-text`, `--off-white`, `--button-colour`), which are now defined.
* `--caption-background` / `--caption-text` are new; the carousel caption used two undefined variables before.
* A few hard-coded colours remain (`#000` on the menu icons, `#fdf6ef`/`#eb0936`/`#ffffff` on the unused `.readmore-button` styles, and shadow colours). They are left as the students wrote them.
* `css/additions.css` adds: `<picture>` handling, `img { height: auto }`, inline-icon sizing, skip link and focus outlines, the carousel, and the Archive page.

## Round 2 — updated to match the students' revised template (October 2026)

The students revised their template repo after the first build (new front-page animation, a genuine masonry/hero layout replacing the old stacked layout, real carousels on the event pages, and a mostly-rewritten stylesheet). This round brings the Eleventy build up to date with those changes.

* **Front-page hero stays as the MP4 video**, not the students' new animated SVG logo, by request. The animated SVG (`Logoanimation_home.svg` / `Logoanimation_mobile.svg`) is not used.
* **Walkthrough video is now a dashboard on/off toggle** ("Show the walkthrough video section"), rather than always hidden. Turn it on once a real video exists; the file/YouTube-or-Vimeo choice from round 1 is unchanged.
* **The two graduate layouts are now one template.** The students' `portfolio-studentname.html` and renamed `portfolio-projectname.html` turned out to use the *same* components (headshot, contacts, quote, project info, a new hero image, and a masonry gallery) in a different order, so there's a single **Block order** choice in the dashboard ("Project first" / "Profile first") instead of the old "Gallery layout" (Masonry/Stacked) field. The old half/full-width stacked image pairing is gone; graduates now have a **Hero image** field (separate from the square card image) plus the masonry gallery.
* **Masonry gallery rebuilt to actually behave like masonry.** The students' CSS used `columns: 2`, which fills one column completely before starting the next and can leave a visible gap when a tall image doesn't fit the remaining space. `js/masonry.js` replaces this: it reads each image's own width/height (already on every `<img>` from the build) and packs images into the column that's currently shortest, re-balancing on resize at the same breakpoints as the original CSS (2 columns, 1 column ≤600px). The CSS-columns rule is left in place as a no-JavaScript fallback. `js/masonry-grid-script.js`, a file in the original project that was never actually used, is removed.
* **Events now have a real carousel with the same on/off toggle as Disciplines.** The Flickity carousel the students added to `debrief.html`/`collections.html` is replaced by the same custom carousel used on discipline pages (`carousel.njk` is now shared between the two, taking its image-path base and field names as parameters rather than assuming "discipline").
* **Event pages restructured** to match the students' new layout: poster-and-description side by side, a dates banner (same look as the front page's), the carousel, then the video. New dashboard fields: **Dates/time** (shown on the events grid card — the students added this but left it unstyled, now fixed in `additions.css`), **Dates/time line** (detail page), and **Dates banner: title/details**.
* **School of Design page**: class names updated to match the students' CSS (`.discipline_narrow` → `.discipline`, `.discipline__grid__narrow` → `.discipline__grid`, wrapping section renamed to `.discipline-explore`).
* **New/updated images carried over**: `Debrief_poster.png` and `Collections_poster.png` (used as the real event posters), updated `triangle.png`/`rectangle.png` (Product/Postgraduate symbols), and `landscape_placeholder.jpg` → `.jpeg` (all references updated).
* The `base.js` (`SITE_BASE` parsing) and `admin/config.txt` (renamed from `.yml`, since SiteGround blocked that extension) fixes made by hand on the live site after round 1 are carried forward in this build.
