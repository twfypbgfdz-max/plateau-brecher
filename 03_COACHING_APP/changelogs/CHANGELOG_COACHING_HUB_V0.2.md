# Changelog – Felix Coaching Hub

---

## Version 0.2 – 2026-07-03

### Neue Dateien

```
03_COACHING_APP/tests/
  coaching-hub-v0_2-test.html   ← Hauptdatei v0.2
  manifest.json                 ← PWA Manifest
  sw.js                         ← Service Worker (Offline-Cache)
  icon.svg                      ← App-Icon (SVG)
03_COACHING_APP/changelogs/
  CHANGELOG_COACHING_HUB_V0.2.md
```

**v0.1 bleibt unverändert** – keine bestehenden Dateien verändert.

---

### Feature 1: Mehrere Kundenprofile

**Was wurde gebaut:**
- 3 Demo-Profile: Max Mustermann, Sarah Müller, Tom Fischer
- Profilwechsel über Dropdown im Header (immer sichtbar)
- Jedes Profil hat eigene: Ziel, Startgewicht, Startdatum, Kalorienziel, Proteinziel
- **Getrennter localStorage-Namespace** pro Profil:
  - `fch_v0_1_max_checkins`, `fch_v0_1_max_training_logs`, `fch_v0_1_max_coach_note`
  - `fch_v0_1_sarah_checkins`, usw.
- Dashboard und Ernährungsseite aktualisieren sich automatisch beim Profilwechsel
- Aktives Profil wird global gespeichert (`fch_v0_1_active_profile`)

**Storage-Logik:**
- `storeG(key)` / `loadG(key)` → Profil-unabhängig (PIN, aktives Profil)
- `store(key)` / `load(key)` → Profil-spezifisch (checkins, training_logs, coach_note)

---

### Feature 2: PIN-Schutz für Coach-Ansicht

**Was wurde gebaut:**
- Coach-Tab öffnet fullscreen PIN-Overlay statt direkt die Coach-Ansicht
- 4-stelliger numerischer PIN (Standard: `1234`)
- PIN-Input mit `inputmode="numeric"` (iPhone zeigt Ziffernblock)
- Falscher PIN → Fehlermeldung + Input leeren
- Richtiger PIN → Coach-Ansicht entsperrt für die gesamte Sitzung
- **„Sitzung sperren"**-Button in der Coach-Ansicht
- **PIN ändern**-Funktion direkt in der Coach-Ansicht
- PIN global gespeichert: `fch_v0_1_coach_pin`

**Sicherheitshinweis:** Reine localStorage-Lösung, kein echter Schutz –
für Demo und interne Nutzung ausreichend. Echter Login folgt in v1.0.

---

### Feature 3: Wochenbericht-Export

**Was wurde gebaut:**
- „📋 Wochenbericht"-Button im Fortschritt-Tab
- Generiert formatierten Text aus dem letzten Check-in:
  - KW-Nummer, Kundenprofil, Datum
  - Körper (Gewicht, Startgewicht, Differenz)
  - Training (Einheiten, Cardio)
  - Subjektive Werte mit Sternen (⭐)
  - Freitext-Felder
  - Aktuelle Coach-Nachricht
- Öffnet als Bottom-Sheet Modal
- **„In Zwischenablage kopieren"**-Button mit `navigator.clipboard` API
  (Fallback: `execCommand('copy')` für ältere Browser)
- Direktes Teilen per WhatsApp/iMessage durch Kopieren möglich

---

### Feature 4: CSV-Export

**Was wurde gebaut:**
- „⬇ CSV Export"-Button im Fortschritt-Tab
- Exportiert alle gespeicherten Check-ins des aktiven Profils
- Format: Semikolon-separiert (`;`) für Excel unter Windows/macOS
- BOM (`﻿`) für korrekte UTF-8-Erkennung in Excel
- Felder: Datum, Gewicht, Einheiten, Cardio, Schlaf, Energie, Hunger, Stress, Wochenbericht, Probleme
- Dateiname: `checkins_[profilId]_[datum].csv`
- Download via Blob-URL, kein Server nötig

