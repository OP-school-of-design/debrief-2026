// Font handling: the dashboard chooses fonts; the build self-hosts ONLY the chosen ones.
// Fonts come from the open-source Fontsource packages (same fonts as Google Fonts, OFL licence),
// so no request is ever made to Google when a visitor loads the site.
//
// The @font-face rules use each font's real name (e.g. "Google Sans"), so the students' stylesheet,
// which names "Google Sans" directly, picks up the self-hosted copy with no changes.
//
// To add a font:  npm install @fontsource-variable/<name>, add it to FONTS below,
// and add the same id to the two font "select" lists in src/admin/config.txt.
import fs from "node:fs";
import path from "node:path";

export const FONTS = [
  { id: "google-sans", label: "Google Sans", category: "sans" },
  { id: "inter", label: "Inter", category: "sans" },
  { id: "space-grotesk", label: "Space Grotesk", category: "sans" },
  { id: "host-grotesk", label: "Host Grotesk", category: "sans" },
  { id: "dm-sans", label: "DM Sans", category: "sans" },
  { id: "manrope", label: "Manrope", category: "sans" },
  { id: "outfit", label: "Outfit", category: "sans" },
  { id: "plus-jakarta-sans", label: "Plus Jakarta Sans", category: "sans" },
  { id: "work-sans", label: "Work Sans", category: "sans" },
  { id: "figtree", label: "Figtree", category: "sans" },
  { id: "onest", label: "Onest", category: "sans" },
  { id: "bricolage-grotesque", label: "Bricolage Grotesque", category: "sans" },
  { id: "instrument-sans", label: "Instrument Sans", category: "sans" },
  { id: "red-hat-display", label: "Red Hat Display", category: "sans" },
  { id: "sora", label: "Sora", category: "sans" },
  { id: "fraunces", label: "Fraunces", category: "serif" },
  { id: "playfair-display", label: "Playfair Display", category: "serif" },
  { id: "lora", label: "Lora", category: "serif" },
  { id: "literata", label: "Literata", category: "serif" },
  { id: "source-serif-4", label: "Source Serif 4", category: "serif" },
  { id: "eb-garamond", label: "EB Garamond", category: "serif" },
  { id: "syne", label: "Syne", category: "display" },
  { id: "unbounded", label: "Unbounded", category: "display" },
];

const STACKS = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  display: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
};
const DEFAULT_ID = "google-sans";
const PKG_ROOT = path.resolve("node_modules/@fontsource-variable");
const cache = new Map();

// Design > Typography in the dashboard is saved to src/_data/typography.json
export function readDesign() {
  return { typography: JSON.parse(fs.readFileSync(path.resolve("src/_data/typography.json"), "utf8")) };
}

function resolveId(id) {
  if (FONTS.some((f) => f.id === id)) return id;
  console.warn(`[fonts] "${id}" is not in the font list - using ${DEFAULT_ID} instead.`);
  return DEFAULT_ID;
}

// Reads a Fontsource package and keeps only the "latin" and "latin-ext" files.
// latin-ext matters here: it contains the macrons (ā ē ī ō ū) used in te reo Māori.
function loadFont(rawId) {
  const id = resolveId(rawId);
  if (cache.has(id)) return cache.get(id);
  const meta = FONTS.find((f) => f.id === id);
  const dir = path.join(PKG_ROOT, id);
  const blocks = [];
  const family = meta.label;
  // Prefer the optical-size version where the package has one: it is the same file Google Fonts serves
  // for the students' "opsz,wght" request, so text renders identically.
  const hasOpsz = fs.existsSync(path.join(dir, "opsz.css"));
  const cssFiles = hasOpsz ? ["opsz.css", "opsz-italic.css"] : ["wght.css", "wght-italic.css"];
  for (const cssName of cssFiles) {
    const file = path.join(dir, cssName);
    if (!fs.existsSync(file)) continue;
    const css = fs.readFileSync(file, "utf8");
    for (const block of css.match(/@font-face\s*\{[^}]*\}/g) || []) {
      const url = block.match(/url\(\.\/files\/([^)]+\.woff2)\)/);
      if (!url) continue;
      const fileName = url[1];
      const subset = fileName.slice(id.length + 1);
      if (!subset.startsWith("latin")) continue;
      const named = block.replace(/font-family:\s*'[^']+'/, `font-family: '${family}'`);
      blocks.push({ block: named, fileName, isNormal: /-normal\.woff2$/.test(fileName), isPlainLatin: subset.startsWith("latin-wght") || subset.startsWith("latin-normal") || /^latin-[a-z]+-normal/.test(subset) });
    }
  }
  if (!blocks.length) throw new Error(`[fonts] No files found for "${id}". Did you run npm install?`);
  const font = { id, family, category: meta.category, blocks };
  cache.set(id, font);
  return font;
}

export function fontStack(id) {
  const f = loadFont(id);
  // The default font keeps the students' exact stack.
  if (f.id === DEFAULT_ID) return `"Google Sans", sans-serif`;
  return `'${f.family}', ${STACKS[f.category] || STACKS.sans}`;
}

function chosen(design) {
  const t = design.typography || {};
  return [...new Set([loadFont(t.headingFont || DEFAULT_ID), loadFont(t.bodyFont || DEFAULT_ID)])];
}

export function fontFaceCss(design, base = "/") {
  return chosen(design)
    .flatMap((f) => f.blocks)
    .map((b) => b.block.replace(/url\(\.\/files\//, `url(${base}fonts/`))
    .join("\n");
}

// Files to preload = the plain "latin" upright file of each chosen font (used by almost every page).
export function fontPreloads(design, base = "/") {
  return chosen(design)
    .map((f) => f.blocks.find((b) => b.isNormal && !b.fileName.includes("-latin-ext-")))
    .filter(Boolean)
    .map((b) => `${base}fonts/${b.fileName}`);
}

export function copyFontFiles(design, outDir) {
  const dest = path.join(outDir, "fonts");
  fs.mkdirSync(dest, { recursive: true });
  for (const f of chosen(design)) {
    for (const b of f.blocks) {
      fs.copyFileSync(path.join(PKG_ROOT, f.id, "files", b.fileName), path.join(dest, b.fileName));
    }
  }
}
