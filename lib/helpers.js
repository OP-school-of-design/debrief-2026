import path from "node:path";
import fs from "node:fs";
import { imageSize } from "image-size";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, breaks: true, linkify: true, typographer: false });

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Turn an image filename saved in a content entry into a path from the src/ folder,
// so the image pipeline can find it from ANY page (this fixes the old "image lives in a different folder" bug).
//   "cover.jpg"          + entry src/graduates/aroha/index.md -> "/graduates/aroha/cover.jpg"
//   "/images/logo.png"   (already from src/)                  -> unchanged
// Site-wide files (logos, banners, favicon, video) are stored as "images/x.jpg" (no leading
// slash) so the dashboard can preview them; this turns them back into site paths ("/images/x.jpg").
export function siteImg(file) {
  if (!file) return "";
  const f = String(file);
  return /^(\/|https?:\/\/)/i.test(f) ? f : "/" + f;
}

// Links typed into the dashboard: only web, email and phone addresses (or links within this site)
// are allowed. Anything else, e.g. "javascript:...", which would run code when clicked, becomes "#".
export function safeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "#";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  if (/^(\/(?!\/)|#|\.{0,2}\/)/.test(url)) return url;
  return "#";
}

// Graduate images are optional until supplied. A card with no card image uses the hero image
// (cropped to a square by the card's CSS); with neither, the grids show a plain grey card
// placeholder. A missing headshot shows a grey head-and-shoulders placeholder; a graduate's page simply leaves out a
// missing hero image (see layouts/graduate.njk).
const GRAD_PLACEHOLDERS = {
  card: "/images/card_placeholder.png",
  headshot: "/images/headshot_placeholder.png",
};
export function gradImg(entry, file, kind) {
  return file ? entryImg(entry, file) : GRAD_PLACEHOLDERS[kind] || GRAD_PLACEHOLDERS.card;
}

// Graduates in alphabetical order of LAST name, then full name (ignores capitals and macrons:
// "Ātaahua" sorts with "A"). The last name is the dashboard's "Last name (for alphabetical order)"
// when filled in, otherwise the last word of the name together with any prefix in front of it
// ("Aria Te Rangi" -> "Te Rangi", "Sam van der Berg" -> "van der Berg"). The first word is always
// treated as a given name, so "Te Aroha Smith" -> "Smith".
const SURNAME_PREFIXES = new Set(["te", "van", "von", "de", "da", "di", "du", "del", "della", "der", "den", "ter", "ten", "la", "le", "st", "st.", "dos", "das", "bin", "binti", "al", "el"]);
export function lastName(data) {
  const set = String(data?.sortName || "").trim();
  if (set) return set;
  const words = String(data?.title || "").trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return words[0] || "";
  let start = words.length - 1;
  while (start > 1 && SURNAME_PREFIXES.has(words[start - 1].toLowerCase())) start--;
  return words.slice(start).join(" ");
}
const compareNames = (x, y) => x.localeCompare(y, "en-NZ", { sensitivity: "base" });
export const byName = (a, b) =>
  compareNames(lastName(a.data), lastName(b.data)) ||
  compareNames(String(a.data.title || ""), String(b.data.title || ""));

export function entryImg(entry, file) {
  if (!file) return "";
  if (file.startsWith("/") || /^https?:\/\//.test(file)) return file;
  const inputPath = (entry?.inputPath || entry?.page?.inputPath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  const dir = path.posix.dirname(inputPath).replace(/^src\/?/, "");
  return "/" + path.posix.join(dir, file);
}

export function mdFilter(text, cls) {
  if (!text) return "";
  const html = md.render(String(text));
  return cls ? html.replace(/<p>/g, `<p class="${cls}">`) : html;
}

export function pclass(html, cls) {
  return String(html || "").replace(/<p>/g, `<p class="${cls}">`);
}

export function nl2br(text, brClass) {
  const br = brClass ? `<br class="${brClass}">` : "<br>";
  return escapeHtml(text).split(/\r?\n/).join(br);
}

// YouTube / Vimeo page URL -> privacy-friendly embed URL. Returns "" if not recognised.
export function embedUrl(url) {
  if (!url) return "";
  let u;
  try { u = new URL(String(url).trim()); } catch { return ""; }
  const host = u.hostname.replace(/^www\./, "");
  let id = "";
  if (host === "youtu.be") id = u.pathname.slice(1);
  else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (u.pathname === "/watch") id = u.searchParams.get("v") || "";
    else id = (u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/) || [])[1] || "";
  } else if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(\d{5,})/);
    return m ? `https://player.vimeo.com/video/${m[1]}` : "";
  }
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
}

