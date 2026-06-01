# V12.8.4-test - Vollstaendiger Zyklus-2-PLAN

Status: Testversion, nicht Stable, nicht deployt.

## Geaendert

- Neue Testdatei erstellt: `plateau-brecher-v12_8_4-test.html`.
- Zyklus 2 / Woche 3 korrigiert:
  - `08.06`, `09.06`, `10.06`, `12.06`, `13.06`
- Zyklus 2 / Woche 4 korrigiert:
  - `15.06`, `16.06`, `17.06`, `19.06`, `20.06`
- `PlanMaintenance.js` um einen Full-PLAN-Wartungshelfer erweitert.

## Sheet-Helfer

- `dryRunEnsureFullPlanDates()` prueft alle Zyklen und Wochen nur per Log.
- `applyEnsureFullPlanDatesBlankOnly()` schreibt nur leere Datumszellen.
- Bestehende abweichende Datumswerte werden blockiert und gemeldet.
- Es werden keine Sheets geloescht, keine Zeilen geloescht und keine vorhandenen Werte ueberschrieben.

## Bewusst nicht geaendert

- Keine Stable-Datei.
- Keine `Code.js`.
- Keine `format.js`.
- Kein `createAllCycleSheets()`.
- Keine Sync-, PR- oder Bestleistungen-Logik.

## Testpunkte

- PLAN in `v12_8_4` muss Zyklus 2 / Woche 3 und Woche 4 mit den korrigierten Daten ausgeben.
- JavaScript-Syntax der HTML-Testdatei pruefen.
- Apps-Script-Syntax von `PlanMaintenance.js` pruefen.
- In Apps Script zuerst nur `dryRunEnsureFullPlanDates()` ausfuehren.
