// ============================================
// PLATEAU-BRECHER V9.0 — DIE VISIONÄR-EDITION
// ============================================

function setupMasterSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let master = ss.getSheetByName('ZYKLUS MASTER') || ss.insertSheet('ZYKLUS MASTER');
  
  // 1. RADIKALER RESET (Verhindert den Fehler aus image_2100db.png)
  master.setFrozenRows(0);
  master.setFrozenColumns(0);
  if (master.getMaxRows() > 1) {
    master.getRange(1, 1, master.getMaxRows(), master.getMaxColumns()).breakApart();
  }
  master.clear(); 

  // 2. DESIGN-HEADER (Stabil ohne Merges)
  master.getRange(1, 1, 2, 22).setBackground('#1a1a2e'); 
  master.getRange(1, 1).setValue('ZYKLUS MASTER — KONFIGURATION | DATEN FLIESSEN AUTOMATISCH')
    .setFontColor('#c8ff00').setFontWeight('bold').setFontSize(11);
  master.setRowHeight(1, 35);
  master.setRowHeight(2, 15);

  // 3. SPALTEN-HEADER
  const headers = ['Woche','Datum','KG','Trainingstag','Übung','Muskelgruppe','G1','R1','G2','R2','G3','R3','Gesamtlast','1RM','RPE','Progression','Ziel','Warmup','Notizen','kcal','bpm','Dauer'];
  master.getRange(3, 1, 1, 22).setValues([headers]);
  master.getRange(3, 1, 1, 22).setBackground('#16213e').setFontColor('#c8ff00').setFontWeight('bold').setHorizontalAlignment('center');
  master.setRowHeight(3, 30);

  // 4. VOLLSTÄNDIGER ÜBUNGSPLAN
  const plan = buildFullMasterPlan();
  master.getRange(4, 1, plan.length, 22).setValues(plan);
  
  // 5. INTELLIGENTE FORMELN & DATUM
  insertSafeProgressionFormulas(master, plan);
  applyProgressionConditionalFormat(master);
  formatZyklusSheet(master, COLORS());
  
  const PLAN_DATA = buildAppPlan();
  writeCycleDates(master, PLAN_DATA[0]);

  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('🚀 VISIONÄR-MASTER BEREIT! Führe nun createAllCycleSheets aus.');
}

function writeCycleDates(sheet, cycleData) {
  if (!cycleData || !cycleData.weeks) return;
  const vals = sheet.getRange(4, 1, sheet.getLastRow() - 3, 4).getValues();
  let currentWStr = "";
  let dIdx = -1;

  for (let r = 0; r < vals.length; r++) {
    const wStr = String(vals[r][0]).trim(); 
    const tStr = String(vals[r][3]).toUpperCase();

    if (wStr.startsWith('Woche')) {
      if (wStr !== currentWStr) {
        currentWStr = wStr;
        dIdx = -1;
      }
      if (tStr.includes('TAG') && !tStr.includes('REST')) {
        dIdx++;
        const wNum = parseInt(wStr.match(/\d+/)) - 1;
        const week = cycleData.weeks[wNum];
        if (week && week.days[dIdx]) {
          sheet.getRange(r + 4, 2).setValue(week.days[dIdx].date);
        }
      }
    }
  }
}

function createAllCycleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const master = ss.getSheetByName('ZYKLUS MASTER');
  if (!master) return;
  const PLAN_DATA = buildAppPlan();
  
  for (let ci = 1; ci < PLAN_DATA.length; ci++) {
    const name = 'ZYKLUS ' + (ci + 1);
    let s = ss.getSheetByName(name);
    if (s) ss.deleteSheet(s);
    const newSheet = master.copyTo(ss).setName(name);
    writeCycleDates(newSheet, PLAN_DATA[ci]);
    newSheet.getRange(1, 1).setValue(name + ' — AUTOMATISIERT');
  }
}

