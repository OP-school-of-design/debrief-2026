// A new version stamp on every build. It's added to the CSS and JavaScript links (?v=...), so after
// each deploy browsers and SiteGround's caches see new addresses and fetch the updated files.
export default {
  version: Date.now().toString(36),
};
