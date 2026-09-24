/* CAROUSEL - no libraries (replaces the third-party carousel library used in the students' original).
   Built on native CSS scroll-snap, so it swipes/scrolls on touch with no JavaScript at all.
   This script adds: previous/next buttons, dots, keyboard arrows, captions, wrap-around and
   optional autoplay (pauses on hover/focus/touch, has a pause button, and is off if the visitor
   has "reduce motion" switched on).

   Markup it expects (see src/_includes/partials/carousel.njk):
   <section class="carousel-section" data-carousel data-autoplay="true|false" data-interval="5">
     <div class="carousel-viewport"><article class="main-carousel"> <div class="carousel-cell" data-caption="..."><img></div> ... </article></div>
     <p class="caption"></p>
   </section> */
(function () {
    "use strict";
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("[data-carousel]").forEach(init);

    function init(root) {
        var track = root.querySelector(".main-carousel");
        var slides = Array.prototype.slice.call(track.querySelectorAll(".carousel-cell"));
        var caption = root.querySelector(".caption");
        var count = slides.length;
        var index = 0;
        var timer = null;
        var paused = false;

        function updateCaption() {
            if (!caption) return;
            caption.textContent = slides[index].dataset.caption || "\u00A0";
        }
        updateCaption();
        if (count < 2) return; // nothing to navigate

        root.classList.add("is-enhanced");

        // ---- controls ----
        function button(cls, label, html) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = cls;
            b.setAttribute("aria-label", label);
            b.innerHTML = html;
            return b;
        }
        var prev = button("carousel-btn carousel-btn--prev", "Previous slide", "&#10094;");
        var next = button("carousel-btn carousel-btn--next", "Next slide", "&#10095;");
        var dotsWrap = document.createElement("div");
        dotsWrap.className = "carousel-dots";
        var dots = slides.map(function (_, i) {
            var d = button("carousel-dot", "Go to slide " + (i + 1), "");
            d.addEventListener("click", function () { goTo(i, true); });
            dotsWrap.appendChild(d);
            return d;
        });
        var toggle = null;
        var autoplay = root.dataset.autoplay === "true" && !reducedMotion;
        var interval = Math.max(2, parseFloat(root.dataset.interval) || 5) * 1000;
        if (autoplay) {
            toggle = button("carousel-toggle", "Pause automatic slide show", "&#10074;&#10074;");
            dotsWrap.appendChild(toggle);
        }
        var viewport = track.parentElement;          // .carousel-viewport (position: relative)
        viewport.appendChild(prev);
        viewport.appendChild(next);
        viewport.insertAdjacentElement("afterend", dotsWrap);

        function render() {
            slides.forEach(function (s, i) { s.setAttribute("aria-hidden", i === index ? "false" : "true"); });
            dots.forEach(function (d, i) {
                if (i === index) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
            });
            updateCaption();
        }

        function goTo(i, user) {
            var wrapped = i < 0 || i >= count;
            index = (i + count) % count;
            track.scrollTo({ left: slides[index].offsetLeft, behavior: reducedMotion || wrapped ? "auto" : "smooth" });
            render();
            if (user) restart();
        }

        prev.addEventListener("click", function () { goTo(index - 1, true); });
        next.addEventListener("click", function () { goTo(index + 1, true); });

        // Keep "index" in step when the visitor swipes or scrolls
        var ticking = false;
        track.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                ticking = false;
                var nearest = 0, best = Infinity;
                slides.forEach(function (s, i) {
                    var dist = Math.abs(s.offsetLeft - track.scrollLeft);
                    if (dist < best) { best = dist; nearest = i; }
                });
                if (nearest !== index) { index = nearest; render(); }
            });
        }, { passive: true });

        track.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1, true); }
            if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1, true); }
        });

        var resizeTimer;
        window.addEventListener("resize", function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { track.scrollTo({ left: slides[index].offsetLeft, behavior: "auto" }); }, 150);
        });

        // ---- autoplay ----
        function stop() { clearInterval(timer); timer = null; }
        function start() {
            if (!autoplay || paused || timer) return;
            timer = setInterval(function () { goTo(index + 1, false); }, interval);
        }
        function restart() { stop(); start(); }

        if (autoplay) {
            caption && caption.setAttribute("aria-live", "off");
            toggle.addEventListener("click", function () {
                paused = !paused;
                toggle.innerHTML = paused ? "&#9654;" : "&#10074;&#10074;";
                toggle.setAttribute("aria-label", paused ? "Start automatic slide show" : "Pause automatic slide show");
                paused ? stop() : start();
            });
            ["mouseenter", "focusin", "touchstart"].forEach(function (ev) { root.addEventListener(ev, stop, { passive: true }); });
            ["mouseleave", "focusout"].forEach(function (ev) { root.addEventListener(ev, start); });
            document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
            start();
        } else if (caption) {
            caption.setAttribute("aria-live", "polite");
        }

        render();
    }
})();
