// Applies to every graduate folder in src/graduates/
import { keepExisting } from "../../lib/missing-images.js";

export default {
  layout: "layouts/graduate.njk",
  tags: ["graduate"],
  eleventyComputed: {
    // Unticking "Published" in the dashboard removes the page and the grid card without deleting anything.
    permalink: (data) => (data.published === false ? false : `/graduates/${data.discipline}/${data.page.fileSlug}/`),
    // An image deleted from the media library while this page still uses it is left out (and listed
    // in the build log) instead of stopping the whole site from being published.
    ...keepExisting(
      [["cover", "Card image"], ["hero", "Hero image"], ["headshot", "Headshot"]],
      [["gallery", "Gallery image"]],
    ),
  },
};
