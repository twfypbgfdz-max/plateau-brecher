// Kalorien-App Sync v0.4.2
// Lokale Vorbereitung fuer spaeteren Web-App-Deploy. Keine Sheet-IDs, Tokens oder Trigger.

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
  const totalsResult = upsertRowsByKey_(totalsSheet, DAILY_TOTALS_HEADERS, [normalizedTotals], 'date');

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
    const key = String(row[keyIndex] || '').trim();
    if (key) {
      existingRowByKey[key] = index + 2;
    }
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

    if (existingRow) {
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
