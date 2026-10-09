(function () {
  "use strict";

  var topbar = document.getElementById("topbar");
  var menuBtn = document.getElementById("navMenuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && topbar && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      var open = topbar.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        topbar.classList.remove("menu-open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  var emailLink = document.getElementById("emailContact");
  if (emailLink) {
    emailLink.addEventListener("click", function (e) {
      e.preventDefault();
      var address = emailLink.getAttribute("data-email");
      if (navigator.clipboard) {
        navigator.clipboard.writeText(address).then(function () {
          var original = emailLink.textContent;
          emailLink.textContent = "Disalin!";
          setTimeout(function () { emailLink.textContent = original; }, 1800);
        });
      }
    });
  }
})();
