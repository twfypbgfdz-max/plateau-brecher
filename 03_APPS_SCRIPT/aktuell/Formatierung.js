function formatCurrentZyklusSheet() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  formatOneZyklusSheet_(sh);
}

function formatOneZyklusSheet_(sh) {
  if (!sh || !/^ZYKLUS [1-6]$/.test(sh.getName())) return;

  const lastCol = 22; // A:V
  const lastRow = sh.getLastRow();
  if (lastRow < 5) return;

  const black = '#000000';
  const header = '#111827';
  const weekBar = '#1F2937';

  const colors = {
    PULL:  '#D9EFD8',
    PUSH:  '#FFF2CC',
    LEGS:  '#F4CCCC',
    TORSO: '#D9EAF7',
    LIMBS: '#EADCF8',
    REST:  '#E5E7EB'
  };

  sh.getRange(1, 1, 3, lastCol)
    .setBackground(header)
    .setFontColor('#C8FF00');

  sh.getRange(3, 1, 1, lastCol)
    .setFontWeight('bold')
    .setBorder(null, null, true, null, null, null, black, SpreadsheetApp.BorderStyle.SOLID_THICK);

  let currentColor = colors.REST;

  for (let r = 4; r <= lastRow; r++) {
    const week = String(sh.getRange(r, 1).getValue() || '').trim();
    const tag = String(sh.getRange(r, 4).getValue() || '').trim();
    const ex = String(sh.getRange(r, 5).getValue() || '').trim();
    const row = sh.getRange(r, 1, 1, lastCol);

    if (week && !tag && !ex) {
      row
        .setBackground(weekBar)
        .setFontColor('#C8FF00')
        .setFontWeight('bold')
        .setBorder(true, true, true, true, true, true, black, SpreadsheetApp.BorderStyle.SOLID_THICK);
      continue;
    }

    if (tag.includes('PULL')) currentColor = colors.PULL;
    else if (tag.includes('PUSH')) currentColor = colors.PUSH;
    else if (tag.includes('LEGS')) currentColor = colors.LEGS;
    else if (tag.includes('TORSO')) currentColor = colors.TORSO;
    else if (tag.includes('LIMBS')) currentColor = colors.LIMBS;
    else if (tag.includes('REST') || ex.includes('PAUSE')) currentColor = colors.REST;

    row
      .setBackground(currentColor)
      .setFontColor('#000000')
      .setFontWeight('normal')
      .setBorder(true, true, true, true, true, true, black, SpreadsheetApp.BorderStyle.SOLID);

    if (tag.startsWith('TAG')) {
      row.setBorder(true, true, null, true, true, true, black, SpreadsheetApp.BorderStyle.SOLID_THICK);
    }
  }
}
