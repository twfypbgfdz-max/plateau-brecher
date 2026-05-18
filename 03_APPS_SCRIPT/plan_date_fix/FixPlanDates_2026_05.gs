// ============================================================
// PLATEAU-BRECHER — Einmaliger PLAN-Datumsfix 2026-05
// Manuell ausfuehren:
// 1) previewPlanDateFix()
// 2) Backup/Kopie des Sheets erstellen
// 3) applyPlanDateFix()
//
// Scope:
// - Aendert nur bekannte falsche PLAN-Datumswerte in Spalte B.
// - Keine Trainingsdaten, PRs, Gewichte, Notizen, Uebungen,
//   Dropdowns, Formeln oder Sheet-Struktur.
// - Keine Trigger. Kein automatisches Ausfuehren.
// ============================================================

const PLAN_DATE_FIX_SPREADSHEET_ID = '1NA5OUomzaSFSw6_VzdJ6U7FaD1bU0qTEsQCtIneJ1JI';

const PLAN_DATE_FIXES = [
  { sheet: 'ZYKLUS 1', range: 'B88:B92', oldValue: '19.05', newValue: '18.05' },
  { sheet: 'ZYKLUS 1', range: 'B94:B98', oldValue: '20.05', newValue: '19.05' },
  { sheet: 'ZYKLUS 1', range: 'B100:B103', oldValue: '21.05', newValue: '20.05' },

  { sheet: 'ZYKLUS 2', range: 'B5:B9', oldValue: '26.05', newValue: '25.05' },
  { sheet: 'ZYKLUS 2', range: 'B11:B15', oldValue: '27.05', newValue: '26.05' },
  { sheet: 'ZYKLUS 2', range: 'B17:B20', oldValue: '28.05', newValue: '27.05' },
  { sheet: 'ZYKLUS 2', range: 'B22:B26', oldValue: '30.05', newValue: '29.05' },
  { sheet: 'ZYKLUS 2', range: 'B28:B35', oldValue: '31.05', newValue: '30.05' },
  { sheet: 'ZYKLUS 2', range: 'B38:B42', oldValue: '02.06', newValue: '01.06' },
  { sheet: 'ZYKLUS 2', range: 'B44:B48', oldValue: '03.06', newValue: '02.06' },
  { sheet: 'ZYKLUS 2', range: 'B50:B53', oldValue: '04.06', newValue: '03.06' },
  { sheet: 'ZYKLUS 2', range: 'B55:B59', oldValue: '06.06', newValue: '05.06' },
  { sheet: 'ZYKLUS 2', range: 'B61:B68', oldValue: '07.06', newValue: '06.06' },
  { sheet: 'ZYKLUS 2', range: 'B89:B93', oldValue: '23.06', newValue: '22.06' },
  { sheet: 'ZYKLUS 2', range: 'B95:B99', oldValue: '24.06', newValue: '23.06' },
  { sheet: 'ZYKLUS 2', range: 'B101:B104', oldValue: '25.06', newValue: '24.06' },

  { sheet: 'ZYKLUS 3', range: 'B21:B25', oldValue: '07.07', newValue: '06.07' },
  { sheet: 'ZYKLUS 3', range: 'B27:B31', oldValue: '08.07', newValue: '07.07' },
  { sheet: 'ZYKLUS 3', range: 'B33:B36', oldValue: '09.07', newValue: '08.07' },
  { sheet: 'ZYKLUS 3', range: 'B38:B42', oldValue: '11.07', newValue: '10.07' },
  { sheet: 'ZYKLUS 3', range: 'B44:B51', oldValue: '12.07', newValue: '11.07' },
  { sheet: 'ZYKLUS 3', range: 'B54:B58', oldValue: '14.07', newValue: '13.07' },
  { sheet: 'ZYKLUS 3', range: 'B60:B64', oldValue: '15.07', newValue: '14.07' },
  { sheet: 'ZYKLUS 3', range: 'B66:B69', oldValue: '16.07', newValue: '15.07' },
  { sheet: 'ZYKLUS 3', range: 'B71:B75', oldValue: '18.07', newValue: '17.07' },
  { sheet: 'ZYKLUS 3', range: 'B77:B84', oldValue: '19.07', newValue: '18.07' },
  { sheet: 'ZYKLUS 3', range: 'B87:B91', oldValue: '21.07', newValue: '20.07' },
  { sheet: 'ZYKLUS 3', range: 'B93:B97', oldValue: '22.07', newValue: '21.07' },
  { sheet: 'ZYKLUS 3', range: 'B99:B102', oldValue: '23.07', newValue: '22.07' },

  { sheet: 'ZYKLUS 4', range: 'B5:B9', oldValue: '28.07', newValue: '27.07' },
  { sheet: 'ZYKLUS 4', range: 'B11:B15', oldValue: '29.07', newValue: '28.07' },
  { sheet: 'ZYKLUS 4', range: 'B17:B20', oldValue: '30.07', newValue: '29.07' },
  { sheet: 'ZYKLUS 4', range: 'B22:B26', oldValue: '01.08', newValue: '31.07' },
  { sheet: 'ZYKLUS 4', range: 'B28:B35', oldValue: '02.08', newValue: '01.08' },
  { sheet: 'ZYKLUS 4', range: 'B38:B42', oldValue: '04.08', newValue: '03.08' },
  { sheet: 'ZYKLUS 4', range: 'B44:B48', oldValue: '05.08', newValue: '04.08' },
  { sheet: 'ZYKLUS 4', range: 'B50:B53', oldValue: '06.08', newValue: '05.08' },
  { sheet: 'ZYKLUS 4', range: 'B55:B59', oldValue: '08.08', newValue: '07.08' },
  { sheet: 'ZYKLUS 4', range: 'B61:B68', oldValue: '09.08', newValue: '08.08' },
  { sheet: 'ZYKLUS 4', range: 'B71:B75', oldValue: '11.08', newValue: '10.08' },
  { sheet: 'ZYKLUS 4', range: 'B77:B81', oldValue: '12.08', newValue: '11.08' },
  { sheet: 'ZYKLUS 4', range: 'B83:B86', oldValue: '13.08', newValue: '12.08' },
  { sheet: 'ZYKLUS 4', range: 'B88:B92', oldValue: '15.08', newValue: '14.08' },
  { sheet: 'ZYKLUS 4', range: 'B94:B101', oldValue: '16.08', newValue: '15.08' },
  { sheet: 'ZYKLUS 4', range: 'B104:B108', oldValue: '18.08', newValue: '17.08' },
  { sheet: 'ZYKLUS 4', range: 'B110:B114', oldValue: '19.08', newValue: '18.08' },
  { sheet: 'ZYKLUS 4', range: 'B116:B119', oldValue: '20.08', newValue: '19.08' },

  { sheet: 'ZYKLUS 5', range: 'B5:B9', oldValue: '25.08', newValue: '24.08' },
  { sheet: 'ZYKLUS 5', range: 'B11:B15', oldValue: '26.08', newValue: '25.08' },
  { sheet: 'ZYKLUS 5', range: 'B17:B20', oldValue: '27.08', newValue: '26.08' },
  { sheet: 'ZYKLUS 5', range: 'B22:B26', oldValue: '29.08', newValue: '28.08' },
  { sheet: 'ZYKLUS 5', range: 'B28:B35', oldValue: '30.08', newValue: '29.08' },
  { sheet: 'ZYKLUS 5', range: 'B38:B42', oldValue: '01.09', newValue: '31.08' },
  { sheet: 'ZYKLUS 5', range: 'B44:B48', oldValue: '02.09', newValue: '01.09' },
  { sheet: 'ZYKLUS 5', range: 'B50:B53', oldValue: '03.09', newValue: '02.09' },
  { sheet: 'ZYKLUS 5', range: 'B55:B59', oldValue: '05.09', newValue: '04.09' },
  { sheet: 'ZYKLUS 5', range: 'B61:B68', oldValue: '06.09', newValue: '05.09' },
  { sheet: 'ZYKLUS 5', range: 'B71:B75', oldValue: '08.09', newValue: '07.09' },
  { sheet: 'ZYKLUS 5', range: 'B77:B81', oldValue: '09.09', newValue: '08.09' },
  { sheet: 'ZYKLUS 5', range: 'B83:B86', oldValue: '10.09', newValue: '09.09' },
  { sheet: 'ZYKLUS 5', range: 'B88:B92', oldValue: '12.09', newValue: '11.09' },
  { sheet: 'ZYKLUS 5', range: 'B94:B101', oldValue: '13.09', newValue: '12.09' },
  { sheet: 'ZYKLUS 5', range: 'B104:B108', oldValue: '15.09', newValue: '14.09' },
  { sheet: 'ZYKLUS 5', range: 'B110:B114', oldValue: '16.09', newValue: '15.09' },
  { sheet: 'ZYKLUS 5', range: 'B116:B119', oldValue: '17.09', newValue: '16.09' },

  { sheet: 'ZYKLUS 6', range: 'B5:B9', oldValue: '22.09', newValue: '21.09' },
  { sheet: 'ZYKLUS 6', range: 'B11:B15', oldValue: '23.09', newValue: '22.09' },
  { sheet: 'ZYKLUS 6', range: 'B17:B20', oldValue: '24.09', newValue: '23.09' },
  { sheet: 'ZYKLUS 6', range: 'B22:B26', oldValue: '26.09', newValue: '25.09' },
  { sheet: 'ZYKLUS 6', range: 'B28:B35', oldValue: '27.09', newValue: '26.09' },
  { sheet: 'ZYKLUS 6', range: 'B38:B42', oldValue: '29.09', newValue: '28.09' },
  { sheet: 'ZYKLUS 6', range: 'B44:B48', oldValue: '30.09', newValue: '29.09' },
  { sheet: 'ZYKLUS 6', range: 'B50:B53', oldValue: '01.10', newValue: '30.09' },
  { sheet: 'ZYKLUS 6', range: 'B55:B59', oldValue: '03.10', newValue: '02.10' },
  { sheet: 'ZYKLUS 6', range: 'B61:B68', oldValue: '04.10', newValue: '03.10' },
  { sheet: 'ZYKLUS 6', range: 'B71:B75', oldValue: '06.10', newValue: '05.10' },
  { sheet: 'ZYKLUS 6', range: 'B77:B81', oldValue: '07.10', newValue: '06.10' },
  { sheet: 'ZYKLUS 6', range: 'B83:B86', oldValue: '08.10', newValue: '07.10' },
  { sheet: 'ZYKLUS 6', range: 'B88:B92', oldValue: '10.10', newValue: '09.10' },
  { sheet: 'ZYKLUS 6', range: 'B94:B101', oldValue: '11.10', newValue: '10.10' },
  { sheet: 'ZYKLUS 6', range: 'B104:B108', oldValue: '13.10', newValue: '12.10' },
  { sheet: 'ZYKLUS 6', range: 'B110:B114', oldValue: '14.10', newValue: '13.10' },
  { sheet: 'ZYKLUS 6', range: 'B116:B119', oldValue: '15.10', newValue: '14.10' },
];

