# CHANGELOG PUBLIC V15.3.8-test

## Geändert
- Neue Public-Testversion `plateau-brecher-public-v15_3.8-test.html` auf Basis von `V15.3.7-test`.
- Version, Title und sichtbare Header-Version auf `V15.3.8-test` gesetzt.
- Aktive/geöffnete Übung optisch deutlicher hervorgehoben.
- Satz-Fortschritt pro Übung ergänzt:
  - `0/3 Sätze mit Daten`
  - `1/3 Sätze mit Daten`
  - `2/3 Sätze mit Daten`
  - `3/3 Sätze mit Daten`
- Satz-Fortschritt wird bei Eingaben live aktualisiert.
- Trainingskarten leicht kompakter gemacht, mobile Eingabefelder bleiben bedienbar.

## Nicht geändert
- Keine Differenz zu `Letztes Mal`.
- Keine neue Progressionslogik.
- Keine Personal-App-Dateien.
- Keine `index.html`.
- Keine Save-/Sync-/PR-/Coach-/Sheet-Logik.
- Kein Deployment, kein Push.

## Tests
- Syntaxcheck der eingebetteten JavaScript-Datei empfohlen.
- Manuelle Prüfung mit geladenem Sheet:
  - Öffnen/Schließen von Übungen.
  - Satz-Fortschritt bei leeren und gefüllten Sätzen.
  - Live-Aktualisierung bei Eingabe und Löschen.
  - Speichern zur Regression prüfen.
