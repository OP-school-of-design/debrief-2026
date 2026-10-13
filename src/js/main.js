/* The students' own page scripts, written once here instead of repeated inline on every page.
   toggleMenu() and toggleDropdown() stay global because the header buttons call them via onclick. */

/* MOBILE MENU */
function toggleMenu() {
    var nav = document.getElementById("myTopnav");
    var button = document.getElementById("menuToggle");
    var icon = document.getElementById("menuIcon");

    if (nav.className === "topnav") {
        nav.className += " responsive";
        icon.textContent = "close";
        button.setAttribute("aria-expanded", "true");
    } else {
        nav.className = "topnav";
        icon.textContent = "menu";
        button.setAttribute("aria-expanded", "false");
    }
}

/* NAVIGATION DROPDOWN */
function toggleDropdown(button) {
    if (window.innerWidth <= 1170) {
        var dropdown = button.closest(".dropdown");
        if (dropdown) {
            dropdown.classList.toggle("open");
        }
    }
}

/* Menu headings without a page of their own (e.g. Archive): Enter or Space opens the list. */
document.querySelectorAll('.dropbtn[role="button"]').forEach(function (label) {
    label.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleDropdown(label);
        }
    });
});

/* FOOTER DROPDOWNS */
document.querySelectorAll(".footer__dropdown").forEach(function (dropdown) {
    dropdown.addEventListener("click", function () {
        var menu = dropdown.closest(".footer__menu");
        menu.classList.toggle("open");
    });
});

/* DISCIPLINE GRID TOGGLE (School of Design page) - works at all screen sizes */
document.querySelectorAll(".discipline-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
        var grid = toggle.parentElement.querySelector(".discipline__grid");
        toggle.classList.toggle("open");
        if (grid) {
            grid.classList.toggle("open");
        }
    });
});
