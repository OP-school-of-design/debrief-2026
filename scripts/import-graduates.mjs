#!/usr/bin/env node
// Bulk import of graduates from the Microsoft Forms graduate form.
//
//   npm run import -- --excel <results.xlsx> --files <uploads folder> [--check] [--replace] [--unpublished]
//
//   --excel    the form's results (Forms > Responses > Open results in Excel, then download a copy)
//   --files    the form's uploads folder: download "Apps > Microsoft Forms > <form name>" from the Team's
//              files and double-click the .zip to unpack it (or point at the OneDrive-synced folder)
//   --check    report only: nothing is written
//   --replace  update graduates this script imported before and nobody has edited since
//   --unpublished  import pages as Unpublished (default: Published, ready to review on the site)
//
// For each student it creates src/graduates/<name>/index.md plus the images, in exactly the shape the
// dashboard makes, and writes import-report.md listing anything staff need to look at. A student's
// resubmissions are combined: each question takes their newest answer that isn't blank (see RESUBMISSIONS).
// Images are turned the right way up, shrunk to at most 2500 px, stripped of hidden data (camera, GPS)
// and saved as hero.jpg, card.jpg, headshot.jpg, gallery-01.jpg... (PNG when they have transparency).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { embedUrl } from "../lib/helpers.js";
// Build tools from package.json. If they're missing (e.g. after a git pull that added one), say how to fix it.
let unzipSync, strFromU8, yaml, sharp;
try {
  ({ unzipSync, strFromU8 } = await import("fflate"));
  yaml = (await import("js-yaml")).default;
  sharp = (await import("sharp")).default;
} catch (e) {
  console.error("\n\u2716 The import's tools aren't installed yet. In this folder, run:\n\n    npm ci\n\nthen run the import again.\n(" + e.message.split("\n")[0] + ")\n");
  process.exit(1);
}

// ---------------------------------------------------------------- QUESTION TITLES
// The form's question titles, as they appear across the top of the Excel file. If a question is renamed
// in the form, add the new title to its list here. (Matching ignores capitals and extra spaces.)
const COLUMNS = {
  submitted: ["Completion time"],
  modified: ["Last modified time"], // when "edit after submitting" is on

  account: ["Email"], // the student's OP sign-in (Forms adds this column itself)
  name: ["Full name"],
  programme: ["Programme"],
  about: ["About you"],
  quote: ["Quote"],
  projectName: ["Project name"],
  projectDescription: ["Project description"],
  hero: ["Hero image"],
  heroAlt: ["Hero image description and caption", "Hero image description", "Hero image caption"],
  card: ["Card image"],
  cardAlt: ["Card image description", "Card image description and caption", "Card image caption"],
  headshot: ["Headshot"],
  headshotAlt: ["Headshot caption", "Headshot description", "Headshot description and caption"],
  gallery: ["Gallery images"],
  galleryAlt: ["Gallery image captions and descriptions", "Gallery image descriptions", "Gallery image captions"],
  video: ["Video", "Video (optional)", "Video link"],
  videoCaption: ["Video caption", "Video caption (optional)"],
  email: ["Public email", "Email1", "Email address", "Contact email"],
  website: ["Website"],
  instagram: ["Instagram"],
  linkedin: ["LinkedIn"],
  behance: ["Behance"],
  other: ["Other links"],
};
const REQUIRED = ["name", "programme", "about", "projectName", "projectDescription"];
const LAYOUT = "profile"; // Page layout for imported graduates: "profile" (profile first) or "project"
const MAX_SIDE = 2500;

// ---------------------------------------------------------------- COMMAND LINE
const args = process.argv.slice(2);
const flag = (n) => args.includes("--" + n);
const opt = (n) => {
  const i = args.indexOf("--" + n);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : "";
};
const home = (p) => (p.startsWith("~") ? path.join(os.homedir(), p.slice(1)) : p);
const EXCEL = home(opt("excel"));
const FILES = home(opt("files"));
const CHECK = flag("check"), REPLACE = flag("replace"), PUBLISH = !flag("unpublished");
const ROOT = process.cwd();
const GRAD_DIR = path.join(ROOT, "src/graduates");
const TODAY = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local date

