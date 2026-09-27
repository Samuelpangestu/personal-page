(function () {
  "use strict";

  var ADMIN_PASSWORD = "panitia2026";
  var STORAGE_KEY = "wedding_wishes_raka_kirana";
  var SESSION_KEY = "wedding_admin_session";

  var gate = document.getElementById("gate");
  var dashboard = document.getElementById("dashboard");
  var gateForm = document.getElementById("gateForm");
  var gatePassword = document.getElementById("gatePassword");
  var gateError = document.getElementById("gateError");
  var logoutBtn = document.getElementById("logoutBtn");

  function showDashboard() {
    gate.style.display = "none";
    dashboard.classList.add("show");
    renderAll();
  }

  gateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (gatePassword.value === ADMIN_PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) {}
      gateError.classList.remove("show");
      showDashboard();
    } else {
      gateError.classList.add("show");
    }
  });

  logoutBtn.addEventListener("click", function () {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (err) {}
    dashboard.classList.remove("show");
    gate.style.display = "flex";
    gatePassword.value = "";
  });

  try {
    if (sessionStorage.getItem(SESSION_KEY) === "1") showDashboard();
  } catch (err) {}

  // ---------- Data ----------
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

  var statTotal = document.getElementById("statTotal");
  var statHadir = document.getElementById("statHadir");
  var statTidak = document.getElementById("statTidak");
  var statRagu = document.getElementById("statRagu");
  var tableBody = document.getElementById("tableBody");
  var tableEmpty = document.getElementById("tableEmpty");
  var searchInput = document.getElementById("searchInput");
  var filterStatus = document.getElementById("filterStatus");
  var exportBtn = document.getElementById("exportBtn");

  var statusClass = { "Hadir": "status-hadir", "Tidak Hadir": "status-tidak", "Ragu": "status-ragu" };

  function formatDate(ts) {
    var d = new Date(ts);
    return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function renderStats(wishes) {
    statTotal.textContent = wishes.length;
    statHadir.textContent = wishes.filter(function (w) { return w.status === "Hadir"; }).length;
    statTidak.textContent = wishes.filter(function (w) { return w.status === "Tidak Hadir"; }).length;
    statRagu.textContent = wishes.filter(function (w) { return w.status === "Ragu"; }).length;
  }

  function renderTable() {
    var wishes = loadWishes();
    renderStats(wishes);

    var query = searchInput.value.trim().toLowerCase();
    var status = filterStatus.value;

    var filtered = wishes.filter(function (w) {
      var matchesQuery = !query || w.name.toLowerCase().indexOf(query) !== -1 || w.message.toLowerCase().indexOf(query) !== -1;
      var matchesStatus = !status || w.status === status;
      return matchesQuery && matchesStatus;
    }).slice().reverse();

    tableBody.innerHTML = "";
    tableEmpty.classList.toggle("show", filtered.length === 0);

    filtered.forEach(function (w) {
      var tr = document.createElement("tr");

      var tdName = document.createElement("td");
      tdName.textContent = w.name;

      var tdStatus = document.createElement("td");
      tdStatus.textContent = w.status;
      tdStatus.className = statusClass[w.status] || "";

      var tdMsg = document.createElement("td");
      tdMsg.className = "wish-cell";
      tdMsg.textContent = w.message;

      var tdTime = document.createElement("td");
      tdTime.className = "time-cell";
      tdTime.textContent = formatDate(w.ts);

      var tdAction = document.createElement("td");
      var delBtn = document.createElement("button");
      delBtn.className = "btn-delete";
      delBtn.textContent = "Hapus";
      delBtn.addEventListener("click", function () {
        var all = loadWishes().filter(function (item) { return item.ts !== w.ts; });
        saveWishes(all);
        renderTable();
      });
      tdAction.appendChild(delBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdStatus);
      tr.appendChild(tdMsg);
      tr.appendChild(tdTime);
      tr.appendChild(tdAction);
      tableBody.appendChild(tr);
    });
  }

  function renderAll() {
    renderTable();
  }

  searchInput.addEventListener("input", renderTable);
  filterStatus.addEventListener("change", renderTable);

  exportBtn.addEventListener("click", function () {
    var wishes = loadWishes();
    var rows = [["Nama", "Status", "Ucapan", "Waktu"]];
    wishes.forEach(function (w) {
      rows.push([w.name, w.status, w.message.replace(/\n/g, " "), formatDate(w.ts)]);
    });
    var csv = rows.map(function (row) {
      return row.map(function (cell) {
        var value = String(cell).replace(/"/g, '""');
        return '"' + value + '"';
      }).join(",");
    }).join("\r\n");

    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "rsvp-raka-kirana.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
