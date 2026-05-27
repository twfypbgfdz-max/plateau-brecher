// PLATEAU-BRECHER V11.8 — Google Apps Script
// Basis: V11.7
// Änderung V11.8:
// - Bestleistungen werden jetzt mit Gewicht, Wdh, 1RM, Datum, Zyklus, Woche, Trainingstag und Notiz gepflegt.
// - Bestehende PRs werden nur verbessert, nicht verschlechtert.
// - ZYKLUS MASTER wird nicht verwendet.

const SHEET_ID = '1NA5OUomzaSFSw6_VzdJ6U7FaD1bU0qTEsQCtIneJ1JI';
const APP_VERSION = 'V11.8';
const PB_SHEET_NAME = 'Bestleistungen';
const LOG_SHEET_NAME = 'Fehlerprotokoll';

// Bestleistungen-Tabelle:
// Zeile 4 = Header
// Ab Zeile 5 = echte Daten
const PB_DATA_START_ROW = 5;

function doPost(e) {
  const lock = LockService.getScriptLock();
  const acquired = lock.tryLock(10000);
  if (!acquired || !lock.hasLock()) {
    logError('API POST LOCK', 'Speichern abgebrochen: Lock nicht erhalten', e && e.postData ? e.postData.contents.substring(0, 200) : 'Kein Inhalt');
    return jsonOut({ success: false, error: 'LOCK_NOT_ACQUIRED' });
  }

  try {
    const data = JSON.parse(e.postData.contents);
    const type = String(data.type || '').toLowerCase();

    // ── type:'log' → Fehlerprotokoll ──────────────────────────────
    if (type === 'log') {
      logError(
        'APP LOG: ' + (data.type_detail || 'INFO'),
        data.msg || '',
        JSON.stringify(data).substring(0, 400)
      );

      return jsonOut({ success: true });
    }

    // ── type:'pr' → Bestleistungen ────────────────────────────────
    if (type === 'pr') {
      const updated = updatePersonalBest({
        uebung: data.exercise || data.uebung || '',
        gewicht: parseNum(data.weight || data.gewicht || data.g || data.orm),
        reps: parseNum(data.reps || data.wdh || data.r || 1),
        orm: parseNum(data.orm || data.oneRm || data.oneRM),
        datum: data.date || data.datum || '',
        zyklus: data.cycle || data.zyklus || '',
        woche: data.week || data.woche || '',
        trainingstag: data.day || data.trainingstag || '',
        notiz: 'PR-Update ' + APP_VERSION
      });

      logError(
        'PR_UPDATE',
        (data.exercise || data.uebung || '') + ' → ' + (data.orm || '') + ' kg 1RM',
        'updated=' + updated + ' | ' + (data.date || data.datum || '')
      );

      return jsonOut({ success: true, updated: updated });
    }

    // ── type:'rename' → Übungsname im Sheet umbenennen ───────────
    if (type === 'rename') {
      const ss2 = SpreadsheetApp.openById(SHEET_ID);
      const sheets = data.sheets || (data.sheet ? [data.sheet] : []);

      const candidates = [String(data.oldName || '').trim().toLowerCase()];
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
          const currentName = String(vals[i][0]).trim().toLowerCase();
          if (candidates.includes(currentName)) {
            s.getRange(i + 4, 5).setValue(data.newName);
            totalChanged++;
          }
        }
      }

      // Bestleistungen-Tab ebenfalls umbenennen
      const pbSheet = ss2.getSheetByName(PB_SHEET_NAME);
      if (pbSheet) {
        const pbData = pbSheet.getDataRange().getValues();

        // echte Daten ab Zeile 5 → Array-Index 4
        for (let i = PB_DATA_START_ROW - 1; i < pbData.length; i++) {
          const currentPbName = String(pbData[i][0]).trim().toLowerCase();
          if (candidates.includes(currentPbName)) {
            pbSheet.getRange(i + 1, 1).setValue(data.newName);
            totalChanged++;
          }
        }
      }

      logError(
        'RENAME',
        data.oldName + ' → ' + data.newName,
        totalChanged + ' Zellen geändert'
      );

      return jsonOut({ success: true, changed: totalChanged });
    }

    // ── type:'training' oder leer → Bulk-Upload ───────────────────
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const entries = Array.isArray(data.exercises) ? data.exercises : [data];

    const sheetName = data.sheet || (entries[0] && entries[0].sheet);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error('Sheet nicht gefunden: ' + sheetName);

    const lastRow = sheet.getLastRow();
    if (lastRow < 4) throw new Error('Sheet hat keine Trainingsdaten: ' + sheetName);

    // A:V = 22 Spalten
    const values = sheet.getRange(1, 1, lastRow, 22).getValues();

    let updated = 0;

    for (const entry of entries) {
      if (!entry || !entry.uebung) continue;

      for (let r = 3; r < values.length; r++) {
        const rowDate = String(values[r][1] || '').trim(); // Spalte B
        const rowEx = String(values[r][4] || '').trim();   // Spalte E

        if (
          rowDate === String(entry.date || '').trim() &&
          rowEx.toLowerCase() === String(entry.uebung || '').trim().toLowerCase()
        ) {
          const sr = r + 1;

          if (entry.kg) sheet.getRange(sr, 3).setValue(parseNum(entry.kg));

          const sets = [[
            parseSheetNumOrBlank(entry.g1),
            parseSheetNumOrBlank(entry.r1),
            parseSheetNumOrBlank(entry.g2),
            parseSheetNumOrBlank(entry.r2),
            parseSheetNumOrBlank(entry.g3),
            parseSheetNumOrBlank(entry.r3)
          ]];

          // G:L
          sheet.getRange(sr, 7, 1, 6).setValues(sets);

          if (entry.rpe) sheet.getRange(sr, 15).setValue(parseNum(entry.rpe));
          if (entry.notes !== undefined && entry.notes !== '') {
            sheet.getRange(sr, 19).setValue(String(entry.notes));
          }
          if (entry.kcal) sheet.getRange(sr, 20).setValue(parseNum(entry.kcal));
          if (entry.bpm) sheet.getRange(sr, 21).setValue(parseNum(entry.bpm));
          if (entry.duration) sheet.getRange(sr, 22).setValue(parseNum(entry.duration));

          // ── Bestleistungen aktualisieren ──────────────────────────
          const bestSetForPB = getBestSetForPB(entry);

          if (bestSetForPB.orm > 0) {
            updatePersonalBest({
              uebung: entry.uebung,
              gewicht: bestSetForPB.g,
              reps: bestSetForPB.r,
              orm: bestSetForPB.orm,
              datum: entry.date || '',
              zyklus: sheetName || '',
              woche: getCurrentWeekFromRow(values, r),
              trainingstag: getCurrentDayFromRow(values, r),
              notiz: 'App-Update ' + APP_VERSION
            });
          }

          // ── Progression berechnen & in Spalte P schreiben ──────────
          const setsForOrm = [
            { g: parseNum(entry.g1), r: parseNum(entry.r1) },
            { g: parseNum(entry.g2), r: parseNum(entry.r2) },
            { g: parseNum(entry.g3), r: parseNum(entry.r3) }
          ].filter(s => s.g > 0 && s.r > 0);

          let newOrm = 0;

          if (setsForOrm.length > 0) {
            const best = setsForOrm.sort((a, b) => {
              return (b.g * (1 + b.r / 30)) - (a.g * (1 + a.r / 30));
            })[0];

            newOrm = Math.round(best.g * (1 + best.r / 30) * 10) / 10;
          }

          let prevOrm = 0;

          for (let pr = r - 1; pr >= 3; pr--) {
            const prEx = String(values[pr][4] || '').trim();
            const prOrm = parseNum(values[pr][13]);

            if (
              prEx.toLowerCase() === String(entry.uebung || '').trim().toLowerCase() &&
              prOrm > 0
            ) {
              prevOrm = prOrm;
              break;
            }
          }

          let progText = '';

          if (newOrm > 0 && prevOrm > 0) {
            if (newOrm > prevOrm) progText = '▲ mehr';
            else if (newOrm < prevOrm) progText = '▼ weniger';
            else progText = '► gleich';
          } else if (newOrm > 0) {
            progText = '► gleich';
          }

          if (progText) sheet.getRange(sr, 16).setValue(progText);

          updated++;
          break;
        }
      }
    }

    logError(
      'SYNC_OK',
      'Bulk: ' + updated + '/' + entries.length + ' gespeichert',
      data.date || sheetName || ''
    );

    return jsonOut({
      success: updated > 0,
      updated: updated,
      total: entries.length
    });

  } catch (err) {
    logError(
      'API POST ERROR',
      err.toString(),
      e && e.postData ? e.postData.contents.substring(0, 200) : 'Kein Inhalt'
    );

    return jsonOut({
      success: false,
      error: err.toString()
    });

  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (e.parameter.action === 'getBestleistungen') {
      const sheet = ss.getSheetByName(PB_SHEET_NAME);
      if (!sheet) return jsonOut([]);

      const lastRow = sheet.getLastRow();
      if (lastRow < PB_DATA_START_ROW) return jsonOut([]);

      const data = sheet.getRange(PB_DATA_START_ROW, 1, lastRow - PB_DATA_START_ROW + 1, 10).getValues();
      return jsonOut(data);
    }

    if (e.parameter.action === 'getPlan') {
      const sheet = ss.getSheetByName(e.parameter.sheet);

      if (!sheet) {
        logError('API GET ERROR', 'Sheet nicht gefunden', e.parameter.sheet);
        return ContentService
          .createTextOutput('Fehler: Blatt nicht gefunden.')
          .setMimeType(ContentService.MimeType.TEXT);
      }

      const lastRow = sheet.getLastRow();
      if (lastRow < 4) {
        return ContentService
          .createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const data = sheet.getRange(4, 1, lastRow - 3, 22).getValues();

      return ContentService
        .createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput('API aktiv - ' + APP_VERSION)
      .setMimeType(ContentService.MimeType.TEXT);

  } catch (err) {
    logError('API GET ERROR', err.toString(), JSON.stringify(e.parameter));

    return ContentService
      .createTextOutput('Fehler: ' + err.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Aktualisiert den Bestleistungen-Tab.
 *
 * Erwartete Struktur:
 * Zeile 4:
 * A Übung
 * B Bestes Gewicht (kg)
 * C Beste Wdh.
 * D Bester 1RM (kg)
 * E Datum
 * F Zyklus
 * G Notizen / Quelle
 * H Woche
 * I Trainingstag
 * J Notiz
 *
 * Regeln:
 * - Neue Übung wird angehängt.
 * - Vorhandene Übung wird nur aktualisiert, wenn der neue 1RM besser/gleich ist.
 * - Bestehende PRs werden nicht verschlechtert.
 */
function updatePersonalBest(pb) {
  if (!pb || !pb.uebung) return false;

  const uebung = String(pb.uebung || '').trim();
  if (!uebung) return false;

  const gewicht = parseNum(pb.gewicht);
  const reps = parseNum(pb.reps);
  let orm = parseNum(pb.orm);

  if (!orm && gewicht > 0 && reps > 0) {
    orm = Math.round(gewicht * (1 + reps / 30) * 10) / 10;
  }

  if (!orm || orm <= 0) return false;

  const ss = SpreadsheetApp.openById(SHEET_ID);
  const pbSheet = ss.getSheetByName(PB_SHEET_NAME);
  if (!pbSheet) return false;

  ensurePersonalBestHeader(pbSheet);

  const lastRow = pbSheet.getLastRow();
  const data = lastRow >= PB_DATA_START_ROW
    ? pbSheet.getRange(PB_DATA_START_ROW, 1, lastRow - PB_DATA_START_ROW + 1, 10).getValues()
    : [];

  const targetName = uebung.toLowerCase();

  for (let i = 0; i < data.length; i++) {
    const rowExercise = String(data[i][0] || '').trim().toLowerCase();

    if (rowExercise === targetName) {
      const sheetRow = PB_DATA_START_ROW + i;
      const oldOrm = parseNum(data[i][3]);

      if (orm >= oldOrm) {
        writePersonalBestRow(pbSheet, sheetRow, {
          uebung: uebung,
          gewicht: gewicht,
          reps: reps,
          orm: orm,
          datum: pb.datum || '',
          zyklus: pb.zyklus || '',
          quelle: pb.notiz || ('App-Update ' + APP_VERSION),
          woche: pb.woche || '',
          trainingstag: pb.trainingstag || '',
          notiz: pb.extraNotiz || ''
        });

        return true;
      }

      return false;
    }
  }

  // Übung noch nicht vorhanden → anhängen.
  const newRow = Math.max(pbSheet.getLastRow() + 1, PB_DATA_START_ROW);

  writePersonalBestRow(pbSheet, newRow, {
    uebung: uebung,
    gewicht: gewicht,
    reps: reps,
    orm: orm,
    datum: pb.datum || '',
    zyklus: pb.zyklus || '',
    quelle: pb.notiz || ('App-Update ' + APP_VERSION),
    woche: pb.woche || '',
    trainingstag: pb.trainingstag || '',
    notiz: pb.extraNotiz || ''
  });

  return true;
}

function writePersonalBestRow(sheet, row, pb) {
  sheet.getRange(row, 1, 1, 10).setValues([[
    pb.uebung || '',
    pb.gewicht || '',
    pb.reps || '',
    pb.orm || '',
    pb.datum || '',
    pb.zyklus || '',
    pb.quelle || '',
    pb.woche || '',
    pb.trainingstag || '',
    pb.notiz || ''
  ]]);
}

/**
 * Stellt sicher, dass die echte PR-Tabelle ab Zeile 4 sauber beschriftet ist.
 * Hinweis: Zeile 1–2 bleiben bewusst als Info-/Hinweisbereich erhalten.
 */
function ensurePersonalBestHeader(pbSheet) {
  pbSheet.getRange(4, 1, 1, 10).setValues([[
    'Übung',
    'Bestes Gewicht (kg)',
    'Beste Wdh.',
    'Bester 1RM (kg)',
    'Datum',
    'Zyklus',
    'Notizen / Quelle',
    'Woche',
    'Trainingstag',
    'Notiz'
  ]]);

  pbSheet.getRange(4, 1, 1, 10).setFontWeight('bold');
}

/**
 * Liefert den Satz mit dem höchsten berechneten 1RM.
 */
function getBestSetForPB(entry) {
  const sets = [
    { g: parseNum(entry.g1), r: parseNum(entry.r1) },
    { g: parseNum(entry.g2), r: parseNum(entry.r2) },
    { g: parseNum(entry.g3), r: parseNum(entry.r3) }
  ].filter(s => s.g > 0 && s.r > 0);

  if (!sets.length) return { g: 0, r: 0, orm: 0 };

  sets.forEach(s => {
    s.orm = Math.round(s.g * (1 + s.r / 30) * 10) / 10;
  });

  sets.sort((a, b) => b.orm - a.orm);

  return sets[0];
}

/**
 * Sucht rückwärts ab aktueller Zeile die letzte gesetzte Woche.
 * values ist das Array aus dem aktiven Zyklus-Sheet.
 */
function getCurrentWeekFromRow(values, rowIndex) {
  for (let i = rowIndex; i >= 3; i--) {
    const week = String(values[i][0] || '').trim();
    if (week) return week;
  }

  return '';
}

/**
 * Sucht rückwärts ab aktueller Zeile den letzten gesetzten Trainingstag.
 * values ist das Array aus dem aktiven Zyklus-Sheet.
 */
function getCurrentDayFromRow(values, rowIndex) {
  for (let i = rowIndex; i >= 3; i--) {
    const day = String(values[i][3] || '').trim();
    if (day) return day;
  }

  return '';
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;

  if (typeof val === 'string') {
    return parseFloat(val.replace(',', '.')) || 0;
  }

  return parseFloat(val) || 0;
}

function parseSheetNumOrBlank(val) {
  if (val === null || val === undefined || val === '') return '';

  if (typeof val === 'string') {
    const clean = val.trim();
    if (!clean) return '';
    const parsed = parseFloat(clean.replace(',', '.'));
    return isNaN(parsed) ? '' : parsed;
  }

  const parsed = parseFloat(val);
  return isNaN(parsed) ? '' : parsed;
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Logging mit Europe/Berlin Zeitzone ────────────────────────
function logError(typ, nachricht, details) {
  const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) return;

  const tz = 'Europe/Berlin';
  const ts = Utilities.formatDate(new Date(), tz, 'dd.MM.yyyy HH:mm:ss');

  logSheet.appendRow([
    ts,
    typ,
    nachricht,
    String(details || '').substring(0, 500)
  ]);
}
