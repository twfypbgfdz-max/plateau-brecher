## Projektkontext

Dieses Repo (`plateau-brecher`) ist die produktive Legacy-/Fallback-App
(„V14"). `plateau-brecher-v15` ist das aktuelle, vollständig getrennte
Nachfolgeprojekt; V14 bleibt unverändert produktiv, bis eine ausdrückliche
Cutover-Entscheidung fällt (siehe `plateau-brecher-v15/README.md`).

## Parallele-Sessions-Sperre

Vor jeder schreibenden Aktion (Commit, Push, Deploy, Datei-Änderung mit
Absicht zu committen) in diesem Repo:

1. Prüfen, ob `.agent-lock.json` im Repo-Root existiert und noch nicht
   abgelaufen ist (`expiresAt` in der Zukunft) mit einer anderen
   `sessionId`.
2. Falls ja: Felix explizit fragen, ob parallel gearbeitet werden darf,
   bevor irgendetwas Schreibendes ausgeführt wird.
3. Falls nein: eigene `.agent-lock.json` anlegen
   (`{ sessionId, tool, startedAt, expiresAt = jetzt + 30 Minuten,
   workingDir }`) und bei Sessionende wieder entfernen.

`.agent-lock.json` ist in `.gitignore` und wird niemals committed.

Für Claude Code übernimmt bereits ein PreToolUse-/SessionEnd-Hook diese
Prüfung automatisch (siehe `.claude\settings.json` sowie
`.claude\hooks\scripts\agent-lock-guard.mjs` und `agent-lock-cleanup.mjs`
im zentralen KI-Workspace `C:\Users\felil\Documents\KI`). Für Tools ohne
eigenes Hook-System (z. B. Codex) gilt die obige Konvention manuell.

Bekannter Unterschied zu AI-Router, felix-cockpit und felix-command-center:
Dieses Repo hat (Stand jetzt) keine lokalen `pre-commit`/`pre-push`-Git-Hooks,
die einen fremden Lock zusätzlich hart auf Git-Ebene blockieren. Der Schutz
gilt hier ausschließlich über die obige Konvention und den Claude-Code-Hook.
`scripts/git-hooks/pre-commit`/`pre-push` in den genannten Repos können bei
Bedarf als Vorlage übernommen werden.

## Hinweis: Verwaistes Lock nach Absturz

Wenn eine Session hart abstürzt (Terminal-Kill, Systemabsturz), greift der
SessionEnd-Cleanup-Hook nicht mehr. Das Lock bleibt dann bis zu 30 Minuten
bestehen, auch wenn die haltende Session nicht mehr existiert.

Falls das auftritt und sicher ist, dass keine andere Session mehr aktiv
läuft: `.agent-lock.json` im Repo-Root manuell löschen. Danach funktionieren
Commits wieder normal.
