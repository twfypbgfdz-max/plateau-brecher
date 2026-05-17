# Plateau-Brecher Admin-Logs

Lokale Ablage fuer Backups und Exporte des Google Sheets `Plateau-Brecher Admin-Logs`.

Die Live-Version bleibt das Google Sheet. Dieser Ordner dient nur zur lokalen Sicherung und Analyse.

## Struktur

- `aktuell/` = aktuelles lokales XLSX-Backup
- `exports/` = CSV-Exports fuer Analyse
- `archiv/` = aeltere Backups/Exports
- `changelogs/` = Aenderungen an Sheet-Struktur/Exporten

## Regeln

- PERSONAL und PUBLIC bleiben getrennt.
- App-Dateien werden von hier aus nicht geaendert.
- Apps Script wird von hier aus nicht geaendert.
- Bestehende Exporte werden nicht geloescht.
