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

