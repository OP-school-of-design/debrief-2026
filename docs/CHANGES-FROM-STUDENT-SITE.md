# What changed from Maxis' HTML/CSS site

Source: <https://github.com/martinkean/maxis-debrief-2026> (also published at martinkean.github.io/maxis-debrief-2026).
Goal of this conversion: **pixel-for-pixel the same site**, with the content editable in the dashboard.

## How it was matched

- Every template was built from the matching original page, keeping its elements, classes, nesting
  and text. Only repeating content (graduates, disciplines, events, menu items) became data.
- The sample content is the original's text and images, copied word for word by script.
- Each of the 10 pages was screenshotted at 1440px and 390px wide, original and conversion,
  and compared pixel by pixel and element by element (see **Verification** below).

| Original page | Eleventy page | Template |
|---|---|---|
| `index.html` | `/` | `src/pages/index.njk` |
| `graduates.html` | `/graduates/` | `src/pages/graduates.njk` |
| `students-communication.html` | `/graduates/communication/` | `src/pages/graduates-by-discipline.njk` |
| `portfolio-studentname.html` | graduate page, layout "Profile first" | `src/_includes/layouts/graduate.njk` |
| `portfolio-projectname.html` | graduate page, layout "Project first" | `src/_includes/layouts/graduate.njk` |
| `school-of-design.html` | `/school-of-design/` | `src/_includes/layouts/school-of-design.njk` |
| `about-communication.html` | `/about/communication/` | `src/pages/about-discipline.njk` |
| `events.html` | `/events/` | `src/pages/events.njk` |
| `debrief.html`, `collections.html` | `/events/debrief/`, `/events/collections/` | `src/_includes/layouts/event.njk` |

No other pages are built. Links in the original that point to pages that don't exist yet
(Fashion, Product and Postgraduate pages, Archive) are kept, as in the original.

## `stylesheet.css`

Maxis' file, unchanged except for 11 lines, each of which falls back to the original value
(so they render identically until a dashboard setting is changed):

- 3 heading `font-family` rules → `var(--font-heading, "Google Sans", sans-serif)`
- 6 other `font-family` rules → `var(--font-body, "Google Sans", sans-serif)`
- body text colour → `var(--body-text, #1d1d1b)`; body background → `var(--page-background, white)`

Everything else stays as written, including the `:root` colours and the five variables the
stylesheet uses but never defines (`--dark-text`, `--cream-text`, `--slide-out-menu-background`,
`--description-text-colour`, `--typeface-open-sans`), because defining them would change the look.

Dashboard additions that are off by default (blank = Maxis' design, unchanged): a per-discipline box colour on the School of Design page (Maxis' CSS colours the boxes by position; a colour set here replaces that for one discipline), four optional palette colours for variables the stylesheet uses but never sets, and a Custom CSS box loaded last (`css/custom.css`, only linked when it has content).

Changed at the school's request (October 2026):
- Graduates are grouped into eight categories (Communication, Fashion and Product Design, three Graduate Diplomas, Honours, Masters), each with its own page and banner. The Graduate Diplomas, Honours and Masters appear in the menus only while they have published graduates. Maxis' "Postgraduate Design" discipline was removed (those categories cover it), so the School of Design page has three boxes and its menu lists About Communication, Fashion and Product Design.
- The menu label is now "All Graduates and Postgraduates", and that page has a plain heading instead of a banner (as on the 2025 site). Menu labels don't wrap, with tighter spacing between 1171px and 1365px (`css/additions.css`).
- Fashion and Product now have graduates pages (previously their menu links led nowhere).
- Security (October 2026, see docs/SECURITY.md): the header buttons' `onclick` attributes became `data-` attributes wired up in `js/main.js` (same behaviour, needed for the security policy); links opening in a new tab got `rel="noopener noreferrer"`. Pages look identical.
- Desktop dropdowns are as wide as their longest item (no wrapping); the phone menu scrolls when it is taller than the screen.

