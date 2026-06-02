# Personal App Versionsregister

Fuer jede Version dokumentieren:

- Version
- Dateiname
- Pfad
- Commit
- Status
  - AKTIVE BASIS
  - TESTVERSION
  - STABLE
  - ARCHIV
  - BACKUP
- Kurzbeschreibung

## Aktuelle Lage

| Version | Dateiname | Pfad | Commit | Status | Kurzbeschreibung |
| --- | --- | --- | --- | --- | --- |
| V12.8.11-test | plateau-brecher-v12_8_11-test.html | 01_PERSONAL_APP/tests/plateau-brecher-v12_8_11-test.html | Rename-Commit siehe Git-Log | AKTIVE BASIS | Aktuelle Entwicklungsbasis aus V12.8.10-Basis; Dateiname an APP_VERSION angeglichen und UX-Text fuer Tageszusammenfassung uebernommen. |
| V12.8.10-test | plateau-brecher-v12_8_5-test.html | 01_PERSONAL_APP/tests/plateau-brecher-v12_8_5-test.html | 4f2db32 | TESTVERSION | Fruehere echte Basis vor V12.8.11-test. |
| V12.8.10-test | plateau-brecher-v12_8_10-test.html | 01_PERSONAL_APP/backups/plateau-brecher-v12_8_10-test.html | Unbekannt / pruefen | BACKUP | Backup-Kopie der V12.8.10-test-Basis; nicht als Arbeitsdatei verwenden. |
| V12.8.9-test | plateau-brecher-v12_8_4-test.html | 01_PERSONAL_APP/tests/plateau-brecher-v12_8_4-test.html | ff5b25b | TESTVERSION | Aeltere Testversion; heute versehentlich mit UX-Patch geaendert, nicht weiter als aktuelle Basis verwenden. |
| V12.8.8-test | plateau-brecher-v12_8_3-test.html | 01_PERSONAL_APP/tests/plateau-brecher-v12_8_3-test.html | Unbekannt / pruefen | TESTVERSION | Untracked lokale Testdatei; Commit-Zuordnung aktuell nicht eindeutig. |
| V12.8.7-test | plateau-brecher-v12_8_2-test.html | 01_PERSONAL_APP/tests/plateau-brecher-v12_8_2-test.html | 41edb92 | TESTVERSION | Getrackte fruehere Testversion mit APP_VERSION V12.8.7-test. |
| V12.8.1 stable | plateau-brecher-v12_8_1-stable.html | 00_AKTUELL/personal_latest/plateau-brecher-v12_8_1-stable.html | 6f9269c | STABLE | Stabile Personal-App-Referenz; nur lesen, nicht ohne Freigabe ueberschreiben. |

## Regeln

- Aktive Entwicklung findet nur in `01_PERSONAL_APP/tests/` statt.
- Backups in `01_PERSONAL_APP/backups/` sind Sicherungen und keine Arbeitsbasis.
- Bei jeder neuen Testversion muessen Dateiname, `APP_VERSION`, `BUILD_DATE` und Changelog-Version synchron gepflegt werden.
- Vor jedem Commit pruefen: Dateiname, `APP_VERSION` und Changelog-Version muessen denselben Versionsstand beschreiben.
- Wenn die Versionsangaben nicht zusammenpassen: STOP, zuerst Versionen korrigieren.
