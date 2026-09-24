import path from "node:path";
import fs from "node:fs";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, breaks: true, linkify: true, typographer: false });

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Turn an image filename saved in a content entry into a path from the src/ folder,
// so the image pipeline can find it from ANY page (this fixes the old "image lives in a different folder" bug).
//   "cover.jpg"          + entry src/graduates/aroha/index.md -> "/graduates/aroha/cover.jpg"
//   "/images/logo.png"   (already from src/)                  -> unchanged
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

// Stacked layout: consecutive "half" images pair up; a lone half becomes full width.
export function groupGallery(gallery = []) {
  const rows = [];
  let i = 0;
  while (i < gallery.length) {
    const g = gallery[i];
    if (g.size === "half" && gallery[i + 1] && gallery[i + 1].size === "half") {
      rows.push({ type: "half", items: [g, gallery[i + 1]] });
      i += 2;
    } else {
      rows.push({ type: "full", items: [g] });
      i += 1;
    }
  }
  return rows;
}

// Inline SVG icons (no icon font, no CDN). Brand/UI icons come from Font Awesome Free (CC BY 4.0).
const FA = {
  globe: "solid/globe.svg",
  website: "solid/globe.svg",
  envelope: "regular/envelope.svg",
  instagram: "brands/instagram.svg",
  facebook: "brands/facebook.svg",
  linkedin: "brands/linkedin.svg",
  youtube: "brands/youtube.svg",
  link: "solid/link.svg",
};
const UI = {
  menu: '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
  chevron: '<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
};
const faCache = new Map();
export function icon(name) {
  if (UI[name]) return UI[name];
  const rel = FA[name] || FA.link;
  if (!faCache.has(rel)) {
    const file = path.resolve("node_modules/@fortawesome/fontawesome-free/svgs", rel);
    const svg = fs.readFileSync(file, "utf8");
    const viewBox = (svg.match(/viewBox="([^"]+)"/) || [])[1] || "0 0 512 512";
    const inner = svg.replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?svg[^>]*>/g, "").trim();
    faCache.set(rel, `<svg class="icon-svg" viewBox="${viewBox}" aria-hidden="true" focusable="false" fill="currentColor">${inner}</svg>`);
  }
  return faCache.get(rel);
}
