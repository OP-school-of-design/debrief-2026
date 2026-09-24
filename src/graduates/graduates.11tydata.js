// Applies to every graduate folder in src/graduates/
export default {
  layout: "layouts/graduate.njk",
  tags: ["graduate"],
  eleventyComputed: {
    // Unticking "Published" in the dashboard removes the page and the grid card without deleting anything.
    permalink: (data) => (data.published === false ? false : `/graduates/${data.discipline}/${data.page.fileSlug}/`),
  },
};
