# Admin-Log-Alerts

Lokale Vorbereitung fuer automatische Benachrichtigungen zu neuen P0/P1-Fehlern im Admin-Sheet.

## Zweck

Diese Struktur ist fuer eine spaetere Apps-Script-Automation vorgesehen, die neue kritische Fehler im Google Sheet `Plateau-Brecher Admin-Logs` erkennt und meldet.

## Ziel-Sheet

- Google Sheet: `Plateau-Brecher Admin-Logs`
- Tabs:
  - `Personal_Logs`
  - `Public_Logs`

## Alert-Bedingung

Benachrichtigungen sollen nur fuer Log-Zeilen ausgeloest werden, wenn beide Bedingungen gelten:

- `Status = offen`
- `Prioritaet = P0` oder `Prioritaet = P1`

## Aktueller lokaler Stand

- Dry-Run existiert.
- P0/P1-Scan existiert.
- `Personal_Logs` und `Public_Logs` werden getrennt geprueft.
- Header werden ueber Spaltennamen erkannt.
- Deduping ueber Apps Script Properties existiert lokal.
- Gmail-Versand kann manuell getestet werden.
- `scanAdminLogAlerts()` bleibt Dry-Run und schreibt keine Properties.
- `dryRunAdminLogAlerts()` bleibt Dry-Run und schreibt keine Properties.
- `scanAdminLogAlertsWithDeduping()` ist kein reiner Dry-Run mehr, weil neue Alert-Keys in Script Properties geschrieben werden.
- `scanAdminLogAlertsAndNotify()` sendet Gmail-Nachrichten nur fuer neue Alerts und speichert Dedup-Keys erst nach erfolgreichem Mailversand.
- Dedup-Key nutzt primaer stabile Alert-Felder: `app`, `priority`, `type`, `version`, `area`, `file`, `message`.
- `rowNumber` wird nur noch als Fallback genutzt, wenn die stabilen Felder leer sind.

## Kanal

Bevorzugter Kanal ist ein Discord Webhook.

Der Discord-/Webhook-Versand ist aktuell noch No-op. `sendDiscordAlert_()` sendet nichts.

## Secrets

Secrets werden spaeter ausschliesslich ueber Apps Script Properties abgelegt:

- `ADMIN_ALERT_EMAIL_TO`
- optional `ADMIN_ALERT_EMAIL_ENABLED`
- `DISCORD_WEBHOOK_URL`
- optional `ADMIN_LOG_SPREADSHEET_ID`

Keine Secrets, privaten Sheet-IDs, Webhook-URLs oder Tokens ins Repo schreiben.

## Manueller Testablauf

1. Script Property `ADMIN_ALERT_EMAIL_TO` setzen.
2. Optional `ADMIN_ALERT_EMAIL_ENABLED=true` setzen oder leer lassen.
3. `testAdminAlertConfig()` ausfuehren und Logs pruefen.
4. `sendTestAdminAlert()` manuell ausfuehren.
5. `dryRunAdminLogAlerts()` ausfuehren.
6. `scanAdminLogAlertsAndNotify()` erst danach manuell ausfuehren.
7. `setupAdminAlertTrigger()` manuell ausfuehren, wenn der automatische Lauf aktiviert werden soll.
8. `removeAdminAlertTriggers()` manuell ausfuehren, wenn der automatische Lauf deaktiviert werden soll.

## Abgrenzung

`03_APPS_SCRIPT/aktuell` bleibt getrennt von diesen Admin-Alerts und wird dadurch nicht veraendert.

## Dateien

- `AdminAlerts.gs`
- `AdminAlertSetup.gs`

## Status

- Lokale Dry-Run-Implementierung vorhanden.
- Lokales Deduping ueber Script Properties vorhanden.
- Manueller Gmail-Versand vorhanden.
- Manuell getestet: `sendTestAdminAlert()` hat eine Testmail gesendet.
- Manuell getestet: `scanAdminLogAlertsAndNotify()` hat eine Alert-Mail fuer einen neuen offenen P0/P1-Eintrag gesendet.
- Manuell getestet: zweiter Notify-Lauf hat Deduping korrekt erkannt (`gesamt=1 bekannt=1 gesendet=0 fehlgeschlagen=0`).
- Trigger-Setup-Code vorhanden: `setupAdminAlertTrigger()` erstellt gezielt einen Zeittrigger fuer `scanAdminLogAlertsAndNotify()` alle 30 Minuten.
- Trigger-Remove-Code vorhanden: `removeAdminAlertTriggers()` entfernt nur Trigger fuer `scanAdminLogAlertsAndNotify()`.
- Trigger werden nicht automatisch erstellt; Aktivierung erfolgt nur durch manuellen Funktionsaufruf im Apps Script Editor.
- Noch keine Webhooks aktiv.
- Kein Deployment erfolgt.
- Keine Google-Sheet-Aenderungen durch diese lokale Struktur.