function fail(msg) {
  console.error("\n\u2716 " + msg + "\n");
  process.exit(1);
}
if (!EXCEL || !FILES) fail('Usage: npm run import -- --excel "<results.xlsx>" --files "<uploads folder>" [--check] [--replace] [--unpublished]');
if (!fs.existsSync(path.join(ROOT, "src/admin/config.txt"))) fail("Run this from the debrief-2026 folder (the one with package.json).");
if (!fs.existsSync(EXCEL)) fail("Can't find the Excel file: " + EXCEL);
if (!fs.existsSync(FILES)) fail("Can't find the uploads folder: " + FILES);
if (fs.statSync(FILES).isFile()) fail("--files should be a folder. Double-click the .zip in Finder to unpack it, then use that folder.");

// ---------------------------------------------------------------- READ THE EXCEL FILE
const xmlText = (s) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, "&")
    .replace(/_x([0-9A-F]{4})_/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

// Microsoft Forms produces two kinds of .xlsx: one saved by Excel, and the direct download, whose XML tags
// carry an "x:" prefix (<x:row>, <x:c>...) and whose file paths may be absolute. Both are handled.
function readXlsx(file) {
  const z = unzipSync(fs.readFileSync(file));
  const get = (p) => (z[p] ? strFromU8(z[p]).replace(/^\uFEFF/, "").replace(/<(\/?)[A-Za-z_][\w.-]*:(?=[A-Za-z_])/g, "<$1") : "");
  const resolve = (target) => (target.startsWith("/") ? target.slice(1) : "xl/" + target.replace(/^\.\//, ""));
  const rels = [...get("xl/_rels/workbook.xml.rels").matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]);
  const relTarget = (test) => {
    const r = rels.find(test);
    return r ? resolve(r.match(/Target="([^"]+)"/)[1]) : "";
  };
  const sstPath = relTarget((r) => /\/sharedStrings"/.test(r)) || "xl/sharedStrings.xml";
  const shared = [...get(sstPath).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) =>
    [...m[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1])).join("")
  );
  // First sheet, found through the workbook's relationships.
  const firstId = (get("xl/workbook.xml").match(/<sheet\b[^>]*\br:id="([^"]+)"/) || [])[1];
  const sheetPath = relTarget((r) => r.includes(`Id="${firstId}"`)) || "xl/worksheets/sheet1.xml";
  const sheet = get(sheetPath);
  const col = (ref) => [...ref.replace(/\d+/g, "")].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;
  const rows = [];
  for (const r of sheet.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const c of r[1].matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1], inner = c[2] || "";
      const ref = (attrs.match(/\br="([A-Z]+\d+)"/) || [])[1];
      const type = (attrs.match(/\bt="([^"]+)"/) || [])[1];
      const v = (inner.match(/<v>([\s\S]*?)<\/v>/) || [])[1];
      let val = "";
      if (type === "s") val = shared[+v] ?? "";
      else if (type === "inlineStr") val = [...inner.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((t) => xmlText(t[1])).join("");
      else if (v !== undefined) val = xmlText(v);
      if (ref) row[col(ref)] = val;
    }
    rows.push(row);
  }
  return rows;
}

