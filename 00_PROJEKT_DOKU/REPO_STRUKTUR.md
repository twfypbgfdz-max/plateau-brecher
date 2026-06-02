# Repo-Struktur

Diese Datei ist die zentrale Repo-Dokumentation fuer das gesamte Projekt.

## Source-of-Truth

Das Repo `twfypbgfdz-max/App` ist die Source-of-Truth.

Hier wird entwickelt. Die anderen Repos dienen nur der Veroeffentlichung der jeweiligen App.

## Repos

### 1. App

GitHub: `twfypbgfdz-max/App`

Lokaler Pfad: `C:\Users\felil\OneDrive\2 Dokumente\App`

Zweck: Hauptrepo / Source-of-Truth

Enthaelt:
- Personal App
- Public App
- Apps Script
- Kalorien-App
- Social-Media-App
- Dokumentation

Regel: Hier wird entwickelt.

### 2. Plateau-Brecher

GitHub: `twfypbgfdz-max/plateau-brecher`

Lokaler Pfad: `C:\Users\felil\OneDrive\2 Dokumente\Plateau-Brecher`

Zweck: Live-/Deploy-Repo der Personal-App

Regel: Keine Entwicklung. Nur veroeffentlichen.

Quelle: `App/00_AKTUELL/personal_latest/`

### 3. Public-Brecher

GitHub: `twfypbgfdz-max/Public-Brecher`

Zweck: Live-/Deploy-Repo der Public-App

Quelle: `02_PUBLIC_APP`

### 4. kalorien-app

GitHub: `twfypbgfdz-max/kalorien-app`

Zweck: Live-/Deploy-Repo der Kalorien-App

Quelle: `07_KALORIEN_APP`

### 5. Social-Media-App

GitHub: `twfypbgfdz-max/Social-Media-App`

Zweck: Live-/Deploy-Repo der Social-Media-App

Quelle: `08_SOCIAL_MEDIA_APP`

## Standard-Ablauf

Neue Funktion
-> Entwicklung im App-Repo

Test
-> Testdatei unter `tests/`

Freigabe
-> Stable unter `00_AKTUELL`

Veroeffentlichung
-> jeweiliges Deploy-Repo
