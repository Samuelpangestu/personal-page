(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-12-21T08:00:00+07:00");

  // ---------- Guest name from ?to= query param ----------
  function getGuestName() {
    var params = new URLSearchParams(window.location.search);
    var name = params.get("to") || params.get("nama");
    return name ? decodeURIComponent(name).replace(/\+/g, " ") : "Tamu Undangan";
  }
  document.getElementById("guestName").textContent = getGuestName();

  // ---------- Open invitation ----------
  var openBtn = document.getElementById("openBtn");
  var content = document.getElementById("content");
  var bottomNav = document.getElementById("bottomNav");
  var bgMusic = document.getElementById("bgMusic");
  var musicToggle = document.getElementById("musicToggle");

  openBtn.addEventListener("click", function () {
    content.classList.add("show");
    bottomNav.classList.add("show");
    document.getElementById("cover").scrollIntoView({ behavior: "instant" in window ? "instant" : "auto" });
    content.scrollIntoView({ behavior: "smooth" });

    bgMusic.play().then(function () {
      musicToggle.classList.add("playing");
    }).catch(function () {
      // Autoplay blocked; user can tap the music toggle manually.
    });
  });

  // ---------- Music toggle ----------
  musicToggle.addEventListener("click", function () {
    if (bgMusic.paused) {
      bgMusic.play().catch(function () {});
      musicToggle.classList.add("playing");
    } else {
      bgMusic.pause();
      musicToggle.classList.remove("playing");
    }
  });

  // ---------- Countdown ----------
  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) { return String(n).padStart(2, "0"); }

  function tickCountdown() {
    var diff = WEDDING_DATE.getTime() - Date.now();
    if (diff < 0) diff = 0;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var secs = Math.floor((diff % 60000) / 1000);
    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  // ---------- Add to calendar (.ics download) ----------
  document.getElementById("calendarBtn").addEventListener("click", function () {
    var start = "20261221T010000Z";
    var end = "20261221T070000Z";
    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "SUMMARY:Pernikahan Raka & Kirana",
      "DTSTART:" + start,
      "DTEND:" + end,
      "LOCATION:Gedung Serbaguna Graha Kencana, Jl. Melati Indah No. 12, Jakarta Selatan",
      "DESCRIPTION:Akad Nikah & Resepsi Pernikahan Raka & Kirana",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    var blob = new Blob([ics], { type: "text/calendar" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "Pernikahan-Raka-Kirana.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ---------- Copy bank number ----------
  document.getElementById("copyBtn").addEventListener("click", function (e) {
    var value = e.currentTarget.getAttribute("data-value");
    navigator.clipboard.writeText(value).then(function () {
      var btn = e.currentTarget;
      var original = btn.textContent;
      btn.textContent = "Tersalin!";
      setTimeout(function () { btn.textContent = original; }, 1800);
    }).catch(function () {});
  });

  // ---------- RSVP & Wishes (localStorage) ----------
  var STORAGE_KEY = "wedding_wishes_raka_kirana";
  var wishesList = document.getElementById("wishesList");
  var wishesEmpty = document.getElementById("wishesEmpty");
  var rsvpForm = document.getElementById("rsvpForm");

  function loadWishes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishes(wishes) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (e) {}
  }

  function renderWishes() {
    var wishes = loadWishes();
    if (wishes.length === 0) {
      wishesEmpty.style.display = "block";
      return;
    }
    wishesEmpty.style.display = "none";
    var frag = document.createDocumentFragment();
    wishes.slice().reverse().forEach(function (w) {
      var item = document.createElement("div");
      item.className = "wish-item";

      var nameEl = document.createElement("span");
      nameEl.className = "wish-name";
      nameEl.textContent = w.name;

      var statusEl = document.createElement("span");
      statusEl.className = "wish-status";
      statusEl.textContent = "· " + w.status;

      var textEl = document.createElement("p");
      textEl.className = "wish-text";
      textEl.textContent = w.message;

      item.appendChild(nameEl);
      item.appendChild(statusEl);
      item.appendChild(textEl);
      frag.appendChild(item);
    });
    wishesList.innerHTML = "";
    wishesList.appendChild(wishesEmpty);
    wishesList.appendChild(frag);
  }

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("rsvpName").value.trim();
    var status = document.getElementById("rsvpStatus").value;
    var message = document.getElementById("rsvpMessage").value.trim();
    if (!name || !status || !message) return;

    var wishes = loadWishes();
    wishes.push({ name: name, status: status, message: message, ts: Date.now() });
    saveWishes(wishes);
    renderWishes();
    rsvpForm.reset();
  });

  renderWishes();

  // ---------- Bottom nav active state + smooth scroll ----------
  var navLinks = Array.prototype.slice.call(bottomNav.querySelectorAll("a"));

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var targetSel = link.getAttribute("data-target");
      var targetEl = targetSel === "cover" ? document.getElementById("cover") : document.querySelector(targetSel);
      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
      navLinks.forEach(function (l) { l.classList.remove("active"); });
      link.classList.add("active");
    });
  });
})();