function previewPlanDateFix() {
  const ss = SpreadsheetApp.openById(PLAN_DATE_FIX_SPREADSHEET_ID);
  const summary = runPlanDateFix_(ss, false);
  Logger.log('PREVIEW SUMMARY changed=%s skipped=%s errors=%s', summary.changed, summary.skipped, summary.errors);
  return summary;
}

function applyPlanDateFix() {
  Logger.log('BACKUP REQUIRED: Erstelle vor applyPlanDateFix() eine Kopie/Backup des Google Sheets.');
  Logger.log('Apply schreibt ausschliesslich bekannte sichere Treffer in Spalte B.');
  const ss = SpreadsheetApp.openById(PLAN_DATE_FIX_SPREADSHEET_ID);
  const summary = runPlanDateFix_(ss, true);
  Logger.log('APPLY SUMMARY changed=%s skipped=%s errors=%s', summary.changed, summary.skipped, summary.errors);
  return summary;
}

function runPlanDateFix_(ss, apply) {
  const summary = { changed: 0, skipped: 0, errors: 0 };
  const actions = [];

  PLAN_DATE_FIXES.forEach(fix => {
    try {
      const sheet = ss.getSheetByName(fix.sheet);
      if (!sheet) {
        summary.errors++;
        Logger.log('ERROR %s %s sheet not found', fix.sheet, fix.range);
        return;
      }

      const range = sheet.getRange(fix.range);
      const values = range.getDisplayValues();
      const startRow = range.getRow();
      let safeCount = 0;
      let skipCount = 0;

      values.forEach((row, idx) => {
        const current = String(row[0] || '').trim();
        const cellA1 = 'B' + (startRow + idx);
        if (current === fix.oldValue) {
          safeCount++;
          actions.push({ sheet, sheetName: fix.sheet, cellA1, oldValue: fix.oldValue, newValue: fix.newValue });
        } else {
          skipCount++;
          summary.skipped++;
          Logger.log('SKIP %s %s current=%s expected=%s new=%s',
            fix.sheet, cellA1, current || '(empty)', fix.oldValue, fix.newValue);
        }
      });

      Logger.log('%s %s %s %s -> %s rows=%s',
        skipCount ? 'PARTIAL' : 'OK', fix.sheet, fix.range, fix.oldValue, fix.newValue, safeCount);
    } catch (err) {
      summary.errors++;
      Logger.log('ERROR %s %s %s', fix.sheet, fix.range, err && err.message ? err.message : err);
    }
  });

  if (!apply) {
    summary.changed = actions.length;
    return summary;
  }

  actions.forEach(action => {
    try {
      action.sheet.getRange(action.cellA1).setValue(action.newValue);
      summary.changed++;
      Logger.log('CHANGED %s %s %s -> %s',
        action.sheetName, action.cellA1, action.oldValue, action.newValue);
    } catch (err) {
      summary.errors++;
      Logger.log('ERROR %s %s write failed: %s',
        action.sheetName, action.cellA1, err && err.message ? err.message : err);
    }
  });

  return summary;
}
