# Admin-Log-Receiver

## Zweck

Dieser Ordner ist fuer den spaeteren lokalen Export des echten Apps-Script-Receivers fuer das Google Sheet `Plateau-Brecher Admin-Logs` vorgesehen.

Der Receiver ist die schreibende Web-App-Logik. Er ist getrennt von `03_APPS_SCRIPT/admin_logs_alerts/`, das Admin-Logs nur liest und Benachrichtigungen vorbereitet.

## Status

- Echter deployed Receiver-Code ist hier noch nicht vorhanden.
- Es wurde kein Receiver neu erfunden.
- Es wurde kein Deployment erstellt.
- Es wurden keine Trigger erstellt.
- Es wurden keine Sheet-Inhalte oder App-Dateien geaendert.

## Erwartete spaetere Aufgaben

- Echten `doPost(e)`-Code aus dem aktiven Apps-Script-Projekt exportieren.
- Pruefen, ob in `Personal_Logs` und `Public_Logs` geschrieben wird.
- Pruefen, ob `env=PERSONAL` nach `Personal_Logs` routet.
- Pruefen, ob `env=PUBLIC` nach `Public_Logs` routet.
- Pruefen, ob die aktuelle Admin-Log-Spaltenstruktur respektiert wird.
- Interne Trainingssheet-Logs wie `Fehlerprotokoll` nicht mit dem Admin-Sheet-Receiver verwechseln.

## Sicherheitsregeln

- Keine Sheet-IDs ins Repo schreiben.
- Keine Web-App-URLs ins Repo schreiben.
- Keine Webhooks, Tokens, API-Keys oder Secrets ins Repo schreiben.
- Keine echten Empfaengeradressen oder privaten Daten dokumentieren.
- Konfiguration spaeter ueber Apps Script Properties oder gebundene Script-Kontexte loesen.

## Geplante Datei

- `AdminLogReceiver.gs`: Platzhalter fuer den spaeteren echten Export.
