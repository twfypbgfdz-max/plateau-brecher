// Non-destructive PLAN maintenance helpers.
// Default entry point is a dry-run and does not change the sheet.

function dryRunEnsureCurrentPlanWeek() {
  return ensureCurrentPlanWeek_({ dryRun: true });
}

function applyEnsureCurrentPlanWeekBlankDatesOnly() {
  return ensureCurrentPlanWeek_({ dryRun: false });
}

function ensureCurrentPlanWeek_(options) {
  const dryRun = !options || options.dryRun !== false;
  const config = {
    sheetName: 'ZYKLUS 2',
    weekLabel: 'Woche 2',
    expectedDates: {
      'TAG 1': '01.06',
      'TAG 2': '02.06',
      'TAG 3': '03.06',
      'TAG 5': '05.06',
      'TAG 6': '06.06'
    }
  };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(config.sheetName);
  const report = {
    dryRun,
    sheetName: config.sheetName,
    weekLabel: config.weekLabel,
    changed: [],
    alreadyOk: [],
    blocked: [],
    missing: []
  };

  if (!sheet) {
    report.blocked.push('Sheet not found: ' + config.sheetName);
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 4) {
    report.blocked.push('No plan rows found below header.');
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const values = sheet.getRange(4, 1, lastRow - 3, 4).getValues();
  const foundTags = {};
  let activeWeek = '';

  for (let i = 0; i < values.length; i++) {
    const rowNumber = i + 4;
    const week = String(values[i][0] || '').trim();
    const currentDate = String(values[i][1] || '').trim();
    const trainingTag = String(values[i][3] || '').trim().toUpperCase();

    if (week) activeWeek = week;
    if (activeWeek !== config.weekLabel) continue;

    Object.keys(config.expectedDates).forEach(function(tagKey) {
      if (!trainingTag.includes(tagKey)) return;
      foundTags[tagKey] = true;
      const expectedDate = config.expectedDates[tagKey];

      if (currentDate === expectedDate) {
        report.alreadyOk.push({ row: rowNumber, tag: tagKey, date: currentDate });
        return;
      }

      if (currentDate) {
        report.blocked.push({
          row: rowNumber,
          tag: tagKey,
          existingDate: currentDate,
          expectedDate: expectedDate,
          reason: 'Existing date is not overwritten.'
        });
        return;
      }

      if (!dryRun) {
        sheet.getRange(rowNumber, 2).setValue(expectedDate);
      }
      report.changed.push({
        row: rowNumber,
        tag: tagKey,
        date: expectedDate,
        action: dryRun ? 'would write blank date cell' : 'wrote blank date cell'
      });
    });
  }

  Object.keys(config.expectedDates).forEach(function(tagKey) {
    if (!foundTags[tagKey]) {
      report.missing.push({ tag: tagKey, expectedDate: config.expectedDates[tagKey] });
    }
  });

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function dryRunEnsureFullPlanDates() {
  return ensureFullPlanDates_({ dryRun: true });
}

function applyEnsureFullPlanDatesBlankOnly() {
  return ensureFullPlanDates_({ dryRun: false });
}

function ensureFullPlanDates_(options) {
  const dryRun = !options || options.dryRun !== false;
  const plan = buildMaintenancePlanV1289_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = {
    dryRun,
    changed: [],
    alreadyOk: [],
    blocked: [],
    missing: []
  };

  plan.forEach(function(cycle, cycleIndex) {
    const sheetName = 'ZYKLUS ' + (cycleIndex + 1);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      report.blocked.push({ sheetName, reason: 'Sheet not found.' });
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 4) {
      report.blocked.push({ sheetName, reason: 'No plan rows found below header.' });
      return;
    }

    const values = sheet.getRange(4, 1, lastRow - 3, 4).getValues();
    const expectedByWeekTag = {};
    const defaultTrainingTags = ['TAG 1', 'TAG 2', 'TAG 3', 'TAG 5', 'TAG 6'];

    cycle.weeks.forEach(function(week, weekIndex) {
      const weekLabel = 'Woche ' + (weekIndex + 1);
      expectedByWeekTag[weekLabel] = {};
      week.days.forEach(function(date, dayIndex) {
        const dayConfig = typeof date === 'string' ? { date, tag: defaultTrainingTags[dayIndex] } : date;
        expectedByWeekTag[weekLabel][dayConfig.tag] = dayConfig.date;
      });
    });

    for (let i = 0; i < values.length; i++) {
      const rowNumber = i + 4;
      const weekCell = String(values[i][0] || '').trim();
      const currentDate = String(values[i][1] || '').trim();
      const trainingTag = String(values[i][3] || '').trim().toUpperCase();
      const weekMatch = weekCell.match(/Woche\s+\d+/i);

      if (!weekMatch || !trainingTag.includes('TAG') || trainingTag.includes('REST')) continue;

      const weekLabel = weekMatch[0].replace(/\s+/g, ' ');
      if (!expectedByWeekTag[weekLabel]) continue;

      const tagKey = Object.keys(expectedByWeekTag[weekLabel]).find(function(expectedTag) {
        return trainingTag.includes(expectedTag);
      });
      if (!tagKey) continue;
      const expectedDate = expectedByWeekTag[weekLabel][tagKey];

      if (!expectedDate) {
        report.missing.push({ sheetName, row: rowNumber, weekLabel, tagKey, reason: 'No expected date for this training row.' });
        continue;
      }

      if (currentDate === expectedDate) {
        report.alreadyOk.push({ sheetName, row: rowNumber, weekLabel, tagKey, date: currentDate });
        continue;
      }

      if (currentDate) {
        report.blocked.push({
          sheetName,
          row: rowNumber,
          weekLabel,
          tagKey,
          existingDate: currentDate,
          expectedDate,
          reason: 'Existing date is not overwritten.'
        });
        continue;
      }

      if (!dryRun) {
        sheet.getRange(rowNumber, 2).setValue(expectedDate);
      }
      report.changed.push({
        sheetName,
        row: rowNumber,
        weekLabel,
        tagKey,
        date: expectedDate,
        action: dryRun ? 'would write blank date cell' : 'wrote blank date cell'
      });
    }
  });

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function buildMaintenancePlanV1289_() {
  return [
    { weeks: [
      { days: ['27.04', '28.04', '29.04', '01.05', '02.05'] },
      { days: [{ date: '08.05', tag: 'TAG 5' }, { date: '09.05', tag: 'TAG 6' }] },
      { days: ['11.05', '12.05', '13.05', '15.05', '16.05'] },
      { days: ['18.05', '19.05', '20.05', '22.05', '23.05'] }
    ] },
    { weeks: [
      { days: ['25.05', '26.05', '27.05', '29.05', '30.05'] },
      { days: ['01.06', '02.06', '03.06', '05.06', '06.06'] },
      { days: ['08.06', '09.06', '10.06', '12.06', '13.06'] },
      { days: ['15.06', '16.06', '17.06', '19.06', '20.06'] }
    ] },
    { weeks: [
      { days: [{ date: '03.07', tag: 'TAG 5' }, { date: '04.07', tag: 'TAG 6' }] },
      { days: ['06.07', '07.07', '08.07', '10.07', '11.07'] },
      { days: ['13.07', '14.07', '15.07', '17.07', '18.07'] },
      { days: ['20.07', '21.07', '22.07', '24.07', '25.07'] }
    ] },
    { weeks: [
      { days: ['27.07', '28.07', '29.07', '31.07', '01.08'] },
      { days: ['03.08', '04.08', '05.08', '07.08', '08.08'] },
      { days: ['10.08', '11.08', '12.08', '14.08', '15.08'] },
      { days: ['17.08', '18.08', '19.08', '21.08', '22.08'] }
    ] },
    { weeks: [
      { days: ['24.08', '25.08', '26.08', '28.08', '29.08'] },
      { days: ['31.08', '01.09', '02.09', '04.09', '05.09'] },
      { days: ['07.09', '08.09', '09.09', '11.09', '12.09'] },
      { days: ['14.09', '15.09', '16.09', '18.09', '19.09'] }
    ] },
    { weeks: [
      { days: ['21.09', '22.09', '23.09', '25.09', '26.09'] },
      { days: ['28.09', '29.09', '30.09', '02.10', '03.10'] },
      { days: ['05.10', '06.10', '07.10', '09.10', '10.10'] },
      { days: ['12.10', '13.10', '14.10', '16.10', '17.10'] }
    ] }
  ];
}

function dryRunEnsureFullPlanBlocks() {
  return ensureFullPlanBlocks_({ dryRun: true });
}

function applyEnsureFullPlanBlocksInsertOnly() {
  return ensureFullPlanBlocks_({ dryRun: false });
}

function ensureFullPlanBlocks_(options) {
  const dryRun = !options || options.dryRun !== false;
  const plan = buildCanonicalAppPlanBlocksV1289_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const report = {
    dryRun,
    inserted: [],
    alreadyOk: [],
    blocked: [],
    missing: []
  };

  plan.forEach(function(cycle, cycleIndex) {
    const sheetName = 'ZYKLUS ' + (cycleIndex + 1);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      report.blocked.push({ sheetName, reason: 'Sheet not found.' });
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 4) {
      report.blocked.push({ sheetName, reason: 'No plan rows found below header.' });
      return;
    }

    const values = sheet.getRange(1, 1, lastRow, 22).getValues();
    const weekMap = getExistingWeekBlocks_(values);
    let simulatedLastRow = lastRow;

    cycle.weeks.forEach(function(week, weekIndex) {
      const weekLabel = 'Woche ' + (weekIndex + 1);
      const existing = weekMap[weekLabel];
      const rowsToInsert = buildCanonicalWeekRows_(weekIndex + 1, week);

      if (existing && existing.rows.length > 0) {
        const check = validateExistingWeekBlock_(sheetName, weekLabel, existing.rows, week);
        if (check.ok) {
          report.alreadyOk.push({ sheetName, weekLabel, rows: existing.rows.length });
        } else {
          report.blocked = report.blocked.concat(check.blocked);
        }
        return;
      }

      const insertAfter = findInsertAfterRowForWeek_(weekIndex + 1, weekMap, simulatedLastRow);
      report.missing.push({ sheetName, weekLabel, insertAfter, rows: rowsToInsert.length });

      if (!dryRun) {
        sheet.insertRowsAfter(insertAfter, rowsToInsert.length);
        sheet.getRange(insertAfter + 1, 1, rowsToInsert.length, 22).setValues(rowsToInsert);
      }
      simulatedLastRow += rowsToInsert.length;
      shiftWeekMapAfterInsert_(weekMap, insertAfter, rowsToInsert.length);
      weekMap[weekLabel] = {
        start: insertAfter + 1,
        end: insertAfter + rowsToInsert.length,
        rows: rowsToInsert.map(function(row, idx) {
          return { rowNumber: insertAfter + 1 + idx, values: row };
        })
      };

      report.inserted.push({
        sheetName,
        weekLabel,
        rows: rowsToInsert.length,
        afterRow: insertAfter,
        action: dryRun ? 'would insert missing week block' : 'inserted missing week block'
      });
    });
  });

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function getExistingWeekBlocks_(values) {
  const map = {};
  for (let i = 3; i < values.length; i++) {
    const rowNumber = i + 1;
    const weekLabel = normalizeWeekLabel_(values[i][0]);
    if (!weekLabel) continue;
    if (!map[weekLabel]) {
      map[weekLabel] = { start: rowNumber, end: rowNumber, rows: [] };
    }
    map[weekLabel].end = rowNumber;
    map[weekLabel].rows.push({ rowNumber, values: values[i] });
  }
  return map;
}

function normalizeWeekLabel_(value) {
  const match = String(value || '').trim().match(/^Woche\s+(\d+)/i);
  return match ? 'Woche ' + match[1] : '';
}

function findInsertAfterRowForWeek_(weekNumber, weekMap, fallbackLastRow) {
  for (let prev = weekNumber - 1; prev >= 1; prev--) {
    const block = weekMap['Woche ' + prev];
    if (block && block.end) return block.end;
  }
  return Math.max(3, fallbackLastRow);
}

function shiftWeekMapAfterInsert_(weekMap, insertAfter, rowCount) {
  Object.keys(weekMap).forEach(function(weekLabel) {
    const block = weekMap[weekLabel];
    if (block.start > insertAfter) block.start += rowCount;
    if (block.end > insertAfter) block.end += rowCount;
    block.rows.forEach(function(row) {
      if (row.rowNumber > insertAfter) row.rowNumber += rowCount;
    });
  });
}

function validateExistingWeekBlock_(sheetName, weekLabel, rows, week) {
  const expectedExercises = [];
  week.days.forEach(function(day) {
    day.exercises.forEach(function(exercise) {
      expectedExercises.push({ date: day.date, exercise });
    });
  });

  const actualExercises = rows
    .filter(function(row) {
      const exercise = String(row.values[4] || '').trim();
      return exercise && exercise !== '— PAUSE —' && exercise !== '- PAUSE -';
    })
    .map(function(row) {
      return {
        row: row.rowNumber,
        date: String(row.values[1] || '').trim(),
        exercise: String(row.values[4] || '').trim()
      };
    });

  const blocked = [];
  if (actualExercises.length !== expectedExercises.length) {
    blocked.push({
      sheetName,
      weekLabel,
      reason: 'Existing week has different exercise row count.',
      existingRows: actualExercises.length,
      expectedRows: expectedExercises.length
    });
  }

  const max = Math.max(actualExercises.length, expectedExercises.length);
  for (let i = 0; i < max; i++) {
    const actual = actualExercises[i];
    const expected = expectedExercises[i];
    if (!actual || !expected) continue;
    if (actual.date !== expected.date || actual.exercise !== expected.exercise) {
      blocked.push({
        sheetName,
        weekLabel,
        row: actual.row,
        existingDate: actual.date,
        expectedDate: expected.date,
        existingExercise: actual.exercise,
        expectedExercise: expected.exercise,
        reason: 'Existing week differs; insert-only helper will not modify it.'
      });
    }
  }

  return { ok: blocked.length === 0, blocked };
}

function buildCanonicalWeekRows_(weekNumber, week) {
  const rows = [];
  week.days.forEach(function(day) {
    rows.push(buildPlanRow_(weekNumber, day.date, day.tag, '', day.muscle));
    day.exercises.forEach(function(exercise) {
      rows.push(buildPlanRow_(weekNumber, day.date, '', exercise, day.muscle));
    });
    rows.push(buildPlanRow_(weekNumber, '', '', '', ''));
  });
  return rows;
}

function buildPlanRow_(weekNumber, date, tag, exercise, muscle) {
  return [
    'Woche ' + weekNumber,
    date || '',
    '',
    tag || '',
    exercise || '',
    muscle || '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];
}

function buildCanonicalAppPlanBlocksV1289_() {
  const d = function(date, tag, muscle, exercises) {
    return { date, tag, muscle, exercises };
  };
  const standardWeek = function(dates, deload) {
    const suffix = deload ? ' (60% Gew.)' : '';
    return {
      days: [
        d(dates[0], 'TAG 1: PULL' + suffix, 'Rücken / Bizeps', ['Latzug-Maschine (breit)', 'Hammer Strength Row (eng)', 'ISO-Lateral Row (einarmig)', 'Face-Pulls (Kabel)', 'Bizeps-Maschine (Preacher)']),
        d(dates[1], 'TAG 2: PUSH' + suffix, 'Brust / Schulter / Trizeps', ['Incline Chest Press', 'Brustpresse (horizontal)', 'Schulterdrück-Maschine', 'Seithebe-Maschine', 'Trizeps-Dips-Maschine']),
        d(dates[2], 'TAG 3: LEGS' + suffix, 'Beine / Waden', ['Beinpresse (45 Grad)', 'Beinbeuger unilateral', 'Beinstrecker-Maschine', 'Wadenheben stehend']),
        d(dates[3], 'TAG 5: TORSO' + suffix, 'Rücken & Brust (Dichte)', ['Prime Row seated', 'High Row Maschine', 'Chest Press (breit)', 'Butterfly', 'Reverse Butterfly Maschine']),
        d(dates[4], 'TAG 6: LIMBS' + suffix, 'Arme & Beine (Pump)', ['Kabel-Seitheben', 'Bizeps-Maschine (Preacher)', 'Trizepsstrecken', 'Kabel-Curls (Stange)', 'Trizeps über Kopf (Seil)', 'Hammer-Curls (Seil)', 'Hack Squat', 'Beinbeuger uni', 'Wadenheben (sitzend)'])
      ]
    };
  };
  const shortLimbsWeek = function(dates) {
    return {
      days: [
        d(dates[0], 'TAG 5: TORSO', 'Rücken & Brust (Dichte)', ['Prime Row seated', 'High Row Maschine', 'Chest Press (breit)', 'Butterfly', 'Reverse Butterfly Maschine']),
        d(dates[1], 'TAG 6: LIMBS', 'Arme & Beine (Pump)', ['Kabel-Seitheben', 'Bizeps-Maschine (Preacher)', 'Trizepsstrecken', 'Kabel-Curls (Stange)', 'Trizeps über Kopf (Seil)', 'Hammer-Curls (Seil)', 'Hack Squat', 'Beinbeuger uni', 'Wadenheben (sitzend)'])
      ]
    };
  };

  return [
    { weeks: [
      standardWeek(['27.04', '28.04', '29.04', '01.05', '02.05'], false),
      shortLimbsWeek(['08.05', '09.05']),
      standardWeek(['11.05', '12.05', '13.05', '15.05', '16.05'], false),
      standardWeek(['18.05', '19.05', '20.05', '22.05', '23.05'], true)
    ] },
    { weeks: [
      standardWeek(['25.05', '26.05', '27.05', '29.05', '30.05'], false),
      standardWeek(['01.06', '02.06', '03.06', '05.06', '06.06'], false),
      standardWeek(['08.06', '09.06', '10.06', '12.06', '13.06'], false),
      standardWeek(['15.06', '16.06', '17.06', '19.06', '20.06'], true)
    ] },
    { weeks: [
      shortLimbsWeek(['03.07', '04.07']),
      standardWeek(['06.07', '07.07', '08.07', '10.07', '11.07'], false),
      standardWeek(['13.07', '14.07', '15.07', '17.07', '18.07'], false),
      standardWeek(['20.07', '21.07', '22.07', '24.07', '25.07'], true)
    ] },
    { weeks: [
      standardWeek(['27.07', '28.07', '29.07', '31.07', '01.08'], false),
      standardWeek(['03.08', '04.08', '05.08', '07.08', '08.08'], false),
      standardWeek(['10.08', '11.08', '12.08', '14.08', '15.08'], false),
      standardWeek(['17.08', '18.08', '19.08', '21.08', '22.08'], true)
    ] },
    { weeks: [
      standardWeek(['24.08', '25.08', '26.08', '28.08', '29.08'], false),
      standardWeek(['31.08', '01.09', '02.09', '04.09', '05.09'], false),
      standardWeek(['07.09', '08.09', '09.09', '11.09', '12.09'], false),
      standardWeek(['14.09', '15.09', '16.09', '18.09', '19.09'], true)
    ] },
    { weeks: [
      standardWeek(['21.09', '22.09', '23.09', '25.09', '26.09'], false),
      standardWeek(['28.09', '29.09', '30.09', '02.10', '03.10'], false),
      standardWeek(['05.10', '06.10', '07.10', '09.10', '10.10'], false),
      standardWeek(['12.10', '13.10', '14.10', '16.10', '17.10'], true)
    ] }
  ];
}

function dryRunDiagnosePlanStructure() {
  const sheetName = 'ZYKLUS 2';
  const targetDates = ['01.06', '08.06', '15.06'];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const report = {
    dryRun: true,
    sheetName,
    weeks: [],
    targetDates: {},
    blocked: []
  };

  if (!sheet) {
    report.blocked.push({ reason: 'Sheet not found.' });
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const lastRow = sheet.getLastRow();
  report.lastRow = lastRow;
  if (lastRow < 4) {
    report.blocked.push({ reason: 'No plan rows found below header.' });
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const values = sheet.getRange(4, 1, lastRow - 3, 5).getValues();
  const weekMap = {};
  let activeWeek = '';
  let activeDate = '';

  values.forEach(function(row, index) {
    const rowNumber = index + 4;
    const weekCell = String(row[0] || '').trim();
    const dateCell = row[1];
    const dateKey = normalizeMaintenanceDateKey_(dateCell);
    const trainingTag = String(row[3] || '').trim();
    const exercise = String(row[4] || '').trim();

    if (weekCell) activeWeek = weekCell;
    if (dateKey) activeDate = dateKey;

    const weekLabel = activeWeek || '(kein Wochenlabel)';
    if (!weekMap[weekLabel]) {
      weekMap[weekLabel] = {
        weekLabel,
        firstRow: rowNumber,
        lastRow: rowNumber,
        dates: {},
        trainingTags: {},
        exerciseRows: 0,
        sampleExercises: []
      };
    }

    const item = weekMap[weekLabel];
    item.lastRow = rowNumber;
    if (activeDate) item.dates[activeDate] = true;
    if (trainingTag) item.trainingTags[trainingTag] = true;
    if (exercise) {
      item.exerciseRows++;
      if (item.sampleExercises.length < 12) item.sampleExercises.push(exercise);
    }

    targetDates.forEach(function(targetDate) {
      if (activeDate !== targetDate) return;
      if (!report.targetDates[targetDate]) report.targetDates[targetDate] = [];
      report.targetDates[targetDate].push({
        row: rowNumber,
        weekLabel,
        rawWeekCell: weekCell,
        rawDate: dateCell instanceof Date ? dateCell.toISOString() : String(dateCell || '').trim(),
        trainingTag,
        exercise
      });
    });
  });

  report.weeks = Object.keys(weekMap).map(function(weekLabel) {
    const item = weekMap[weekLabel];
    return {
      weekLabel: item.weekLabel,
      firstRow: item.firstRow,
      lastRow: item.lastRow,
      dates: Object.keys(item.dates),
      trainingTags: Object.keys(item.trainingTags),
      exerciseRows: item.exerciseRows,
      sampleExercises: item.sampleExercises
    };
  });

  targetDates.forEach(function(targetDate) {
    if (!report.targetDates[targetDate]) report.targetDates[targetDate] = [];
  });

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function normalizeMaintenanceDateKey_(value) {
  if (value instanceof Date && !isNaN(value)) {
    return String(value.getDate()).padStart(2, '0') + '.' + String(value.getMonth() + 1).padStart(2, '0');
  }
  const raw = String(value || '').trim();
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return String(parseInt(iso[3], 10)).padStart(2, '0') + '.' + String(parseInt(iso[2], 10)).padStart(2, '0');
  const match = raw.match(/(\d{1,2})\D+(\d{1,2})(?:\D+\d{2,4})?/);
  if (!match) return '';
  return String(parseInt(match[1], 10)).padStart(2, '0') + '.' + String(parseInt(match[2], 10)).padStart(2, '0');
}

function dryRunDiagnoseZyklus2MigrationToV1284() {
  const sheetName = 'ZYKLUS 2';
  const targetPlan = {
    'Woche 1': ['25.05', '26.05', '27.05', '29.05', '30.05'],
    'Woche 2': ['01.06', '02.06', '03.06', '05.06', '06.06'],
    'Woche 3': ['08.06', '09.06', '10.06', '12.06', '13.06'],
    'Woche 4': ['15.06', '16.06', '17.06', '19.06', '20.06']
  };
  const oldRanges = {
    '08.06-13.06': ['08.06', '09.06', '10.06', '12.06', '13.06'],
    '19.06-20.06': ['19.06', '20.06'],
    '22.06-27.06': ['22.06', '23.06', '24.06', '26.06', '27.06']
  };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const report = {
    dryRun: true,
    sheetName,
    targetPlan,
    missingTargetDates: [],
    additionalDates: [],
    trainingValueChecks: {},
    affectedRows: [],
    recommendation: '',
    blocked: []
  };

  if (!sheet) {
    report.blocked.push({ reason: 'Sheet not found.' });
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const lastRow = sheet.getLastRow();
  report.lastRow = lastRow;
  if (lastRow < 4) {
    report.blocked.push({ reason: 'No plan rows found below header.' });
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const values = sheet.getRange(4, 1, lastRow - 3, 22).getValues();
  const targetDateSet = {};
  Object.keys(targetPlan).forEach(function(weekLabel) {
    targetPlan[weekLabel].forEach(function(date) {
      targetDateSet[date] = weekLabel;
    });
  });

  const datesInSheet = {};
  let activeWeek = '';
  let activeDate = '';

  values.forEach(function(row, index) {
    const rowNumber = index + 4;
    const weekCell = String(row[0] || '').trim();
    const dateKey = normalizeMaintenanceDateKey_(row[1]);
    const trainingTag = String(row[3] || '').trim();
    const exercise = String(row[4] || '').trim();

    if (weekCell) activeWeek = weekCell;
    if (dateKey) activeDate = dateKey;
    if (!activeDate) return;

    if (!datesInSheet[activeDate]) datesInSheet[activeDate] = [];
    const hasTrainingValues = rowHasTrainingValues_(row);
    const rowInfo = {
      row: rowNumber,
      sheetWeek: activeWeek || '',
      rawWeekCell: weekCell,
      date: activeDate,
      trainingTag,
      exercise,
      hasTrainingValues
    };
    datesInSheet[activeDate].push(rowInfo);
    report.affectedRows.push(rowInfo);
  });

  Object.keys(targetDateSet).forEach(function(date) {
    if (!datesInSheet[date]) {
      report.missingTargetDates.push({
        date,
        targetWeek: targetDateSet[date]
      });
    }
  });

  Object.keys(datesInSheet).forEach(function(date) {
    if (!targetDateSet[date]) {
      report.additionalDates.push({
        date,
        rows: datesInSheet[date].map(function(row) { return row.row; }),
        weeks: uniqueValues_(datesInSheet[date].map(function(row) { return row.sheetWeek; }))
      });
    }
  });

  Object.keys(oldRanges).forEach(function(rangeLabel) {
    const rows = [];
    oldRanges[rangeLabel].forEach(function(date) {
      (datesInSheet[date] || []).forEach(function(row) {
        rows.push(row);
      });
    });
    const valueRows = rows.filter(function(row) { return row.hasTrainingValues; });
    report.trainingValueChecks[rangeLabel] = {
      dates: oldRanges[rangeLabel],
      rows: rows.map(function(row) { return row.row; }),
      weeks: uniqueValues_(rows.map(function(row) { return row.sheetWeek; })),
      hasTrainingValues: valueRows.length > 0,
      valueRows: valueRows.map(function(row) {
        return {
          row: row.row,
          date: row.date,
          sheetWeek: row.sheetWeek,
          exercise: row.exercise,
          trainingTag: row.trainingTag
        };
      })
    };
  });

  const hasValuesInShiftedWeek = report.trainingValueChecks['08.06-13.06'].hasTrainingValues;
  const hasValuesInOldSchool = report.trainingValueChecks['19.06-20.06'].hasTrainingValues;
  const hasValuesInOldDeload = report.trainingValueChecks['22.06-27.06'].hasTrainingValues;
  const missingEarlyJune = report.missingTargetDates.some(function(item) {
    return ['01.06', '02.06', '03.06', '05.06', '06.06'].indexOf(item.date) >= 0;
  });

  if (hasValuesInShiftedWeek || hasValuesInOldSchool || hasValuesInOldDeload) {
    report.recommendation = 'Migration riskant: echte Trainingswerte liegen in alten/verschobenen Bereichen. Kein Insert-only/Label-Fix ohne manuelle Sicherung und gezielten Migrationsplan.';
  } else if (missingEarlyJune) {
    report.recommendation = 'Insert-only fuer fehlende Woche 2 koennte moeglich sein, aber erst nach Kontrolle der betroffenen Zeilen und Wochenlabels.';
  } else {
    report.recommendation = 'Kein offensichtlicher Insert-only-Bedarf fuer fehlende Ziel-Daten; Strukturabweichungen weiter manuell pruefen.';
  }

  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function rowHasTrainingValues_(row) {
  const cols = [6, 7, 8, 9, 10, 11, 14, 18, 19, 20, 21];
  return cols.some(function(index) {
    const value = row[index];
    if (value === null || typeof value === 'undefined') return false;
    const text = String(value).trim();
    return text !== '' && text !== '0';
  });
}

function uniqueValues_(values) {
  const seen = {};
  const result = [];
  values.forEach(function(value) {
    const key = String(value || '').trim();
    if (!key || seen[key]) return;
    seen[key] = true;
    result.push(key);
  });
  return result;
}

function dryRunRebuildZyklus2AfterWeek1ToV1284() {
  const report = analyzeRebuildZyklus2AfterWeek1ToV1284_();
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function applyRebuildZyklus2AfterWeek1ToV1284() {
  const report = analyzeRebuildZyklus2AfterWeek1ToV1284_();
  report.dryRun = false;

  if (!report.safeToApply) {
    report.applied = false;
    report.recommendation = 'ABBRUCH: ' + report.recommendation;
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(report.sheetName);
  if (!sheet) {
    report.applied = false;
    report.safeToApply = false;
    report.blocked.push({ reason: 'Sheet not found during apply.' });
    Logger.log(JSON.stringify(report, null, 2));
    return report;
  }

  if (report.replaceRange.rowCount > 0) {
    sheet.deleteRows(report.replaceRange.startRow, report.replaceRange.rowCount);
  }

  sheet.insertRowsAfter(report.week1.lastRow, report.rowsThatWouldBeInserted.length);
  sheet.getRange(report.week1.lastRow + 1, 1, report.rowsThatWouldBeInserted.length, 22)
    .setValues(report.insertValues);

  report.applied = true;
  report.recommendation = 'Apply abgeschlossen: ZYKLUS 2 nach Woche 1 auf v12_8_4-Zielstruktur Woche 2-4 neu aufgebaut.';
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function analyzeRebuildZyklus2AfterWeek1ToV1284_() {
  const sheetName = 'ZYKLUS 2';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const report = {
    dryRun: true,
    sheetName,
    week1: null,
    replaceRange: null,
    rowsThatWouldBeRemoved: [],
    rowsThatWouldBeInserted: [],
    insertValues: [],
    blockedRowsWithTrainingValues: [],
    safeToApply: false,
    recommendation: '',
    blocked: []
  };

  if (!sheet) {
    report.blocked.push({ reason: 'Sheet not found.' });
    report.recommendation = 'Nicht sicher: Sheet nicht gefunden.';
    return report;
  }

  const lastRow = sheet.getLastRow();
  report.lastRow = lastRow;
  if (lastRow < 4) {
    report.blocked.push({ reason: 'No plan rows found below header.' });
    report.recommendation = 'Nicht sicher: keine Planzeilen ab Zeile 4.';
    return report;
  }

  const values = sheet.getRange(1, 1, lastRow, 22).getValues();
  const weekBlocks = collectContiguousWeekBlocks_(values);
  const week1Blocks = weekBlocks.filter(function(block) {
    return block.weekLabel === 'Woche 1';
  });

  if (week1Blocks.length !== 1) {
    report.blocked.push({
      reason: 'Woche 1 is not uniquely detected.',
      foundBlocks: week1Blocks.map(function(block) {
        return { firstRow: block.firstRow, lastRow: block.lastRow, rows: block.rows.length };
      })
    });
    report.recommendation = 'Nicht sicher: Woche 1 wurde nicht eindeutig erkannt.';
    return report;
  }

  const week1 = week1Blocks[0];
  report.week1 = summarizeWeekBlockForRebuild_(week1);

  const replaceStart = week1.lastRow + 1;
  const replaceEnd = lastRow;
  const replaceCount = Math.max(0, replaceEnd - replaceStart + 1);
  report.replaceRange = {
    startRow: replaceStart,
    endRow: replaceEnd,
    rowCount: replaceCount
  };

  for (let rowNumber = replaceStart; rowNumber <= replaceEnd; rowNumber++) {
    const row = values[rowNumber - 1];
    if (!row) continue;
    const item = rowToRebuildLogItem_(rowNumber, row);
    report.rowsThatWouldBeRemoved.push(item);
    if (item.hasTrainingValues) report.blockedRowsWithTrainingValues.push(item);
  }

  const canonical = buildCanonicalAppPlanBlocksV1289_()[1];
  [1, 2, 3].forEach(function(weekIndex) {
    const weekNumber = weekIndex + 1;
    const rows = buildCanonicalWeekRows_(weekNumber, canonical.weeks[weekIndex]);
    report.insertValues = report.insertValues.concat(rows);
    rows.forEach(function(row) {
      report.rowsThatWouldBeInserted.push({
        week: row[0],
        date: row[1],
        tag: row[3],
        exercise: row[4],
        muscle: row[5]
      });
    });
  });

  if (report.blockedRowsWithTrainingValues.length > 0) {
    report.safeToApply = false;
    report.recommendation = 'Nicht anwenden: Nach Woche 1 wurden echte Trainingswerte gefunden.';
    return report;
  }

  report.safeToApply = true;
  report.recommendation = 'Apply moeglich: Woche 1 bleibt unveraendert; Bereich nach Woche 1 enthaelt keine echten Trainingswerte und kann durch v12_8_4 Woche 2-4 ersetzt werden.';
  return report;
}

function collectContiguousWeekBlocks_(values) {
  const blocks = [];
  let current = null;

  for (let i = 3; i < values.length; i++) {
    const rowNumber = i + 1;
    const weekLabel = normalizeWeekLabel_(values[i][0]);
    if (!weekLabel) {
      if (current) {
        current.lastRow = rowNumber;
        current.rows.push({ rowNumber, values: values[i] });
      }
      continue;
    }

    if (!current || current.weekLabel !== weekLabel) {
      current = {
        weekLabel,
        firstRow: rowNumber,
        lastRow: rowNumber,
        rows: []
      };
      blocks.push(current);
    }

    current.lastRow = rowNumber;
    current.rows.push({ rowNumber, values: values[i] });
  }

  return blocks;
}

function summarizeWeekBlockForRebuild_(block) {
  const dates = {};
  let exerciseRows = 0;
  let hasTrainingValues = false;

  block.rows.forEach(function(item) {
    const row = item.values;
    const date = normalizeMaintenanceDateKey_(row[1]);
    const exercise = String(row[4] || '').trim();
    if (date) dates[date] = true;
    if (exercise) exerciseRows++;
    if (rowHasTrainingValues_(row)) hasTrainingValues = true;
  });

  return {
    weekLabel: block.weekLabel,
    firstRow: block.firstRow,
    lastRow: block.lastRow,
    rows: block.rows.length,
    dates: Object.keys(dates),
    exerciseRows,
    hasTrainingValues
  };
}

function rowToRebuildLogItem_(rowNumber, row) {
  return {
    row: rowNumber,
    week: String(row[0] || '').trim(),
    date: normalizeMaintenanceDateKey_(row[1]),
    tag: String(row[3] || '').trim(),
    exercise: String(row[4] || '').trim(),
    hasTrainingValues: rowHasTrainingValues_(row)
  };
}
