// Disciplines don't get a page of their own; the grid page (/graduates/<key>/) and
// about page (/about/<key>/) are generated from them in src/pages/.
import { keepExisting } from "../../lib/missing-images.js";

export default {
  tags: ["discipline"],
  permalink: false,
  // Images deleted from the media library while still used are left out (see lib/missing-images.js).
  eleventyComputed: keepExisting(
    [["symbol", "Symbol"], ["gradBannerImage", "Graduates page banner"], ["bannerImage", "About page banner"], ["image", "Image"]],
    [["carousel", "Carousel image"]],
  ),
};
