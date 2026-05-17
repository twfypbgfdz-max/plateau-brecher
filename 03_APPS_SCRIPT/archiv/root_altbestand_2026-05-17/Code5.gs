// PLATEAU-BRECHER V11.7 — Google Apps Script
const SHEET_ID = '1NA5OUomzaSFSw6_VzdJ6U7FaD1bU0qTEsQCtIneJ1JI';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const type = (data.type || '').toLowerCase();

    // ── type:'log' → Fehlerprotokoll ──────────────────────────────
    if (type === 'log') {
      logError('APP LOG: ' + (data.type_detail || 'INFO'), data.msg || '', JSON.stringify(data).substring(0, 400));
      return ContentService.createTextOutput('{"success":true}').setMimeType(ContentService.MimeType.JSON);
    }

    // ── type:'pr' → Bestleistungen ────────────────────────────────
    if (type === 'pr') {
      updatePersonalBest(data.exercise, data.orm, data.date);
      logError('PR_UPDATE', data.exercise + ' → ' + data.orm + ' kg', data.date || '');
      return ContentService.createTextOutput('{"success":true}').setMimeType(ContentService.MimeType.JSON);
    }

    // ── type:'rename' → Übungsname im Sheet umbenennen ───────────
    if (type === 'rename') {
      const ss2 = SpreadsheetApp.openById(SHEET_ID);
      const sheets = data.sheets || (data.sheet ? [data.sheet] : []);
      // Kandidaten: oldName + optional originalName als Fallback
      const candidates = [String(data.oldName).trim().toLowerCase()];
      if (data.originalName && data.originalName !== data.oldName) {
        candidates.push(String(data.originalName).trim().toLowerCase());
      }
      let totalChanged = 0;
      for (const sName of sheets) {
        const s = ss2.getSheetByName(sName);
        if (!s) continue;
        const lastRow = s.getLastRow();
        if (lastRow < 4) continue;
        const range = s.getRange(4, 5, lastRow - 3, 1);
        const vals = range.getValues();
        for (let i = 0; i < vals.length; i++) {
          if (candidates.includes(String(vals[i][0]).trim().toLowerCase())) {
            s.getRange(i + 4, 5).setValue(data.newName);
            totalChanged++;
          }
        }
      }
      // Bestleistungen-Tab ebenfalls umbenennen
      const pbSheet = ss2.getSheetByName('Bestleistungen');
      if (pbSheet) {
        const pbData = pbSheet.getDataRange().getValues();
        for (let i = 4; i < pbData.length; i++) {
          if (candidates.includes(String(pbData[i][0]).trim().toLowerCase())) {
            pbSheet.getRange(i + 1, 1).setValue(data.newName);
            totalChanged++;
          }
        }
      }
      logError('RENAME', data.oldName + ' → ' + data.newName, totalChanged + ' Zellen geändert');
      return ContentService.createTextOutput(JSON.stringify({success: true, changed: totalChanged})).setMimeType(ContentService.MimeType.JSON);
    }

    // ── type:'training' oder leer → Bulk-Upload ───────────────────
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const entries = Array.isArray(data.exercises) ? data.exercises : [data];
    const sheetName = data.sheet || (entries[0] && entries[0].sheet);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error('Sheet nicht gefunden: ' + sheetName);
    const values = sheet.getRange(1, 1, sheet.getLastRow(), 22).getValues();
    let updated = 0;
    for (const entry of entries) {
      for (let r = 3; r < values.length; r++) {
        const rowDate = String(values[r][1]).trim();
        const rowEx   = String(values[r][4]).trim();
        if (rowDate === entry.date && rowEx.toLowerCase() === entry.uebung.toLowerCase()) {
          const sr = r + 1;
          if (entry.kg)       sheet.getRange(sr, 3).setValue(parseNum(entry.kg));
          const sets = [[parseNum(entry.g1), parseNum(entry.r1), parseNum(entry.g2), parseNum(entry.r2), parseNum(entry.g3), parseNum(entry.r3)]];
          sheet.getRange(sr, 7, 1, 6).setValues(sets);
          if (entry.rpe)      sheet.getRange(sr, 15).setValue(parseNum(entry.rpe));
          if (entry.notes !== undefined && entry.notes !== '') sheet.getRange(sr, 19).setValue(String(entry.notes));
          if (entry.kcal)     sheet.getRange(sr, 20).setValue(parseNum(entry.kcal));
          if (entry.bpm)      sheet.getRange(sr, 21).setValue(parseNum(entry.bpm));
          if (entry.duration) sheet.getRange(sr, 22).setValue(parseNum(entry.duration));
          const maxG = Math.max(parseNum(entry.g1), parseNum(entry.g2), parseNum(entry.g3));
          updatePersonalBest(entry.uebung, maxG, entry.date);

          // ── Progression berechnen & in Spalte P schreiben ──────────
          const setsForOrm = [
            {g: parseNum(entry.g1), r: parseNum(entry.r1)},
            {g: parseNum(entry.g2), r: parseNum(entry.r2)},
            {g: parseNum(entry.g3), r: parseNum(entry.r3)}
          ].filter(s => s.g > 0 && s.r > 0);
          let newOrm = 0;
          if (setsForOrm.length > 0) {
            const best = setsForOrm.sort((a,b) => (b.g*(1+b.r/30)) - (a.g*(1+a.r/30)))[0];
            newOrm = Math.round(best.g * (1 + best.r / 30) * 10) / 10;
          }
          let prevOrm = 0;
          for (let pr = r - 1; pr >= 3; pr--) {
            const prEx  = String(values[pr][4]).trim();
            const prOrm = parseFloat(values[pr][13]) || 0;
            if (prEx.toLowerCase() === entry.uebung.toLowerCase() && prOrm > 0) {
              prevOrm = prOrm; break;
            }
          }
          let progText = '';
          if (newOrm > 0 && prevOrm > 0) {
            if (newOrm > prevOrm)      progText = '▲ mehr';
            else if (newOrm < prevOrm) progText = '▼ weniger';
            else                       progText = '► gleich';
          } else if (newOrm > 0) {
            progText = '► gleich';
          }
          if (progText) sheet.getRange(sr, 16).setValue(progText);
          // ────────────────────────────────────────────────────────────

          updated++; break;
        }
      }
    }
    logError('SYNC_OK', 'Bulk: ' + updated + '/' + entries.length + ' gespeichert', data.date || '');
    return ContentService.createTextOutput(JSON.stringify({
      success: updated > 0, updated: updated, total: entries.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    logError('API POST ERROR', err.toString(), e.postData ? e.postData.contents.substring(0, 200) : 'Kein Inhalt');
    return ContentService.createTextOutput(JSON.stringify({success: false, error: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    if (e.parameter.action === 'getPlan') {
      const sheet = ss.getSheetByName(e.parameter.sheet);
      if (!sheet) {
        logError('API GET ERROR', 'Sheet nicht gefunden', e.parameter.sheet);
        return ContentService.createTextOutput('Fehler: Blatt nicht gefunden.').setMimeType(ContentService.MimeType.TEXT);
      }
      const data = sheet.getRange(4, 1, sheet.getLastRow() - 3, 22).getValues();
      return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput('API aktiv - V11.7').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    logError('API GET ERROR', err.toString(), JSON.stringify(e.parameter));
    return ContentService.createTextOutput('Fehler: ' + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function updatePersonalBest(uebung, gewicht, datum) {
  if (!gewicht || gewicht <= 0) return;
  const pbSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Bestleistungen');
  if (!pbSheet) return;
  const data = pbSheet.getDataRange().getValues();
  for (let i = 4; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(uebung).toLowerCase()) {
      if (parseFloat(gewicht) >= (parseFloat(data[i][1]) || 0)) {
        pbSheet.getRange(i + 1, 2).setValue(gewicht);
        pbSheet.getRange(i + 1, 5).setValue(datum);
        pbSheet.getRange(i + 1, 7).setValue('App-Update V11.7');
      }
      return;
    }
  }
}

function parseNum(val) {
  if (typeof val === 'string') return parseFloat(val.replace(',', '.')) || 0;
  return parseFloat(val) || 0;
}

// ── Logging mit Europe/Berlin Zeitzone ────────────────────────
function logError(typ, nachricht, details) {
  const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Fehlerprotokoll');
  if (!logSheet) return;
  const tz = 'Europe/Berlin';
  const ts = Utilities.formatDate(new Date(), tz, 'dd.MM.yyyy HH:mm:ss');
  logSheet.appendRow([ts, typ, nachricht, String(details).substring(0, 500)]);
}