function buildFullMasterPlan() {
  const row = (w, t, u, m) => [`Woche ${w}`, '', '', t, u, m, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  const SEP = (w) => [`Woche ${w}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  function block(w, del) {
    const s = del ? ' (60%)' : '';
    return [
      row(w,`TAG 1: PULL${s}`,'',''), row(w,'','Latzug-Maschine (breit)','Rücken'), row(w,'','Hammer Strength Row (eng)','Rücken'), row(w,'','ISO-Lateral Row','Rücken'), row(w,'','Face-Pulls','Rücken'), row(w,'','Bizeps-Maschine','Arme'), SEP(w),
      row(w,`TAG 2: PUSH${s}`,'',''), row(w,'','Incline Chest Press','Brust'), row(w,'','Brustpresse','Brust'), row(w,'','Schulterdrücken','Schulter'), row(w,'','Seitheben','Schulter'), row(w,'','Trizeps-Dips','Arme'), SEP(w),
      row(w,`TAG 3: LEGS${s}`,'',''), row(w,'','Beinpresse','Beine'), row(w,'','Beinbeuger','Beine'), row(w,'','Beinstrecker','Beine'), row(w,'','Wadenheben','Waden'), SEP(w),
      row(w,'TAG 4: REST','— PAUSE —',''), SEP(w),
      row(w,`TAG 5: TORSO${s}`,'',''), row(w,'','Kabelrudern','Rücken'), row(w,'','High Row','Rücken'), row(w,'','Chest Press','Brust'), row(w,'','Pec Deck','Brust'), row(w,'','Reverse Butterfly','Schulter'), SEP(w),
      row(w,`TAG 6: LIMBS${s}`,'',''), row(w,'','Trizeps-Dips','Arme'), row(w,'','Bizeps-Maschine','Arme'), row(w,'','Trizeps-Kabel','Arme'), row(w,'','Kabel-Curls','Arme'), row(w,'','Trizeps über Kopf','Arme'), row(w,'','Hammer-Curls','Arme'), row(w,'','Beinstrecker','Beine'), row(w,'','Wadenheben','Waden'), SEP(w)
    ];
  }
  return [...block(1,0), ...block(2,0), ...block(3,0), ...block(4,1)];
}

// ... (Restliche Hilfsfunktionen COLORS, formatZyklusSheet, applyProgression bleibt wie in V8.9)
function COLORS() { return { DARK_BG:'#1a1a2e', HEADER_BG:'#16213e', ACCENT:'#c8ff00', WOCHE_BG:'#1e1e3a', WOCHE_FG:'#aaaacc', PULL:'#d4edda', PUSH:'#fff3cd', LEGS:'#f8d7da', TORSO:'#d1ecf1', LIMBS:'#e2d9f3' }; }

function formatZyklusSheet(sheet, C) {
  const lr = sheet.getLastRow();
  const v = sheet.getRange(4,1,lr-3,4).getValues();
  for(let r=0; r<v.length; r++) {
    let sR = r+4;
    let w = String(v[r][0]); let t = String(v[r][3]).toUpperCase();
    if(w.startsWith('Woche')) sheet.getRange(sR,1,1,22).setBackground(C.WOCHE_BG).setFontColor(C.WOCHE_FG);
    if(t.includes('PULL')) sheet.getRange(sR,1,1,22).setBackground(C.PULL);
    else if(t.includes('PUSH')) sheet.getRange(sR,1,1,22).setBackground(C.PUSH);
    else if(t.includes('LEGS')) sheet.getRange(sR,1,1,22).setBackground(C.LEGS);
    else if(t.includes('TORSO')) sheet.getRange(sR,1,1,22).setBackground(C.TORSO);
    else if(t.includes('LIMBS')) sheet.getRange(sR,1,1,22).setBackground(C.LIMBS);
  }
  sheet.setFrozenRows(3);
  sheet.setFrozenColumns(5);
}

function insertSafeProgressionFormulas(sheet, plan) {
  const formulas = [];
  for (let i = 0; i < plan.length; i++) {
    const r = i + 4;
    const ueb = String(plan[i][4]).trim();
    const tag = String(plan[i][3]).trim();
    if (ueb !== "" && !ueb.includes('—') && tag === "") {
      // Die korrekte Logik: Wenn leer oder 0, dann ►. Ansonsten Verweis.
      formulas.push([`=IF(OR(ISBLANK(G${r}), G${r}=0), "►", IFERROR(IF(G${r} > IFERROR(VLOOKUP(E${r}, Bestleistungen!$A:$B, 2, FALSE), 0), "▲", IF(G${r} = IFERROR(VLOOKUP(E${r}, Bestleistungen!$A:$B, 2, FALSE), 0), "►", "▼")), "►"))`]);
    } else { formulas.push([""]); }
  }
  sheet.getRange(4, 16, formulas.length, 1).setFormulas(formulas);
}

function applyProgressionConditionalFormat(sheet) {
  const rng = [sheet.getRange('P4:P500')];
  sheet.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('▲').setBackground('#d4edda').setFontColor('#155724').setRanges(rng).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('►').setBackground('#d1ecf1').setFontColor('#0c5460').setRanges(rng).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('▼').setBackground('#f8d7da').setFontColor('#721c24').setRanges(rng).build()
  ]);
}

function buildAppPlan() {
  const d = (date) => ({ date });
  const w = (days) => ({ days: days.map(date => d(date)) });
  return [
    { weeks: [w(['27.04','28.04','29.04','01.05','02.05']), w(['04.05','05.05','06.05','08.05','09.05']), w(['11.05','12.05','13.05','15.05','16.05']), w(['18.05','19.05','20.05','22.05','23.05'])] },
    { weeks: [w(['25.05','26.05','27.05','29.05','30.05']), w(['01.06','02.06','03.06','05.06','06.06']), w(['08.06','09.06','10.06','12.06','13.06']), w(['15.06','16.06','17.06','19.06','20.06'])] },
    { weeks: [w(['30.06','01.07','02.07','04.07','05.07']), w(['07.07','08.07','09.07','11.07','12.07']), w(['14.07','15.07','16.07','18.07','19.07']), w(['21.07','22.07','23.07','25.07','26.07'])] },
    { weeks: [w(['28.07','29.07','30.07','01.08','02.08'])] },
    { weeks: [w(['25.08','26.08','27.08','29.08','30.08'])] },
    { weeks: [w(['22.09','23.09','24.09','26.09','27.09'])] }
  ];
}