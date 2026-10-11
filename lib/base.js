// Base path the site is served from. Accepts "/debrief/2026/", "debrief/2026",
// or a full address like "https://design.ac.nz/debrief/2026/" (only the path is used).
let base = process.env.SITE_BASE || "/";
try {
  if (/^https?:\/\//i.test(base)) base = new URL(base).pathname;
} catch {}
const clean = base.replace(/^\/+|\/+$/g, "");
export const BASE = clean ? `/${clean}/` : "/";
