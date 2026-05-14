# Ordnerstruktur Plateau-Brecher

Diese Datei beschreibt die lokale Projektstruktur und die wichtigsten Unterschiede zwischen Arbeits-, Stable-, Test- und Archivbereichen.

## Hauptstruktur

```text
00_AKTUELL/
01_PERSONAL_APP/
02_PUBLIC_APP/
03_APPS_SCRIPT/
04_SHEETS/
05_FEHLER_LOGS/
06_DEPLOYMENT/
99_ARCHIV_ALT/
```

## `00_AKTUELL` vs. `*/aktuell`

`00_AKTUELL` ist die stabile Referenz fuer aktuelle Live- oder Stable-Versionen.

Beispiele:

```text
00_AKTUELL/personal_latest/
00_AKTUELL/public_latest/
```

Die Ordner `*/aktuell` innerhalb der App-Bereiche sind Arbeitsbereiche fuer die jeweils aktuelle Entwicklungsversion.

Beispiele:

```text
01_PERSONAL_APP/aktuell/
02_PUBLIC_APP/aktuell/
```

Kurz gesagt:

- `00_AKTUELL` = Stable-/Live-Referenz
- `01_PERSONAL_APP/aktuell` = aktuelle Personal-Arbeitsversion
- `02_PUBLIC_APP/aktuell` = aktuelle Public-Arbeitsversion

## Personal-App

```text
01_PERSONAL_APP/
  aktuell/
  tests/
  archiv/
  changelogs/
```

- `aktuell` enthaelt die aktuelle Personal-Arbeitsversion.
- `tests` enthaelt aktuelle relevante Testversionen.
- `archiv` enthaelt lokale alte Versionen und Backups.
- `changelogs` enthaelt Aenderungsnotizen.

Lokale Personal-Archive werden nicht automatisch geloescht.

## Public-App

```text
02_PUBLIC_APP/
  aktuell/
  tests/
  archiv/
  changelogs/
```

- `aktuell` enthaelt die aktuelle Public-Arbeitsversion.
- `tests` enthaelt aktuelle relevante Testversionen.
- `archiv` enthaelt lokale alte Versionen und Backups.
- `changelogs` enthaelt Aenderungsnotizen.

Public und Personal bleiben strikt getrennt.

## Google Drive

Google Drive ist nicht das vollstaendige Hauptprojektarchiv.

Drive dient nur als:

- schlanke Sync-Ablage
- Backup fuer aktuelle relevante Dateien
- Stable- und Transfer-Ablage
- geraeteuebergreifender Zugriff

In Drive sollen keine grossen Archive, alten Build-Sammlungen oder unnoetigen Duplikate dauerhaft liegen.

## Stable, Tests und Archive

- Stable-Dateien gehoeren in die dafuer vorgesehenen Stable-/Latest-Bereiche.
- Testbuilds gehoeren in `tests`.
- Alte Versionen und Backups gehoeren lokal in `archiv` oder `99_ARCHIV_ALT`.
- Lokale Archive werden nicht automatisch geloescht.

## Zukuenftiges Thema: Apps Script

`03_APPS_SCRIPT` enthaelt aktuell mehrere Apps-Script-Dateien und sollte spaeter separat analysiert werden. Bis dahin werden dort keine Dateien verschoben, umbenannt oder geloescht.
