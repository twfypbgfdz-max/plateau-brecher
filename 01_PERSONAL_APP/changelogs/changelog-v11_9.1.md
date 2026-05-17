# Plateau-Brecher V11.9.1

## Version
V11.9.1

## Datum
10.05.2026

## Änderungen
- V11.9.1 als stabile persönliche Plateau-Brecher-Version freigegeben.
- Eingebetteter Setup-`SCRIPT_CODE` auf V11.9.1 aktualisiert.
- `APP_VERSION` auf `V11.9.1` gesetzt.
- `SK` bleibt `pb_v11_9`, damit bestehende lokale Daten erhalten bleiben.

## Fixes
- `SCRIPT_CODE` meldet jetzt `API aktiv - V11.9.1`.
- Bestleistungen-Update im eingebetteten Apps-Script-Code an die Struktur A:J angepasst.
- Bulk-Training schreibt Bestleistungen aus dem besten Satz nach 1RM.
- PR-Fallback aktualisiert nur vorhandene 1RM-/Meta-Daten und leert keine Gewicht-/Wdh.-Felder.

## Bekannte Probleme
- `00_AKTUELL\personal_latest.html` existiert aktuell als Ordner. Der Alias konnte deshalb nicht als Datei aktualisiert werden, ohne den bestehenden Ordner zu löschen oder umzubenennen.
- Ein Node-Syntaxcheck wurde in der Sandbox nicht zugelassen; Text- und Strukturchecks waren unauffällig.

## Nächste Schritte
- Entscheiden, wie der bestehende `personal_latest.html`-Ordner in `00_AKTUELL` behandelt werden soll.
- Danach `personal_latest.html` als Alias/Kopie auf V11.9.1 sauber setzen.
- Smarten Deload weiter vorbereiten, ohne Zyklus- oder Speicherlogik umzubauen.
