// Starts the dashboard. Loaded before Decap itself.
//  - The settings (from src/admin/config.txt) are built into index.html, so Decap doesn't fetch a
//    separate settings file first: the dashboard opens about 0.7 s sooner.
//  - Decap's loading messages are replaced with clearer ones. Its last one, "This might take
//    several minutes", appears after just 10 seconds and sounds like something is wrong; the wait
//    is nearly always GitHub answering slowly.
window.CMS_MANUAL_INIT = true;

document.addEventListener("DOMContentLoaded", function () {
  var CMS = window.CMS;
  var el = document.getElementById("cms-config");
  if (!CMS || !el) return;

  try {
    var en = CMS.getLocale("en");
    if (en && en.collection && en.collection.entries) {
      var copy = JSON.parse(JSON.stringify(en));
      copy.collection.entries.loadingEntries = "Loading…";
      copy.collection.entries.cachingEntries = "Fetching from GitHub…";
      copy.collection.entries.longerLoading = "Still waiting for GitHub (it can be slow to answer)…";
      CMS.registerLocale("en", copy);
    }
  } catch (e) { /* keep Decap's own wording */ }

  var config = JSON.parse(el.textContent);
  config.load_config_file = false;
  CMS.init({ config: config });
});
