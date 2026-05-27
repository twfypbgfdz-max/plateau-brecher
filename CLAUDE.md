# CLAUDE.md

## Projekt

Plateau-Brecher / App-Brecher
Private Trainings- und Analyse-App mit getrennten Bereichen für:

* PERSONAL_APP
* PUBLIC_APP
* APPS_SCRIPT
* Admin-Logs/Alerts
* Kalorien-App
* Sandbox-Experimente

Arbeitsumgebung:

* VS Code
* Codex
* Claude / Claude Code
* Git + GitHub
* Google Sheets + Apps Script
* iPhone Mobile Tests

---

# Wichtige Grundregeln

## Erst analysieren, dann ändern

Immer:

1. Analyse
2. Patchplan
3. kleine sichere Änderungen

Keine großen Refactors ohne explizite Freigabe.

---

# Sicherheitsregeln

## Niemals direkt ändern

Besonders vorsichtig behandeln:

* Stable-Dateien
* produktive HTML-Dateien
* aktive Apps-Script-Dateien
* Sheet-Strukturen
* SCRIPT_CODE
* PLAN-Logik

Vor größeren Änderungen:

* Testdatei erstellen
* Backup erstellen
* isoliert testen

---

# Bereichstrennung

## PERSONAL_APP

Ordner:
`01_PERSONAL_APP`

Enthält:

* private Trainingsdaten
* Analysefunktionen
* PR-System
* Readiness
* Deload
* Coach-/Analyse-Logik

Wichtig:

* keine Vermischung mit PUBLIC_APP
* keine Public-Vereinfachungen direkt übernehmen
* Sync-Logik defensiv behandeln

---

## PUBLIC_APP

Ordner:
`02_PUBLIC_APP`

Ziel:

* einfache öffentliche Mobile-Version
* ruhige UI
* Performance
* einfache Bedienung

Wichtig:

* keine privaten Analysefunktionen übernehmen
* keine Admin-/Debug-/Personal-Systeme integrieren
* simpel halten

---

## APPS_SCRIPT

Ordner:
`03_APPS_SCRIPT`

Wichtig:

* niemals Secrets im Code speichern
* Script Properties nutzen
* keine Webhooks/Tokens hardcoden
* Trigger nur mit expliziter Freigabe erstellen

---

## Sandbox

Ordner:
`98_SANDBOX_CODEX`

Nur für:

* Experimente
* Testumbauten
* große Ideen
* UI-Tests
* Codex-Spielwiese

Regeln:

* niemals echte Produktivdateien ändern
* keine Deployments
* keine Sheet-Änderungen
* keine echten Trigger
* keine Secrets
* keine automatischen Pushes

Sandbox ist strikt getrennt.

---

# Git-Regeln

Repository:
`twfypbgfdz-max/App`

Branches:

* `main` = stabil
* `dev` = Entwicklung

Regeln:

* kleine Commits
* klar benannte Commit-Messages
* keine unnötigen Massenänderungen
* vor Push kurz prüfen
* `main` bewusst stabil halten

---

# Public Deploy

Wichtig:
Das Hauptrepo deployed NICHT automatisch auf GitHub Pages.

Public Deploy läuft separat über:
`Public-Brecher`

Ablauf:

1. gewünschte Public-Testdatei auswählen
2. nach `index.html` kopieren
3. committen
4. nach `origin main` pushen

---

# Kalorien-App

Source of Truth:
`07_KALORIEN_APP`

Public-/Deploy-Repo getrennt halten.

Keine automatische Vermischung mit Plateau-Brecher.

---

# Mobile Tests

Tests häufig auf:

* iPhone
* Live Server
* lokalem Netzwerk

UI immer:

* mobile-first
* touchfreundlich
* ruhig
* performant

---

# Arbeitsstil

Bevorzugt:

* defensive Änderungen
* kleine isolierte Patches
* bestehende Architektur respektieren
* vorhandene Systeme stabil halten

Vermeiden:

* komplette Umbauten
* aggressive Optimierungen
* unnötige Dependencies
* automatische Strukturänderungen
* stilles Löschen/Verschieben wichtiger Dateien

---

# Codex vs Claude

## Codex bevorzugt für:

* kleine Fixes
* schnelle UI-Patches
* HTML/CSS
* kleine JS-Änderungen
* Routinearbeit
* Git-Workflow

## Claude bevorzugt für:

* Architektur
* Risikoanalyse
* komplexe Debugs
* Strukturentscheidungen
* größere Planung
* defensive Patchstrategien
* Projektorganisation

---

# Admin-Alert-System

Status:

* lokal vorbereitet
* Gmail zuerst
* Discord später optional

Später möglich:

* Cooldown-System
* Retry-Logik
* Sammelmail
* tägliche Zusammenfassung
* Dashboard-Status

Keine echten Empfänger/Webhooks/Tokens im Code speichern.

---

# Allgemeine Priorität

Stabilität wichtiger als Features.

Saubere kleine sichere Schritte bevorzugen.