const rows = readXlsx(EXCEL);
if (rows.length < 2) fail("The Excel file has no responses.");
const norm = (s) => String(s || "").trim().replace(/\s+/g, " ").toLowerCase();
// Question titles match whatever the case, spacing or an "(optional)" on the end.
const titleNorm = (s) => norm(s).replace(/\s*\(optional\)/g, "").trim();
const headers = rows[0].map(titleNorm);
const colIndex = {};
const missingColumns = [];
for (const [key, titles] of Object.entries(COLUMNS)) {
  const i = titles.map(titleNorm).map((t) => headers.indexOf(t)).find((x) => x !== -1);
  if (i === undefined) missingColumns.push(`${key} (${titles[0]})`);
  else colIndex[key] = i;
}
const missingRequired = REQUIRED.filter((k) => colIndex[k] === undefined);
if (missingRequired.length) fail("These questions aren't in the Excel file: " + missingRequired.map((k) => COLUMNS[k][0]).join(", ") + ". If they were renamed, add the new titles to COLUMNS in scripts/import-graduates.mjs.");

const cell = (row, key) => (colIndex[key] === undefined ? "" : String(row[colIndex[key]] ?? "").replace(/\r\n?/g, "\n").trim());

// Folder name from a graduate's name.
const slugify = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "graduate";