Added: a favicon (Maxis' site had none), set in Site settings. It only appears in the browser tab and on phone home screens, so the pages themselves are unchanged.

Extra CSS lives in separate files: `base.css` (one image rule, loaded first so Maxis' CSS still wins),
`design.css` (generated from the dashboard; defaults equal Maxis' values), `icons.css` and `carousel.css`.

## Replaced

- **Flickity** (needs a paid licence for this use) → `js/carousel.js` + `css/carousel.css`, styled to
  match Flickity exactly: 44px buttons 10px in from each edge, the same arrow shape, 10px dots 25px
  below the images, and Maxis' own `is-selected` fade/blur. On/off switch per discipline and per event.
- **Google Fonts, Material Symbols and Font Awesome CDN links** → self-hosted copies of the same files:
  Google Sans (the same optical-size version Google serves), Material Symbols cut down to the three
  icons used (15 KB instead of several MB), Font Awesome Free 6.5.2.
- **Inline scripts repeated on every page** → `js/main.js` (menu, dropdowns, footer, discipline toggle)
  and `js/lightbox.js`. Same code; `toggleMenu()`/`toggleDropdown()` are still called from the header buttons.
- **Images** → WebP at 400–2000px, as plain `<img srcset>` (same markup as the original).

## Fixed

- Front-page quote image: the page asked for `debrief_discipline_shapes.png` but the file was
  `DEBRIEF_discipline_shapes.png`, so it showed as a broken image on GitHub Pages. It now displays.
  This is the one intentional visual difference.
- Lightbox: it only looked for `.grid--masonry`, so it never opened on the profile-first page
  (`.grid--masonry-sn`). It now works on both, and opens the largest image size.
- Logo animation SVGs: both 23 MB versions were downloaded on every visit (the hidden one too). The
  embedded PNG textures are now WebP (6 MB each, same animation), and only the visible one downloads.
- The reference's Flickity measured the carousel before its images loaded, so on a first visit it could
  collapse to a thin strip. The new carousel doesn't have that problem.
- All file names lowercase.

## Kept as in the original (on purpose)

- All text, including typos in the sample text ("hich connects", "unnessary", "ehads", "fpr te",
  "disicplines"), and the collections event page repeating the DEBRIEF heading and description.
  These are sample content, to be replaced in the dashboard.
- The Facebook link with address `#`.

## Verification

Pixel comparison, original vs conversion, same browser and fonts:

| Page | Desktop height (orig / new) | Phone height (orig / new) |
|---|---|---|
| Front page | 2795 / 3103 (quote image now shows) | 3410 / 3575 (quote image now shows) |
| All graduates, Communication grid | 1680 / 1680 | 2169 / 2169 |
| Graduate, profile first | 4402 / 4402 | 5512 / 5514 |
| Graduate, project first | 4654 / 4654 | 5511 / 5513 |
| School of Design | 1875 / 1875 | 2424 / 2424 |
| About Communication | 3590 / 3589 | 3626 / 3626 |
| Events | 2175 / 2174 | 2794 / 2794 |
| DEBRIEF event | 3510 / 3510 | 3477 / 3477 |
| COLLECTIONS event | 3511 / 3511 | 3453 / 3454 |

Text, colours and element positions match. What remains:

- **Image edges:** resized WebP images are softened slightly differently from the browser shrinking the
  full-size originals. Not visible at normal viewing, but it shows up as edge pixels in a strict comparison.
- **0–2px height differences:** resized images round their height to whole pixels (e.g. 1600×1066 →
  400×267), which shifts later content by up to half a pixel per image.
- **Data-driven text:** graduate cards show the graduate's own name ("Student Name") where the original
  hard-coded "Person Name"; the graduate page shows the graduate's actual discipline ("Communication
  Design") where the original hard-coded "Discipline Design".

## History

- Round 1 converted the first student template.
- Round 2 updated templates for the revised template but **did not copy the revised stylesheet**, so the
  graduate and event pages were unstyled or styled for the old layout. It also replaced the icons, dropped
  the Facebook link and defined two variables the stylesheet leaves undefined. Round 3 (this one) rebuilt
  from the original pages and verified the result against them.
