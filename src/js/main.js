/* Site-wide behaviour: mobile menu, dropdowns, footer accordions, School of Design discipline toggle.
   (Moved out of the inline <script> blocks that were repeated on every page.) */
(function () {
    "use strict";

    // Mobile hamburger menu
    var nav = document.getElementById("myTopnav");
    var menuButton = document.getElementById("menuToggle");
    if (nav && menuButton) {
        var iconOpen = menuButton.querySelector("[data-icon-open]");
        var iconClose = menuButton.querySelector("[data-icon-close]");
        menuButton.addEventListener("click", function () {
            var open = nav.classList.toggle("responsive");
            menuButton.setAttribute("aria-expanded", String(open));
            if (iconOpen) iconOpen.hidden = open;
            if (iconClose) iconClose.hidden = !open;
        });
    }

    // Dropdown sub-menus in the mobile menu
    document.querySelectorAll(".dropdown-toggle").forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            if (window.innerWidth <= 1170) {
                var open = toggle.closest(".dropdown").classList.toggle("open");
                toggle.setAttribute("aria-expanded", String(open));
            }
        });
    });

    // Footer accordions
    document.querySelectorAll(".footer__dropdown").forEach(function (button) {
        button.addEventListener("click", function () {
            button.closest(".footer__menu").classList.toggle("open");
        });
    });

    // School of Design page: "Explore the Disciplines" toggle
    document.querySelectorAll(".discipline-toggle").forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            var grid = toggle.parentElement.querySelector(".discipline__grid__narrow");
            var open = toggle.classList.toggle("open");
            toggle.setAttribute("aria-expanded", String(open));
            if (grid) grid.classList.toggle("open", open);
        });
    });
})();
