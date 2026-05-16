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

Benachrichtigungen sollen nur fuer Log-Zeilen ausgelöst werden, wenn beide Bedingungen gelten:

- `Status = offen`
- `Priorität = P0` oder `Priorität = P1`

## Kanal

Bevorzugter Kanal ist ein Discord Webhook.

## Secrets

Secrets werden spaeter ausschliesslich ueber Apps Script Properties abgelegt:

- `DISCORD_WEBHOOK_URL`
- optional `ADMIN_LOG_SPREADSHEET_ID`

Keine Secrets, privaten Sheet-IDs, Webhook-URLs oder Tokens ins Repo schreiben.

## Abgrenzung

`03_APPS_SCRIPT/aktuell` bleibt getrennt von diesen Admin-Alerts und wird dadurch nicht veraendert.

## Geplante Dateien

- `AdminAlerts.gs`
- `AdminAlertSetup.gs`

## Status

- Noch keine aktive Implementierung.
- Noch keine Trigger aktiv.
- Noch keine Webhooks aktiv.
