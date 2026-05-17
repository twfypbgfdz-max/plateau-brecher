# Changelog 2026-05-17

## Geaendert

- Lokale Struktur fuer Admin-Log-Alerts vorbereitet.
- README fuer Zweck, Ziel-Sheet, Tabs, Alert-Bedingung, Discord-Kanal und Secret-Ablage erstellt.
- Dry-Run-Stand dokumentiert.
- P0/P1-Scan fuer `Personal_Logs` und `Public_Logs` dokumentiert.
- Lokales Deduping ueber Apps Script Properties dokumentiert.
- Hinweis ergaenzt: `scanAdminLogAlertsWithDeduping()` ist kein reiner Dry-Run mehr, weil Script Properties geschrieben werden.
- Dedup-Key robuster dokumentiert: primaer stabile Alert-Felder, `rowNumber` nur noch als Fallback.
- Minimalen manuellen Gmail-Versand dokumentiert.
- Script Properties `ADMIN_ALERT_EMAIL_TO` und optional `ADMIN_ALERT_EMAIL_ENABLED` dokumentiert.
- Manuelles Testergebnis dokumentiert: Testmail erfolgreich.
- Manuelles Testergebnis dokumentiert: echte Notify-Funktion hat eine Alert-Mail gesendet.
- Manuelles Testergebnis dokumentiert: zweiter Notify-Lauf wurde durch Deduping korrekt unterdrueckt (`gesamt=1 bekannt=1 gesendet=0 fehlgeschlagen=0`).
- Trigger-Setup fuer `scanAdminLogAlertsAndNotify()` alle 30 Minuten dokumentiert.
- Trigger-Entfernung fuer exakt diesen Handler dokumentiert.

## Umgesetzt

- Lokale Dry-Run-Logik in `AdminAlerts.gs`.
- Getrennter Scan von `Personal_Logs` und `Public_Logs`.
- Header-Erkennung ueber Spaltennamen.
- P0/P1-Erkennung fuer offene Logs.
- Lokales Deduping ueber Script Properties.
- Robusterer Dedup-Key ohne primaere Abhaengigkeit von `rowNumber`.
- Manueller Gmail-Testversand mit `sendTestAdminAlert()`.
- Gmail-Notify-Funktion `scanAdminLogAlertsAndNotify()` ohne Trigger.
- Config-Pruefung fuer Gmail-Properties.
- Erfolgreicher manueller Gmail-Testlauf ohne Trigger.
- Gezieltes Trigger-Setup ohne doppelte Trigger.
- Gezieltes Entfernen nur der Admin-Alert-Trigger.

## Noch nicht umgesetzt

- Kein Trigger automatisch erstellt.
- Keine Discord-Webhooks.
- Discord-/Webhook-Versand bleibt No-op.
- Keine echten Secrets.
- Kein Deployment.
- Keine Google-Sheet-Aenderungen.
- Keine App-Datei-Aenderungen.
- Keine Empfaengeradresse im Code.
