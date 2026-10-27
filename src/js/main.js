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

// Front page logo animation: remove the placeholder still once the animation has loaded.
(function () {
  var section = document.querySelector(".logo-animation.has-still");
  if (!section) return;
  var img = section.querySelector("img");
  var done = function () { section.classList.add("is-loaded"); };
  if (!img) return;
  // decode() waits until the animation can be shown; if it can't load, the still stays.
  if (img.decode) img.decode().then(done, function () {});
  else if (img.complete) done();
  else img.addEventListener("load", done);
})();

// Headings and quotes: a word that's too long for its line is shrunk to fit instead of being split
// (see css/additions.css). Runs on load, once the fonts are ready, and when the window changes size.
(function () {
  var SELECTOR = "h1, h2, h3, .student-quote, .student-quote-sn";
  function fit() {
    var els = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < els.length; i++) {
      els[i].style.fontSize = "";
      els[i].classList.remove("fit-break");
    }
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      if (!el.clientWidth) continue;
      var base = parseFloat(getComputedStyle(el).fontSize);
      for (var n = 0; n < 4 && el.scrollWidth > el.clientWidth + 1; n++) {
        var now = parseFloat(el.style.fontSize) || base;
        el.style.fontSize = Math.max(base * 0.5, Math.floor(now * (el.clientWidth / el.scrollWidth) * 100) / 100 - 0.25) + "px";
      }
      // Still too wide at half size (an extremely long word): as a last resort let it break
      // rather than run off the screen.
      if (el.scrollWidth > el.clientWidth + 1) el.classList.add("fit-break");
    }
  }
  var queued = false;
  function soon() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; fit(); });
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
  window.addEventListener("load", soon);
  window.addEventListener("resize", soon);
})();
