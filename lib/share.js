// Share images and file stamps.
//
// SHARE IMAGES: the picture shown when a page's link is shared (Facebook, LinkedIn, Instagram and
// WhatsApp messages, iMessage, Teams and Outlook link previews, Slack, Discord, X, Bluesky...) and
// next to it in some search results. Every platform wants roughly 1200 x 630 (1.91:1) and many crop
// it to a centred square for small previews, so:
//   "frame"  a graduate's square card image, centred on the share frame (Site settings), with a margin
//            all round: wide previews show the whole card on the frame, square previews show the card.
//   "cover"  a banner or other image, cropped from the centre to fill 1200 x 630.
//   "poster" a portrait poster, shown whole (570 px tall) in the middle of the share frame.
//   "square" a 1200 x 1200 copy (search engines like a square image as well as a wide one).
// They're made once per build in img/og/, named after their content, so a deploy only uploads new
// or changed ones, and kept under 300 KB, which WhatsApp needs to show a preview.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp"; // installed with @11ty/eleventy-img

const RECIPE = "share-v1";
const W = 1200, H = 630, CARD = 570, KEYLINE = 6;
const jobs = new Map(); // file name -> { src, mode, frame }

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
export function shareImage(sitePath, mode = "cover", framePath = "") {
  const src = srcFile(sitePath);
  if (!src) return null;
  const framed = mode === "frame" || mode === "poster";
  const frame = framed ? srcFile(framePath) : "";
  if (framed && !frame) mode = "cover";
  const id = md5([RECIPE, mode, contentHash(src), frame ? contentHash(frame) : ""].join("|")).slice(0, 16);
  const name = `${id}.jpg`;
  jobs.set(name, { src, mode, frame });
  return { path: `/img/og/${name}`, width: W, height: mode === "square" ? W : H };
}

async function jpeg(pipeline) {
  // Start at quality 82 and step down until it's under 300 KB.
  for (const quality of [82, 76, 70, 64]) {
    const buf = await pipeline.clone().jpeg({ quality, mozjpeg: true, progressive: true }).toBuffer();
    if (buf.length < 300 * 1024 || quality === 64) return buf;
  }
}

async function make({ src, mode, frame }) {
  const input = sharp(src, { density: 144 }).rotate().flatten({ background: "#ffffff" });
  if (mode === "square") return jpeg(input.resize(W, W, { fit: "cover", position: "centre" }));
  if (mode === "cover") return jpeg(input.resize(W, H, { fit: "cover", position: "centre" }));
  // frame: the card (cropped square from its centre) on the frame image.
  // poster: the whole poster, 570 px tall, on the frame image.
  // Both get a thin white edge, like a print on paper, so a yellow card doesn't melt into the frame.
  const inner = CARD - 2 * KEYLINE;
  const picture = mode === "poster"
    ? input.resize({ height: inner, width: W - 60, fit: "inside" })
    : input.resize(inner, inner, { fit: "cover", position: "centre" });
  const { data: pic, info } = await sharp(await picture.png().toBuffer())
    .extend({ top: KEYLINE, bottom: KEYLINE, left: KEYLINE, right: KEYLINE, background: "#ffffff" })
    .png().toBuffer({ resolveWithObject: true });
  const back = sharp(frame, { density: 144 }).flatten({ background: "#ffffff" }).resize(W, H, { fit: "cover", position: "centre" });
  const composed = await back.composite([{ input: pic, left: Math.round((W - info.width) / 2), top: Math.round((H - info.height) / 2) }]).png().toBuffer();
  return jpeg(sharp(composed));
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
