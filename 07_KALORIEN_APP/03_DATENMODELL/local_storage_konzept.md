# Local-Storage-Konzept

## Ziel

Der MVP speichert alle Daten lokal im Browser. Es gibt keine Anmeldung, keinen Cloud-Sync und keine externe Datenbank.

## Speicherbereiche

- Tagesdaten nach Datum
- Nutzerziele
- UI-Einstellungen
- optionale Feldsichtbarkeit

## Schutzregeln

- Datenstruktur versionieren.
- Vor Migrationen erst vorhandene Daten pruefen.
- Keine stillen Datenloeschungen.
- Keine automatischen Annahmen bei unvollstaendigen Tagen.
- Export spaeter einplanen, aber nicht fuer den ersten MVP erzwingen.

