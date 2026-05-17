# Aktuelle Apps-Script-Quelle

Dieser Ordner ist die aktive Personal-/Trainingsscript-Quelle.

## Abgrenzung

- Dieser Ordner gehoert nicht zur `PUBLIC_APP`.
- Dieser Ordner gehoert nicht zu den Admin-Log-Alerts.
- Admin-Alerts liegen separat in `03_APPS_SCRIPT/admin_logs_alerts/`.

## Versionierung

- `.clasp.json` darf nie committed werden.
- `appsscript.json` ist versionierbar, aber sicherheitsrelevant vor jedem Commit zu pruefen.
- Harte Sheet-IDs im Code bewusst pruefen. Langfristig sind `PropertiesService` oder ein gebundenes Script besser.

## Deployment

Kein `clasp push` und keine Deployments ohne ausdrueckliche Freigabe.
