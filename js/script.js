(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-12-21T08:00:00+07:00");

  // ---------- Loader ----------
  window.addEventListener("load", function () {
    var loader = document.getElementById("loader");
    setTimeout(function () { loader.classList.add("hide"); }, 600);
  });

  // ---------- Guest name from ?to= query param ----------
  function getGuestName() {
    var params = new URLSearchParams(window.location.search);
    var name = params.get("to") || params.get("nama");
    return name ? decodeURIComponent(name).replace(/\+/g, " ") : "Tamu Undangan";
  }
  var guestName = getGuestName();
  ["guestName", "headerGuestName", "chipGuestName", "homeGuestName"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = guestName;
  });

  // ---------- Opening gate ----------
  var openBtn = document.getElementById("openBtn");
  var openGate = document.getElementById("openGate");
  var chatShell = document.getElementById("chatShell");
  var bottomNav = document.getElementById("bottomNav");
  var bgMusic = document.getElementById("bgMusic");
  var musicToggle = document.getElementById("musicToggle");

  openBtn.addEventListener("click", function () {
    chatShell.classList.remove("locked");
    openGate.style.opacity = "0";
    openGate.style.pointerEvents = "none";
    setTimeout(function () { openGate.style.display = "none"; }, 400);
    bottomNav.classList.add("show");

    bgMusic.play().then(function () {
      musicToggle.classList.add("playing");
      musicToggle.setAttribute("aria-pressed", "true");
    }).catch(function () {
      // Autoplay blocked; user can tap the music button manually.
    });
  });
  openGate.style.transition = "opacity .4s ease";

  // ---------- Music toggle ----------
  musicToggle.addEventListener("click", function () {
    if (bgMusic.paused) {
      bgMusic.play().catch(function () {});
      musicToggle.classList.add("playing");
      musicToggle.setAttribute("aria-pressed", "true");
    } else {
      bgMusic.pause();
      musicToggle.classList.remove("playing");
      musicToggle.setAttribute("aria-pressed", "false");
    }
  });

  // ---------- Live button tooltip ----------
  var liveBtn = document.getElementById("liveBtn");
  var liveTooltip = document.getElementById("liveTooltip");
  var liveTimer = null;
  liveBtn.addEventListener("click", function () {
    liveTooltip.classList.add("show");
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { liveTooltip.classList.remove("show"); }, 4000);
  });
  document.addEventListener("click", function (e) {
    if (!liveBtn.contains(e.target)) liveTooltip.classList.remove("show");
  });

  // ---------- Share button ----------
  var shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var shareData = {
        title: "Undangan Pernikahan Raka & Kirana",
        text: "Kamu diundang ke pernikahan Raka & Kirana!",
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareData.url).then(function () {
          var original = shareBtn.textContent;
          shareBtn.textContent = "Tersalin!";
          setTimeout(function () { shareBtn.textContent = original; }, 1800);
        }).catch(function () {});
      }
    });
  }

  // ---------- Reaction pills ----------
  document.querySelectorAll(".reaction-pill").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var countEl = btn.querySelector(".r-count");
      var reacted = btn.classList.toggle("reacted");
      if (countEl) {
        var count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = reacted ? count + 1 : count - 1;
      }
    });
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

  // ---------- Add to calendar (.ics download), generic for all events ----------
  document.querySelectorAll(".btn-calendar").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var summary = btn.getAttribute("data-summary") || "Pernikahan Raka & Kirana";
      var location = btn.getAttribute("data-location") || "";
      var start = btn.getAttribute("data-start");
      var end = btn.getAttribute("data-end");

      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "SUMMARY:" + summary,
        "DTSTART:" + start,
        "DTEND:" + end,
        "LOCATION:" + location,
        "DESCRIPTION:" + summary,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      var blob = new Blob([ics], { type: "text/calendar" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = summary.replace(/\s+/g, "-") + ".ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // ---------- Copy buttons (bank number, address) ----------
  document.querySelectorAll(".btn-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-value");
      navigator.clipboard.writeText(value).then(function () {
        var original = btn.textContent;
        btn.textContent = "Tersalin!";
        setTimeout(function () { btn.textContent = original; }, 1800);
      }).catch(function () {});
    });
  });

  // ---------- RSVP attendance choice ----------
  var choiceHadir = document.getElementById("choiceHadir");
  var choiceTidak = document.getElementById("choiceTidak");
  var guestCountRow = document.getElementById("guestCountRow");
  var rsvpError = document.getElementById("rsvpError");
  var selectedStatus = "";

  function selectStatus(status) {
    selectedStatus = status;
    choiceHadir.classList.toggle("selected", status === "Hadir");
    choiceTidak.classList.toggle("selected", status === "Tidak Hadir");
    guestCountRow.hidden = status !== "Hadir";
    rsvpError.classList.remove("show");
  }
  choiceHadir.addEventListener("click", function () { selectStatus("Hadir"); });
  choiceTidak.addEventListener("click", function () { selectStatus("Tidak Hadir"); });

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
    wishesList.querySelectorAll(".wish-item").forEach(function (el) { el.remove(); });
    if (wishes.length === 0) {
      wishesEmpty.style.display = "block";
      return;
    }
    wishesEmpty.style.display = "none";
    var frag = document.createDocumentFragment();
    wishes.slice().reverse().forEach(function (w) {
      var row = document.createElement("div");
      row.className = "msg " + (w.avatar === "bride" ? "bride" : "guest");

      var avatar = document.createElement("span");
      avatar.className = "avatar" + (w.avatar === "bride" ? " avatar-bride" : "");
      avatar.style.background = w.avatar === "bride" ? "" : "#7a6a55";
      avatar.textContent = w.name.charAt(0).toUpperCase();

      var bubble = document.createElement("div");
      bubble.className = "bubble wish-item";

      var nameEl = document.createElement("span");
      nameEl.className = "wish-name";
      nameEl.textContent = w.name;

      var statusEl = document.createElement("span");
      statusEl.className = "wish-status";
      statusEl.textContent = "· " + w.status + (w.count ? " (" + w.count + " orang)" : "");

      var textEl = document.createElement("p");
      textEl.className = "wish-text";
      textEl.textContent = w.message;

      bubble.appendChild(nameEl);
      bubble.appendChild(statusEl);
      bubble.appendChild(textEl);
      row.appendChild(avatar);
      row.appendChild(bubble);
      frag.appendChild(row);
    });
    wishesList.appendChild(frag);
  }

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("rsvpName").value.trim();
    var message = document.getElementById("rsvpMessage").value.trim();
    var count = document.getElementById("guestCount").value;

    if (!selectedStatus) {
      rsvpError.classList.add("show");
      return;
    }
    if (!name || !message) return;

    var entry = {
      name: name,
      status: selectedStatus,
      count: selectedStatus === "Hadir" ? count : null,
      message: message,
      ts: Date.now()
    };
    var wishes = loadWishes();
    wishes.push(entry);
    saveWishes(wishes);
    renderWishes();
    rsvpForm.reset();

    if (window.RSVP_WEBHOOK_URL) {
      fetch(window.RSVP_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(entry)
      }).catch(function () {});
    }
  });

  renderWishes();

  // ---------- Bottom nav: click to scroll + active state on scroll ----------
  var navLinks = Array.prototype.slice.call(bottomNav.querySelectorAll("a"));
  var navSections = navLinks.map(function (link) {
    var sel = link.getAttribute("data-target");
    return { link: link, el: document.querySelector(sel) };
  }).filter(function (n) { return n.el; });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var targetEl = document.querySelector(link.getAttribute("data-target"));
      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
    });
  });

  function updateActiveNav() {
    var scrollPos = window.scrollY + window.innerHeight / 3;
    var current = navSections[0];
    navSections.forEach(function (n) {
      if (n.el.offsetTop <= scrollPos) current = n;
    });
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    if (current) current.link.classList.add("active");
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });

  // ---------- Scroll reveal ----------
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  // ---------- Gallery lightbox ----------
  var galleryCaptions = [
    "Prewedding di taman kota",
    "Momen lamaran",
    "Liburan bersama",
    "Hari jadi kedua",
    "Bertemu keluarga",
    "Menuju hari bahagia"
  ];
  var galleryClasses = ["g1", "g2", "g3", "g1", "g2", "g3"];
  var currentPhotoIndex = 0;

  var lightbox = document.getElementById("lightbox");
  var lightboxPhoto = document.getElementById("lightboxPhoto");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");

  function showPhoto(index) {
    currentPhotoIndex = (index + galleryCaptions.length) % galleryCaptions.length;
    lightboxPhoto.className = "lightbox-photo " + galleryClasses[currentPhotoIndex];
    lightboxCaption.textContent = galleryCaptions[currentPhotoIndex];
  }

  document.querySelectorAll("#galleryMosaic .g-item").forEach(function (item) {
    item.addEventListener("click", function () {
      showPhoto(parseInt(item.getAttribute("data-index"), 10) || 0);
      lightbox.classList.add("show");
      lightboxClose.focus();
    });
  });

  function closeLightbox() { lightbox.classList.remove("show"); }
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", function () { showPhoto(currentPhotoIndex - 1); });
  lightboxNext.addEventListener("click", function () { showPhoto(currentPhotoIndex + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("show")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto(currentPhotoIndex - 1);
    if (e.key === "ArrowRight") showPhoto(currentPhotoIndex + 1);
  });
})();
