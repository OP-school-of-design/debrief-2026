// Search-engine helpers: page descriptions and structured data (JSON-LD).
//
// Structured data tells Google and other search engines what a page is about, in a form they can
// use for richer results: a graduate's page is a profile of a person (with their links and
// picture), events with dates and a venue can appear in event listings, and every page gets
// "breadcrumbs" (DEBRIEF 2026 > All Graduates > Communication Design > name) instead of a bare
// web address under its title.
import { lastName } from "./helpers.js";

// Plain text from dashboard text (markdown), shortened at a word to about `max` characters.
export function summarise(text, max = 158) {
  let s = String(text || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")          // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")        // links -> their text
    .replace(/[*_`>#~]+/g, "")                      // emphasis, headings, quotes
    .replace(/\\\s*/g, " ")                         // markdown line breaks
    .replace(/\s+/g, " ")
    .trim();
  if (s.length <= max) return s;
  s = s.slice(0, max - 1);
  const cut = s.lastIndexOf(" ");
  return (cut > max * 0.6 ? s.slice(0, cut) : s).replace(/[\s,.;:–—-]+$/, "") + "…";
}

// First name(s) and last name, for the share preview of a graduate's profile.
export function nameParts(data) {
  const full = String(data?.title || "").trim();
  const last = lastName(data);
  const first = full.endsWith(last) ? full.slice(0, full.length - last.length).trim() : "";
  return { first, last };
}

const clean = (v) => {
  if (Array.isArray(v)) {
    const a = v.map(clean).filter((x) => x !== undefined);
    return a.length ? a : undefined;
  }
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      const c = clean(x);
      if (c !== undefined) o[k] = c;
    }
    return Object.keys(o).length ? o : undefined;
  }
  return v === "" || v === null || v === undefined ? undefined : v;
};

// One <script type="application/ld+json"> body from a list of items (empty items are dropped).
export function ldGraph(items) {
  const graph = (items || []).map(clean).filter(Boolean);
  return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
}

export function ldBreadcrumbs(crumbs) {
  const list = (crumbs || []).filter((c) => c && c.name && c.url);
  if (list.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    itemListElement: list.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };
}

const SCHOOL = {
  "@type": "CollegeOrUniversity",
  name: "Otago Polytechnic School of Design",
  url: "https://www.op.ac.nz/schools/school-of-design",
};

export function ldWebsite({ name, url, description }) {
  return { "@type": "WebSite", "@id": url + "#website", name, url, description, inLanguage: "en-NZ", publisher: SCHOOL };
}

// A graduate's page: a profile page about a person, with their project.
export function ldGraduate({ url, pageTitle, name, description, image, images, discipline, links, projectName, projectDescription, projectImage, website }) {
  const sameAs = (links || [])
    .filter((l) => l && l.type !== "email" && /^https?:\/\//i.test(String(l.url || "")))
    .map((l) => String(l.url).trim());
  return [
    {
      "@type": "ProfilePage",
      "@id": url + "#page",
      url,
      name: pageTitle,
      description,
      inLanguage: "en-NZ",
      isPartOf: website ? { "@id": website + "#website" } : undefined,
      primaryImageOfPage: image,
      mainEntity: { "@id": url + "#person" },
    },
    {
      "@type": "Person",
      "@id": url + "#person",
      name,
      url,
      description,
      image: images,
      sameAs,
      alumniOf: SCHOOL,
      knowsAbout: discipline,
      workExample: projectName
        ? { "@type": "CreativeWork", name: projectName, description: summarise(projectDescription, 300), image: projectImage, creator: { "@id": url + "#person" } }
        : undefined,
    },
  ];
}

// An event, when it has a start date (Search listing fields in the dashboard).
export function ldEvent({ url, name, description, image, startDate, endDate, venueName, venueAddress }) {
  // Dates arrive as text ("2026-11-19T17:30:00+13:00") or, when the YAML reader has already
  // turned them into dates, as Date objects.
  const iso = (d) => {
    if (!d) return "";
    if (d instanceof Date) return isNaN(d) ? "" : d.toISOString();
    return isNaN(new Date(String(d))) ? "" : String(d);
  };
  if (!iso(startDate)) return null;
  return {
    "@type": "ExhibitionEvent",
    "@id": url + "#event",
    name,
    url,
    description,
    image,
    startDate: iso(startDate),
    endDate: iso(endDate),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: venueName || "Otago Polytechnic",
      address: { "@type": "PostalAddress", streetAddress: venueAddress, addressLocality: "Dunedin", addressRegion: "Otago", addressCountry: "NZ" },
    },
    organizer: SCHOOL,
  };
}

// Search Console / Bing verification: accepts the whole <meta> tag or just its code, and keeps
// only the characters a verification code uses.
export function verificationCode(value) {
  const s = String(value || "").trim();
  const m = s.match(/content\s*=\s*["']([^"']+)["']/i);
  return (m ? m[1] : s).replace(/[^A-Za-z0-9_\-]/g, "");
}
