// Kalorien-App Sync v0.4.4
// Lokale Vorbereitung fuer spaeteren Web-App-Deploy. Keine Sheet-IDs, Tokens oder Trigger.
// Fix: Daily_Totals bekommt eigene Funktion upsertDailyTotalsByDate_.
//      Sie scannt alle Zeilen direkt, normalisiert das date-Feld robust
//      und loescht spaetere Duplikate mit gleichem date.
// Fix2: normalizeSheetKey_ nutzt Utilities.formatDate statt getDate(),
//       da getDate() die JS-Runtime-Zeitzone verwendet, nicht die Spreadsheet-Zeitzone.

const FOOD_LOG_SHEET_NAME = 'Food_Log';
const DAILY_TOTALS_SHEET_NAME = 'Daily_Totals';

const FOOD_LOG_HEADERS = [
  'date',
  'clientEntryId',
  'meal',
  'name',
  'grams',
  'kcal',
  'protein',
  'createdAt',
  'updatedAt',
  'sourceDate',
  'copiedAt',
  'syncStatus',
  'lastSyncedAt'
];

const DAILY_TOTALS_HEADERS = [
  'date',
  'kcal',
  'protein',
  'weight',
  'entryCount',
  'updatedAt'
];

function doPost(e) {
  try {
    const request = parsePost_(e);
    if (request.action !== 'syncDay') {
      return jsonResponse_({
        ok: false,
        error: 'UNSUPPORTED_ACTION',
        message: 'Nur action "syncDay" wird unterstuetzt.'
      });
    }

    const result = syncDay_(request.payload);
    return jsonResponse_({
      ok: true,
      action: request.action,
      result: result
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error && error.code ? error.code : 'SYNC_ERROR',
      message: String(error && error.message ? error.message : error)
    });
  }
}

function syncDay_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload fehlt.');
  }
  if (!Array.isArray(payload.entries)) {
    throw new Error('payload.entries muss ein Array sein.');
  }
  if (!payload.dailyTotals || typeof payload.dailyTotals !== 'object' || Array.isArray(payload.dailyTotals)) {
    throw new Error('payload.dailyTotals muss ein Objekt sein.');
  }

  const entries = payload.entries;
  const dailyTotals = payload.dailyTotals;
  const totalsDate = cleanString_(dailyTotals.date);
  if (!totalsDate) {
    throw new Error('dailyTotals.date fehlt.');
  }

  const normalizedEntries = entries.map(normalizeEntryForSheet_);
  normalizedEntries.forEach((entry) => {
    if (entry.date !== totalsDate) {
      throw new Error('Entry-Date passt nicht zu dailyTotals.date: ' + entry.clientEntryId);
    }
  });

  const normalizedTotals = normalizeDailyTotalsForSheet_(dailyTotals);
  // v0.4.1 definiert syncDay_ als Full-Day-Sync: entryCount kommt aus den gesendeten Tages-Eintraegen.
  normalizedTotals.entryCount = normalizedEntries.length;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const foodSheet = getOrCreateSheet_(ss, FOOD_LOG_SHEET_NAME, FOOD_LOG_HEADERS);
  const totalsSheet = getOrCreateSheet_(ss, DAILY_TOTALS_SHEET_NAME, DAILY_TOTALS_HEADERS);

  const foodResult = upsertRowsByKey_(foodSheet, FOOD_LOG_HEADERS, normalizedEntries, 'clientEntryId');
  // Daily_Totals: dedizierte Funktion statt upsertRowsByKey_, da date-Zellen als JS-Date-Objekt
  // aus getValues() kommen und ein generischer String-Vergleich nicht zuverlaessig funktioniert.
  const totalsResult = upsertDailyTotalsByDate_(totalsSheet, DAILY_TOTALS_HEADERS, normalizedTotals);

  return {
    foodLog: foodResult,
    dailyTotals: totalsResult,
    date: normalizedTotals.date
  };
}

function getOrCreateSheet_(ss, name, headers) {
  if (!ss) {
    throw new Error('Kein aktives Spreadsheet gefunden.');
  }

  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  ensureHeaders_(sheet, headers);
  return sheet;
}

function ensureHeaders_(sheet, headers) {
  const lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0]
    .map((header) => cleanString_(header));
  const hasAnyHeader = currentHeaders.some((header) => header !== '');

  if (!hasAnyHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    return;
  }

  const missingHeaders = headers.filter((header) => currentHeaders.indexOf(header) === -1);

  if (missingHeaders.length > 0) {
    sheet.getRange(1, lastColumn + 1, 1, missingHeaders.length).setValues([missingHeaders]);
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePost_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw codedError_('EMPTY_BODY', 'POST-Body fehlt.');
  }

  let parsed;
  try {
    parsed = JSON.parse(e.postData.contents);
  } catch (error) {
    throw codedError_('INVALID_JSON', 'POST-Body ist kein gueltiges JSON.');
  }

  return {
    action: parsed.action,
    payload: parsed.payload
  };
}

