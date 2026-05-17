function updateProgressionValues() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pb = ss.getSheetByName('Bestleistungen');
  if (!pb) return;

  const pbData = pb.getDataRange().getValues();
  const bestMap = {};

  for (let i = 4; i < pbData.length; i++) {
    const name = String(pbData[i][0] || '').trim().toLowerCase();
    const orm = parseFloat(pbData[i][3]) || 0; // D Bester 1RM
    if (name) bestMap[name] = orm;
  }

  const sheets = ['ZYKLUS 1', 'ZYKLUS 2', 'ZYKLUS 3', 'ZYKLUS 4', 'ZYKLUS 5', 'ZYKLUS 6'];

  sheets.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (!sh) return;

    const lastRow = sh.getLastRow();

    for (let r = 5; r <= lastRow; r++) {
      const ex = String(sh.getRange(r, 5).getValue() || '').trim();
      if (!ex || ex === '— PAUSE —') continue;

      const orm = parseFloat(sh.getRange(r, 14).getValue()) || 0; // N 1RM
      const best = bestMap[ex.toLowerCase()] || 0;
      const cell = sh.getRange(r, 16); // P Progression

      cell.clearDataValidations();

      if (!orm) {
        cell.setValue('');
      } else if (!best) {
        cell.setValue('keine PR-Basis');
      } else if (orm > best) {
        cell.setValue('▲ mehr');
      } else if (orm === best) {
        cell.setValue('► gleich');
      } else {
        cell.setValue('▼ weniger');
      }
    }
  });
}
