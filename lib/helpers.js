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

// Graduate names in alphabetical order (ignores capitals and macrons: "Ātaahua" sorts with "A").
export const byName = (a, b) =>
  String(a.data.title || "").localeCompare(String(b.data.title || ""), "en-NZ", { sensitivity: "base" });

// All Graduates page: graduates grouped by category in the order chosen in the dashboard
// (Pages > All Graduates page), alphabetical within each category. Categories missing from that
// list follow, in their Disciplines order.
export function byCategory(grads, categoryOrder, disciplines) {
  const order = [...(categoryOrder || [])];
  for (const d of disciplines || []) {
    const key = d.data.disciplineKey;
    if (!order.includes(key)) order.push(key);
  }
  const rank = (g) => {
    const i = order.indexOf(g.data.discipline);
    return i === -1 ? order.length : i;
  };
  return [...(grads || [])].sort((a, b) => rank(a) - rank(b) || byName(a, b));
}

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
export function bannerTitle(text) {
  return escapeHtml(text).split(/\r?\n/).map((l) => l.trim()).join(' <br class="desktop-break"> ');
}

// Dates banner details: a new line is a normal line break; "//" is a line break on phones only
// (the students' <span class="mobile-break"><br></span>).
export function bannerDetails(text) {
  return escapeHtml(text)
    .split(/\r?\n/)
    .map((line) => line.split("//").map((p) => p.trim()).join(' <span class="mobile-break"><br></span> '))
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
