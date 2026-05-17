function setupLegendeUndDropdowns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  addFehlerprotokollLegende_(ss);
  addZyklusDropdowns_(ss);
  addBestleistungenDropdowns_(ss);
}

function addFehlerprotokollLegende_(ss) {
  const sh = ss.getSheetByName('Fehlerprotokoll');
  if (!sh) return;

  const legend = [
    ['Legende', 'Bedeutung'],
    ['SYNC_OK', 'Training wurde erfolgreich ins Sheet geschrieben'],
    ['PR_UPDATE', 'Bestleistung / 1RM wurde aktualisiert'],
    ['APP LOG: SYNC_ERROR', 'App konnte etwas nicht laden oder synchronisieren'],
    ['API POST', 'Fehler beim Speichern über Apps Script'],
    ['API GET', 'Fehler beim Laden aus dem Sheet'],
    ['API GET KRITISCH', 'Schwerer Fehler beim Sheet-Lesen'],
    ['OFFLINE', 'App war offline, Daten wurden gepuffert']
  ];

  sh.getRange('F1:G8').setValues(legend);
  sh.getRange('F1:G1')
    .setBackground('#111827')
    .setFontColor('#C8FF00')
    .setFontWeight('bold');
  sh.getRange('F2:G8')
    .setBackground('#F8FAFC')
    .setFontColor('#111111')
    .setBorder(true, true, true, true, true, true, '#D1D5DB', SpreadsheetApp.BorderStyle.SOLID);

  sh.setColumnWidth(6, 170);
  sh.setColumnWidth(7, 420);
}

function addZyklusDropdowns_(ss) {
  const sheets = ['ZYKLUS 1', 'ZYKLUS 2', 'ZYKLUS 3', 'ZYKLUS 4', 'ZYKLUS 5', 'ZYKLUS 6'];

  const rpeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['1','2','3','4','5','6','7','8','9','10'], true)
    .setAllowInvalid(true)
    .build();

  const progressionRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['▲ mehr', '► gleich', '▼ weniger', 'PR'], true)
    .setAllowInvalid(true)
    .build();

  const tagRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['TAG 1: PULL', 'TAG 2: PUSH', 'TAG 3: LEGS', 'TAG 4: REST', 'TAG 5: TORSO', 'TAG 6: LIMBS'], true)
    .setAllowInvalid(true)
    .build();

  sheets.forEach(name => {
    const sh = ss.getSheetByName(name);
    if (!sh) return;

    const lastRow = Math.max(sh.getLastRow(), 160);

    sh.getRange(5, 15, lastRow - 4, 1).setDataValidation(rpeRule);        // O RPE
    sh.getRange(5, 16, lastRow - 4, 1).setDataValidation(progressionRule); // P Progression
    sh.getRange(5, 4, lastRow - 4, 1).setDataValidation(tagRule);          // D Trainingstag
  });
}

function addBestleistungenDropdowns_(ss) {
  const sh = ss.getSheetByName('Bestleistungen');
  if (!sh) return;

  const lastRow = Math.max(sh.getLastRow(), 40);

  const zyklusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['ZYKLUS 1','ZYKLUS 2','ZYKLUS 3','ZYKLUS 4','ZYKLUS 5','ZYKLUS 6'], true)
    .setAllowInvalid(true)
    .build();

  const quelleRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['App-Update V9.1', 'PR App V9.1', 'Manuell korrigiert', 'Import alt'], true)
    .setAllowInvalid(true)
    .build();

  sh.getRange(5, 6, lastRow - 4, 1).setDataValidation(zyklusRule); // F Zyklus
  sh.getRange(5, 7, lastRow - 4, 1).setDataValidation(quelleRule); // G Quelle
}
