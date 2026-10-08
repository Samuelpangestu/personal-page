(function () {
  "use strict";

  var navPill = document.getElementById("navPill");
  var menuBtn = document.getElementById("navMenuBtn");
  if (menuBtn && navPill) {
    menuBtn.addEventListener("click", function () {
      var open = navPill.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navPill.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        navPill.classList.remove("menu-open");
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
          emailLink.textContent = "Disalin: " + address;
          setTimeout(function () { emailLink.textContent = original; }, 1800);
        });
      }
    });
  }
})();
