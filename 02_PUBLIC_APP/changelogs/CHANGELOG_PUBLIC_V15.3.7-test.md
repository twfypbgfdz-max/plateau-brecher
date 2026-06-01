# CHANGELOG PUBLIC V15.3.7-test

## Geändert
- Neue Public-Testversion `plateau-brecher-public-v15_3.7-test.html` auf Basis von `V15.3.6-test`.
- Version, Title und sichtbare Header-Version auf `V15.3.7-test` gesetzt.
- Kleine Anzeige unter dem Übungsnamen ergänzt:
  - `Letztes Mal: 22 kg × 12`
  - nur bei früherer Zeile im geladenen `rawData`
  - aktuelle Zeile wird ausgeschlossen
  - exaktes normalisiertes Namensmatching
  - Satz 1 wird bevorzugt, bester vollständiger Satz dient als Fallback
- Minimal-CSS für `.last-set-line`.

## Nicht geändert
- Keine Personal-App-Dateien.
- Keine `index.html`.
- Keine neuen Sheet-Spalten.
- Keine Alias-Logik.
- Keine Save-/Sync-/PR-/Coach-/Sheet-Logik.
- Kein Deployment, kein Push.

## Tests
- Syntaxcheck der eingebetteten JavaScript-Datei empfohlen.
- Manuelle Prüfung mit geladenem Sheet:
  - Übung ohne frühere Daten zeigt keine Zeile.
  - Übung mit früheren Daten zeigt `Letztes Mal`.
  - Aktuelle Zeile wird nicht als eigene Historie verwendet.
