import { keepExisting } from "../../lib/missing-images.js";

export default {
  layout: "layouts/event.njk",
  tags: ["event"],
  eleventyComputed: {
    permalink: (data) => `/events/${data.page.fileSlug}/`,
    // Images deleted from the media library while still used are left out (see lib/missing-images.js).
    ...keepExisting([["poster", "Poster"]], [["carousel", "Carousel image"]]),
  },
};
