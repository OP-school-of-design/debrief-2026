// Dashboard fix for a Decap CMS bug: an image field asks for its thumbnail only once. Site-wide
// images (logos, page banners, favicon) are still loading at that moment, so their thumbnails
// stayed blank. This wrapper keeps checking until each picture has loaded, then redraws the
// thumbnail. It changes nothing else about the image field.
(function () {
  if (!window.CMS || !window.createClass || !window.h) return;
  var original = CMS.getWidget("image");
  if (!original || !original.control) return;
  var Control = original.control;
  var EMPTY = "empty.svg"; // Decap's stand-in while a picture loads

  function paths(value) {
    if (!value) return [];
    if (typeof value === "string") return [value];
    if (value.toArray) value = value.toArray();
    return Array.isArray(value) ? value.filter(function (v) { return typeof v === "string" && v; }) : [];
  }

  var FixedImageControl = createClass({
    componentDidMount: function () { this.check(); },
    componentDidUpdate: function (prev) { if (prev.value !== this.props.value) this.check(); },
    componentWillUnmount: function () { clearTimeout(this.timer); },
    check: function () {
      var self = this, tries = 0;
      clearTimeout(this.timer);
      (function poll() {
        var p = self.props;
        var waiting = paths(p.value).some(function (v) {
          var asset = p.getAsset(v, p.field);
          return !asset || asset.path === EMPTY;
        });
        if (!waiting) {
          if (tries) {
            // A new getAsset function makes the thumbnail ask again, now that the picture is ready.
            self.getAssetFresh = function (v, f) { return self.props.getAsset(v, f); };
            self.forceUpdate();
          }
          return;
        }
        if (++tries < 120) self.timer = setTimeout(poll, 500); // gives up after a minute
      })();
    },
    render: function () {
      var props = Object.assign({}, this.props);
      if (this.getAssetFresh) props.getAsset = this.getAssetFresh;
      return h(Control, props);
    },
  });

  CMS.registerWidget({
    name: "image",
    controlComponent: FixedImageControl,
    previewComponent: original.preview,
    schema: original.schema,
    globalStyles: original.globalStyles,
    allowMapValue: original.allowMapValue,
  });
})();
