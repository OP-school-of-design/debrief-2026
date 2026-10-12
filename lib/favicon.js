// Favicon: makes the browser-tab and phone home-screen icons from the image chosen in
// the dashboard (Site settings → Favicon). Any square-ish PNG, JPG, WebP or SVG works;
// non-square images are centred on a transparent square.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp"; // installed with @11ty/eleventy-img

export async function writeFavicons(site, outputDir) {
  const chosen = site && site.favicon ? String(site.favicon) : "";
  if (!chosen) return;
  const src = path.join("src", chosen.replace(/^\/+/, ""));
  if (!fs.existsSync(src)) {
    console.warn(`[favicon] ${src} not found, so no favicon was made.`);
    return;
  }
  const outDir = path.join(outputDir, "favicon");
  fs.mkdirSync(outDir, { recursive: true });
  const input = fs.readFileSync(src);
  const clear = { r: 0, g: 0, b: 0, alpha: 0 };
  const square = (size) => sharp(input, { density: 300 }).resize(size, size, { fit: "contain", background: clear });

  await square(32).png().toFile(path.join(outDir, "icon-32.png"));
  await square(192).png().toFile(path.join(outDir, "icon-192.png"));

  // Phones show transparent home-screen icons on black, so a see-through icon is placed on
  // white with a margin. A solid square icon (like the default) is used edge to edge.
  const { isOpaque } = await sharp(input).stats();
  const apple = isOpaque
    ? square(180)
    : sharp({ create: { width: 180, height: 180, channels: 4, background: "#ffffff" } })
        .composite([{ input: await square(144).png().toBuffer(), top: 18, left: 18 }]);
  await apple.flatten({ background: "#ffffff" }).png().toFile(path.join(outDir, "apple-touch-icon.png"));
}
