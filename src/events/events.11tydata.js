export default {
  layout: "layouts/event.njk",
  tags: ["event"],
  eleventyComputed: {
    permalink: (data) => `/events/${data.page.fileSlug}/`,
  },
};
