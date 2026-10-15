// Upload several images at once in the dashboard's image dialog.
//
// Decap's "Upload" button only takes one file. This lets editors pick many files in the file
// browser (Shift- or Cmd/Ctrl-click) and uploads them one after another through Decap's own upload
// (so its size limit, file-name clean-up and drafts all work as normal). They're sent in reverse
// order, so when they're done the FIRST file picked is at the top and selected, ready for
// "Choose selected". Every uploaded image then stays in the dialog for the graduate's other image
// fields (card, hero, gallery...).
//
// Decap itself is not changed (decap-3.16.3/ stays exactly as published on npm).
(function () {
  "use strict";

  var BUTTON = ".nc-fileUploadButton";
  var resending = false;

  // Let the hidden file input accept more than one file.
  function allowMultiple() {
    var inputs = document.querySelectorAll(BUTTON + ' input[type="file"]');
    for (var i = 0; i < inputs.length; i++) {
      if (!inputs[i].multiple) inputs[i].multiple = true;
    }
  }
  new MutationObserver(allowMultiple).observe(document.documentElement, { childList: true, subtree: true });

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  // Decap disables the button while an upload is in progress.
  function currentInput(fallback) {
    return fallback.isConnected ? fallback : document.querySelector(BUTTON + ' input[type="file"]');
  }

  async function waitUntilIdle(input) {
    for (var waited = 0; waited < 180000; waited += 100) {
      var el = currentInput(input);
      if (el && !el.disabled) return el;
      await sleep(100);
    }
    return currentInput(input);
  }

  async function uploadInTurn(input, files) {
    for (var i = 0; i < files.length; i++) {
      var el = await waitUntilIdle(input);
      if (!el) return;
      var one = new DataTransfer();
      one.items.add(files[i]);
      el.files = one.files;
      resending = true;
      el.dispatchEvent(new Event("change", { bubbles: true }));
      resending = false;
      await sleep(150); // give Decap a moment to start before checking it's finished
    }
  }

  // Catch the file browser's result before Decap sees it. One file: Decap handles it as usual.
  // Several: hand them to Decap one at a time.
  document.addEventListener("change", function (e) {
    var input = e.target;
    if (resending || !input || input.type !== "file" || !input.closest || !input.closest(BUTTON)) return;
    var files = Array.prototype.slice.call(input.files || []);
    if (files.length < 2) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    uploadInTurn(input, files.reverse());
  }, true);
})();
