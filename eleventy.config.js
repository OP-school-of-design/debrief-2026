import path from "node:path";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { BASE } from "./lib/base.js";
import { readDesign, copyFontFiles, copyPreviewFonts } from "./lib/fonts.js";
import { writeFavicons } from "./lib/favicon.js";
import fs from "node:fs";
import { entryImg, mdFilter, pclass, nl2br, embedUrl, where, faClass, bannerTitle, bannerDetails, naturalSizes, siteImg, safeUrl, gradImg, byName, responsiveCss } from "./lib/helpers.js";

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
  // Data for a <script type="application/json"> block: "<" is escaped so nothing in it can close the tag.
  eleventyConfig.addFilter("jsonScript", (v) =>
    JSON.stringify(v).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029"));
  eleventyConfig.addFilter("bannerDetails", bannerDetails);
  eleventyConfig.addFilter("naturalSizes", naturalSizes);
  eleventyConfig.addFilter("siteImg", siteImg);
  eleventyConfig.addFilter("safeUrl", safeUrl);
  eleventyConfig.addFilter("gradImg", gradImg);
  eleventyConfig.addFilter("responsiveCss", responsiveCss);

  // Text typed into the dashboard (graduate bios, event descriptions, page text) can't contain raw
  // HTML such as <script>: it's shown as plain text. Markdown formatting (bold, links...) still works,
  // and markdown links to "javascript:" addresses are already refused by the markdown library.
  eleventyConfig.amendLibrary("md", (mdLib) => mdLib.set({ html: false }));
  eleventyConfig.addFilter("trimSlash", (s) => String(s || "").replace(/\/+$/, ""));

  // ---------- Collections ----------
  const byOrder = (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.title.localeCompare(b.data.title);
  // Published graduates, in alphabetical order of name (on every graduates grid).
  eleventyConfig.addCollection("graduates", (api) =>
    api.getFilteredByTag("graduate").filter((g) => g.data.published !== false).sort(byName));
  // Every discipline / graduate category (used to look up a graduate's discipline name).
  eleventyConfig.addCollection("disciplines", (api) => api.getFilteredByTag("discipline").sort(byOrder));
  // Graduate categories shown in the "All Graduates" menu and footer, each with its own graduates page.
  // A category set to "only show when it has graduates" appears only while at least one PUBLISHED
  // graduate is in it, so it comes and goes on its own as graduates are added or removed.
  eleventyConfig.addCollection("gradCategories", (api) => {
    const counts = {};
    for (const g of api.getFilteredByTag("graduate")) {
      if (g.data.published === false) continue;
      counts[g.data.discipline] = (counts[g.data.discipline] || 0) + 1;
    }
    return api.getFilteredByTag("discipline")
      .filter((d) => d.data.inGraduatesMenu !== false)
      .filter((d) => !d.data.hideWhenEmpty || counts[d.data.disciplineKey] > 0)
      .sort(byOrder);
  });
  // Disciplines on the School of Design side: its coloured boxes and "About ..." menu.
  eleventyConfig.addCollection("schoolDisciplines", (api) =>
    api.getFilteredByTag("discipline").filter((d) => d.data.onSchoolPage !== false).sort(byOrder));
  // School of Design disciplines whose About page is switched on.
  eleventyConfig.addCollection("disciplinePages", (api) =>
    api.getFilteredByTag("discipline")
      .filter((d) => d.data.onSchoolPage !== false && d.data.pagesPublished !== false).sort(byOrder));
  eleventyConfig.addCollection("events", (api) => api.getFilteredByTag("event").sort(byOrder));

  // ---------- Static files ----------
  eleventyConfig.addPassthroughCopy({
    "src/css/base.css": "css/base.css",
    "src/css/stylesheet.css": "css/stylesheet.css",
    "src/css/icons.css": "css/icons.css",
    "src/css/carousel.css": "css/carousel.css",
    "src/css/additions.css": "css/additions.css",
    "src/js": "js",
    "src/fonts": "fonts",
    "src/videos": "videos",
    "src/.htaccess": ".htaccess",
    "src/images/**/*.svg": "images",
    "src/admin/start.js": "admin/start.js",
    "src/admin/multi-upload.js": "admin/multi-upload.js",
    "src/admin/image-thumbnail-fix.js": "admin/image-thumbnail-fix.js",
    "src/admin/previews.js": "admin/previews.js",
    "src/admin/decap-3.16.3": "admin/decap-3.16.3",
    "src/admin/.htaccess": "admin/.htaccess",
    // Font Awesome Free (icons CC BY 4.0, fonts SIL OFL), the same version the students linked to
    "node_modules/@fortawesome/fontawesome-free/css/all.min.css": "fontawesome/css/all.min.css",
    "node_modules/@fortawesome/fontawesome-free/webfonts": "fontawesome/webfonts",
  });

  // ---------- Self-hosted text fonts: copy only the fonts chosen in the dashboard ----------
  eleventyConfig.on("eleventy.after", ({ directories, dir }) => {
    copyFontFiles(readDesign(), directories?.output || dir.output);
    // Every font, for the dashboard's type specimens only (admin/fonts/).
    copyPreviewFonts(directories?.output || dir.output);
  });
  eleventyConfig.addWatchTarget("src/_data/typography.json");
  eleventyConfig.addWatchTarget("src/admin/config.txt");

  // ---------- Favicon: tab and home-screen icons made from Site settings → Favicon ----------
  eleventyConfig.on("eleventy.after", async ({ directories, dir }) => {
    const site = JSON.parse(fs.readFileSync("src/_data/site.json", "utf8"));
    await writeFavicons(site, directories?.output || dir.output);
  });
  eleventyConfig.addWatchTarget("src/favicon/");
  eleventyConfig.addWatchTarget("src/_includes/head-code.html");

  eleventyConfig.setServerOptions({ showVersion: false });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    pathPrefix: BASE,
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: false, // people typing {{ }} in the dashboard can't break the build
  };
}
