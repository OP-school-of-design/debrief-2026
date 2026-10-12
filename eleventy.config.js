import path from "node:path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { BASE } from "./lib/base.js";
import { readDesign, copyFontFiles } from "./lib/fonts.js";
import { entryImg, mdFilter, pclass, nl2br, embedUrl, where, faClass, bannerTitle, bannerDetails, naturalSizes } from "./lib/helpers.js";

export default function (eleventyConfig) {
  // ---------- Images ----------
  // Every <img> becomes WebP at 400/800/1200/1600/2000px wide (never enlarged beyond the original),
  // as a plain <img srcset> so the page structure stays exactly as the students wrote it.
  // The browser downloads only the size it needs; width/height are added so space is reserved while
  // it loads (css/base.css keeps the students' own sizing in charge).
  // Add eleventy:ignore to an <img> to leave it untouched (used for the animated SVG logos).
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp"],
    widths: [400, 800, 1200, 1600, 2000],
    outputDir: "./_site/img/",
    urlPath: BASE + "img/",
    failOnError: true,
    defaultAttributes: { loading: "lazy", decoding: "async", sizes: "100vw" },
    filenameFormat: (id, src, width, format) => {
      const name = path.basename(src, path.extname(src)).toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return `${name}-${id}-${width}w.${format}`;
    },
    sharpWebpOptions: { quality: 85 },
  });

  // ---------- Filters ----------
  eleventyConfig.addFilter("entryImg", entryImg);
  eleventyConfig.addFilter("md", mdFilter);
  eleventyConfig.addFilter("pclass", pclass);
  eleventyConfig.addFilter("nl2br", nl2br);
  eleventyConfig.addFilter("embed", embedUrl);
  eleventyConfig.addFilter("where", where);
  eleventyConfig.addFilter("faClass", faClass);
  eleventyConfig.addFilter("bannerTitle", bannerTitle);
  eleventyConfig.addFilter("bannerDetails", bannerDetails);
  eleventyConfig.addFilter("naturalSizes", naturalSizes);
  eleventyConfig.addFilter("trimSlash", (s) => String(s || "").replace(/\/+$/, ""));

  // ---------- Collections ----------
  const byOrder = (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.title.localeCompare(b.data.title);
  eleventyConfig.addCollection("graduates", (api) =>
    api.getFilteredByTag("graduate").filter((g) => g.data.published !== false).sort(byOrder));
  // All disciplines: used for the menus, footer and the School of Design grid (as in the students' design).
  eleventyConfig.addCollection("disciplines", (api) => api.getFilteredByTag("discipline").sort(byOrder));
  // Disciplines whose pages are switched on: these get a graduates grid page and an About page.
  eleventyConfig.addCollection("disciplinePages", (api) =>
    api.getFilteredByTag("discipline").filter((d) => d.data.pagesPublished !== false).sort(byOrder));
  eleventyConfig.addCollection("events", (api) => api.getFilteredByTag("event").sort(byOrder));

  // ---------- Static files ----------
  eleventyConfig.addPassthroughCopy({
    "src/css/base.css": "css/base.css",
    "src/css/stylesheet.css": "css/stylesheet.css",
    "src/css/icons.css": "css/icons.css",
    "src/css/carousel.css": "css/carousel.css",
    "src/js": "js",
    "src/fonts": "fonts",
    "src/videos": "videos",
    "src/images/**/*.svg": "images",
    "src/admin/config.txt": "admin/config.txt",
    "src/admin/index.html": "admin/index.html",
    // Font Awesome Free (icons CC BY 4.0, fonts SIL OFL), the same version the students linked to
    "node_modules/@fortawesome/fontawesome-free/css/all.min.css": "fontawesome/css/all.min.css",
    "node_modules/@fortawesome/fontawesome-free/webfonts": "fontawesome/webfonts",
  });

  // ---------- Self-hosted text fonts: copy only the fonts chosen in the dashboard ----------
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
