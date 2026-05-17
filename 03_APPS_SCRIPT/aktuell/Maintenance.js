// ============================================================
// PLATEAU-BRECHER — Maintenance Script
// Einmalig ausführen: runMaintenance()
// ============================================================

const ZYKLUS_SHEETS = ['ZYKLUS 1','ZYKLUS 2','ZYKLUS 3','ZYKLUS 4','ZYKLUS 5','ZYKLUS 6'];

function getTrainingSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  const id = PropertiesService.getScriptProperties().getProperty('PERSONAL_TRAINING_SPREADSHEET_ID');
  if (!id) throw new Error('PERSONAL_TRAINING_SPREADSHEET_ID fehlt in Script Properties');
  return SpreadsheetApp.openById(id);
}

function runMaintenance() {
  const ss = getTrainingSpreadsheet_();
  const log = [];

  // ── 1. ALT_ / MASTER Tabs löschen ──────────────────────────
  const deleted = deleteAltTabs_(ss);
  log.push('🗑 Gelöscht: ' + deleted + ' ALT_/MASTER-Tabs');

  // ── 2. Zeilen 1–3 in ZYKLUS 1–6 fixieren ───────────────────
  const frozen = freezeHeaders_(ss);
  log.push('📌 Header fixiert: ' + frozen + ' Sheets');

  // ── 3. Bedingte Formatierung Spalte P (Progression) ────────
  const formatted = formatProgressionCol_(ss);
  log.push('🎨 Spalte P formatiert: ' + formatted + ' Sheets');

  // ── 4. Fehlerprotokoll einfärben ────────────────────────────
  const colored = colorErrorLog_(ss);
  log.push('🔴 Fehlerprotokoll: ' + colored + ' Zeilen eingefärbt');

  // ── 5. Maintenance-Eintrag loggen ───────────────────────────
  logMaintenance_(ss, log);
  log.push('✅ Eintrag ins Fehlerprotokoll geschrieben');

  // ── Ergebnis ins Ausführungsprotokoll ───────────────────────
  Logger.log('✅ MAINTENANCE ABGESCHLOSSEN\n' + log.join('\n'));
  Browser.msgBox('✅ MAINTENANCE ABGESCHLOSSEN', log.join('\n'), Browser.Buttons.OK);
}

// ── Einzelfunktionen (optional direkt aufrufbar) ────────────

function deleteAltTabsOnly() {
  const ss = getTrainingSpreadsheet_();
  const n = deleteAltTabs_(ss);
  Logger.log('🗑 ' + n + ' Tabs gelöscht.');
  Browser.msgBox('🗑 ' + n + ' Tabs gelöscht.');
}

function formatOnly() {
  const ss = getTrainingSpreadsheet_();
  const p = formatProgressionCol_(ss);
  const c = colorErrorLog_(ss);
  Logger.log('🎨 Spalte P: ' + p + ' Sheets | 🔴 Fehlerprotokoll: ' + c + ' Zeilen');
  Browser.msgBox('🎨 Spalte P: ' + p + ' Sheets\n🔴 Fehlerprotokoll: ' + c + ' Zeilen');
}

// ============================================================
// PRIVATE HELPERS
// ============================================================

function deleteAltTabs_(ss) {
  let count = 0;
  const sheets = ss.getSheets();
  const toDelete = sheets.filter(s => {
    const n = s.getName();
    return n.startsWith('ALT_') || n.startsWith('MASTER') || n.startsWith('alt_');
  });
  // Sicherheit: nie alle Sheets löschen
  if (toDelete.length >= sheets.length) {
    Logger.log('⚠ Abbruch: würde alle Tabs löschen!');
    return 0;
  }
  toDelete.forEach(s => { ss.deleteSheet(s); count++; });
  return count;
}

function freezeHeaders_(ss) {
  let count = 0;
  ZYKLUS_SHEETS.forEach(name => {
    const s = ss.getSheetByName(name);
    if (!s) return;
    s.setFrozenRows(3); // Zeile 1 Titel, 2 Legende, 3 Spaltenheader
    count++;
  });
  return count;
}

function formatProgressionCol_(ss) {
  let count = 0;
  ZYKLUS_SHEETS.forEach(name => {
    const s = ss.getSheetByName(name);
    if (!s) return;
    const lastRow = Math.max(s.getLastRow(), 4);
    const range = s.getRange(4, 16, lastRow - 3, 1); // Spalte P ab Zeile 4

    // Alte Regeln für Spalte P entfernen
    const existing = s.getConditionalFormatRules();
    const filtered = existing.filter(r =>
      !r.getRanges().some(rng => rng.getColumn() === 16)
    );
    s.setConditionalFormatRules(filtered);

    // Neue Regeln: ▲ grün, ▼ rot, ► grau
    const rules = [
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('▲')
        .setBackground('#1a3a1a').setFontColor('#00e676')
        .setRanges([range]).build(),
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('▼')
        .setBackground('#3a1a1a').setFontColor('#ff4444')
        .setRanges([range]).build(),
      SpreadsheetApp.newConditionalFormatRule()
        .whenTextContains('►')
        .setBackground('#2a2a2a').setFontColor('#888888')
        .setRanges([range]).build(),
    ];
    s.setConditionalFormatRules([...filtered, ...rules]);
    count++;
  });
  return count;
}

function colorErrorLog_(ss) {
  const s = ss.getSheetByName('Fehlerprotokoll');
  if (!s) return 0;
  const lastRow = s.getLastRow();
  if (lastRow < 2) return 0;

  const types = s.getRange(2, 2, lastRow - 1, 1).getValues();
  let count = 0;

  types.forEach((row, i) => {
    const typ = String(row[0]).toUpperCase();
    const rowNum = i + 2;
    const r = s.getRange(rowNum, 1, 1, 4);

    if (typ.includes('ERROR') || typ.includes('UI_ERROR')) {
      r.setBackground('#3a1a1a'); count++;
    } else if (typ.includes('SYNC_OK') || typ.includes('RENAME') || typ.includes('MAINTENANCE')) {
      r.setBackground('#1a3a1a'); count++;
    } else if (typ.includes('OFFLINE') || typ.includes('APP LOG')) {
      r.setBackground('#1a2a3a'); count++;
    } else if (typ.includes('WARN') || typ.includes('FATIGUE')) {
      r.setBackground('#3a2a1a'); count++;
    }
  });
  return count;
}

function logMaintenance_(ss, logLines) {
  const s = ss.getSheetByName('Fehlerprotokoll');
  if (!s) return;
  const now = Utilities.formatDate(new Date(), 'Europe/Berlin', 'dd.MM.yyyy HH:mm:ss');
  s.appendRow([now, 'MAINTENANCE', 'runMaintenance()', logLines.join(' | ').substring(0, 500)]);
}
