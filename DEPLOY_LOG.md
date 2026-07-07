# Deploy-Log

Dokumentiert, welcher Stand aus dem `App`-Repo zuletzt nach `index.html`
veröffentlicht wurde.

| Datum | App-Version | Deploy-Commit (dieses Repo) | Notiz |
| --- | --- | --- | --- |
| 2026-07-07 | V12.8.20-test | (dieser Commit) | Quelle: `App`-Repo, `01_PERSONAL_APP/tests/plateau-brecher-v12_8_20-test.html` (Commit `bf8c1f2` „merge: apply audit fixes and document repo split plan"). Aktualisiert `index.html` von V12.8.15-test auf V12.8.20-test: P0/P1-Audit-Fixes (Backend-Auth-Guard, PR-Fastpath-Korrektur, Sync-Verifikation, PR-Rename-Migration, Stagnation/Decline-Fix). Byte-identisch zur Quelle geprüft. |
| 2026-06-24 | V12.8.15-test | `9b7aef5` „deploy: publish personal app v12.8.15" | Letzter bekannter Veröffentlichungsstand vor der Repo-Verschlankung (2026-07-07). |

## Hinweis

Ab der Repo-Verschlankung (2026-07-07, Branch `cleanup/deploy-only`) enthält
dieses Repo nur noch `index.html`, dieses Log und ein schlankes `README.md`.
Neue Einträge hier ergänzen, sobald ein neuer Stand aus `App` veröffentlicht wird.
