/* The students' own page scripts, written once here instead of repeated inline on every page.
   toggleMenu() and toggleDropdown() are the students' functions, attached to the header buttons below. */

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

/* The header buttons call these (wired up here rather than with onclick="..." in the HTML, so the
   site's security policy can block all inline script). */
var menuButton = document.querySelector("[data-menu-toggle]");
if (menuButton) {
    menuButton.addEventListener("click", toggleMenu);
}
document.querySelectorAll("[data-dropdown-toggle]").forEach(function (el) {
    el.addEventListener("click", function () {
        toggleDropdown(el);
    });
});

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
