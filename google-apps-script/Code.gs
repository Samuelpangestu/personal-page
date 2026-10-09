var SPREADSHEET_ID = "1jBOSVG5hpwS1YXkMMIICwJ9Jd4bGJpuOOc9wlfCEmSg";
var SHEET_ID = 1448202939;
var HEADERS = ["Waktu", "Nama", "Kehadiran", "Jumlah Tamu", "Ucapan & Doa"];

function doGet() {
  return jsonResponse({ ok: true, service: "wedding-rsvp" });
}

function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(10000);

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetById(SHEET_ID);
    if (!sheet) throw new Error("Sheet tab not found");

    ensureHeaders(sheet);

    var params = (e && e.parameter) || {};
    var status = params.status === "Hadir" ? "Hadir" : "Tidak Hadir";
    var count = status === "Hadir" && (params.count === "1" || params.count === "2")
      ? Number(params.count)
      : "";

    sheet.appendRow([
      new Date(),
      safeCell(params.name),
      status,
      count,
      safeCell(params.message)
    ]);

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error.message || error) });
  } finally {
    lock.releaseLock();
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
}

function safeCell(value) {
  var text = String(value || "").trim().slice(0, 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
