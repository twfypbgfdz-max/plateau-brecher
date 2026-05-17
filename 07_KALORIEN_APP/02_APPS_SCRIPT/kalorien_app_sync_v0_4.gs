// Kalorien-App Sync v0.4
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
      error: 'SYNC_ERROR',
      message: String(error && error.message ? error.message : error)
    });
  }
}

function syncDay_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload fehlt.');
  }

  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const dailyTotals = payload.dailyTotals || {};
  const normalizedEntries = entries.map(normalizeEntryForSheet_);
  const normalizedTotals = normalizeDailyTotalsForSheet_(dailyTotals);
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
  const currentLastColumn = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, currentLastColumn).getValues()[0];
  const needsHeaderWrite = headers.some((header, index) => currentHeaders[index] !== header);

  if (needsHeaderWrite) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function parsePost_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('POST-Body fehlt.');
  }

  const parsed = JSON.parse(e.postData.contents);
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
    kcal: cleanNumber_(entry.kcal),
    protein: cleanNumber_(entry.protein),
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
    kcal: cleanNumber_(totals.kcal),
    protein: cleanNumber_(totals.protein),
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

function cleanNullableNumber_(value) {
  if (value === null || value === undefined || value === '') return '';
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '';
}
