/* MASONRY, height-balanced (replaces the old CSS "columns" layout for .grid--masonry / .grid--masonry-sn).
   CSS columns fill one column fully before starting the next, which can leave a big gap near the bottom
   of a column when an image doesn't quite fit. This packs images by their ACTUAL rendered height instead,
   using the width/height attributes the build already put on every <img> - no waiting for images to load.
   Runs again on resize, since the column count changes at the same breakpoints as the students' CSS. */
(function () {
    "use strict";

    function columnsFor(width) {
        return width <= 600 ? 1 : 2;
    }

    function flatten(root) {
        var children = Array.prototype.slice.call(root.children);
        var cols = children.filter(function (el) { return el.classList.contains("masonry-col"); });
        if (!cols.length) {
            // First run: the direct children are the <picture>/<img> elements themselves.
            return children.filter(function (el) { return el.tagName === "PICTURE" || el.tagName === "IMG"; });
        }
        // Later runs (resize): undo the previous packing before repacking.
        var items = [];
        cols.forEach(function (col) {
            items = items.concat(Array.prototype.slice.call(col.children));
            col.remove();
        });
        return items;
    }

    function pack(root) {
        var items = flatten(root);
        if (items.length < 2) return; // nothing to balance

        var cols = columnsFor(root.clientWidth || window.innerWidth);
        var tracks = [];
        var frag = document.createDocumentFragment();
        for (var i = 0; i < cols; i++) {
            var col = document.createElement("div");
            col.className = "masonry-col";
            tracks.push(col);
            frag.appendChild(col);
        }

        var trackWidth = (root.clientWidth || window.innerWidth) / cols;
        var heights = new Array(cols).fill(0);

        items.forEach(function (item) {
            var img = item.tagName === "IMG" ? item : item.querySelector("img");
            var w = parseFloat(img && img.getAttribute("width")) || 1;
            var h = parseFloat(img && img.getAttribute("height")) || 1;
            var renderedHeight = trackWidth * (h / w);

            var shortest = 0;
            for (var i = 1; i < cols; i++) {
                if (heights[i] < heights[shortest]) shortest = i;
            }
            tracks[shortest].appendChild(item);
            heights[shortest] += renderedHeight;
        });

        root.classList.add("masonry-js");
        root.appendChild(frag);
    }

    function packAll() {
        document.querySelectorAll(".grid--masonry, .grid--masonry-sn").forEach(pack);
    }

    packAll();

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(packAll, 200);
    });
})();
