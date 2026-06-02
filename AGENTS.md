\# Arbeitsregeln für Codex



\## Grundregel



Erst analysieren, nicht direkt ändern.



Vor Änderungen immer nennen:

\- betroffene Dateien

\- Risiko

\- genauer Patchplan

\- Testliste



\## Arbeitsweise



\- Nur kleine gezielte Patches.

\- Keine Live-Dateien direkt bearbeiten.

\- Keine Personal-App anfassen, wenn Public gemeint ist.

\- Keine Public-App anfassen, wenn Personal gemeint ist.

\- Keine Dateien löschen.

\- Keine Deployments ohne Freigabe.

\- Keine unklaren Dateinamen verwenden.

\- Immer neue Version + Changelog erstellen.

\## Versionsregeln

Bei jeder neuen Testversion muessen immer zusammenpassen:
\- Dateiname
\- `APP_VERSION`
\- `BUILD_DATE`
\- Changelog-Eintrag

Beispiel:
\- Datei: `01_PERSONAL_APP/tests/plateau-brecher-v12_8_6-test.html`
\- `APP_VERSION`: `V12.8.11-test`
\- `BUILD_DATE`: aktuelles Datum
\- Changelog: `V12.8.11-test`

Vor jedem Commit pruefen:
Dateiname, `APP_VERSION` und Changelog-Version muessen denselben Versionsstand haben.
Wenn sie nicht uebereinstimmen: STOP, zuerst Versionen synchronisieren.

Aktive Entwicklung findet nur unter `01_PERSONAL_APP/tests/` statt.
Dateien in `01_PERSONAL_APP/backups/` sind nur Sicherungen und duerfen nicht als Arbeitsdatei weiterentwickelt werden.



\## Nach jedem Patch berichten



Bitte kurz ausgeben:

\- welche Dateien geändert wurden

\- welche Version geändert wurde

\- welche Tests gemacht wurden

\- was ich selbst testen soll



\## Ordnerlogik



Public-App:

\- Arbeitsversionen: `02\_PUBLIC\_APP/aktuell`

\- Live/Stable: `00\_AKTUELL/public\_latest`

\- Archiv: `02\_PUBLIC\_APP/archiv`

\- Changelogs: `02\_PUBLIC\_APP/changelogs`




Personal-App:

\- stabile Version: `01\_PERSONAL\_APP/aktuell`

\- Tests: `01\_PERSONAL\_APP/tests`

\- Archiv: `01\_PERSONAL\_APP/archiv`

\- Changelogs: `01\_PERSONAL\_APP/changelogs`

\- Stable-/Live-Referenz lesen erlaubt:
  `00\_AKTUELL/personal_latest`

\- Neue Testversionen immer zuerst nach:
  `01\_PERSONAL\_APP/tests`

\- `00\_AKTUELL` niemals ohne ausdrückliche Freigabe überschreiben.



\## Sicherheitsregeln



\- Keine API-Keys vollständig ausgeben.

\- Keine privaten Sheet-IDs vollständig ausgeben.

\- Keine persönlichen Daten in Public übernehmen.

\- Keine Secrets in Changelogs oder Logs kopieren.

## Codex-Arbeitsregeln für App-Brecher

Codex arbeitet immer vorsichtig, kleinschrittig und projektkonform.

### Grundregeln
- Erst analysieren, dann kurzen Patchplan nennen, dann ändern.
- Keine großen Refactors ohne ausdrückliche Freigabe.
- Keine bestehenden Funktionen löschen, nur weil sie alt oder unübersichtlich wirken.
- Bestehende Architektur, Namensmuster und Datenstruktur respektieren.
- Keine neuen Libraries/Dependencies ohne Freigabe.
- Änderungen immer möglichst klein, nachvollziehbar und rückbaubar halten.

### Git-Regeln
- Nur auf dem `dev`-Branch arbeiten.
- Keine Änderungen direkt auf `main`.
- Keine Stable-Dateien direkt ändern.
- Keine fremden/uncommitted Änderungen überschreiben.
- Niemals `git reset --hard`, `git checkout -- .` oder ähnliche Rücksetz-Befehle ohne klare Freigabe.
- Nach sinnvollen kleinen Änderungen committen.
- Commit-Messages kurz und konkret.

### App-spezifische Schutzbereiche
Folgende Bereiche nur mit besonderer Vorsicht ändern:
- Google-Sheet-Sync
- `SCRIPT_CODE`
- `PLAN`
- PR-/1RM-Berechnung
- Deload-/Readiness-Logik
- lokale Storage-/History-Logik
- Exercise-Alias-/Matching-Logik

### Arbeitsweise bei Bugs
- Erst Ursache finden.
- Dann minimalen Fix vorschlagen.
- Keine komplette Logik neu schreiben, wenn ein kleiner Fix reicht.
- Bei Sync-Problemen immer prüfen:
  - Sheet-Daten
  - lokale Browser-Daten
  - Datum/Day-Matching
  - Exercise-Alias
  - alte Syncs/Cooldowns

### UI-/Mobile-Regeln
- Mobile-first, speziell iPhone.
- Buttons groß genug.
- Texte gut lesbar.
- Keine überladenen Karten.
- Stats/PR-Seiten ruhig, klar und schnell erfassbar halten.

### Trainingsdaten-Regeln
- Keine Trainingsdaten raten.
- Keine Werte automatisch übernehmen, wenn Datum oder Übung nicht eindeutig passt.
- Übungsvarianten über Alias/Notes sauber behandeln.
- PRs nicht verfälschen durch falsches Exercise-Matching.

## Prompt-/Token-Effizienz

- Prompts und Antworten möglichst effizient halten.
- Keine unnötigen Wiederholungen oder langen Erklärungen.
- Große Dateien nicht komplett neu ausgeben.
- Kleine lokale Änderungen statt großer Refactors bevorzugen.
- Analysen gezielt eingrenzen.
- Möglichst kleine Diffs/Patches erzeugen.
- Vor Änderungen erst relevante Bereiche identifizieren.
- Vorhandenen Projektkontext nutzen statt alles neu zu erklären.
- Token-/Kontextverbrauch aktiv minimieren.
- Keine unnötigen Code-Blöcke oder Dateiduplikate erzeugen.

# PERSONAL_APP vs PUBLIC_APP

## PERSONAL_APP
Ziel:
- persönliche Haupt-App
- experimentelle Features möglich
- tiefere Analyse
- PR-/Recovery-/Coach-/Readiness-Systeme erlaubt
- komplexere Datenlogik möglich

Wichtig:
- Stabilität der Trainingsdaten kritisch
- Sync-/Sheet-/PR-Logik vorsichtig behandeln
- defensive Validierung wichtig
- neue Features zuerst in tests

Pfad:
- 01_PERSONAL_APP/tests
- 01_PERSONAL_APP/aktuell
- 01_PERSONAL_APP/archiv


## PUBLIC_APP
Ziel:
- öffentliche/mobile Version
- einfacher Trainings-Tracker
- ruhige klare UI
- Mobile First
- schnelle Bedienung
- weniger technische Komplexität

Nicht übernehmen aus PERSONAL_APP:
- interne Debug-Systeme
- aggressive Analyse-/Coach-Logik
- überladene Recovery-/Readiness-Systeme
- unnötige Expertenanzeigen
- komplexe Entwicklerfeatures

Wichtig:
- Public-App bewusst simpler halten
- Übersichtlichkeit wichtiger als Datentiefe
- Performance und Klarheit priorisieren

Pfad:
- 02_PUBLIC_APP/tests
- 02_PUBLIC_APP/aktuell
- 02_PUBLIC_APP/archiv
