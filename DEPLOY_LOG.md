# Deploy-Log

Dokumentiert, welcher Stand aus dem `App`-Repo zuletzt nach `index.html`
veröffentlicht wurde.

| Datum | App-Version | Deploy-Commit (dieses Repo) | Notiz |
| --- | --- | --- | --- |
| 2026-07-12 | V13.2.4-test | (dieser Commit) | Quelle: `App`-Repo, `01_PERSONAL_APP/tests/plateau-brecher-v13_2_4-test.html` (Commit `3d41193` "feat: add cockpit training summary export"). Aktualisiert `index.html` von V12.8.20-test auf V13.2.4-test: secret-freier Read-only-Cockpit-Export als `training-summary.json`, eigener PLAN-Reiter, Wochenansicht und Tagesdetails, Zyklus-Auswahl in TRAINING und PLAN, persistentes "Nur hier", korrigiertes "Ueberall ersetzen", V13-Plan-Namespaces und Sync-Schutz. Realer iPhone-Safari-Test erfolgreich: PLAN/TRAINING, Cockpit-Download und Tab-Wechsel funktionieren; kein horizontaler Overflow festgestellt. Byte-identisch zur Quelle per Git-Blob geprueft. |
| 2026-07-07 | V12.8.20-test | (dieser Commit) | Quelle: `App`-Repo, `01_PERSONAL_APP/tests/plateau-brecher-v12_8_20-test.html` (Commit `bf8c1f2` „merge: apply audit fixes and document repo split plan"). Aktualisiert `index.html` von V12.8.15-test auf V12.8.20-test: P0/P1-Audit-Fixes (Backend-Auth-Guard, PR-Fastpath-Korrektur, Sync-Verifikation, PR-Rename-Migration, Stagnation/Decline-Fix). Byte-identisch zur Quelle geprüft. |
| 2026-06-24 | V12.8.15-test | `9b7aef5` „deploy: publish personal app v12.8.15" | Letzter bekannter Veröffentlichungsstand vor der Repo-Verschlankung (2026-07-07). |

## Hinweis

Ab der Repo-Verschlankung (2026-07-07, Branch `cleanup/deploy-only`) enthält
dieses Repo nur noch `index.html`, dieses Log und ein schlankes `README.md`.
Neue Einträge hier ergänzen, sobald ein neuer Stand aus `App` veröffentlicht wird.