// Normalisiert einen Rohwert aus sheet.getValues() zu einem String-Key.
// Sheets gibt Datumszellen als Date-aehnliches Objekt zurueck.
// instanceof Date schlaegt in Apps Script fehl wenn das Objekt aus einem anderen
// Ausfuehrungskontext stammt — typeof .getTime prueft Duck-Typing zuverlaessig.
function normalizeSheetKey_(value) {
  if (value && typeof value.getTime === 'function') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

// Dediziertes Upsert fuer Daily_Totals.
// Liest alle Zeilen, normalisiert das date-Feld (robust gegen JS-Date-Objekte aus getValues()),
// aktualisiert die erste passende Zeile und loescht spaetere Duplikate.
// Haengt eine neue Zeile an, wenn kein Treffer gefunden wird.
function upsertDailyTotalsByDate_(sheet, headers, totalsObj) {
  const dateIndex = headers.indexOf('date');
  if (dateIndex === -1) {
    throw new Error('date-Spalte fehlt in DAILY_TOTALS_HEADERS.');
  }

  const targetDate = String(totalsObj.date || '').trim();
  if (!targetDate) {
    throw new Error('totalsObj.date fehlt.');
  }

  const values = headers.map((h) => totalsObj[h] === undefined ? '' : totalsObj[h]);

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    // Kein Datensatz vorhanden — direkt anhaengen.
    sheet.appendRow(values);
    return { inserted: 1, updated: 0, skipped: 0 };
  }

  const data = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();

  // Alle Zeilennummern sammeln, deren date-Zelle zum Zieldatum passt.
  const matchingSheetRows = [];
  data.forEach((row, index) => {
    const rawCell = row[dateIndex];
    const cellDate = normalizeSheetKey_(rawCell);
    // Debug: zeigt Rohtyp und normalisiertes Ergebnis fuer Diagnosezwecke
    Logger.log('[upsert] row ' + (index + 2) + ' | rawType: ' + typeof rawCell + ' | raw: ' + rawCell + ' | norm: ' + cellDate + ' | target: ' + targetDate);
    if (cellDate === targetDate) {
      matchingSheetRows.push(index + 2); // +1 fuer 0-Index, +1 fuer Header-Zeile
    }
  });

  if (matchingSheetRows.length === 0) {
    sheet.appendRow(values);
    return { inserted: 1, updated: 0, skipped: 0 };
  }

  // Erste Zeile aktualisieren.
  sheet.getRange(matchingSheetRows[0], 1, 1, headers.length).setValues([values]);

  // Spaetere Duplikate von unten nach oben loeschen (Indizes bleiben stabil).
  if (matchingSheetRows.length > 1) {
    const duplicates = matchingSheetRows.slice(1).reverse();
    duplicates.forEach((rowNum) => sheet.deleteRow(rowNum));
  }

  return { inserted: 0, updated: 1, skipped: 0 };
}

function upsertRowsByKey_(sheet, headers, rows, keyName) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      inserted: 0,
      updated: 0,
      skipped: 0
    };
  }

  const keyIndex = headers.indexOf(keyName);
  if (keyIndex === -1) {
    throw new Error('Key-Spalte fehlt: ' + keyName);
  }

  const lastRow = sheet.getLastRow();
  const existingValues = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, headers.length).getValues()
    : [];

  const existingRowByKey = {};

  existingValues.forEach((row, index) => {
    const key = normalizeSheetKey_(row[keyIndex]);
    if (!key) return;
    if (existingRowByKey[key] !== undefined) return;
    existingRowByKey[key] = index + 2;
  });

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  rows.forEach((rowObj) => {
    const key = String(rowObj[keyName] || '').trim();
    if (!key) {
      skipped += 1;
      return;
    }

    const values = headers.map((header) => rowObj[header] === undefined ? '' : rowObj[header]);
    const existingRow = existingRowByKey[key];

    if (existingRow !== undefined) {
      sheet.getRange(existingRow, 1, 1, headers.length).setValues([values]);
      updated += 1;
    } else {
      sheet.appendRow(values);
      inserted += 1;
    }
  });

  return {
    inserted: inserted,
    updated: updated,
    skipped: skipped
  };
}

