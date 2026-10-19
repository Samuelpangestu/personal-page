// Configure SPREADSHEET_ID and RSVP_SECRET in Script Properties, never in Git.
function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    var body = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var secret = props.getProperty('RSVP_SECRET') || (typeof RSVP_CONFIG !== 'undefined' && RSVP_CONFIG.secret);
    if (!secret || body.secret !== secret) throw new Error('Unauthorized');
    if (body.action === 'guest') return jsonRsvp_(lookupGuest_(body, props));
    if (!/^[a-f0-9]{64}$/.test(body.key || '')) throw new Error('Invalid guest');
    if (body.action !== 'read' && body.action !== 'save') throw new Error('Invalid action');
    if (body.action === 'save') validateRsvp_(body);
    lock.waitLock(10000);
    locked = true;
    var sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID') || RSVP_CONFIG.spreadsheetId).getSheetByName('RSVP');
    if (!sheet) throw new Error('RSVP sheet not configured');
    var rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues() : [];
    var index = rows.findIndex(function (row) { return row[5] === body.key; });
    if (body.action === 'read') return jsonRsvp_({ok: true, entry: index < 0 ? null : entryRsvp_(rows[index])});
    var now = new Date();
    var row = [now, textRsvp_(body.name), body.status, body.status === 'Hadir' ? body.count : 0,
      textRsvp_(body.message), body.key, textRsvp_(body.invitedName), index < 0 ? now : rows[index][7], 'Website'];
    // Summary cells to the right can make getLastRow larger than the response table.
    var target = index < 0 ? rows.findIndex(function (existing) { return existing.every(function (value) { return value === ''; }); }) : index;
    if (target < 0) target = rows.length;
    sheet.getRange(target + 2, 1, 1, 9).setValues([row]);
    SpreadsheetApp.flush();
    return jsonRsvp_({ok: true, entry: {name: body.name, status: body.status,
      count: row[3], message: body.message, ts: now.getTime(), synced: true}});
  } catch (error) {
    console.error('RSVP: ' + error.message);
    return jsonRsvp_({ok: false, error: 'RSVP belum tersimpan. Silakan coba lagi.'});
  } finally {
    if (locked) lock.releaseLock();
  }
}

function validateRsvp_(body) {
  ['invitedName', 'name'].forEach(function (key) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].length > 120) throw new Error('Invalid name');
  });
  if (typeof body.message !== 'string' || body.message.length > 2000) throw new Error('Invalid message');
  if (body.status !== 'Hadir' && body.status !== 'Tidak Hadir') throw new Error('Invalid status');
  if (!Number.isInteger(body.count) || (body.status === 'Hadir' ? body.count < 1 || body.count > 2 : body.count !== 0)) throw new Error('Invalid count');
}

function textRsvp_(value) {
  // setValues interprets '=' as a formula; user text must remain literal.
  return /^[=+@\-]/.test(value) ? "'" + value : value;
}

function entryRsvp_(row) {
  return {name: row[1], status: row[2], count: row[3], message: row[4], ts: new Date(row[0]).getTime(), synced: true};
}

function authorizeRsvp() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || RSVP_CONFIG.spreadsheetId;
  console.log('RSVP siap: ' + SpreadsheetApp.openById(id).getSheetByName('RSVP').getName());
}

function jsonRsvp_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function lookupGuest_(body, props) {
  if (!/^[a-f0-9]{32}$/.test(body.guestId || '')) throw new Error('Invalid guest ID');
  var sheet = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID') || RSVP_CONFIG.spreadsheetId).getSheetByName('Tamu');
  if (!sheet) throw new Error('Guest sheet not configured');
  var rows = sheet.getLastRow() >= 6 ? sheet.getRange(6, 2, sheet.getLastRow() - 5, 11).getValues() : [];
  var matches = rows.filter(function (row) { return row[10] === body.guestId; });
  if (matches.length > 1) throw new Error('Duplicate guest ID');
  var name = matches.length ? String(matches[0][0]).trim() : '';
  return {ok: true, name: name || null};
}