export function where(arr = [], keyPath, value) {
  const get = (o) => keyPath.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
  return arr.filter((item) => get(item) === value);
}

// Font Awesome classes for the icon names chosen in the dashboard (the students' own icon set).
const FA_CLASSES = {
  globe: "fa-solid fa-globe",
  website: "fa-solid fa-globe",
  email: "fa-solid fa-envelope",
  envelope: "fa-solid fa-envelope",
  instagram: "fa-brands fa-instagram",
  facebook: "fa-brands fa-facebook",
  linkedin: "fa-brands fa-linkedin",
  youtube: "fa-brands fa-youtube",
  behance: "fa-brands fa-behance",
  link: "fa-solid fa-link",
  other: "fa-solid fa-link",
};
export function faClass(name) {
  return FA_CLASSES[name] || FA_CLASSES.link;
}

// Dates banner title: each new line becomes the students' desktop-only line break.
// Each line is wrapped in <span class="dl"> (no effect on desktop): on phones each becomes its own
// line, sized by js/main.js so the longest one fills the banner's width (css/additions.css).
const dl = (s) => (s ? `<span class="dl">${s}</span>` : "");
export function bannerTitle(text) {
  return escapeHtml(text).split(/\r?\n/).map((l) => dl(l.trim())).join(' <br class="desktop-break"> ');
}

// Dates banner details: a new line is a normal line break; "//" is a line break on phones only
// (the students' <span class="mobile-break"><br></span>).
export function bannerDetails(text) {
  return escapeHtml(text)
    .split(/\r?\n/)
    .map((line) => line.split("//").map((p) => dl(p.trim())).join(' <span class="mobile-break"><br></span> '))
    .join(" <br> ");
}

// `sizes` for images the students' CSS sizes with width:auto plus max-width/max-height caps.
// There the browser treats `sizes` as the image's natural width, so it must equal the real
// natural width (capped at the screen width) for the image to render exactly as in their design.
//   src: a path from src/, e.g. "/events/debrief/poster.png"
export function naturalSizes(src) {
  try {
    const file = path.resolve("src", String(src).replace(/^\//, ""));
    const { width } = imageSize(fs.readFileSync(file));
    return `(min-width: ${width}px) ${width}px, 100vw`;
  } catch {
    return "100vw";
  }
}

// Responsive CSS (Design > Responsive CSS): the dashboard boxes hold only the rules, and the build
// wraps each in its @media block. A box whose { and } don't pair up is left out (with a warning in
// the build log), because one missing } would swallow every rule after it.
export const BREAKPOINTS = [
  { key: "xs", label: "Extra small devices (phones, 600px and down)", media: "only screen and (max-width: 600px)" },
  { key: "sm", label: "Small devices (portrait tablets and large phones, 600px and up)", media: "only screen and (min-width: 600px)" },
  { key: "md", label: "Medium devices (landscape tablets, 768px and up)", media: "only screen and (min-width: 768px)" },
  { key: "lg", label: "Large devices (laptops/desktops, 992px and up)", media: "only screen and (min-width: 992px)" },
  { key: "xl", label: "Extra large devices (large laptops and desktops, 1200px and up)", media: "only screen and (min-width: 1200px)" },
];

export function bracesBalanced(css) {
  // Ignore comments and quoted text, then check every { has its }.
  const s = String(css || "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, "");
  let depth = 0;
  for (const ch of s) {
    if (ch === "{") depth++;
    else if (ch === "}" && --depth < 0) return false;
  }
  return depth === 0 && !/\/\*/.test(s);
}

const warnedCss = new Set();

export function responsiveCss(data) {
  const out = [];
  for (const bp of BREAKPOINTS) {
    const css = String((data && data[bp.key]) || "").trim();
    if (!css) continue;
    if (!bracesBalanced(css)) {
      if (!warnedCss.has(bp.key + css)) console.warn(`[responsive css] "${bp.label}" left out: its { and } don't pair up.`);
      warnedCss.add(bp.key + css);
      continue;
    }
    out.push(`/* ${bp.label} */\n@media ${bp.media} {\n${css}\n}`);
  }
  return out.join("\n\n");
}