function normalizeEntryForSheet_(entry) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Ungueltiger Food-Log-Eintrag.');
  }

  const clientEntryId = cleanString_(entry.clientEntryId);
  const date = cleanString_(entry.date);
  if (!clientEntryId) {
    throw new Error('clientEntryId fehlt.');
  }
  if (!date) {
    throw new Error('date fehlt.');
  }

  return {
    date: date,
    clientEntryId: clientEntryId,
    meal: cleanString_(entry.meal),
    name: cleanString_(entry.name),
    grams: cleanNullableNumber_(entry.grams),
    kcal: requireNumber_(entry.kcal, 'entry.kcal'),
    protein: requireNumber_(entry.protein, 'entry.protein'),
    createdAt: cleanString_(entry.createdAt),
    updatedAt: cleanString_(entry.updatedAt),
    sourceDate: cleanString_(entry.sourceDate),
    copiedAt: cleanString_(entry.copiedAt),
    syncStatus: cleanString_(entry.syncStatus) || 'local',
    lastSyncedAt: cleanString_(entry.lastSyncedAt)
  };
}

function normalizeDailyTotalsForSheet_(totals) {
  if (!totals || typeof totals !== 'object') {
    throw new Error('dailyTotals fehlt.');
  }

  const date = cleanString_(totals.date);
  if (!date) {
    throw new Error('dailyTotals.date fehlt.');
  }

  return {
    date: date,
    kcal: requireNumber_(totals.kcal, 'dailyTotals.kcal'),
    protein: requireNumber_(totals.protein, 'dailyTotals.protein'),
    weight: cleanNullableNumber_(totals.weight),
    entryCount: cleanNumber_(totals.entryCount),
    updatedAt: cleanString_(totals.updatedAt) || new Date().toISOString()
  };
}

function cleanString_(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function cleanNumber_(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function requireNumber_(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(fieldName + ' ist keine gueltige Zahl.');
  }
  return parsed;
}

function cleanNullableNumber_(value) {
  if (value === null || value === undefined || value === '') return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '';
}

function codedError_(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function testSyncDayWithSamplePayload_() {
  const now = new Date().toISOString();
  const payload = {
    entries: [
      {
        date: '2026-05-17',
        clientEntryId: 'sample-entry-001',
        meal: 'Snack',
        name: 'Proteinshake',
        grams: null,
        kcal: 180,
        protein: 30,
        createdAt: now,
        updatedAt: now,
        sourceDate: '',
        copiedAt: '',
        syncStatus: 'local',
        lastSyncedAt: ''
      }
    ],
    dailyTotals: {
      date: '2026-05-17',
      kcal: 180,
      protein: 30,
      weight: '',
      entryCount: 1,
      updatedAt: now
    }
  };

  return syncDay_(payload);
}

// Prueft, dass syncDay_ beim zweiten Aufruf mit demselben date keine neue Zeile in Daily_Totals erzeugt.
// Erwartetes Ergebnis: result1.dailyTotals.inserted === 1, result2.dailyTotals.updated === 1.
function testSyncDayDuplicateDailyTotals_() {
  const now = new Date().toISOString();
  const payload = {
    entries: [
      {
        date: '2026-05-17',
        clientEntryId: 'test-dup-001',
        meal: 'Fruehstueck',
        name: 'Haferflocken',
        grams: 100,
        kcal: 350,
        protein: 12,
        createdAt: now,
        updatedAt: now,
        sourceDate: '',
        copiedAt: '',
        syncStatus: 'local',
        lastSyncedAt: ''
      }
    ],
    dailyTotals: {
      date: '2026-05-17',
      kcal: 350,
      protein: 12,
      weight: '',
      entryCount: 1,
      updatedAt: now
    }
  };

  const result1 = syncDay_(payload);
  Logger.log('Erster Sync:  ' + JSON.stringify(result1));

  // Zweiter Sync: gleicher Tag, aktualisierte Werte
  payload.dailyTotals.kcal = 700;
  payload.dailyTotals.protein = 24;
  payload.entries[0].kcal = 700;
  payload.entries[0].protein = 24;

  const result2 = syncDay_(payload);
  Logger.log('Zweiter Sync: ' + JSON.stringify(result2));

  // Erwartung pruefen
  const ok =
    result1.dailyTotals.inserted === 1 &&
    result1.dailyTotals.updated === 0 &&
    result2.dailyTotals.inserted === 0 &&
    result2.dailyTotals.updated === 1;

  Logger.log('Test bestanden: ' + ok);
  return { result1: result1, result2: result2, ok: ok };
}
