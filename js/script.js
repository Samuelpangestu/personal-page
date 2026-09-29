(function () {
  "use strict";

  var WEDDING_DATE = new Date("2026-12-21T09:00:00+07:00");
  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function pad(n) { return String(n).padStart(2, "0"); }

  // ---------- Loader ----------
  window.addEventListener("load", function () {
    document.getElementById("loader").classList.add("hide");
  });

  // ---------- Viewport: pin the app to the *visible* viewport ----------
  // iOS Safari resizes/pans the visual viewport for its toolbar and the
  // keyboard. Mirroring visualViewport into CSS keeps the header and composer
  // on screen, and the document itself is never allowed to scroll.
  var vv = window.visualViewport;
  function isTextFieldFocused() {
    var el = document.activeElement;
    return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT");
  }
  function syncViewport() {
    if (!vv) return;
    root.style.setProperty("--app-h", Math.round(vv.height) + "px");
    root.style.setProperty("--app-top", Math.max(0, Math.round(vv.offsetTop)) + "px");
  }
  if (vv) {
    vv.addEventListener("resize", syncViewport);
    vv.addEventListener("scroll", syncViewport);
    syncViewport();
    // On some browsers (notably in-app WebViews, e.g. a link opened directly
    // from a WhatsApp chat) visualViewport.height isn't fully settled at the
    // moment this script runs, and nothing re-corrects --app-h until a later
    // scroll/resize fires - which only happens once the user interacts. That
    // leaves the very first screen (the lock screen) rendered against a
    // stale/wrong height until then. Re-sync a few times shortly after load
    // to catch that settling automatically, without needing user input.
    [50, 200, 500, 1200].forEach(function (delay) {
      setTimeout(syncViewport, delay);
    });
  }
  window.addEventListener("scroll", function () {
    if (!isTextFieldFocused() && (window.scrollY || window.pageYOffset)) window.scrollTo(0, 0);
  }, { passive: true });
  document.addEventListener("focusout", function () {
    setTimeout(function () {
      if (isTextFieldFocused()) return;
      window.scrollTo(0, 0);
      syncViewport();
    }, 80);
  });

  // Safari tints its status bar / toolbar from theme-color.
  var themeMeta = document.getElementById("themeColor");
  function syncThemeColor(locked) {
    if (!themeMeta) return;
    var dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    themeMeta.setAttribute("content", locked ? "#000000" : (dark ? "#1E1E1E" : "#F6F6F6"));
  }

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

  // ---------- Toast ----------
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }

  // ---------- Message grouping (WhatsApp rules) ----------
  // Consecutive messages from one sender form a run: the sender's name sits
  // on the first bubble, the avatar and the tail on the last one.
  var chatFeed = document.getElementById("chatFeed");
  var SENDERS = { groom: "Samuel", bride: "Ledy" };

  function senderOf(msg) {
    if (msg.classList.contains("out")) return "out";
    if (msg.classList.contains("bride")) return "bride";
    if (msg.classList.contains("groom")) return "groom";
    return "guest";
  }

  function groupMessages() {
    var msgs = Array.prototype.slice.call(chatFeed.querySelectorAll(".msg"));
    msgs.forEach(function (msg, i) {
      var who = senderOf(msg);
      var prev = msgs[i - 1];
      var next = msgs[i + 1];
      var first = !prev || senderOf(prev) !== who;
      var last = !next || senderOf(next) !== who;
      msg.classList.toggle("is-first", first);
      msg.classList.toggle("is-last", last);

      var bubble = msg.querySelector(".bubble");
      var existing = bubble && bubble.querySelector(":scope > .sender");
      if (first && SENDERS[who] && bubble && !existing) {
        var name = document.createElement("p");
        name.className = "sender sender-" + who;
        name.textContent = SENDERS[who];
        bubble.insertBefore(name, bubble.firstChild);
      } else if (!first && existing) {
        existing.remove();
      }
    });
  }

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

  // ---------- Lock screen clock (Indonesian iOS format: "20.28") ----------
  var lockDate = document.getElementById("lockDate");
  var lockTime = document.getElementById("lockTime");
  var statusBarTime = document.getElementById("statusBarTime");
  var DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  var MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  function tickClock() {
    var now = new Date();
    lockDate.textContent = DAY_NAMES[now.getDay()] + ", " + now.getDate() + " " + MONTH_NAMES[now.getMonth()];
    var hm = pad(now.getHours()) + "." + pad(now.getMinutes());
    lockTime.textContent = hm;
    if (statusBarTime) statusBarTime.textContent = hm;
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---------- Music (only after a real user gesture) ----------
  var bgMusic = document.getElementById("bgMusic");
  var musicToggle = document.getElementById("musicToggle");

  function setMusicState(playing) {
    musicToggle.classList.toggle("playing", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    musicToggle.setAttribute("aria-label", playing ? "Jeda musik latar" : "Putar musik latar");
  }
  function startMusic() {
    var p = bgMusic.play();
    if (p && p.then) {
      p.then(function () { setMusicState(true); }).catch(function () { setMusicState(false); });
    } else {
      setMusicState(true);
    }
  }
  function stopMusic() {
    bgMusic.pause();
    setMusicState(false);
  }
  musicToggle.addEventListener("click", function () {
    if (bgMusic.paused) startMusic(); else stopMusic();
  });

  // ---------- Opening flow: lock screen -> chat ----------
  var lockScreen = document.getElementById("lockScreen");
  var chatShell = document.getElementById("chatShell");
  var isOpen = false;
  var OPEN_MS = 320;
  var EASE = "cubic-bezier(.32,.72,0,1)";

  // p = 0 (locked) .. 1 (open). The lock screen follows the finger 1:1 and
  // the chat underneath scales from 96% to 100%, as iOS does for an app.
  function paintProgress(p, animate) {
    var h = lockScreen.offsetHeight || window.innerHeight;
    var t = animate ? "transform " + OPEN_MS + "ms " + EASE : "none";
    lockScreen.style.transition = t;
    chatShell.style.transition = t;
    if (reduceMotion.matches && animate) {
      lockScreen.style.transition = "opacity 150ms linear";
      lockScreen.style.opacity = p >= 1 ? "0" : "1";
      lockScreen.style.transform = "";
      chatShell.style.transform = "";
      return;
    }
    lockScreen.style.opacity = "";
    lockScreen.style.transform = p ? "translate3d(0," + (-p * h) + "px,0)" : "";
    chatShell.style.transform = "scale(" + (0.96 + 0.04 * p) + ")";
  }

  var typingTimer = null;
  function showTyping() {
    var participants = document.querySelector(".header-participants");
    if (!participants || participants.dataset.original) return;
    participants.dataset.original = participants.innerHTML;
    participants.textContent = "Ledy sedang mengetik…";
    typingTimer = setTimeout(function () {
      participants.innerHTML = participants.dataset.original;
      delete participants.dataset.original;
      document.getElementById("headerGuestName").textContent = guestName;
    }, 2200);
  }

  function finishOpen() {
    lockScreen.classList.add("gone");
    lockScreen.setAttribute("aria-hidden", "true");
    chatShell.classList.remove("locked");
    chatShell.style.transform = "";
    chatShell.style.transition = "";
  }

  function openInvitation() {
    if (isOpen) return;
    isOpen = true;
    // Called from inside the gesture handler, so autoplay policy allows it.
    startMusic();
    chatFeed.scrollTop = 0;
    root.classList.remove("is-locked");
    syncThemeColor(false);
    paintProgress(1, true);
    setTimeout(finishOpen, reduceMotion.matches ? 160 : OPEN_MS);
    showTyping();
  }

  function closeInvitation() {
    if (!isOpen) return;
    isOpen = false;
    closeJumpMenu();
    stopMusic();
    lockScreen.classList.remove("gone");
    lockScreen.removeAttribute("aria-hidden");
    chatShell.classList.add("locked");
    root.classList.add("is-locked");
    syncThemeColor(true);
    paintProgress(1, false);
    void lockScreen.offsetHeight;
    paintProgress(0, true);
  }
  document.getElementById("mainBackBtn").addEventListener("click", closeInvitation);

  // Tapping a notification opens the chat (as on iOS). A drag that happens to
  // start on a notification must not count as a tap.
  var suppressNotifClick = false;
  ["notifSamuel", "notifLedy"].forEach(function (id) {
    document.getElementById(id).addEventListener("click", function () {
      if (suppressNotifClick) { suppressNotifClick = false; return; }
      openInvitation();
    });
  });

  // ---------- Swipe up (pointer events: touch, pen and mouse) ----------
  var drag = null;
  var DRAG_SLOP = 8;            // px before a press becomes a drag
  var OPEN_DISTANCE = 0.22;     // fraction of screen height
  var OPEN_VELOCITY = 0.5;      // px/ms upward flick

  lockScreen.addEventListener("pointerdown", function (e) {
    if (isOpen || (e.pointerType === "mouse" && e.button !== 0)) return;
    drag = { id: e.pointerId, y0: e.clientY, y: e.clientY, t: e.timeStamp, vy: 0, active: false };
  });

  lockScreen.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dy = drag.y0 - e.clientY;
    if (!drag.active) {
      if (Math.abs(dy) < DRAG_SLOP) return;
      drag.active = true;
      suppressNotifClick = true;
      try { lockScreen.setPointerCapture(e.pointerId); } catch (err) {}
    }
    var dt = Math.max(1, e.timeStamp - drag.t);
    drag.vy = (drag.y - e.clientY) / dt;
    drag.y = e.clientY;
    drag.t = e.timeStamp;
    var h = lockScreen.offsetHeight || window.innerHeight;
    paintProgress(Math.max(0, Math.min(1, dy / h)), false);
  });

  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag;
    drag = null;
    if (!d.active) return;
    var h = lockScreen.offsetHeight || window.innerHeight;
    var dy = d.y0 - e.clientY;
    if (e.type !== "pointercancel" && (dy > h * OPEN_DISTANCE || (d.vy > OPEN_VELOCITY && dy > 40))) {
      openInvitation();
    } else {
      paintProgress(0, true);
    }
    // Let a click that follows this pointerup be swallowed, then re-arm.
    setTimeout(function () { suppressNotifClick = false; }, 0);
  }
  lockScreen.addEventListener("pointerup", endDrag);
  lockScreen.addEventListener("pointercancel", endDrag);
  // Older iOS without touch-action support: never let the page pan.
  lockScreen.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });

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

  // ---------- Share (forward button beside the invitation photo) ----------
  var shareBtn = document.getElementById("shareBtn");
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
        showToast("Tautan undangan disalin");
      }).catch(function () {});
    }
  });

  // ---------- Reactions ----------
  document.querySelectorAll(".reaction-pill").forEach(function (btn) {
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", function () {
      var countEl = btn.querySelector(".r-count");
      var reacted = btn.classList.toggle("reacted");
      btn.setAttribute("aria-pressed", String(reacted));
      if (countEl) {
        var count = parseInt(countEl.textContent, 10) || 0;
        countEl.textContent = reacted ? count + 1 : count - 1;
      }
    });
  });

  // ---------- Scrolling inside the chat ----------
  var chatTop = document.getElementById("chatTop");
  function scrollChatTo(targetEl, highlight) {
    var feedRect = chatFeed.getBoundingClientRect();
    var top = targetEl.getBoundingClientRect().top - feedRect.top + chatFeed.scrollTop - chatTop.offsetHeight - 8;
    chatFeed.scrollTo({ top: Math.max(0, top), behavior: reduceMotion.matches ? "auto" : "smooth" });
    if (highlight) {
      var row = targetEl.classList.contains("msg") ? targetEl : targetEl.querySelector(".msg");
      if (!row) return;
      row.classList.remove("flash");
      void row.offsetWidth;
      row.classList.add("flash");
      setTimeout(function () { row.classList.remove("flash"); }, 1200);
    }
  }

  // ---------- Countdown ----------
  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");
  var daysRemaining = 0;

  function tickCountdown() {
    var diff = WEDDING_DATE.getTime() - Date.now();
    if (diff < 0) diff = 0;
    var days = Math.floor(diff / 86400000);
    elDays.textContent = pad(days);
    elHours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    elMins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    elSecs.textContent = pad(Math.floor((diff % 60000) / 1000));
    daysRemaining = days;
  }

  // ---------- Pinned messages ----------
  // Tap: jump to the pinned message shown, then show the next one. The text
  // slides in the direction of travel through the chat; the vertical
  // indicator marks which of the pins is showing.
  var pinnedItems = [
    { target: "#countdown", label: "hitung mundur", text: function () { return "Hitung mundur · <strong>" + daysRemaining + "</strong> hari lagi menuju hari H"; } },
    { target: "#events .msg:nth-of-type(2)", label: "lokasi pemberkatan", text: function () { return "Lokasi · Pemberkatan, Semarang"; } },
    { target: "#gift .msg:nth-of-type(2)", label: "tanda kasih", text: function () { return "Tanda kasih · Jago · 105147598203"; } },
    { target: "#rsvp", label: "konfirmasi kehadiran", text: function () { return "Konfirmasi kehadiran · Kamu bisa datang?"; } }
  ];
  var pinnedIndex = 0;
  var pinnedBar = document.getElementById("pinnedBar");
  var pinnedText = document.getElementById("pinnedText");
  var pinnedCount = document.getElementById("pinnedCount");
  var pinnedTrack = document.getElementById("pinnedTrack");

  pinnedItems.forEach(function () { pinnedTrack.appendChild(document.createElement("i")); });
  var pinnedSegs = Array.prototype.slice.call(pinnedTrack.children);

  function renderPinned() {
    var item = pinnedItems[pinnedIndex];
    pinnedText.innerHTML = item.text();
    pinnedCount.textContent = (pinnedIndex + 1) + "/" + pinnedItems.length;
    pinnedSegs.forEach(function (seg, i) { seg.classList.toggle("on", i === pinnedIndex); });
    pinnedBar.setAttribute("aria-label", "Pesan disematkan " + (pinnedIndex + 1) + " dari " + pinnedItems.length + ": " + item.label + ". Ketuk untuk melompat ke pesan.");
  }

  function advancePinned() {
    var forward = pinnedIndex < pinnedItems.length - 1;
    pinnedIndex = (pinnedIndex + 1) % pinnedItems.length;
    if (reduceMotion.matches || !pinnedText.animate) { renderPinned(); return; }
    var dir = forward ? 1 : -1;
    pinnedText.animate(
      [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(" + (-60 * dir) + "%)", opacity: 0 }],
      { duration: 110, easing: "ease-in" }
    ).onfinish = function () {
      renderPinned();
      pinnedText.animate(
        [{ transform: "translateY(" + (60 * dir) + "%)", opacity: 0 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 170, easing: "cubic-bezier(.22,.61,.36,1)" }
      );
    };
  }

  pinnedBar.addEventListener("click", function () {
    var targetEl = document.querySelector(pinnedItems[pinnedIndex].target);
    if (targetEl) scrollChatTo(targetEl, true);
    advancePinned();
  });

  tickCountdown();
  renderPinned();
  setInterval(function () {
    var before = daysRemaining;
    tickCountdown();
    if (pinnedIndex === 0 && before !== daysRemaining) renderPinned();
  }, 1000);

  // ---------- Composer ----------
  document.getElementById("composeCamera").addEventListener("click", function () {
    var gallerySection = document.getElementById("gallery");
    if (gallerySection) scrollChatTo(gallerySection);
  });

  function goToRsvp() {
    var rsvpSection = document.getElementById("rsvp");
    if (rsvpSection) scrollChatTo(rsvpSection);
  }
  document.getElementById("composeInput").addEventListener("click", goToRsvp);
  document.getElementById("composeSend").addEventListener("click", goToRsvp);

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
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(value).then(function () {
        var original = btn.textContent;
        btn.textContent = "Tersalin!";
        setTimeout(function () { btn.textContent = original; }, 1800);
      }).catch(function () {});
    });
  });

  // ---------- RSVP attendance (poll) ----------
  var choiceHadir = document.getElementById("choiceHadir");
  var choiceTidak = document.getElementById("choiceTidak");
  var guestCountRow = document.getElementById("guestCountRow");
  var rsvpError = document.getElementById("rsvpError");
  var selectedStatus = "";

  function selectStatus(status) {
    selectedStatus = status;
    choiceHadir.classList.toggle("selected", status === "Hadir");
    choiceTidak.classList.toggle("selected", status === "Tidak Hadir");
    choiceHadir.setAttribute("aria-pressed", String(status === "Hadir"));
    choiceTidak.setAttribute("aria-pressed", String(status === "Tidak Hadir"));
    guestCountRow.hidden = status !== "Hadir";
    rsvpError.classList.remove("show");
  }
  choiceHadir.addEventListener("click", function () { selectStatus("Hadir"); });
  choiceTidak.addEventListener("click", function () { selectStatus("Tidak Hadir"); });

  // ---------- RSVP & Wishes (localStorage) ----------
  // Wishes stored here were written on this device, i.e. by this guest, so
  // they render as the guest's own (outgoing) messages.
  var STORAGE_KEY = "wedding_wishes_samuel_ledy";
  var wishesList = document.getElementById("wishesList");
  var wishesEmpty = document.getElementById("wishesEmpty");
  var rsvpForm = document.getElementById("rsvpForm");
  var TICKS_SVG = '<svg class="ticks" width="16" height="11" viewBox="0 0 16 11" fill="none" aria-label="Dibaca"><path d="M1 5.8 3.9 8.7 10 2.2M6.4 7.9l.8.8L13.9 2.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

  function timeOf(ts) {
    var d = ts ? new Date(ts) : new Date();
    return pad(d.getHours()) + "." + pad(d.getMinutes());
  }

  function renderWishes() {
    var wishes = loadWishes();
    wishesList.querySelectorAll(".msg").forEach(function (el) { el.remove(); });
    wishesEmpty.hidden = wishes.length > 0;

    var frag = document.createDocumentFragment();
    wishes.forEach(function (w) {
      var row = document.createElement("div");
      row.className = "msg out";

      var bubble = document.createElement("div");
      bubble.className = "bubble wish-item";

      var meta = document.createElement("p");
      meta.className = "wish-meta";
      meta.textContent = w.name + " · " + w.status + (w.count ? " (" + w.count + " orang)" : "");

      var textEl = document.createElement("p");
      textEl.className = "wish-text";
      textEl.textContent = w.message;

      var time = document.createElement("span");
      time.className = "msg-time";
      time.innerHTML = timeOf(w.ts) + TICKS_SVG;

      bubble.appendChild(meta);
      bubble.appendChild(textEl);
      bubble.appendChild(time);
      row.appendChild(bubble);
      frag.appendChild(row);
    });
    wishesList.appendChild(frag);
    groupMessages();
  }

  rsvpForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("rsvpName").value.trim();
    var message = document.getElementById("rsvpMessage").value.trim();
    var count = document.getElementById("guestCount").value;

    if (!selectedStatus) {
      rsvpError.classList.add("show");
      scrollChatTo(document.getElementById("rsvp"));
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
    if (document.activeElement) document.activeElement.blur();

    var rows = wishesList.querySelectorAll(".msg");
    if (rows.length) scrollChatTo(rows[rows.length - 1]);

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

  // ---------- Quick-jump menu (opened from the composer's + button) ----------
  var jumpMenu = document.getElementById("jumpMenu");
  var jumpMenuToggle = document.getElementById("jumpMenuToggle");
  var navLinks = Array.prototype.slice.call(jumpMenu.querySelectorAll("a"));
  var navSections = navLinks.map(function (link) {
    return { link: link, el: document.querySelector(link.getAttribute("data-target")) };
  }).filter(function (n) { return n.el; });

  function setJumpMenu(open) {
    jumpMenu.classList.toggle("show", open);
    jumpMenuToggle.setAttribute("aria-expanded", String(open));
    jumpMenu.setAttribute("aria-hidden", String(!open));
  }
  function closeJumpMenu() { setJumpMenu(false); }

  jumpMenuToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setJumpMenu(!jumpMenu.classList.contains("show"));
  });
  document.addEventListener("click", function (e) {
    if (jumpMenu.classList.contains("show") && !jumpMenu.contains(e.target)) closeJumpMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeJumpMenu();
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var targetEl = document.querySelector(link.getAttribute("data-target"));
      if (targetEl) scrollChatTo(targetEl);
      closeJumpMenu();
    });
  });

  var navTicking = false;
  function updateActiveNav() {
    navTicking = false;
    var line = chatFeed.getBoundingClientRect().top + chatTop.offsetHeight + 40;
    var current = navSections[0];
    navSections.forEach(function (n) {
      if (n.el.getBoundingClientRect().top <= line) current = n;
    });
    navLinks.forEach(function (l) { l.classList.toggle("active", !!current && l === current.link); });
  }
  chatFeed.addEventListener("scroll", function () {
    if (!navTicking) { navTicking = true; requestAnimationFrame(updateActiveNav); }
  }, { passive: true });

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

  groupMessages();
  syncThemeColor(true);
})();
