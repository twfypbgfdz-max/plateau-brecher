// PLATEAU-BRECHER V9.1 — Google Apps Script
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

    // ── type:'pr' → nur Spalte D (1RM) aktualisieren ─────────────
    if (type === 'pr') {
      updatePROnly(data.exercise, data.orm, data.date);
      logError('PR_UPDATE', data.exercise + ' → 1RM ' + data.orm + ' kg', data.date || '');
      return ContentService.createTextOutput('{"success":true}').setMimeType(ContentService.MimeType.JSON);
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

          // Besten Satz ermitteln (höchstes Gewicht, bei Gleichstand höhere Wdh)
          const setsArr = [
            { g: parseNum(entry.g1), r: parseNum(entry.r1) },
            { g: parseNum(entry.g2), r: parseNum(entry.r2) },
            { g: parseNum(entry.g3), r: parseNum(entry.r3) }
          ].filter(s => s.g > 0);
          if (setsArr.length > 0) {
            const best = setsArr.sort((a, b) => b.g - a.g || b.r - a.r)[0];
            updatePersonalBest(entry.uebung, best.g, best.r, entry.date, sheetName);
          }

          updated++; break;
        }
      }
    }
    logError('SYNC_OK', 'Bulk: ' + updated + '/' + entries.length + ' gespeichert', data.date || '');
    return ContentService.createTextOutput(JSON.stringify({
      success: updated > 0, updated: updated, total: entries.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    logError('API POST', err.toString(), e.postData ? e.postData.contents.substring(0, 200) : 'Kein Inhalt');
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
        logError('API GET', 'Sheet nicht gefunden', e.parameter.sheet);
        return ContentService.createTextOutput('Fehler: Blatt nicht gefunden.').setMimeType(ContentService.MimeType.TEXT);
      }
      const data = sheet.getRange(4, 1, sheet.getLastRow() - 3, 22).getValues();
      return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput('API aktiv - V9.1').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    logError('API GET KRITISCH', err.toString(), JSON.stringify(e.parameter));
    return ContentService.createTextOutput('Fehler: ' + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

// Bulk-Save: schreibt B (Gewicht), C (Wdh), E (Datum), F (Zyklus), G (Quelle)
function updatePersonalBest(uebung, gewicht, wdh, datum, sheetName) {
  if (!gewicht || gewicht <= 0) return;
  const pbSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Bestleistungen');
  if (!pbSheet) return;
  const data = pbSheet.getDataRange().getValues();
  for (let i = 4; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(uebung).toLowerCase()) {
      const oldGew = parseFloat(data[i][1]) || 0;
      const oldWdh = parseFloat(data[i][2]) || 0;
      if (parseFloat(gewicht) > oldGew || (parseFloat(gewicht) === oldGew && parseFloat(wdh || 0) > oldWdh)) {
        pbSheet.getRange(i + 1, 2).setValue(gewicht);           // B Bestes Gewicht
        pbSheet.getRange(i + 1, 3).setValue(wdh || 0);          // C Beste Wdh
        // D: 1RM berechnen (Epley-Formel) falls keine Formel im Sheet
        const orm1rm = Math.round(parseFloat(gewicht) * (1 + parseFloat(wdh || 0) / 30));
        pbSheet.getRange(i + 1, 4).setValue(orm1rm);            // D Bester 1RM
        pbSheet.getRange(i + 1, 5).setValue(datum);             // E Datum
        if (sheetName) pbSheet.getRange(i + 1, 6).setValue(sheetName); // F Zyklus
        pbSheet.getRange(i + 1, 7).setValue('App-Update V9.1'); // G Quelle
      }
      return;
    }
  }
}

// PR-Route: schreibt nur D (1RM) — Gewicht/Wdh kommen hier nicht an
function updatePROnly(uebung, orm, datum) {
  if (!orm || orm <= 0) return;
  const pbSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Bestleistungen');
  if (!pbSheet) return;
  const data = pbSheet.getDataRange().getValues();
  for (let i = 4; i < data.length; i++) {
    if (String(data[i][0]).trim().toLowerCase() === String(uebung).toLowerCase()) {
      if (parseFloat(orm) >= (parseFloat(data[i][3]) || 0)) {
        pbSheet.getRange(i + 1, 4).setValue(orm);               // D Bester 1RM
        if (datum) pbSheet.getRange(i + 1, 5).setValue(datum);  // E Datum
        pbSheet.getRange(i + 1, 7).setValue('PR App V9.1');     // G Quelle
      }
      return;
    }
  }
}

function parseNum(val) {
  if (typeof val === 'string') return parseFloat(val.replace(',', '.')) || 0;
  return parseFloat(val) || 0;
}

function logError(typ, nachricht, details) {
  const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Fehlerprotokoll');
  if (logSheet) logSheet.appendRow([new Date(), typ, nachricht, String(details).substring(0, 500)]);
}
