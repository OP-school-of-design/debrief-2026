/* CAROUSEL - no libraries (replaces Flickity, which needs a paid licence for this use).
   Works on the students' own markup:
     <article class="main-carousel"> <div class="carousel-cell"><img ...></div> ... </article>
     <p class="caption">&nbsp;</p>
   Behaves like the students' Flickity setup (wrap-around, left-aligned, one slide in view),
   with previous/next buttons, dots, keyboard arrows and swipe/drag.
   Optional, from the dashboard: data-autoplay="true" and data-interval="5" (seconds) on .main-carousel.
   Autoplay pauses on hover/focus/touch, has a pause button, and is off for visitors who
   have "reduce motion" switched on. */
(function () {
    "use strict";
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ARROW = '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M 10,50 L 60,100 L 70,90 L 30,50 L 70,10 L 60,0 Z"></path></svg>';

    document.querySelectorAll(".main-carousel").forEach(init);

    function init(carousel) {
        var cells = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-cell"));
        if (!cells.length) return;
        var section = carousel.closest(".carousel-section");
        var caption = section ? section.querySelector(".caption") : null;
        var count = cells.length;
        var index = 0;

        // Build: .main-carousel > .carousel-viewport > .carousel-track > cells
        var viewport = document.createElement("div");
        viewport.className = "carousel-viewport";
        var track = document.createElement("div");
        track.className = "carousel-track";
        cells.forEach(function (cell, i) {
            cell.setAttribute("role", "group");
            cell.setAttribute("aria-roledescription", "slide");
            cell.setAttribute("aria-label", (i + 1) + " of " + count);
            track.appendChild(cell);
        });
        viewport.appendChild(track);
        carousel.appendChild(viewport);
        carousel.classList.add("carousel-enabled");
        carousel.setAttribute("tabindex", "0");
        carousel.setAttribute("role", "region");
        carousel.setAttribute("aria-roledescription", "carousel");
        if (!carousel.hasAttribute("aria-label")) carousel.setAttribute("aria-label", "Image carousel");

        function button(cls, label) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "carousel-button " + cls;
            b.setAttribute("aria-label", label);
            b.innerHTML = ARROW;
            if (cls === "next") b.querySelector("path").setAttribute("transform", "translate(100, 100) rotate(180)");
            return b;
        }

        var dots = [];
        if (count > 1) {
            var prev = button("previous", "Previous slide");
            var next = button("next", "Next slide");
            carousel.appendChild(prev);
            carousel.appendChild(next);
            prev.addEventListener("click", function () { goTo(index - 1, true); });
            next.addEventListener("click", function () { goTo(index + 1, true); });

            var list = document.createElement("ol");
            list.className = "carousel-dots";
            cells.forEach(function (_, i) {
                var dot = document.createElement("li");
                dot.className = "dot";
                dot.setAttribute("role", "button");
                dot.setAttribute("tabindex", "0");
                dot.setAttribute("aria-label", "Go to slide " + (i + 1));
                dot.addEventListener("click", function () { goTo(i, true); });
                dot.addEventListener("keydown", function (e) {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goTo(i, true); }
                });
                list.appendChild(dot);
                dots.push(dot);
            });
            carousel.appendChild(list);
        }

        function render() {
            track.style.transform = "translateX(" + (-index * 100) + "%)";
            cells.forEach(function (cell, i) {
                cell.classList.toggle("is-selected", i === index);
                cell.setAttribute("aria-hidden", i === index ? "false" : "true");
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-selected", i === index);
                if (i === index) dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current");
            });
            if (caption) {
                var text = cells[index].getAttribute("data-caption");
                caption.textContent = text ? text : " ";
            }
        }

        function goTo(i, byVisitor) {
            index = (i + count) % count; // wrap around, like the students' wrapAround: true
            render();
            if (byVisitor) restart();
        }

        // Keyboard
        carousel.addEventListener("keydown", function (e) {
            if (e.target !== carousel) return;
            if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1, true); }
            if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1, true); }
        });

        // Swipe / drag
        var startX = null, deltaX = 0;
        viewport.addEventListener("pointerdown", function (e) {
            if (count < 2) return;
            startX = e.clientX; deltaX = 0;
            viewport.classList.add("is-pointer-down");
            track.style.transition = "none";
            try { viewport.setPointerCapture(e.pointerId); } catch (err) {}
        });
        viewport.addEventListener("pointermove", function (e) {
            if (startX === null) return;
            deltaX = e.clientX - startX;
            track.style.transform = "translateX(calc(" + (-index * 100) + "% + " + deltaX + "px))";
        });
        function endDrag() {
            if (startX === null) return;
            viewport.classList.remove("is-pointer-down");
            track.style.transition = "";
            var threshold = Math.min(80, viewport.clientWidth * 0.15);
            if (deltaX > threshold) goTo(index - 1, true);
            else if (deltaX < -threshold) goTo(index + 1, true);
            else render();
            startX = null;
        }
        viewport.addEventListener("pointerup", endDrag);
        viewport.addEventListener("pointercancel", endDrag);

        // Optional autoplay (dashboard setting)
        var timer = null, paused = false;
        var autoplay = carousel.getAttribute("data-autoplay") === "true" && !reducedMotion && count > 1;
        var interval = Math.max(2, parseFloat(carousel.getAttribute("data-interval")) || 5) * 1000;
        function stop() { clearInterval(timer); timer = null; }
        function start() { if (autoplay && !paused && !timer) timer = setInterval(function () { goTo(index + 1, false); }, interval); }
        function restart() { stop(); start(); }
        if (autoplay) {
            var toggle = document.createElement("button");
            toggle.type = "button";
            toggle.className = "carousel-toggle";
            toggle.textContent = "Pause";
            toggle.setAttribute("aria-label", "Pause automatic slide show");
            toggle.addEventListener("click", function () {
                paused = !paused;
                toggle.textContent = paused ? "Play" : "Pause";
                toggle.setAttribute("aria-label", paused ? "Start automatic slide show" : "Pause automatic slide show");
                if (paused) stop(); else start();
            });
            var dotsList = carousel.querySelector(".carousel-dots");
            if (dotsList) dotsList.appendChild(toggle);
            ["mouseenter", "focusin", "touchstart"].forEach(function (ev) { carousel.addEventListener(ev, stop, { passive: true }); });
            ["mouseleave", "focusout"].forEach(function (ev) { carousel.addEventListener(ev, start); });
            document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
            start();
        }

        render();
    }
})();
