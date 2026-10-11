import path from "node:path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { BASE } from "./lib/base.js";
import { readDesign, copyFontFiles } from "./lib/fonts.js";
import { entryImg, mdFilter, pclass, nl2br, embedUrl, where, groupGallery, icon } from "./lib/helpers.js";

export default function (eleventyConfig) {
  // ---------- Images ----------
  // Every <img> in every template is turned into a <picture> with AVIF + WebP + original-format
  // versions at 400/800/1200/1600/2000px wide (never enlarged beyond the source). The browser
  // downloads only the size it needs, and width/height are added automatically (no layout jump).
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "auto"],
    widths: [400, 800, 1200, 1600, 2000],
    outputDir: "./_site/img/",
    urlPath: BASE + "img/",
    failOnError: true,
    defaultAttributes: { loading: "lazy", decoding: "async", sizes: "100vw" },
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src)).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `${name}-${id}-${width}w.${format}`;
    },
    sharpJpegOptions: { quality: 85, progressive: true },
    sharpWebpOptions: { quality: 82 },
    sharpAvifOptions: { quality: 60, effort: 3 },
  });

  // ---------- Filters & shortcodes ----------
  eleventyConfig.addFilter("entryImg", entryImg);
  eleventyConfig.addFilter("md", mdFilter);
  eleventyConfig.addFilter("pclass", pclass);
  eleventyConfig.addFilter("nl2br", nl2br);
  eleventyConfig.addFilter("embed", embedUrl);
  eleventyConfig.addFilter("where", where);
  eleventyConfig.addFilter("groupGallery", groupGallery);
  eleventyConfig.addFilter("trimSlash", (s) => String(s || "").replace(/\/+$/, ""));
  eleventyConfig.addShortcode("icon", icon);

  // ---------- Collections ----------
  const byOrder = (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.title.localeCompare(b.data.title);
  eleventyConfig.addCollection("graduates", (api) =>
    api.getFilteredByTag("graduate").filter((g) => g.data.published !== false).sort((a, b) => a.data.title.localeCompare(b.data.title, "en-NZ")));
  eleventyConfig.addCollection("disciplines", (api) => api.getFilteredByTag("discipline").sort(byOrder));
  eleventyConfig.addCollection("events", (api) => api.getFilteredByTag("event").sort(byOrder));

  // ---------- Static files ----------
  eleventyConfig.addPassthroughCopy({
    "src/css/stylesheet.css": "css/stylesheet.css",
    "src/css/additions.css": "css/additions.css",
    "src/js": "js",
    "src/videos": "videos",
    "src/admin/config.txt": "admin/config.txt",
    "src/admin/index.html": "admin/index.html",
  });

  // ---------- Self-hosted fonts: copy only the fonts chosen in the dashboard ----------
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    copyFontFiles(readDesign(), dir.output);
  });
  eleventyConfig.addWatchTarget("src/_data/typography.json");

  eleventyConfig.setServerOptions({ showVersion: false });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: BASE,
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false, // people typing {{ }} in the dashboard can't break the build
  };
}
