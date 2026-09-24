/* Lightbox for graduate galleries (both layouts). Any <img> inside an element with [data-lightbox] opens it.
   The lightbox loads the largest suitable size from the same responsive image set the page already uses. */
(function () {
    "use strict";
    var box = document.getElementById("lightbox");
    if (!box) return;

    var bigImage = document.getElementById("lightbox-image");
    var closeBtn = box.querySelector(".lightbox-close");
    var prevBtn = box.querySelector(".lightbox-prev");
    var nextBtn = box.querySelector(".lightbox-next");
    var images = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox] img"));
    var current = 0;
    var lastFocus = null;

    // Pick a size from the <picture>'s WebP srcset that suits this screen (up to 2000px wide).
    function bestSource(img) {
        var picture = img.closest("picture");
        var source = picture && (picture.querySelector('source[type="image/webp"]') || picture.querySelector("source"));
        if (!source || !source.srcset) return img.currentSrc || img.src;
        var target = Math.min(window.innerWidth * (window.devicePixelRatio || 1), 2000);
        var options = source.srcset.split(",").map(function (part) {
            var bits = part.trim().split(/\s+/);
            return { url: bits[0], width: parseInt(bits[1], 10) || 0 };
        }).sort(function (a, b) { return a.width - b.width; });
        var match = options.find(function (o) { return o.width >= target; }) || options[options.length - 1];
        return match.url;
    }

    function show(index) {
        current = (index + images.length) % images.length;
        var img = images[current];
        bigImage.src = bestSource(img);
        bigImage.alt = img.alt;
    }

    function open(index) {
        lastFocus = document.activeElement;
        show(index);
        box.classList.add("active");
        document.body.style.overflow = "hidden";
        closeBtn.focus();
    }

    function close() {
        box.classList.remove("active");
        document.body.style.overflow = "";
        if (lastFocus) lastFocus.focus();
    }

    images.forEach(function (img, index) {
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", "View larger: " + (img.alt || "image " + (index + 1)));
        img.addEventListener("click", function () { open(index); });
        img.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(index); }
        });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(current - 1); });
    nextBtn.addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
        if (!box.classList.contains("active")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") show(current - 1);
        if (e.key === "ArrowRight") show(current + 1);
    });
})();
