// Computed from Design > Typography in the dashboard (src/_data/typography.json).
import { readDesign, fontFaceCss, fontPreloads, fontStack } from "../../lib/fonts.js";
import { BASE } from "../../lib/base.js";

export default function () {
  const design = readDesign();
  const t = design.typography || {};
  return {
    css: fontFaceCss(design, BASE),
    preloads: fontPreloads(design, BASE),
    headingStack: fontStack(t.headingFont || "google-sans"),
    bodyStack: fontStack(t.bodyFont || "google-sans"),
  };
}
