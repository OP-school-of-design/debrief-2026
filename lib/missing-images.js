// Images that a page refers to but that aren't in its folder any more (usually because they were
// deleted from the dashboard's media library while a page still used them).
//
// One missing image used to stop the whole build, so NOTHING was published until it was fixed.
// Now the page is built as if that image field were empty (a graduate's card falls back to their
// hero image, a missing gallery image is skipped), and the build log and the run's summary on
// GitHub list what's missing so it can be replaced in the dashboard.
import fs from "node:fs";
import path from "node:path";

const IMAGE = /\.(jpe?g|png|webp|gif|avif|svg)$/i;
const reported = new Set();

// Where an image named in a page's front matter lives: next to the page, or (for "images/..." and
// "/...") from src/.
export function imagePath(inputPath, file) {
  const f = String(file).split("?")[0];
  return /^(\/|images\/)/.test(f) ? path.join("src", decodeURIComponent(f).replace(/^\/+/, "")) : path.join(path.dirname(inputPath), decodeURIComponent(f));
}

export function isMissing(inputPath, file) {
  if (!file || typeof file !== "string" || !IMAGE.test(file) || /^https?:\/\//i.test(file)) return false;
  return !fs.existsSync(imagePath(inputPath, file));
}

function report(inputPath, label, file) {
  const key = inputPath + "|" + file;
  if (reported.has(key)) return;
  reported.add(key);
  const where = inputPath.replace(/^\.\//, "");
  console.warn(`[missing image] ${where}: ${label} "${file}" isn't in the folder, so it's left out. Choose another image in the dashboard.`);
  if (process.env.GITHUB_ACTIONS) console.log(`::warning file=${where}::${label} "${file}" is missing (deleted from the media library?). Left out until another image is chosen.`);
}

// eleventyComputed entries for a content folder: each named image field becomes "" when its file
// is missing, and list fields (gallery, carousel) drop items whose image is missing.
export function keepExisting(fields = [], lists = []) {
  const computed = {};
  for (const [name, label] of fields) {
    computed[name] = (data) => {
      const v = data[name];
      if (isMissing(data.page.inputPath, v)) { report(data.page.inputPath, label, v); return ""; }
      return v;
    };
  }
  for (const [name, label] of lists) {
    computed[name] = (data) => {
      const v = data[name];
      if (!Array.isArray(v)) return v;
      return v.filter((item) => {
        if (!item || !isMissing(data.page.inputPath, item.image)) return true;
        report(data.page.inputPath, label, item.image);
        return false;
      });
    };
  }
  return computed;
}
