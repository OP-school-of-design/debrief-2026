// Dashboard previews (the right-hand pane while editing) for Graduates, Disciplines, Events, the
// Pages (Front page, About the School of Design, All Graduates page, Events listing page, Archive
// menu) and Site settings. Design (colours, fonts, CSS) keeps Decap's plain preview.
// Decap's built-in preview just lists every field in form order at full size. These show each part
// labelled, in the order and grouping editors think in, with images at a sensible size and notes
// on what shows where. They're previews for editors only: the real pages use the site's design.
(function () {
  if (!window.CMS || !window.createClass || !window.h) return;

  var STYLE = [
    "body{margin:0;background:#fff}",
    ".gp{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#1d1d1b;padding:24px 28px 48px;max-width:860px}",
    ".gp h1{font-size:28px;margin:0 0 4px}",
    ".gp .sub{color:#5d626f;margin:0 0 4px}",
    ".gp .note{display:inline-block;font-size:12px;background:#fdecc8;color:#6b4e00;border-radius:4px;padding:2px 8px;margin:4px 0 0}",
    ".gp .sec{margin:28px 0 0}",
    ".gp .lab{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#5d626f;margin:0 0 8px;border-bottom:1px solid #e3e4e8;padding-bottom:4px}",
    ".gp .row{display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start}",
    ".gp figure{margin:0}",
    ".gp figcaption{font-size:12px;color:#5d626f;margin-top:4px;max-width:220px}",
    ".gp .card{width:200px;height:200px;object-fit:cover;display:block;background:#efefef}",
    ".gp .head{width:120px;height:120px;object-fit:cover;border-radius:50%;display:block;background:#efefef}",
    ".gp .hero{width:100%;max-height:420px;object-fit:cover;display:block;background:#efefef}",
    ".gp .empty{color:#8a8f99;font-style:italic;font-size:14px;margin:0}",
    ".gp .quote{color:#ff4200;font-weight:700;font-size:20px;margin:0}",
    ".gp .masonry{columns:3 180px;column-gap:12px}",
    ".gp .masonry img{width:100%;display:block;margin:0 0 12px;break-inside:avoid;background:#efefef}",
    ".gp ul.links{list-style:none;padding:0;margin:0}",
    ".gp ul.links li{margin:0 0 6px}",
    ".gp .body p{margin:0 0 10px;line-height:1.5}",
    ".gp .ok{color:#1d6b2c}.gp .no{color:#8a8f99}",
    ".gp ul.where{margin:0;padding-left:18px}.gp ul.where li{margin:0 0 4px}",
    ".gp .box{display:flex;align-items:center;gap:16px;width:260px;padding:14px 18px;border-radius:4px;background:#d9d9d9}",
    ".gp .box img{width:44px;height:44px;object-fit:contain}",
    ".gp .banner{position:relative;width:100%;height:180px;background:#efefef;overflow:hidden}",
    ".gp .banner img{width:100%;height:100%;object-fit:cover;display:block}",
    ".gp .banner span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#ff4200;font-weight:700;font-size:26px;text-align:center;padding:0 12px}",
    ".gp .square{width:220px;height:220px;object-fit:cover;display:block;background:#efefef}",
    ".gp .poster{max-width:260px;max-height:360px;display:block;background:#efefef}",
    ".gp .slides{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}",
    ".gp .slides figure{flex:0 0 auto}",
    ".gp .slides img{height:120px;width:auto;display:block;background:#efefef}",
    ".gp .datesbanner{background:#ffe800;padding:16px 20px}",
    ".gp .datesbanner p{margin:0 0 6px}",
    ".gp .tag{display:inline-block;font-size:12px;background:#eef0f4;border-radius:4px;padding:2px 8px;margin:0 6px 6px 0}",
    ".gp .phone{width:300px;flex:0 0 auto}.gp .desk{flex:1 1 360px}",
    ".gp .cap{font-size:12px;color:#5d626f;margin:0 0 4px}",
    ".gp .serp{border:1px solid #e3e4e8;border-radius:8px;padding:12px 16px;max-width:600px}",
    ".gp .serp .u{font-size:13px;color:#4d5156;margin:0 0 2px;display:flex;align-items:center;gap:8px}",
    ".gp .serp .u img{width:18px;height:18px;border-radius:50%;background:#f1f3f4}",
    ".gp .serp .t{font-size:19px;color:#1a0dab;margin:0 0 3px}",
    ".gp .serp .d{font-size:14px;color:#4d5156;margin:0;line-height:1.45}",
    ".gp .warn{color:#a33a00;font-size:13px;margin:6px 0 0}",
    ".gp .boxes{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}",
    ".gp .boxes .box{width:auto}",
    ".gp .dd{display:inline-block;min-width:240px;border:1px solid #e3e4e8;border-radius:4px;overflow:hidden}",
    ".gp .dd .hd{background:#1d1d1b;color:#fff;font-weight:700;padding:10px 14px}",
    ".gp .dd a,.gp .dd span.i{display:block;padding:8px 14px;border-top:1px solid #eee;color:#1d1d1b;text-decoration:none}",
    ".gp ol.cats{margin:0;padding-left:22px}.gp ol.cats li{margin:0 0 8px}",
    ".gp .cats small{display:block;font-size:12px}",
    ".gp .tab{display:inline-flex;align-items:center;gap:8px;background:#f1f3f4;border-radius:8px 8px 0 0;padding:8px 14px;font-size:13px;max-width:280px}",
    ".gp .tab img{width:16px;height:16px}",
    ".gp .home{width:60px;height:60px;border-radius:14px;object-fit:cover;display:block;background:#efefef}",
    ".gp .foot{background:#ffe800;border-top:10px solid #ff48b0;color:#1d1d1b;padding:20px 22px;display:flex;gap:28px;flex-wrap:wrap}",
    ".gp .foot h4{margin:0 0 8px;font-size:14px;color:#ff4200}",
    ".gp .foot ul{list-style:none;margin:0;padding:0;font-size:13px}.gp .foot li{margin:0 0 5px}",
    ".gp .foot p{font-size:12px;margin:12px 0 0}",
    ".gp .navbar{background:#fff;border:1px solid #e3e4e8;padding:10px 14px;display:flex;align-items:center;gap:22px;font-size:14px}"
  ].join("\n");

  // Maxis' CSS colours the School of Design boxes by position (1st green, 2nd blue, 3rd red, 4th
  // purple) unless a discipline sets its own Box colour. Default palette colours.
  var POSITION_COLOURS = ["#8dc63f", "#60c8d6", "#ef4237", "#9c3e97"];

  function get(entry, key) {
    var v = entry.getIn(["data", key]);
    return v === undefined || v === null ? "" : v;
  }

  function listOf(entry, key) {
    var v = entry.getIn(["data", key]);
    return v && v.toArray ? v.toArray() : [];
  }

  function src(getAsset, path, field) {
    if (!path) return "";
    var asset = getAsset(path, field);
    return asset ? asset.toString() : "";
  }

  function fieldByName(fields, name) {
    if (!fields) return null;
    return fields.find(function (f) { return f.get("name") === name; }) || null;
  }

  // A text field rendered by the dashboard (markdown etc.). Guarded so a field missing from an
  // entry can't break the preview.
  function widget(props, name) {
    try { return props.widgetFor(name); } catch (e) { return null; }
  }

  function section(label, children) {
    return h("div", { className: "sec" }, h("p", { className: "lab" }, label), children);
  }

  function empty(text) {
    return h("p", { className: "empty" }, text);
  }


  // Images from GitHub arrive a moment after the preview first draws, so redraw for a minute.
  var Redraw = {
    componentDidMount: function () {
      var self = this, n = 0;
      this.redrawTimer = setInterval(function () {
        if (++n > 60) return clearInterval(self.redrawTimer);
        self.forceUpdate();
      }, 1000);
    },
    componentWillUnmount: function () { clearInterval(this.redrawTimer); },
  };

  // Text with line breaks kept.
  function lines(text) {
    var parts = String(text || "").split(/\r?\n/), out = [];
    parts.forEach(function (p, i) { if (i) out.push(h("br", { key: "b" + i })); out.push(p); });
    return out;
  }

  function yesNo(on, yes, no) {
    return h("li", { className: on ? "ok" : "no" }, (on ? "\u2713 " : "\u2013 ") + (on ? yes : no));
  }

  function carouselSection(entry, getAsset, fields) {
    var slides = listOf(entry, "carousel");
    var field = fieldByName(fields, "carousel");
    var on = entry.getIn(["data", "showCarousel"]) === true;
    var auto = entry.getIn(["data", "carouselAutoplay"]) === true;
    var secs = get(entry, "carouselInterval") || 5;
    var status = on
      ? "Shown" + (auto ? ", advancing every " + secs + " seconds" : ", visitors click through it") + ". " + slides.length + " slide" + (slides.length === 1 ? "" : "s") + "."
      : "Hidden from the page" + (slides.length ? " (" + slides.length + " slide" + (slides.length === 1 ? "" : "s") + " kept for later)." : ".");
    return section("Carousel",
      h("div", null,
        h("p", { className: on ? "" : "empty", style: { margin: "0 0 8px" } }, status),
        slides.length
          ? h("div", { className: "slides" }, slides.map(function (s, i) {
              var p = s && s.get ? s.get("image") : "";
              var u = src(getAsset, p, field);
              var cap = s && s.get ? s.get("caption") : "";
              return h("figure", { key: i, style: on ? null : { opacity: 0.5 } },
                u ? h("img", { src: u, alt: "" }) : h("div", { style: { width: 160, height: 120, background: "#efefef" } }),
                h("figcaption", null, cap || ("Slide " + (i + 1))));
            }))
          : null));
  }

  // The dates banner as it looks on a computer and on a phone. In the title, a new line is a line
  // break on computers only. In the details, a new line is a line break everywhere and "//" is a
  // line break on phones only (a space on computers). Same rules as lib/helpers.js.
  function datesBanner(title, details) {
    if (!title && !details) return empty("No dates banner.");
    function render(phone) {
      var t = String(title || "").split(/\r?\n/).map(function (l) { return l.trim(); });
      var d = String(details || "").split(/\r?\n/).map(function (l) {
        return l.split("//").map(function (p) { return p.trim(); }).join(phone ? "\n" : " ");
      }).join("\n");
      return h("div", { className: phone ? "phone" : "desk" },
        h("p", { className: "cap" }, phone ? "Phone" : "Computer"),
        h("div", { className: "datesbanner" },
          title ? h("p", { style: { fontWeight: 700, fontSize: 18 } }, phone ? t.join(" ") : lines(t.join("\n"))) : null,
          details ? h("p", null, lines(d)) : null));
    }
    return h("div", { className: "row" }, render(false), render(true));
  }

  // How the page could appear in a Google search result.
  function searchResult(title, address, desc, iconSrc) {
    var long = String(desc || "").length > 160;
    return h("div", null,
      h("div", { className: "serp" },
        h("p", { className: "u" }, iconSrc ? h("img", { src: iconSrc, alt: "" }) : null, address),
        h("p", { className: "t" }, title),
        h("p", { className: "d" }, desc ? (long ? String(desc).slice(0, 157) + "…" : desc) : h("em", null, "No description: search engines pick some text from the page."))),
      long ? h("p", { className: "warn" }, "The description is " + String(desc).length + " characters; search engines usually show about 160, so the end is cut off.") : null);
  }

  function imageOrBlank(url, className, style) {
    return url ? h("img", { className: className, src: url, alt: "", style: style }) : h("div", { className: className, style: style });
  }

  // Data from other parts of the dashboard (the published versions on GitHub), loaded once when the
  // preview opens. Unpublished drafts aren't included, as on the site.
  function loadInto(component, key, collection, file) {
    if (!component.props.getCollection) return;
    component.props.getCollection(collection, file).then(function (res) {
      var s = {}; s[key] = res; component.setState(s);
    }).catch(function () {
      var s = {}; s[key + "Failed"] = true; component.setState(s);
    });
  }

  function dataOf(item) {
    var d = item && item.get ? item.get("data") : null;
    return d && d.toJS ? d.toJS() : (d || {});
  }

  function byOrder(a, b) {
    return ((a.order == null ? 999 : a.order) - (b.order == null ? 999 : b.order)) || String(a.title || "").localeCompare(String(b.title || ""));
  }

  function siteSettings(component) {
    return component.state && component.state.site ? dataOf(component.state.site) : {};
  }

  function videoSection(entry, label) {
    var url = get(entry, "videoUrl"), title = get(entry, "videoTitle");
    return section(label || "Video",
      url
        ? h("div", null, title ? h("p", { style: { fontWeight: 700, margin: "0 0 4px" } }, title) : null, h("p", { style: { margin: 0, wordBreak: "break-all" } }, url))
        : empty("No video."));
  }

  var GraduatePreview = createClass({
    mixins: [Redraw],

    render: function () {
      var entry = this.props.entry;
      var getAsset = this.props.getAsset;
      var fields = this.props.fields;

      // Discipline: show its name, not its key.
      var discKey = get(entry, "discipline");
      var discName = discKey;
      var discField = fieldByName(fields, "discipline");
      if (discField && discField.get("options")) {
        discField.get("options").forEach(function (o) {
          if (o.get && o.get("value") === discKey) discName = o.get("label");
        });
      }

      var cover = get(entry, "cover"), hero = get(entry, "hero"), headshot = get(entry, "headshot");
      var cardSrc = src(getAsset, cover || hero, fieldByName(fields, cover ? "cover" : "hero"));
      var heroSrc = src(getAsset, hero, fieldByName(fields, "hero"));
      var headSrc = src(getAsset, headshot, fieldByName(fields, "headshot"));
      var galleryField = fieldByName(fields, "gallery");
      var gallery = listOf(entry, "gallery");
      var links = listOf(entry, "links");
      var published = entry.getIn(["data", "published"]) !== false;

      return h("div", { className: "gp" },
        h("style", null, STYLE),

        h("h1", null, get(entry, "title") || "(no name yet)"),
        h("p", { className: "sub" }, discName || "(no discipline chosen)"),
        published ? null : h("p", { className: "note" }, "Unpublished: hidden from the site"),

        section("Card (graduate grids) and headshot",
          h("div", { className: "row" },
            h("figure", null,
              cardSrc ? h("img", { className: "card", src: cardSrc, alt: "" }) : h("div", { className: "card" }),
              h("figcaption", null, cover ? "Card image" : hero ? "No card image: the hero image is used" : "No card image: grey placeholder")),
            h("figure", null,
              headSrc ? h("img", { className: "head", src: headSrc, alt: "" }) : h("div", { className: "head" }),
              h("figcaption", null, headshot ? "Headshot" : "No headshot: grey placeholder")))),

        section("Project",
          h("div", null,
            h("p", { style: { fontWeight: 700, margin: "0 0 6px" } }, get(entry, "projectName") || "(no project name)"),
            get(entry, "projectDescription") ? h("p", { style: { margin: 0, lineHeight: 1.5 } }, get(entry, "projectDescription")) : empty("(no project description)"))),

        section("Hero image",
          heroSrc ? h("img", { className: "hero", src: heroSrc, alt: "" }) : empty("No hero image: the page will not show one.")),

        section("About the graduate", h("div", { className: "body" }, widget(this.props, "body"))),

        get(entry, "quote") ? section("Quote", h("p", { className: "quote" }, get(entry, "quote"))) : null,

        section("Gallery images (masonry grid)",
          gallery.length
            ? h("div", { className: "masonry" }, gallery.map(function (item, i) {
                var p = item && item.get ? item.get("image") : "";
                var s = src(getAsset, p, galleryField);
                return s ? h("img", { key: i, src: s, alt: "" }) : null;
              }))
            : empty("No gallery images yet.")),

        section("Contact links",
          links.length
            ? h("ul", { className: "links" }, links.map(function (l, i) {
                var type = l.get("type") || "link", url = l.get("url") || "", label = l.get("label") || "";
                var names = { website: "Website", email: "Email", instagram: "Instagram", linkedin: "LinkedIn", facebook: "Facebook", youtube: "YouTube", behance: "Behance", other: "Link", link: "Link" };
                return h("li", { key: i }, h("strong", null, (names[type] || type) + ": "), label && label !== names[type] ? label + " (" + url + ")" : url);
              }))
            : empty("No contact links."))
      );
    },
  });

  var DisciplinePreview = createClass({
    mixins: [Redraw],

    render: function () {
      var entry = this.props.entry, getAsset = this.props.getAsset, fields = this.props.fields;
      var key = get(entry, "disciplineKey");
      var inMenu = entry.getIn(["data", "inGraduatesMenu"]) !== false;
      var whenFull = entry.getIn(["data", "hideWhenEmpty"]) === true;
      var onSchool = entry.getIn(["data", "onSchoolPage"]) === true;
      var aboutLive = entry.getIn(["data", "pagesPublished"]) === true;
      var colour = get(entry, "boxColour");
      // The box's position on the page follows the Order number.
      var order = parseInt(get(entry, "order"), 10) || 0;
      var defaultColour = POSITION_COLOURS[order - 1] || "#d9d9d9";
      var symbolSrc = src(getAsset, get(entry, "symbol"), fieldByName(fields, "symbol"));
      var gradBanner = get(entry, "gradBannerImage") || get(entry, "bannerImage");
      var gradBannerSrc = src(getAsset, gradBanner, fieldByName(fields, get(entry, "gradBannerImage") ? "gradBannerImage" : "bannerImage"));
      var aboutBannerSrc = src(getAsset, get(entry, "bannerImage"), fieldByName(fields, "bannerImage"));
      var introSrc = src(getAsset, get(entry, "image"), fieldByName(fields, "image"));
      var title = get(entry, "title") || "(no name yet)";

      var parts = [
        h("style", { key: "s" }, STYLE),
        h("h1", { key: "t" }, title),
        h("p", { key: "k", className: "sub" }, key ? "Web address key: " + key : "(no web address key yet)"),

        section("Where it appears", h("ul", { className: "where" },
          inMenu
            ? yesNo(true, whenFull ? "All Graduates menu, footer and its own graduates page, but only while it has at least one published graduate" : "All Graduates menu, footer and its own graduates page (/graduates/" + key + "/)")
            : yesNo(false, "", "Not a graduate category (not in the All Graduates menu)"),
          onSchool ? yesNo(true, "School of Design page (a box) and the School of Design menu") : yesNo(false, "", "Not on the School of Design page or menu"),
          onSchool ? yesNo(aboutLive, "About page live (/about/" + key + "/)", "About page not live yet") : null)),
      ];

      if (inMenu) {
        parts.push(section("Graduates page banner",
          h("div", { className: "banner" },
            gradBannerSrc ? h("img", { src: gradBannerSrc, alt: "" }) : null,
            h("span", null, title)),
          gradBanner ? null : h("p", { className: "empty", style: { marginTop: 6 } }, "No banner chosen: the site's placeholder banner is used.")));
      }

      if (onSchool) {
        parts.push(section("School of Design page box",
          h("div", null,
            h("div", { className: "box", style: { background: colour || defaultColour } },
              symbolSrc ? h("img", { src: symbolSrc, alt: "" }) : null,
              h("span", null, get(entry, "shortName") || title)),
            h("p", { className: "empty", style: { marginTop: 6 } }, colour ? "Box colour: " + colour + " (chosen here)." : "Box colour: Maxis' colour for its position on the page (set in Design > Colour palette)."))));

        parts.push(section("About page banner",
          h("div", { className: "banner" },
            aboutBannerSrc ? h("img", { src: aboutBannerSrc, alt: "" }) : null,
            h("span", null, "About " + title))));

        parts.push(section("About page introduction",
          h("div", { className: "row" },
            h("div", { style: { flex: "1 1 300px" } },
              h("p", { style: { fontWeight: 700, margin: "0 0 6px" } }, get(entry, "introHeading") || "(no heading)"),
              h("div", { className: "body" }, widget(this.props, "intro"))),
            introSrc ? h("img", { className: "square", src: introSrc, alt: "" }) : h("div", { className: "square" }))));

        parts.push(videoSection(entry, "About page video"));
        parts.push(carouselSection(entry, getAsset, fields));
        if (get(entry, "moreText")) parts.push(section("Text under the carousel", h("div", { className: "body" }, widget(this.props, "moreText"))));
      } else {
        parts.push(section("About page", empty("Not on the School of Design side, so the About page fields aren't used.")));
      }

      return h("div", { className: "gp" }, parts);
    },
  });

  var EventPreview = createClass({
    mixins: [Redraw],

    render: function () {
      var entry = this.props.entry, getAsset = this.props.getAsset, fields = this.props.fields;
      var posterSrc = src(getAsset, get(entry, "poster"), fieldByName(fields, "poster"));
      var title = get(entry, "title") || "(no name yet)";
      var bTitle = get(entry, "bannerTitle"), bDetails = get(entry, "bannerDetails");

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, title),
        get(entry, "subtitle") ? h("p", { className: "sub" }, get(entry, "subtitle")) : null,

        section("Events page card and menus",
          h("div", { className: "row" },
            posterSrc ? h("img", { className: "poster", src: posterSrc, alt: "", style: { maxWidth: 160 } }) : h("div", { className: "poster", style: { width: 160, height: 220 } }),
            h("div", { style: { flex: "1 1 260px" } },
              h("p", { style: { fontWeight: 700, margin: "0 0 4px" } }, title),
              get(entry, "subtitle") ? h("p", { style: { margin: "0 0 6px" } }, get(entry, "subtitle")) : null,
              get(entry, "gridDates") ? h("p", { style: { margin: "0 0 10px", color: "#5d626f" } }, lines(get(entry, "gridDates"))) : null,
              h("span", { className: "tag" }, "Top menu: " + (get(entry, "navLabel") || title)),
              h("span", { className: "tag" }, "Footer: " + (get(entry, "footerLabel") || title))))),

        section("Event page",
          h("div", { className: "row" },
            h("div", { style: { flex: "1 1 320px" } },
              h("p", { style: { fontWeight: 700, fontSize: 22, margin: "0 0 4px" } }, get(entry, "heading") || title),
              get(entry, "detailDatesLine") ? h("p", { style: { fontWeight: 600, margin: "0 0 10px" } }, lines(get(entry, "detailDatesLine"))) : null,
              h("div", { className: "body" }, widget(this.props, "body"))),
            posterSrc ? h("img", { className: "poster", src: posterSrc, alt: "" }) : empty("No poster."))),

        section("Dates banner", datesBanner(bTitle, bDetails)),

        carouselSection(entry, getAsset, fields),
        get(entry, "moreText") ? section("Text under the carousel", h("div", { className: "body" }, widget(this.props, "moreText"))) : null,
        videoSection(entry)
      );
    },
  });

  // ------------------------------------------------------------------ PAGES AND SITE SETTINGS

  function altNote(path, alt) {
    return path && !alt ? h("p", { className: "warn" }, "No description (alt text) for this image.") : null;
  }

  function addressOf(site, sub) {
    var u = String(site.url || "").replace(/^https?:\/\//, "").replace(/\/+$/, "");
    return (u + (sub || "")).replace(/\/+$/, "").split("/").join(" › ");
  }

  function bannerSection(label, url, text, alt, path) {
    return section(label, h("div", null,
      h("div", { className: "banner" }, url ? h("img", { src: url, alt: "" }) : null, h("span", null, text)),
      path ? altNote(path, alt) : h("p", { className: "empty", style: { marginTop: 6 } }, "No banner image chosen.")));
  }

  function loading(component, key, what) {
    if (component.state && component.state[key + "Failed"]) return empty("Couldn't load " + what + ".");
    return empty("Loading " + what + "…");
  }

  var FrontPagePreview = createClass({
    mixins: [Redraw],
    getInitialState: function () { return {}; },
    componentDidMount: function () { loadInto(this, "site", "settings", "site"); },

    render: function () {
      var entry = this.props.entry, getAsset = this.props.getAsset, fields = this.props.fields;
      var site = siteSettings(this);
      var img = function (name) { return src(getAsset, get(entry, name), fieldByName(fields, name)); };
      var on = entry.getIn(["data", "showWalkthrough"]) === true;
      var vUrl = get(entry, "walkthroughVideoUrl"), vFile = get(entry, "walkthroughVideoFile");
      var wStatus = on
        ? (vUrl || vFile ? "Shown on the front page." : "Switched on, but hidden until a video address or video file is added.")
        : "Hidden (switched off).";

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, "Front page"),

        section("In Google search results",
          searchResult(get(entry, "seoTitle") || ((site.name || "") + " - " + (site.tagline || "")), addressOf(site), get(entry, "metaDescription") || site.description)),
        !get(entry, "seoTitle") || !get(entry, "metaDescription")
          ? h("p", { className: "empty", style: { marginTop: 6 } }, "Empty SEO title or meta description: the Site settings ones are used.")
          : null,

        section("Logo animation",
          h("div", null,
            h("div", { className: "row" },
              h("figure", { className: "desk" }, h("p", { className: "cap" }, "Computer"), imageOrBlank(img("heroDesktop"), "hero")),
              h("figure", { className: "phone" }, h("p", { className: "cap" }, "Phone"), imageOrBlank(img("heroMobile"), "hero"))),
            altNote(get(entry, "heroDesktop"), get(entry, "heroAlt")))),

        section("Dates banner", datesBanner(get(entry, "datesTitle"), get(entry, "datesDetails"))),

        section("Introduction",
          h("div", { className: "row" },
            h("div", { style: { flex: "1 1 300px" } },
              h("p", { style: { fontWeight: 700, fontSize: 20, margin: "0 0 6px" } }, get(entry, "introHeading") || "(no heading)"),
              h("div", { className: "body" }, h("p", null, lines(get(entry, "introText"))))),
            h("div", null, imageOrBlank(img("introImage"), "square"), altNote(get(entry, "introImage"), get(entry, "introImageAlt"))))),

        section("Walkthrough video",
          h("div", { style: on ? null : { opacity: 0.6 } },
            h("p", { className: on && (vUrl || vFile) ? "" : "empty", style: { margin: "0 0 8px" } }, wStatus),
            get(entry, "walkthroughHeading") ? h("p", { style: { fontWeight: 700, margin: "0 0 4px" } }, get(entry, "walkthroughHeading")) : null,
            vUrl ? h("p", { style: { margin: "0 0 6px", wordBreak: "break-all" } }, "Video address: " + vUrl)
              : vFile ? h("p", { style: { margin: "0 0 6px" } }, "Video file: " + String(vFile).split("/").pop()) : null,
            !vUrl && img("walkthroughPoster") ? h("img", { className: "card", src: img("walkthroughPoster"), alt: "", style: { width: 320, height: 180 } }) : null,
            get(entry, "walkthroughCaption") ? h("p", { style: { margin: "6px 0 0" } }, get(entry, "walkthroughCaption")) : null)),

        get(entry, "quote") || get(entry, "quoteImage")
          ? section("Quote",
              h("div", { className: "row" },
                h("p", { className: "quote", style: { flex: "1 1 300px" } }, get(entry, "quote")),
                h("div", null, img("quoteImage") ? h("img", { className: "poster", src: img("quoteImage"), alt: "" }) : null, altNote(get(entry, "quoteImage"), get(entry, "quoteImageAlt")))))
          : section("Quote", empty("No quote: the section is left out."))
      );
    },
  });

  var SchoolPreview = createClass({
    mixins: [Redraw],
    getInitialState: function () { return {}; },
    componentDidMount: function () {
      loadInto(this, "site", "settings", "site");
      loadInto(this, "disciplines", "disciplines");
    },

    render: function () {
      var entry = this.props.entry, getAsset = this.props.getAsset, fields = this.props.fields;
      var site = siteSettings(this);
      var title = get(entry, "title") || "About the School of Design";
      var boxes = null;
      if (this.state.disciplines) {
        var list = this.state.disciplines.map(dataOf).filter(function (d) { return d.onSchoolPage !== false; }).sort(byOrder);
        boxes = list.length
          ? h("div", { className: "boxes" }, list.map(function (d, i) {
              return h("div", { key: i, className: "box", style: { background: d.boxColour || POSITION_COLOURS[i] || "#d9d9d9" } },
                h("span", null, d.shortName || d.title));
            }))
          : empty("No disciplines are on the School of Design page.");
      }

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, title),

        section("In Google search results",
          searchResult(title + " | " + (site.name || ""), addressOf(site, "/school-of-design"), get(entry, "metaDescription") || site.description)),

        bannerSection("Banner", src(getAsset, get(entry, "bannerImage"), fieldByName(fields, "bannerImage")), get(entry, "heading") || title, get(entry, "bannerAlt"), get(entry, "bannerImage")),

        section("Disciplines",
          h("div", null,
            h("p", { style: { fontWeight: 700, fontSize: 20, margin: "0 0 10px" } }, (get(entry, "disciplinesHeading") || "(no heading)") + " ▾"),
            boxes || loading(this, "disciplines", "the disciplines"),
            h("p", { className: "empty", style: { marginTop: 8 } }, "Visitors click the heading to open the boxes. The boxes, their order, colours and symbols are set in Disciplines."))),

        section("Description",
          h("div", { className: "row" },
            h("div", { style: { flex: "1 1 300px" } },
              h("p", { style: { fontWeight: 700, fontSize: 20, margin: "0 0 6px" } }, get(entry, "descHeading") || "(no heading)"),
              h("div", { className: "body" }, widget(this.props, "body"))),
            h("div", null,
              imageOrBlank(src(getAsset, get(entry, "descImage"), fieldByName(fields, "descImage")), "square"),
              altNote(get(entry, "descImage"), get(entry, "descImageAlt")))))
      );
    },
  });

  var GraduatesPagePreview = createClass({
    getInitialState: function () { return {}; },
    componentDidMount: function () {
      loadInto(this, "disciplines", "disciplines");
      loadInto(this, "graduates", "graduates");
    },

    render: function () {
      var entry = this.props.entry;
      var title = get(entry, "title") || "(no title)";
      var st = this.state;
      var body;

      if (!st.disciplines || !st.graduates) {
        body = loading(this, st.disciplines ? "graduates" : "disciplines", "the disciplines and graduates");
      } else {
        var discs = st.disciplines.map(dataOf);
        var byKey = {}; discs.forEach(function (d) { byKey[d.disciplineKey] = d; });
        var counts = {};
        st.graduates.map(dataOf).forEach(function (g) {
          if (g.published === false) return;
          counts[g.discipline] = (counts[g.discipline] || 0) + 1;
        });
        // Same order as the site (lib/helpers.js byCategory): this list first, then any others by Order.
        var order = listOf(entry, "categoryOrder").map(function (c) { return c && c.get ? c.get("category") : c; }).filter(Boolean);
        discs.slice().sort(byOrder).forEach(function (d) { if (order.indexOf(d.disciplineKey) === -1) order.push(d.disciplineKey); });
        var menu = discs.filter(function (d) { return d.inGraduatesMenu !== false && (!d.hideWhenEmpty || counts[d.disciplineKey] > 0); }).sort(byOrder);

        body = h("div", null,
          section("Graduate grid, in this order",
            h("div", null,
              h("ol", { className: "cats" }, order.map(function (k) {
                var d = byKey[k], n = counts[k] || 0;
                var note = !d ? "No discipline with this key."
                  : n ? n + " published graduate" + (n === 1 ? "" : "s") + ", in alphabetical order"
                  : "No published graduates yet" + (d.hideWhenEmpty && d.inGraduatesMenu !== false ? ": also hidden from the menus" : "");
                return h("li", { key: k, className: n ? "" : "no" }, d ? d.title : k, h("small", null, note));
              })),
              h("p", { className: "empty", style: { marginTop: 4 } }, "Counts include published graduates only. Drafts that haven't been published don't appear on the site yet."))),

          section("All Graduates menu and footer",
            h("div", null,
              h("div", { className: "dd" },
                h("div", { className: "hd" }, title + " ▾"),
                menu.map(function (d, i) { return h("span", { key: i, className: "i" }, d.title); })),
              h("p", { className: "empty", style: { marginTop: 8 } }, "The menus list categories by each discipline's Order number (Disciplines), not by the order above."))));
      }

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, title),
        h("p", { className: "sub" }, "The page heading and the top menu label. This page has no banner."),
        body);
    },
  });

  var EventsPagePreview = createClass({
    mixins: [Redraw],
    getInitialState: function () { return {}; },
    componentDidMount: function () { loadInto(this, "events", "events"); },

    render: function () {
      var entry = this.props.entry, getAsset = this.props.getAsset, fields = this.props.fields;
      var title = get(entry, "title") || "(no title)";
      var events = this.state.events ? this.state.events.map(dataOf).sort(byOrder) : null;

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, "Events page"),
        bannerSection("Banner", src(getAsset, get(entry, "bannerImage"), fieldByName(fields, "bannerImage")), title, get(entry, "bannerAlt"), get(entry, "bannerImage")),
        section("Event cards under the banner",
          events
            ? (events.length
                ? h("div", null,
                    h("ol", { className: "cats" }, events.map(function (e, i) {
                      return h("li", { key: i }, e.title, h("small", null, [e.subtitle, String(e.gridDates || "").replace(/\r?\n/g, " · ")].filter(Boolean).join(" — ")));
                    })),
                    h("p", { className: "empty", style: { marginTop: 4 } }, "Each card (poster, title, dates) is edited in Events; they're listed by their Order number."))
                : empty("No events yet."))
            : loading(this, "events", "the events"))
      );
    },
  });

  function isSafeLink(url) {
    url = String(url || "").trim();
    return /^(https?:\/\/|mailto:|tel:)/i.test(url) || /^(\/(?!\/)|\.{0,2}\/)/.test(url);
  }

  var ArchivePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var links = listOf(entry, "links");
      var pageUrl = get(entry, "pageUrl");
      var bad = links.filter(function (l) { return !isSafeLink(l.get("url")); });

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, "Archive menu"),
        section("The dropdown in the top menu",
          h("div", null,
            h("div", { className: "dd" },
              h("div", { className: "hd" }, "Archive ▾"),
              links.length
                ? links.map(function (l, i) {
                    var ok = isSafeLink(l.get("url"));
                    return h("span", { key: i, className: "i", style: ok ? null : { color: "#a33a00" } }, (l.get("label") || "(no label)") + (ok ? "" : "  — no valid address"));
                  })
                : h("span", { className: "i empty" }, "No previous years listed.")),
            h("p", { className: "empty", style: { marginTop: 8 } },
              pageUrl ? "Clicking “Archive” opens " + pageUrl + "." : "“Archive” isn't a link: clicking it just opens the list."),
            h("p", { className: "empty", style: { marginTop: 4 } }, "Each year opens in a new tab."),
            bad.length ? h("p", { className: "warn" }, bad.length + " link" + (bad.length === 1 ? " doesn't" : "s don't") + " start with https:// and won't go anywhere.") : null))
      );
    },
  });

  var SitePreview = createClass({
    mixins: [Redraw],
    getInitialState: function () { return {}; },
    componentDidMount: function () { loadInto(this, "events", "events"); },

    render: function () {
      var entry = this.props.entry, getAsset = this.props.getAsset, fields = this.props.fields;
      var img = function (name) { return src(getAsset, get(entry, name), fieldByName(fields, name)); };
      var name = get(entry, "name") || "(no site name)";
      var homeTitle = name + " - " + get(entry, "tagline");
      var icon = img("favicon");
      var socials = listOf(entry, "socials");
      var events = this.state.events ? this.state.events.map(dataOf).sort(byOrder) : null;
      var site = { url: get(entry, "url") };

      return h("div", { className: "gp" },
        h("style", null, STYLE),
        h("h1", null, name),
        get(entry, "tagline") ? h("p", { className: "sub" }, get(entry, "tagline")) : null,

        section("Browser tab and phone home screen",
          h("div", { className: "row", style: { alignItems: "flex-end" } },
            h("div", null, h("p", { className: "cap" }, "Browser tab"), h("div", { className: "tab" }, icon ? h("img", { src: icon, alt: "" }) : null, homeTitle)),
            h("figure", null, h("p", { className: "cap" }, "Home screen"), imageOrBlank(icon, "home"), h("figcaption", { style: { textAlign: "center", maxWidth: 60 } }, name)))),
        icon ? null : h("p", { className: "warn" }, "No favicon: browsers show a blank page icon."),

        section("In Google search results (front page)",
          h("div", null,
            searchResult(homeTitle, addressOf(site), get(entry, "description"), icon),
            h("p", { className: "empty", style: { marginTop: 6 } }, "Pages > Front page can replace this title and description for the front page. Other pages use the description here when they don't have their own."))),

        section("Header logo",
          h("div", null,
            h("div", { className: "navbar" }, img("navLogo") ? h("img", { src: img("navLogo"), alt: "", style: { width: 225, maxHeight: 80, objectFit: "contain" } }) : empty("No header logo."), h("span", null, "Home"), h("span", null, "Graduates"), h("span", null, "Events"), h("span", null, "Archive")),
            altNote(get(entry, "navLogo"), get(entry, "navLogoAlt")))),

        section("Footer",
          h("div", null,
            h("div", { className: "foot" },
              img("footerLogo") ? h("img", { src: img("footerLogo"), alt: "", style: { maxWidth: 160, maxHeight: 160, objectFit: "contain" } }) : null,
              h("div", null,
                h("h4", null, "Events"),
                events ? h("ul", null, events.map(function (e, i) { return h("li", { key: i }, e.footerLabel || e.navLabel || e.title); })) : h("ul", null, h("li", null, "…")),
                h("p", null, lines(get(entry, "footerNote"))),
                h("p", null, "This website by " + (get(entry, "websiteCredit") || "(no name)"))),
              h("div", null, h("h4", null, "Graduates"), h("ul", null, h("li", null, "(the graduate categories)"))),
              h("div", null,
                h("h4", null, "Social links"),
                h("ul", null, socials.map(function (s, i) {
                  var ok = isSafeLink(s.get("url")) && String(s.get("url")).trim() !== "#";
                  return h("li", { key: i }, h("span", { className: "tag", style: { margin: "0 6px 0 0" } }, s.get("icon") || "link"), s.get("label") || "(no label)", ok ? null : h("span", { style: { color: "#a33a00" } }, " — no address yet"));
                })))),
            altNote(get(entry, "footerLogo"), get(entry, "footerLogoAlt"))))
      );
    },
  });

  CMS.registerPreviewTemplate("frontpage", FrontPagePreview);
  CMS.registerPreviewTemplate("school", SchoolPreview);
  CMS.registerPreviewTemplate("graduatespage", GraduatesPagePreview);
  CMS.registerPreviewTemplate("eventspage", EventsPagePreview);
  CMS.registerPreviewTemplate("archive", ArchivePreview);
  CMS.registerPreviewTemplate("site", SitePreview);
  CMS.registerPreviewTemplate("graduates", GraduatePreview);
  CMS.registerPreviewTemplate("disciplines", DisciplinePreview);
  CMS.registerPreviewTemplate("events", EventPreview);
})();
