(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-12-21T09:00:00+07:00");

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
  ["headerGuestName", "chipGuestName", "chipGuestName2", "homeGuestName", "lockGuestName", "giGuestName"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = guestName;
  });
  var giGuestAvatar = document.getElementById("giGuestAvatar");
  if (giGuestAvatar) giGuestAvatar.textContent = guestName.charAt(0).toUpperCase();

  // ---------- Group info panel ----------
  var groupInfo = document.getElementById("groupInfo");
  function openGroupInfo() {
    groupInfo.classList.add("show");
    groupInfo.setAttribute("aria-hidden", "false");
  }
  function closeGroupInfo() {
    groupInfo.classList.remove("show");
    groupInfo.setAttribute("aria-hidden", "true");
  }
  document.getElementById("headerInfoBtn").addEventListener("click", openGroupInfo);
  document.getElementById("groupInfoBack").addEventListener("click", closeGroupInfo);

  // ---------- Story viewer (tap the avatar to open) ----------
  var STORY_COUNT = 5;
  var storyIndex = 0;
  var storyViewer = document.getElementById("storyViewer");
  var storyPhoto = document.getElementById("storyPhoto");
  var storyCounter = document.getElementById("storyCounter");
  var storyProgress = document.getElementById("storyProgress");
  var storyClasses = ["g1", "g2", "g3", "g4", "g5"];

  var STORY_DURATION = 4500;
  var storyAdvanceTimer = null;
  var storyStartedAt = 0;
  var storyRemaining = STORY_DURATION;

  for (var s = 0; s < STORY_COUNT; s++) {
    var seg = document.createElement("span");
    seg.className = "seg";
    var fill = document.createElement("span");
    fill.className = "seg-fill";
    seg.appendChild(fill);
    storyProgress.appendChild(seg);
  }
  var storySegs = Array.prototype.slice.call(storyProgress.querySelectorAll(".seg"));

  function renderStory() {
    storyPhoto.className = "story-view-photo " + storyClasses[storyIndex];
    storyCounter.textContent = "Status · " + (storyIndex + 1) + " dari " + STORY_COUNT;
    storySegs.forEach(function (seg, i) {
      seg.classList.toggle("filled", i < storyIndex);
      seg.classList.toggle("active", i === storyIndex);
      var segFill = seg.querySelector(".seg-fill");
      segFill.style.transition = "none";
      if (i === storyIndex) segFill.style.width = "0%";
    });
    startStoryTimer();
  }

  function startStoryTimer() {
    clearTimeout(storyAdvanceTimer);
    storyRemaining = STORY_DURATION;
    runStoryTimer();
  }

  // Drives the active segment's fill via a CSS transition (rather than a
  // fixed @keyframes animation) so pauseStoryTimer can freeze it mid-flight
  // and resumeStoryTimer can continue the fill from that exact width.
  function runStoryTimer() {
    var activeFill = storySegs[storyIndex].querySelector(".seg-fill");
    activeFill.style.transition = "none";
    void activeFill.offsetWidth;
    activeFill.style.transition = "width " + storyRemaining + "ms linear";
    activeFill.style.width = "100%";
    storyStartedAt = Date.now();
    clearTimeout(storyAdvanceTimer);
    storyAdvanceTimer = setTimeout(nextStory, storyRemaining);
  }

  function pauseStoryTimer() {
    var activeSeg = storySegs[storyIndex];
    var activeFill = activeSeg && activeSeg.querySelector(".seg-fill");
    if (!activeFill) return;
    var pct = (activeFill.getBoundingClientRect().width / activeSeg.getBoundingClientRect().width) * 100;
    activeFill.style.transition = "none";
    activeFill.style.width = Math.min(100, pct) + "%";
    clearTimeout(storyAdvanceTimer);
    storyRemaining = Math.max(0, storyRemaining - (Date.now() - storyStartedAt));
  }

  function resumeStoryTimer() {
    if (!storyViewer.classList.contains("show")) return;
    runStoryTimer();
  }

  function openStory() {
    storyIndex = 0;
    renderStory();
    storyViewer.classList.add("show");
    storyViewer.setAttribute("aria-hidden", "false");
  }
  function closeStory() {
    clearTimeout(storyAdvanceTimer);
    storyViewer.classList.remove("show");
    storyViewer.setAttribute("aria-hidden", "true");
  }
  function nextStory() {
    if (storyIndex >= STORY_COUNT - 1) { closeStory(); return; }
    storyIndex++;
    renderStory();
  }
  function prevStory() {
    storyIndex = Math.max(0, storyIndex - 1);
    renderStory();
  }

  document.getElementById("statusAvatarBtn").addEventListener("click", openStory);
  document.getElementById("storyClose").addEventListener("click", closeStory);
  document.getElementById("storyNext").addEventListener("click", nextStory);
  document.getElementById("storyPrev").addEventListener("click", prevStory);
  storyViewer.addEventListener("pointerdown", function (e) {
    if (e.target.closest(".story-header, .story-progress, .story-nav")) return;
    pauseStoryTimer();
  });
  storyViewer.addEventListener("pointerup", resumeStoryTimer);
  storyViewer.addEventListener("pointercancel", resumeStoryTimer);
  document.addEventListener("keydown", function (e) {
    if (!storyViewer.classList.contains("show")) return;
    if (e.key === "Escape") closeStory();
    if (e.key === "ArrowRight") nextStory();
    if (e.key === "ArrowLeft") prevStory();
  });

  // ---------- Lock screen clock ----------
  var lockDate = document.getElementById("lockDate");
  var lockTime = document.getElementById("lockTime");
  var statusBarTime = document.getElementById("statusBarTime");
  var DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  function tickClock() {
    var now = new Date();
    lockDate.textContent = DAY_NAMES[now.getDay()] + ", " + now.getDate() + " " + MONTH_NAMES[now.getMonth()];
    var hm = pad(now.getHours()) + ":" + pad(now.getMinutes());
    lockTime.textContent = hm;
    if (statusBarTime) statusBarTime.textContent = hm.replace(":", ".");
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---------- Opening flow (lock screen -> chat) ----------
  var lockScreen = document.getElementById("lockScreen");
  var chatShell = document.getElementById("chatShell");
  var composeBar = document.getElementById("composeBar");
  var bgMusic = document.getElementById("bgMusic");
  var musicToggle = document.getElementById("musicToggle");

  function startMusic() {
    return bgMusic.play().then(function () {
      musicToggle.classList.add("playing");
      musicToggle.setAttribute("aria-pressed", "true");
    }).catch(function () {
      // Browsers require a user gesture before unmuted audio can start.
    });
  }

  // Try immediately, then retry on the first landing-page gesture for browsers
  // that block unmuted autoplay.
  startMusic();
  lockScreen.addEventListener("pointerdown", startMusic, { once: true });

  function openInvitation() {
    chatShell.classList.remove("locked");
    lockScreen.style.opacity = "0";
    lockScreen.style.pointerEvents = "none";
    setTimeout(function () { lockScreen.style.display = "none"; }, 400);
    composeBar.classList.add("show");

    var participants = document.querySelector(".header-participants");
    if (participants) {
      var original = participants.textContent;
      participants.textContent = "Ledy sedang mengetik...";
      participants.classList.add("typing-status");
      setTimeout(function () {
        participants.textContent = original;
        participants.classList.remove("typing-status");
      }, 2200);
    }

    startMusic();
  }
  lockScreen.style.transition = "opacity .4s ease";
  document.getElementById("notifSamuel").addEventListener("click", openInvitation);
  document.getElementById("notifLedy").addEventListener("click", openInvitation);

  // ---------- Swipe up to open (touch + mouse drag), anywhere on the lock screen ----------
  var swipeStartY = null;

  function swipeStart(y) { swipeStartY = y; }
  function swipeEnd(y) {
    if (swipeStartY === null) return;
    var delta = swipeStartY - y;
    swipeStartY = null;
    if (delta > 50) openInvitation();
  }

  lockScreen.addEventListener("touchstart", function (e) { swipeStart(e.touches[0].clientY); }, { passive: true });
  lockScreen.addEventListener("touchend", function (e) { swipeEnd(e.changedTouches[0].clientY); });

  // Listen on document (not via setPointerCapture) so a mouse/trackpad drag
  // that ends outside lockScreen still registers, without hijacking the
  // notification buttons' own click-to-open behaviour.
  function onDocPointerUp(e) {
    document.removeEventListener("pointerup", onDocPointerUp);
    swipeEnd(e.clientY);
  }
  lockScreen.addEventListener("pointerdown", function (e) {
    swipeStart(e.clientY);
    document.addEventListener("pointerup", onDocPointerUp);
  });

  function closeInvitation() {
    chatShell.classList.add("locked");
    composeBar.classList.remove("show");
    lockScreen.style.display = "";
    lockScreen.style.pointerEvents = "";
    requestAnimationFrame(function () { lockScreen.style.opacity = "1"; });
    bgMusic.pause();
    musicToggle.classList.remove("playing");
    musicToggle.setAttribute("aria-pressed", "false");
  }
  document.getElementById("mainBackBtn").addEventListener("click", closeInvitation);

  // ---------- Music toggle ----------
  musicToggle.addEventListener("click", function () {
    if (bgMusic.paused) {
      startMusic();
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
        title: "Undangan Pernikahan Samuel & Ledy",
        text: "Kamu diundang ke pernikahan Samuel & Ledy!",
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

  var daysRemaining = 0;

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
    daysRemaining = days;
  }

  // ---------- Pinned message: tap cycles to the next item and jumps to it ----------
  var pinnedItems = [
    { target: "#countdown", text: function () { return "Hitung mundur · <strong>" + daysRemaining + "</strong> hari lagi menuju hari H"; } },
    { target: "#events", text: function () { return "Lokasi · Pemberkatan, Semarang"; } },
    { target: "#gift", text: function () { return "Tanda kasih · BCA · 1234567890"; } },
    { target: "#rsvp", text: function () { return "Konfirmasi kehadiran · Kamu bisa datang?"; } }
  ];
  var pinnedIndex = 0;
  var pinnedBar = document.getElementById("pinnedBar");
  var pinnedText = document.getElementById("pinnedText");
  var pinnedDots = document.getElementById("pinnedDots");
  pinnedItems.forEach(function () {
    var dot = document.createElement("span");
    dot.className = "dot";
    pinnedDots.appendChild(dot);
  });
  var pinnedDotEls = Array.prototype.slice.call(pinnedDots.querySelectorAll(".dot"));

  function renderPinned() {
    var item = pinnedItems[pinnedIndex];
    pinnedText.innerHTML = item.text();
    pinnedDotEls.forEach(function (dot, i) { dot.classList.toggle("active", i === pinnedIndex); });
  }
  renderPinned();

  pinnedBar.addEventListener("click", function () {
    var item = pinnedItems[pinnedIndex];
    var targetEl = document.querySelector(item.target);
    if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
    pinnedIndex = (pinnedIndex + 1) % pinnedItems.length;
    renderPinned();
  });

  tickCountdown();
  setInterval(function () {
    tickCountdown();
    if (pinnedIndex === 0) renderPinned();
  }, 1000);

  // ---------- Compose bar camera icon -> jump to gallery ----------
  document.getElementById("composeCamera").addEventListener("click", function () {
    var gallerySection = document.getElementById("gallery");
    if (gallerySection) gallerySection.scrollIntoView({ behavior: "smooth" });
  });

  // ---------- Add to calendar: open the .ics directly in the native calendar app ----------
  function icsEscape(text) {
    return String(text).replace(/([,;])/g, "\\$1");
  }
  document.querySelectorAll(".btn-calendar").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var summary = btn.getAttribute("data-summary") || "Pernikahan Samuel & Ledy";
      var location = btn.getAttribute("data-location") || "";
      var start = btn.getAttribute("data-start");
      var end = btn.getAttribute("data-end");

      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "SUMMARY:" + icsEscape(summary),
        "DTSTART:" + start,
        "DTEND:" + end,
        "LOCATION:" + icsEscape(location),
        "DESCRIPTION:" + icsEscape(summary),
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      // Navigating directly to a data: URI (rather than an <a download> blob
      // link) is what makes iOS Safari present the native "Add Event" sheet
      // immediately instead of just saving a .ics file to Files.
      window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
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
  var STORAGE_KEY = "wedding_wishes_samuel_ledy";
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

  // ---------- Quick-jump menu (opened from compose bar's + button) ----------
  var jumpMenu = document.getElementById("jumpMenu");
  var jumpMenuToggle = document.getElementById("jumpMenuToggle");
  var navLinks = Array.prototype.slice.call(jumpMenu.querySelectorAll("a"));
  var navSections = navLinks.map(function (link) {
    var sel = link.getAttribute("data-target");
    return { link: link, el: document.querySelector(sel) };
  }).filter(function (n) { return n.el; });

  jumpMenuToggle.addEventListener("click", function () {
    var isOpen = jumpMenu.classList.toggle("show");
    jumpMenuToggle.setAttribute("aria-expanded", String(isOpen));
    jumpMenu.setAttribute("aria-hidden", String(!isOpen));
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var targetEl = document.querySelector(link.getAttribute("data-target"));
      if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
      jumpMenu.classList.remove("show");
      jumpMenuToggle.setAttribute("aria-expanded", "false");
      jumpMenu.setAttribute("aria-hidden", "true");
    });
  });

  var chatFeed = document.getElementById("chatFeed");
  function updateActiveNav() {
    var feedRect = chatFeed.getBoundingClientRect();
    var scrollPos = feedRect.top + feedRect.height / 3;
    var current = navSections[0];
    navSections.forEach(function (n) {
      if (n.el.getBoundingClientRect().top <= scrollPos) current = n;
    });
    navLinks.forEach(function (l) { l.classList.remove("active"); });
    if (current) current.link.classList.add("active");
  }
  chatFeed.addEventListener("scroll", updateActiveNav, { passive: true });

  // ---------- Fake compose bar -> jumps to RSVP ----------
  function goToRsvp() {
    var rsvpSection = document.getElementById("rsvp");
    if (rsvpSection) rsvpSection.scrollIntoView({ behavior: "smooth" });
    var nameInput = document.getElementById("rsvpName");
    if (nameInput) setTimeout(function () { nameInput.focus(); }, 400);
  }
  document.getElementById("composeInput").addEventListener("click", goToRsvp);
  document.getElementById("composeSend").addEventListener("click", goToRsvp);

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
    "Photo booth berdua",
    "Liburan ke Bandung",
    "Photo booth, lagi becanda",
    "Nonton bareng",
    "Lari pagi di Jakarta"
  ];
  var galleryClasses = ["g1", "g2", "g3", "g4", "g5"];
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

  document.querySelectorAll("#galleryMosaic .g-item, #giMediaGrid .g-item").forEach(function (item) {
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