// ---------------------------------------------------------------- RESUBMISSIONS
// A student can submit again just to correct something: their answers are COMBINED, oldest to newest,
// and each question takes the newest answer that isn't blank. So a resubmission with only a corrected
// bio, or one new hero image, keeps everything else from their earlier response. (A blank answer never
// removes anything; to take something away, edit the page in the dashboard.)
// An image and its description go together: a new upload brings its own description with it (even a
// blank one); a new description on its own updates the earlier image's description.
// Responses belong to the same student when they come from the same OP sign-in and the names are the
// same or nearly the same (so a corrected spelling still counts); one staff member submitting for
// several students keeps them apart. The order comes from each response's time stamp ("Last modified
// time" when the student edited it in Forms, otherwise "Completion time"), then its row.
const PAIRS = [["hero", "heroAlt"], ["card", "cardAlt"], ["headshot", "headshotAlt"], ["gallery", "galleryAlt"], ["video", "videoCaption"]];
const PAIRED = new Set(PAIRS.flat());
const plainName = (s) => norm(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
function sameName(a, b) {
  if (!a || !b || a === b) return true; // a blank name joins the others from that sign-in
  if (editDistance(a, b) <= Math.max(2, Math.round(Math.min(a.length, b.length) * 0.15))) return true;
  const wa = a.split(" "), wb = b.split(" ");
  const [short, long] = wa.length <= wb.length ? [wa, wb] : [wb, wa];
  return short.length >= 2 && short.every((w) => long.includes(w)); // a middle name added or dropped
}
function stampOf(r, i) {
  const stamp = cell(r, "modified") || cell(r, "submitted");
  const t = /^\d+(\.\d+)?$/.test(stamp) ? (parseFloat(stamp) - 25569) * 86400000 : Date.parse(stamp);
  return { t: isNaN(t) ? -Infinity : t, i, label: isNaN(t) ? "" : new Date(t).toISOString().slice(0, 16).replace("T", " ") };
}

const allRows = rows.slice(1).filter((r) => r.some((v) => String(v ?? "").trim()));
const groups = []; // { account, items: [{ r, when, name }] }
allRows.forEach((r, i) => {
  const account = norm(cell(r, "account"));
  const name = plainName(cell(r, "name"));
  const item = { r, when: stampOf(r, i), name };
  const g = account && groups.find((x) => x.account === account && x.items.some((it) => sameName(it.name, name)));
  if (g) g.items.push(item);
  else groups.push({ account, items: [item] });
});

const combineNotes = new Map(); // combined row -> notes for the report
let responses = groups.map((g) => {
  const items = g.items.sort((a, b) => a.when.t - b.when.t || a.when.i - b.when.i);
  if (items.length === 1) return items[0].r;
  const merged = [...items[0].r];
  const fromLatest = new Set();
  // Sets an answer; the newest submission's real changes are listed in the report.
  let last = false;
  const set = (key, value) => {
    if (colIndex[key] === undefined) return;
    if (last && value !== cell(merged, key) && !["submitted", "modified", "account"].includes(key)) fromLatest.add(COLUMNS[key][0]);
    merged[colIndex[key]] = value;
  };
  items.slice(1).forEach((it, n) => {
    last = n === items.length - 2;
    for (const key of Object.keys(colIndex)) {
      if (PAIRED.has(key)) continue;
      const v = cell(it.r, key);
      if (v) set(key, v);
    }
    for (const [file, desc] of PAIRS) {
      const f = cell(it.r, file), d = cell(it.r, desc);
      if (f) { set(file, f); set(desc, d); }
      else if (d) set(desc, d);
    }
  });
  const names = [...new Set(items.map((it) => cell(it.r, "name")).filter(Boolean))];
  const newest = items[items.length - 1].when.label;
  const notes = [`Combined ${items.length} submissions (newest ${newest || "last in the file"}); the newest changed: ${[...fromLatest].join(", ") || "nothing new"}.`];
  if (names.length > 1) {
    const oldSlugs = names.slice(0, -1).map(slugify).filter((s) => s !== slugify(names[names.length - 1]));
    notes.push(`\u26a0 Name changed (${names.join(" \u2192 ")}).` + (oldSlugs.length ? ` If a page was imported under the old name (src/graduates/${oldSlugs.join(", ")}), delete it in the dashboard.` : ""));
  }
  combineNotes.set(merged, notes);
  return merged;
});
const replaced = allRows.length - responses.length;
const namesPerAccount = new Map();
for (const r of responses) {
  const account = norm(cell(r, "account"));
  if (account) namesPerAccount.set(account, (namesPerAccount.get(account) || new Set()).add(cell(r, "name") || "(no name)"));
}

// ---------------------------------------------------------------- DISCIPLINES
// Programme answer -> discipline key, from the dashboard's Discipline list and the Disciplines' titles.
const config = yaml.load(fs.readFileSync(path.join(ROOT, "src/admin/config.txt"), "utf8"));
const gradCollection = config.collections.find((c) => c.name === "graduates");
const dashboardOptions = (gradCollection.fields.find((f) => f.name === "discipline").options || []).map((o) => (typeof o === "string" ? { label: o, value: o } : o));
const programmes = new Map();
const inDashboard = new Set(dashboardOptions.map((o) => o.value));
for (const d of fs.readdirSync(path.join(ROOT, "src/disciplines"), { withFileTypes: true })) {
  if (!d.isDirectory()) continue;
  const fm = fs.readFileSync(path.join(ROOT, "src/disciplines", d.name, "index.md"), "utf8").match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;
  const data = yaml.load(fm[1]) || {};
  if (data.title && data.disciplineKey) programmes.set(norm(data.title), data.disciplineKey);
}
for (const o of dashboardOptions) programmes.set(norm(o.label), o.value);

// ---------------------------------------------------------------- UPLOADED FILES
// Index every file in the uploads folder by "<question folder>/<file name>" and by file name alone.
const nfc = (s) => s.normalize("NFC");
const byPath = new Map(), byName = new Map();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else {
      byPath.set(nfc(path.basename(dir) + "/" + e.name), full);
      const k = nfc(e.name);
      byName.set(k, byName.has(k) ? null : full); // null = name not unique
    }
  }
})(FILES);

function filesFor(value) {
  // Each upload answer is one or more SharePoint links separated by ";".
  return String(value || "").split(/;\s*/).map((s) => s.trim()).filter(Boolean).map((url) => {
    let p = url;
    try { p = decodeURIComponent(url); } catch {}
    const parts = p.split("/");
    const name = nfc(parts.pop() || ""), folder = nfc(parts.pop() || "");
    return { url, name, file: byPath.get(folder + "/" + name) || byName.get(name) || null };
  });
}

// ---------------------------------------------------------------- HELPERS

