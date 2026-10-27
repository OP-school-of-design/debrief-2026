// Share images and file stamps.
//
// SHARE IMAGES: the picture shown when a page's link is shared (Facebook, LinkedIn, Instagram and
// WhatsApp messages, iMessage, Teams and Outlook link previews, Slack, Discord, X, Bluesky...) and
// next to it in some search results. Each one is a single image only (one person's work, one
// banner), never combined with anything else, so whose work it is stays clear:
//   "square" a graduate's card image as it appears on the grids (1200 x 1200, cropped to a square
//            from the centre like the grid's cards). Platforms that want a wide picture crop it.
//   "fit"    a poster, whole and uncropped, at most 1200 x 1200.
//   "cover"  a banner, hero or other landscape image, cropped from the centre to 1200 x 630.
// They're made once per build in img/og/, named after their content, so a deploy only uploads new
// or changed ones, and kept under 300 KB, which WhatsApp needs to show a preview.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp"; // installed with @11ty/eleventy-img
import { imageSize } from "image-size";

const RECIPE = "share-v2";
const W = 1200, H = 630;
const jobs = new Map(); // file name -> { src, mode }

const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex");
const hashCache = new Map();
function contentHash(file) {
  const stat = fs.statSync(file);
  const key = file + ":" + stat.size + ":" + stat.mtimeMs;
  if (!hashCache.has(key)) hashCache.set(key, md5(fs.readFileSync(file)));
  return hashCache.get(key);
}

// Site path ("/graduates/aria/card.jpg", "/images/x.png") -> file in src/, or "" if it isn't there.
function srcFile(sitePath) {
  const p = String(sitePath || "").split("?")[0];
  if (!p || /^https?:\/\//i.test(p)) return "";
  const file = path.join("src", decodeURIComponent(p).replace(/^\/+/, ""));
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : "";
}

// A short stamp of a file's content, for links that browsers may keep for a year (?v=...).
export function fileHash(sitePath) {
  const file = srcFile(sitePath);
  return file ? contentHash(file).slice(0, 10) : "0";
}

// The front page animation's stills (images/stills/<content>.webp and -small.webp), if made.
export function animStill(sitePath) {
  const file = srcFile(sitePath);
  if (!file) return null;
  const h = contentHash(file).slice(0, 12);
  const full = `/images/stills/${h}.webp`, small = `/images/stills/${h}-small.webp`;
  return srcFile(full) && srcFile(small) ? { full, small } : null;
}

// Register a share image; returns { path, width, height } (path from the site root) or null.
export function shareImage(sitePath, mode = "cover") {
  const src = srcFile(sitePath);
  if (!src) return null;
  let width = W, height = mode === "square" ? W : H;
  if (mode === "fit") {
    try {
      const d = imageSize(fs.readFileSync(src));
      const turned = d.orientation && d.orientation >= 5; // phone photos stored on their side
      const w = turned ? d.height : d.width, h = turned ? d.width : d.height;
      const scale = Math.min(W / w, W / h, 1);
      width = Math.round(w * scale); height = Math.round(h * scale);
    } catch {
      mode = "cover";
    }
  }
  const id = md5([RECIPE, mode, contentHash(src)].join("|")).slice(0, 16);
  // Graduates' share images carry their name too (maxis-angel-<id>.jpg).
  const who = (String(sitePath).match(/^\/graduates\/([a-z0-9-]+)\//) || [])[1];
  const name = who ? `${who}-${id}.jpg` : `${id}.jpg`;
  jobs.set(name, { src, mode, width, height });
  return { path: `/img/og/${name}`, width, height };
}

async function jpeg(pipeline) {
  // Start at quality 82 and step down until it's under 300 KB.
  for (const quality of [82, 76, 70, 64, 58, 52]) {
    const buf = await pipeline.clone().jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
    if (buf.length < 300 * 1024 || quality === 52) return buf;
  }
}

async function make({ src, mode, width, height }) {
  const input = sharp(src, { density: 144 }).rotate().flatten({ background: "#ffffff" });
  if (mode === "fit") return jpeg(input.resize(width, height, { fit: "fill" }));
  return jpeg(input.resize(width, height, { fit: "cover", position: "centre" }));
}

// Called after each build: makes any share images that aren't in the output folder yet.
export async function writeShareImages(outputDir) {
  const dir = path.join(outputDir, "img", "og");
  fs.mkdirSync(dir, { recursive: true });
  let made = 0;
  for (const [name, job] of jobs) {
    const out = path.join(dir, name);
    if (fs.existsSync(out)) continue;
    try {
      fs.writeFileSync(out, await make(job));
      made++;
    } catch (e) {
      console.warn(`[share images] couldn't make one from ${job.src}: ${e.message}`);
    }
  }
  if (made) console.log(`[share images] made ${made}`);
}
