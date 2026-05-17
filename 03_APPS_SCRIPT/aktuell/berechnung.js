function fixZyklus1Limbs0905() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName('ZYKLUS 1');
  if (!sh) return;

  for (let r = 44; r <= 51; r++) {
    sh.getRange(r, 13).setFormula(`=IF(G${r}="";"";G${r}*H${r}+I${r}*J${r}+K${r}*L${r})`);
    sh.getRange(r, 14).setFormula(`=IF(OR(G${r}="";H${r}="");"";ROUND(G${r}*(1+H${r}/30);1))`);
    sh.getRange(r, 18).setFormula(`=IF(G${r}="";"";ROUND(G${r}*0,6;1))`);
  }
}