---

### Feature 5: PWA-Unterstützung

**Was wurde gebaut:**

`manifest.json`
- App-Name, Short Name, Beschreibung
- `display: standalone` (kein Browser-Chrome bei Installation)
- Theme-Color: `#00c896`
- Background-Color: `#0f0f0f`
- Icon: `icon.svg`

`sw.js` (Service Worker)
- Strategie: Cache First, dann Netzwerk
- Precacht: HTML, Manifest, Icon
- Aktivierung: alten Cache aufräumen
- Offline-Nutzung nach erstem Laden möglich

`icon.svg`
- Grünes „F" auf dunklem Hintergrund
- Passt zu App-Farbschema

**Meta-Tags im HTML** (iOS)
- `apple-mobile-web-app-capable` – Standalone-Mode auf iOS
- `apple-mobile-web-app-status-bar-style` – schwarze Statusbar
- `apple-mobile-web-app-title` – Name bei „Zum Home-Bildschirm"
- `theme-color` – Browser-Chrome-Farbe auf Android

**Einschränkungen:**
- SW funktioniert NUR auf `http://` oder `https://`, NICHT auf `file://`
- SW-Registrierung wird automatisch übersprungen bei `file://`-Aufruf
- Für iPhone-Installation: Live Server oder HTTPS-Deploy nötig

---

### Technische Details

#### Neue localStorage Keys

| Key | Scope | Inhalt |
|---|---|---|
| `fch_v0_1_active_profile` | global | ID des aktiven Profils |
| `fch_v0_1_coach_pin` | global | 4-stelliger PIN (String) |
| `fch_v0_1_[id]_checkins` | profil | Check-in Array |
| `fch_v0_1_[id]_training_logs` | profil | Trainings-Logs |
| `fch_v0_1_[id]_coach_note` | profil | Coach-Nachricht |

#### Neue JS-Funktionen

| Funktion | Beschreibung |
|---|---|
| `storeG()` / `loadG()` | Globaler (profil-unabhängiger) Speicher |
| `store()` / `load()` | Profil-spezifischer Speicher |
| `switchProfile(id)` | Profil wechseln, Daten neu laden |
| `getCurrentProfile()` | Aktives Profil-Objekt zurückgeben |
| `reloadData()` | checkins + trainLogs neu laden |
| `showPinOverlay()` | PIN-Overlay anzeigen |
| `closePinOverlay()` | PIN-Overlay schließen |
| `checkPin()` | PIN prüfen, bei Erfolg Coach öffnen |
| `lockCoach()` | Coach-Ansicht sperren |
| `changePin()` | PIN ändern und in localStorage speichern |
| `navigateTo(section)` | Direkte Navigation ohne PIN-Check |
| `navigate(section)` | Navigation mit PIN-Check für Coach |
| `renderNutrition()` | Ernährungsziele profil-dynamisch rendern |
| `generateReport()` | Wochenbericht erstellen und Modal öffnen |
| `closeReport()` | Report-Modal schließen |
| `copyReport()` | Berichttext in Zwischenablage kopieren |
| `exportCSV()` | CSV-Download auslösen |

---

### Bewusst ausgelassen (Out of Scope v0.2)

- Echter sicherer Login (v1.0)
- Ernährungs-Tagebuch
- Fortschrittsfotos
- E-Mail / Benachrichtigungen
- Mehrere Trainingspläne pro Profil
- Push-Nachrichten

---

### Nächste sinnvolle Schritte (v0.3+)

1. **Persönlicher Trainingsplan pro Profil** – statt einem globalen Plan für alle
2. **Ernährungs-Tagebuch** – tägliches Protein/Kalorien-Tracking
3. **Fortschrittsfotos-Platzhalter** – lokaler Base64-Upload
4. **Dark/Light Mode Toggle** – manuell umschaltbar
5. **Echter sicherer Login** – mit Backend oder Passwort-Hashing (v1.0)