// Plain text from the form -> Markdown paragraphs. A line starting with a Markdown symbol is escaped, so
// "#hashtag" or "1. " at the start of a line stays as typed.
const paragraphs = (text) =>
  text.split(/\n+/).map((l) => l.trim()).filter(Boolean)
    .map((l) => l.replace(/^(#{1,6}\s|>|[-*+]\s|\d+[.)]\s)/, "\\$1")).join("\n\n");

const QUOTE_START = /^["\u201c\u201d\u2018'\u00ab\u201e]/;
const withQuotes = (q) => (!q ? "" : QUOTE_START.test(q) ? q : "\u201c" + q.replace(/["\u201d]+$/, "") + "\u201d");

function webAddress(value, kind) {
  let v = value.trim().replace(/\s+/g, "");
  if (!v) return "";
  if (kind === "instagram" && /^@?[\w.]+$/.test(v) && !v.includes(".com")) return "https://www.instagram.com/" + v.replace(/^@/, "") + "/";
  if (kind === "behance" && /^@?[\w-]+$/.test(v) && !v.includes(".")) return "https://www.behance.net/" + v.replace(/^@/, "");
  if (!/^https?:\/\//i.test(v)) v = "https://" + v.replace(/^\/+/, "");
  try {
    const u = new URL(v);
    return u.hostname.includes(".") ? v : "";
  } catch { return ""; }
}

function linkType(url) {
  const h = (() => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } })();
  if (/youtube\.com$|youtu\.be$/.test(h)) return "youtube";
  if (/facebook\.com$/.test(h)) return "facebook";
  if (/instagram\.com$/.test(h)) return "instagram";
  if (/linkedin\.com$/.test(h)) return "linkedin";
  if (/behance\.net$/.test(h)) return "behance";
  return "other";
}

async function saveImage(src, destBase, notes, label) {
  let img;
  try {
    img = sharp(src, { failOn: "none" });
    const meta = await img.metadata();
    const rotated = (meta.orientation || 1) >= 5;
    const w = rotated ? meta.height : meta.width, h = rotated ? meta.width : meta.height;
    const alpha = meta.hasAlpha && (await sharp(src).stats()).isOpaque === false;
    const ext = alpha ? "png" : "jpg";
    const out = destBase + "." + ext;
    if (!CHECK) {
      let p = sharp(src, { failOn: "none" }).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
      p = alpha ? p.png({ compressionLevel: 9 }) : p.flatten({ background: "#ffffff" }).jpeg({ quality: 82, mozjpeg: true });
      await p.toFile(out);
    }
    return { file: path.basename(out), w, h };
  } catch (e) {
    const heic = /heif|heic/i.test(String(e.message)) || /\.(heic|heif)$/i.test(src);
    notes.push(`\u2716 ${label}: can't read this image${heic ? " (an iPhone HEIC photo; export it as JPG)" : ""}. Add it in the dashboard.`);
    return null;
  }
}

// A fingerprint of a page's content, stored in its "imported" field. If the page is later saved with
// changes in the dashboard, the fingerprint no longer matches, so --replace leaves it alone.
function fingerprint(data, body) {
  const sorted = (v) =>
    Array.isArray(v) ? v.map(sorted)
    : v && typeof v === "object" && !(v instanceof Date) ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sorted(v[k])]))
    : v;
  const { imported, ...rest } = data;
  return crypto.createHash("sha256").update(JSON.stringify(sorted(rest)) + "\n" + String(body || "").trim()).digest("hex").slice(0, 12);
}

function untouchedSinceImport(file) {
  const text = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { imported: false };
  let data;
  try { data = yaml.load(m[1]) || {}; } catch { return { imported: false }; }
  const marker = String(data.imported || "");
  const fp = (marker.match(/fp:([0-9a-f]+)/) || [])[1];
  return { imported: !!fp, untouched: !!fp && fp === fingerprint(data, m[2]) };
}

// ---------------------------------------------------------------- IMPORT
const report = [];
const slugsThisRun = new Set();
let created = 0, updated = 0, skipped = 0, attention = 0;

for (const r of responses) {
  const notes = [...(combineNotes.get(r) || [])];
  const name = cell(r, "name");
  const who = name || cell(r, "account") || "(no name)";
  const missing = REQUIRED.filter((k) => !cell(r, k)).map((k) => COLUMNS[k][0]);
  const disc = programmes.get(norm(cell(r, "programme")));
  if (missing.length) notes.push("\u2716 Missing: " + missing.join(", ") + ". Not imported.");
  if (!disc && cell(r, "programme")) notes.push(`\u2716 Programme \u201c${cell(r, "programme")}\u201d doesn't match any discipline. Not imported.`);
  if (missing.length || !disc) {
    report.push({ who, status: "Not imported", notes });
    skipped++;
    continue;
  }
  if (!inDashboard.has(disc)) notes.push(`\u26a0 \u201c${cell(r, "programme")}\u201d isn't in the dashboard's Discipline list yet, so the dashboard won't show it on this graduate.`);

  // Folder name from the graduate's name; a second graduate with the same name gets -2.
  let slug = slugify(name), n = 2;
  while (slugsThisRun.has(slug)) slug = slugify(name) + "-" + n++;
  slugsThisRun.add(slug);
  const dir = path.join(GRAD_DIR, slug);
  let isUpdate = false;
  if (fs.existsSync(dir)) {
    const state = untouchedSinceImport(path.join(dir, "index.md"));
    if (!REPLACE || !state.untouched) {
      notes.push(!state.imported
        ? "A graduate with this folder name already exists (made in the dashboard). Not changed."
        : !state.untouched
          ? "Already imported, and edited in the dashboard since. Not changed, so the staff edits are kept."
          : "Already imported. Not changed (use --replace to update it from the form).");
      report.push({ who, status: "Skipped", slug, notes });
      skipped++;
      continue;
    }
    isUpdate = true;
  }
  if (!CHECK) {
    if (isUpdate) for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f), { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
  }

  const data = {
    title: name,
    discipline: disc,
    published: PUBLISH,
    blockOrder: LAYOUT,
    projectName: cell(r, "projectName"),
    projectDescription: paragraphs(cell(r, "projectDescription")),
  };

  // Single images
  for (const [key, altKey, label, base] of [["card", "cardAlt", "Card image", "card"], ["hero", "heroAlt", "Hero image", "hero"], ["headshot", "headshotAlt", "Headshot", "headshot"]]) {
    const found = filesFor(cell(r, key));
    if (!found.length) {
      if (key === "hero") notes.push("\u26a0 No hero image: the page will have none until one is added.");
      continue;
    }
    if (!found[0].file) { notes.push(`\u2716 ${label}: \u201c${found[0].name}\u201d isn't in the uploads folder.`); continue; }
    const saved = await saveImage(found[0].file, path.join(dir, base), notes, label);
    if (!saved) continue;
    const field = key === "card" ? "cover" : key;
    data[field] = saved.file;
    let alt = cell(r, altKey);
    if (!alt && key === "headshot") alt = "Portrait of " + name;
    if (alt) data[field + "Alt"] = alt;
    else notes.push(`\u26a0 ${label}: no description (alt text).`);
    if (key === "hero" && saved.w < saved.h) notes.push(`\u26a0 Hero image is portrait (${saved.w}\u00d7${saved.h}); it's shown as a wide banner, so it will be cropped.`);
    if (key === "hero" && saved.w < 1600) notes.push(`\u26a0 Hero image is small (${saved.w} px wide) and may look soft.`);
    if (key === "card" && Math.abs(saved.w / saved.h - 1) > 0.1) notes.push(`\u26a0 Card image isn't square (${saved.w}\u00d7${saved.h}); the grid crops it to a square.`);
  }

  // Video: a YouTube or Vimeo link, shown under the hero image
  const videoRaw = cell(r, "video");
  if (videoRaw) {
    const url = webAddress(videoRaw, "other");
    if (url && embedUrl(url)) { // the same check the site uses to embed it
      data.videoUrl = url;
      if (cell(r, "videoCaption")) data.videoCaption = cell(r, "videoCaption");
    } else notes.push(`\u26a0 Video \u201c${videoRaw}\u201d isn't a YouTube or Vimeo link. Left out.`);
  } else if (cell(r, "videoCaption")) notes.push("\u26a0 A video caption but no video link. Caption left out.");

  // Quote
  const quote = withQuotes(cell(r, "quote"));
  if (quote) data.quote = quote;

  // Contact links
  const links = [];
  const email = cell(r, "email").replace(/^mailto:/i, "");
  if (email) {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) links.push({ type: "email", url: email });
    else notes.push(`\u26a0 Public email \u201c${email}\u201d isn't an email address. Left out.`);
  }
  for (const kind of ["website", "instagram", "linkedin", "behance"]) {
    const raw = cell(r, kind);
    if (!raw) continue;
    const url = webAddress(raw, kind);
    if (url) links.push({ type: kind, url });
    else notes.push(`\u26a0 ${COLUMNS[kind][0]} \u201c${raw}\u201d isn't a web address. Left out.`);
  }
  for (const raw of cell(r, "other").split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)) {
    const url = webAddress(raw, "other");
    if (url) links.push({ type: linkType(url), url });
    else notes.push(`\u26a0 Other link \u201c${raw}\u201d isn't a web address. Left out.`);
  }
  if (links.length) data.links = links;

  // Gallery, in upload order, paired with the description lines (leading numbers like "01" removed).
  const galleryFiles = filesFor(cell(r, "gallery"));
  // "01 Close-up..." -> "Close-up...": a leading number is removed only when it's that line's position,
  // so a description that starts with a number ("3 chairs in a row") is kept as written.
  const numberedLines = (text) => text.split("\n").map((l) => l.trim()).filter(Boolean)
    .map((l, i) => {
      const m = l.match(/^\(?(\d{1,2})[).:\-\s]\s*(.*)$/);
      return m && +m[1] === i + 1 && m[2] ? m[2].trim() : l;
    });
  // When every line is numbered (and the numbers fit the images), pair by number instead, so a
  // skipped line ("1...", "3...") doesn't shift every later description onto the wrong image.
  const byNumber = (text, count) => {
    const ls = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const ms = ls.map((l) => l.match(/^\(?(\d{1,2})[).:\-\s]\s*(.*)$/));
    if (!ls.length || ms.some((m) => !m || !m[2].trim())) return null;
    const nums = ms.map((m) => +m[1]);
    if (new Set(nums).size !== nums.length || nums.some((n) => n < 1 || n > Math.max(count, ls.length))) return null;
    if (nums.every((n, i) => n === i + 1)) return null; // plain 1, 2, 3...: same as in order
    const out = [];
    ms.forEach((m, i) => { out[nums[i] - 1] = m[2].trim(); });
    return out;
  };
  const numbered = byNumber(cell(r, "galleryAlt"), galleryFiles.length);
  const galleryAlts = numbered || numberedLines(cell(r, "galleryAlt"));
  const gallery = [];
  for (let i = 0; i < galleryFiles.length; i++) {
    const g = galleryFiles[i];
    const label = `Gallery image ${i + 1}`;
    if (!g.file) { notes.push(`\u2716 ${label}: \u201c${g.name}\u201d isn't in the uploads folder.`); continue; }
    const saved = await saveImage(g.file, path.join(dir, "gallery-" + String(gallery.length + 1).padStart(2, "0")), notes, label);
    if (!saved) continue;
    const item = { image: saved.file };
    if (galleryAlts[i]) item.alt = galleryAlts[i];
    gallery.push(item);
  }
  if (gallery.length) data.gallery = gallery;
  if (numbered) {
    const gaps = galleryFiles.map((_, i) => i + 1).filter((n) => !galleryAlts[n - 1]);
    const extra = galleryAlts.map((a, i) => (a && i >= galleryFiles.length ? i + 1 : 0)).filter(Boolean);
    notes.push(`\u26a0 Gallery descriptions are numbered, so they were paired by number.` +
      (gaps.length ? ` No description for image${gaps.length === 1 ? "" : "s"} ${gaps.join(", ")}.` : "") +
      (extra.length ? ` Description${extra.length === 1 ? "" : "s"} ${extra.join(", ")} ha${extra.length === 1 ? "s" : "ve"} no image.` : ""));
  } else if (galleryFiles.length && galleryAlts.length !== galleryFiles.length)
    notes.push(`\u26a0 ${galleryFiles.length} gallery image${galleryFiles.length === 1 ? "" : "s"} but ${galleryAlts.length} description line${galleryAlts.length === 1 ? "" : "s"}: check they're paired correctly.`);
  if (!galleryFiles.length) notes.push("\u26a0 No gallery images.");

  // Marks pages made by this script, with a fingerprint of their content (see fingerprint()).
  const body = paragraphs(cell(r, "about"));
  data.imported = `form ${TODAY} fp:${fingerprint(data, body)}`;

  if (!CHECK) {
    const fm = yaml.dump(data, { lineWidth: 100, quotingType: '"' });
    fs.writeFileSync(path.join(dir, "index.md"), `---\n${fm}---\n${body}\n`);
  }
  const problems = notes.some((x) => /^[\u2716\u26a0]/.test(x));
  if (problems) attention++;
  isUpdate ? updated++ : created++;
  report.push({ who, status: CHECK ? (isUpdate ? "Would update" : "Would add") : isUpdate ? "Updated" : "Added", slug, notes });
}

// ---------------------------------------------------------------- REPORT
const lines = [
  `# Graduate import ${CHECK ? "check" : "report"}, ${TODAY}`,
  "",
  `${responses.length} graduate${responses.length === 1 ? "" : "s"} in the form` + (replaced ? ` (${replaced} resubmission${replaced === 1 ? "" : "s"} combined with earlier ones)` : "") + ".",
  `${CHECK ? "Would add" : "Added"}: ${created} \u00b7 ${CHECK ? "Would update" : "Updated"}: ${updated} \u00b7 Skipped or not imported: ${skipped} \u00b7 Need a look: ${attention}`,
  CHECK ? "This was a check: nothing was written." : `Pages were imported as ${PUBLISH ? "Published: review them on the site, and untick Published in the dashboard to hide one while it's fixed" : "Unpublished: tick Published in the dashboard once each is checked"}.`,
  "",
];
if (missingColumns.length) lines.push("Questions not found in the Excel file (left blank): " + missingColumns.join(", ") + ".", "");
for (const [account, names] of namesPerAccount)
  if (names.size > 1) lines.push(`${account} sent responses for ${names.size} different names (${[...names].join(", ")}): each is imported as its own graduate. If one student changed how they wrote their name, keep the newest page and delete the other.`, "");
const order = { "Not imported": 0, Skipped: 1, Added: 2, Updated: 2, "Would add": 2, "Would update": 2 };
for (const e of report.sort((a, b) => order[a.status] - order[b.status] || a.who.localeCompare(b.who))) {
  lines.push(`## ${e.who}: ${e.status}${e.slug ? ` (src/graduates/${e.slug})` : ""}`);
  lines.push(...(e.notes.length ? e.notes.map((x) => "- " + x) : ["- All good."]), "");
}
const reportFile = path.join(ROOT, "import-report.md");
fs.writeFileSync(reportFile, lines.join("\n"));
console.log("\n" + lines.slice(0, 5).join("\n"));
console.log(`\nFull report: ${reportFile}\n`);
