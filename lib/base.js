// Base path the site is served from.
//   Local dev / domain root:  "/"           (default)
//   Sub-folder on a server:   SITE_BASE=/debrief/2026/ npm run build
let base = process.env.SITE_BASE || "/";
if (!base.startsWith("/")) base = "/" + base;
if (!base.endsWith("/")) base = base + "/";
export const BASE = base;
