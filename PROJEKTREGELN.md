# Projektregeln Plateau-Brecher

## Grundprinzip

Der lokale normale Projektordner ist die Hauptarbeitsumgebung fuer die Plateau-Brecher-App.

Google Drive dient nur als schlanke Sync-, Backup- und Transfer-Ablage fuer aktuelle relevante Versionen. Drive ist nicht das vollstaendige Projektarchiv.

## Lokal vs. Google Drive

Lokal bleiben:

- vollstaendige Projektstruktur
- Entwicklungsdateien
- alte Versionen
- Backups
- Archive
- fruehere Stable-Builds
- groessere Testbuilds

Google Drive enthaelt nur:

- aktuelle Arbeits- oder Transfer-Versionen
- aktuelle Stable-Dateien
- relevante Testbuilds
- Dateien fuer schnellen Zugriff zwischen Geraeten

Lokale Archive duerfen niemals automatisch geloescht werden. Alte Versionen duerfen nur in der schlanken Drive-Sync-Struktur ersetzt oder entfernt werden, wenn der Auftrag eindeutig ist.

## Arbeitsweise

Vor Aenderungen gilt:

1. Erst analysieren.
2. Betroffene Dateien nennen.
3. Risiko einschaetzen.
4. Genauen Patchplan nennen.
5. Testliste nennen.
6. Danach nur kleine sichere Aenderungen umsetzen.

Keine grossen Refactors, Umbenennungen, Verschiebungen oder Deployments ohne ausdrueckliche Freigabe.

## Trennung der Apps

Personal-App und Public-App muessen getrennt bleiben.

- Keine Personal-Dateien in Public uebernehmen.
- Keine Public-Dateien in Personal uebernehmen.
- Stable-, Test- und Archivbereiche sauber trennen.
- Keine persoenlichen Daten in Public-Dateien uebernehmen.

## Sicherheit

- Keine API-Keys vollstaendig ausgeben.
- Keine privaten Sheet-IDs vollstaendig ausgeben.
- Keine Secrets in Changelogs, Logs oder Dokumentation kopieren.
- Keine globalen Dateisystemaenderungen ausserhalb des bestaetigten Projektordners.

## Apps Script

`03_APPS_SCRIPT` bleibt vorerst unveraendert. Eine spaetere Aufraeumung ist sinnvoll, aber nur nach separater Analyse und ausdruecklicher Freigabe.
