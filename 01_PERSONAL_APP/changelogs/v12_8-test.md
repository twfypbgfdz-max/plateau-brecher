# V12.8-test - Coach-/KI-Feinschliff und Limbs-Anpassung

Status: Testversion, nicht Stable, nicht deployt.

## V12.8.9-test / v12_8_4

- Neue Testdatei: `plateau-brecher-v12_8_4-test.html`.
- Zyklus 2 / Woche 3 auf `08.06`, `09.06`, `10.06`, `12.06`, `13.06` korrigiert.
- Zyklus 2 / Woche 4 auf `15.06`, `16.06`, `17.06`, `19.06`, `20.06` korrigiert.
- `PlanMaintenance.js` um Full-PLAN-Dry-Run und Blank-only-Anwendung erweitert.
- Keine Stable-, `Code.js`-, `format.js`-, Sync-, PR- oder Bestleistungen-Logik geaendert.

## V12.8.8-test / v12_8_3

- Neue Testdatei: `plateau-brecher-v12_8_3-test.html`.
- Startlogik findet bei fehlendem exaktem Tagesdatum defensiv die aktuelle Planwoche.
- `01.06.2026` ist als Zyklus 2 / Woche 2 / TAG 1: PULL im PLAN pruefbar.
- Separater Apps-Script-Dry-Run-Helfer `PlanMaintenance.js` fuer `ZYKLUS 2` / `Woche 2` ergaenzt.
- Keine Stable-, `Code.js`-, Sync-, PR- oder Bestleistungen-Logik geaendert.

## V12.8.7-test

- Optionales Geraete-/Maschinenprofil pro Uebung lokal ergaenzt.
- Kompaktes Auswahlfeld im Training-Reiter mit Standardwert `Standard`.
- Dezenter Hinweis bei anderem Geraet als im letzten lokalen Training.
- Keine Sheet-, Sync-, PR-, Stats-, Bestleistungen- oder Apps-Script-Logik geaendert.

## Geaendert

- Neue Testdatei auf Basis von V12.7 erstellt: `plateau-brecher-v12_8-test.html`.
- Coach-/KI-Kontext auf einen kuerzeren strukturierten Snapshot umgestellt.
- KI-Systemprompt auf fuenf kurze Coach-Zeilen ausgerichtet:
  - staerkste Verbesserung
  - auffaellige Entwicklung
  - naechste Empfehlung
  - nicht ueberbewerten
  - kurze Begruendung
- Groq bleibt optional und nutzt lokale Findings als Grundlage.
- Trainingszusammenfassung nach dem Speichern gekuerzt und ruhiger formuliert.
- Marker-Erkennung fuer Datenqualitaet um `andere Brustpresse` erweitert.
- Hack Squat an allen TAG 6: LIMBS ergaenzt.
- Hack Squat wird als Beinuebung und fuer Knie-/Hueft-Kontext erkannt.
- Neue Empfehlung fuer leere Hack-Squat-Eingabe: `1-2 Saetze · 8-12 Wdh · RPE 7-8`.
- Limbs-Armuebungen bekommen bei leerer Eingabe eine defensivere 2-Satz-Orientierung.

## Bewusst nicht geaendert

- Kein Stable-/Live-Update.
- Keine Public-App.
- Keine `index.html`.
- Keine Aenderung an `aktuell` oder `00_AKTUELL/personal_latest`.
- Kein `SCRIPT_CODE`.
- Keine Sheet-Struktur.
- SK bleibt `pb_v12_0_test`.
- Haupt-Leg-Day bleibt unveraendert.
- Keine neuen Tabs und keine grosse Trainingsarchitektur.

## Testpunkte

- App als V12.8-test laden.
- TAG 6: LIMBS pruefen: Hack Squat sichtbar, Haupt-Leg-Day unveraendert.
- Hack Squat leer lassen: Empfehlung muss 1-2 Saetze, 8-12 Wdh, RPE 7-8 nennen.
- Limbs-Armuebungen leer lassen: Empfehlung soll 2 Saetze defensiv nennen.
- Readiness mit Knie/Huefte/Schmerzkontext pruefen.
- Notizen mit `andere Brustpresse`, `Matrix`, `MedX`, `anderer Griff`, `ROM besser`, `Schmerzen Schulter 4/10` testen.
- Analyse/KI: kurze defensive Findings, keine Panik, keine Rohdatenliste.
- Training speichern: Tageszusammenfassung kurz und verstaendlich.
- Stats/PRs: keine falschen Cross-Cycle- oder Cross-Day-Aussagen.
- Mobile: Readiness, Stats, PRs und Analyse ohne Ueberlappungen.

## Risiken / offen

- Browser- und Mobile-Praxistest stehen noch aus.
- Hack Squat ist neu im Plan und sollte im Gym auf Erholung/Beinvolumen beobachtet werden.
- KI-Antwortqualitaet haengt bei Groq weiter von der externen Antwort ab; lokale Analyse bleibt die Grundlage.
