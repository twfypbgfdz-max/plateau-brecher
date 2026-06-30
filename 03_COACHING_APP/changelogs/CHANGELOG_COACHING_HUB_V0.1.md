# Changelog – Felix Coaching Hub

---

## Version 0.1 – 2026-06-30

### Neue Ordnerstruktur

```
03_COACHING_APP/
  tests/
    coaching-hub-v0_1-test.html   ← Hauptdatei dieser Version
  changelogs/
    CHANGELOG_COACHING_HUB_V0.1.md
  docs/
    README_COACHING_APP.md
```

Kein Eingriff in bestehende Ordner:
- `01_PERSONAL_APP` unverändert
- `02_PUBLIC_APP` unverändert
- `03_APPS_SCRIPT` unverändert
- `04_SHEETS` unverändert
- `07_KALORIEN_APP` unverändert

---

### Neue Hauptdatei

`03_COACHING_APP/tests/coaching-hub-v0_1-test.html`

Komplette Coaching-App als Single-File HTML (HTML + CSS + JS in einer Datei).
Kein externes Framework, kein Build-System, kein CDN-Aufruf.
Läuft offline lokal im Browser.

---

### Ziel der Version 0.1

Einen funktionsfähigen Demo-Prototypen des Felix Coaching Hubs aufbauen.
Grundfunktionen mit lokalem Datenspeicher (localStorage) ohne echte
Backend-Anbindung, ohne Login-Funktion und ohne Zahlungsfunktion.

---

### Enthaltene Funktionen

**Dashboard**
- Begrüßung mit Kundenname
- Anzeige des aktuellen Ziels
- Trainingsfortschritt der laufenden Woche (inkl. Fortschrittsbalken)
- Kalorienziel und Proteinziel
- Coach-Nachricht (aus localStorage, editierbar über Coach-Ansicht)
- Anzeige des letzten Check-ins
- Datum des nächsten Check-in-Termins (Montag)

**Trainingsplan**
- 3 Trainingstage (Tag A / B / C) – Ganzkörper Anfänger
- 6 Übungen pro Tag mit: Name, Sätze × Wiederholungen, Techniknotiz
- Eingabefeld für verwendetes Gewicht
- Checkbox / Toggle-Button „erledigt" pro Übung
- Speicherung der Gewichte und Status in localStorage (Schlüssel: Wochennummer)

**Wochen-Check-in**
- Eingabe: Gewicht (kg), Trainingseinheiten, Cardio/Schritte
- Slider 1–5 für: Schlafqualität, Energie, Hunger, Stress
- Freitext: Wie lief die Woche / Probleme & Schmerzen
- Speicherung in localStorage (`fch_v0_1_checkins`)
- Formular-Reset nach Speichern
- Toast-Bestätigung

**Fortschritt**
- Gewichtsentwicklung als einfaches Balkendiagramm (letzte 8 Einträge)
- Gesamt-Trend (Differenz Startgewicht zu aktuellem Gewicht)
- Tabellarische Check-in-Verlaufsansicht (letzte 12 Einträge)

**Ernährung**
- Tagesziele: Kalorien, Protein, Kohlenhydrate, Fett
- 5 Grundregeln
- 4 Beispielmahlzeiten
- Einkaufsliste mit Basis-Lebensmitteln
- Disclaimer: Nur allgemeine Hinweise für gesunde Personen

**Coach-Ansicht**
- Demo-Kundenprofil (Ziel, Startgewicht, aktuelles Gewicht, Startdatum)
- Anzeige des letzten Check-ins mit allen Werten
- Textarea für Coach-Kommentar → erscheint im Dashboard als Coach-Nachricht
- Vollständige Check-in-Übersicht aller gespeicherten Einträge
- Hinweis: Demo-Ansicht, später mit sicherem Login schützen

**Navigation**
- Mobile Bottom Navigation mit 6 Tabs
- iPhone-sicher: `env(safe-area-inset-bottom)` berücksichtigt
- Aktiver Tab visuell markiert (Farbe + Punkt)

**Datenschutz / Seriosität**
- Disclaimer auf Dashboard, Check-in und Ernährungs-Seite
- Hinweis: ersetzt keine ärztliche Beratung
- Hinweis: Ernährungsempfehlungen nur für gesunde Personen

---

### Bewusst ausgelassene Funktionen (Out of Scope v0.1)

| Feature | Grund |
|---|---|
| Echter Login | Sicherheit – erst bei v1.0 mit Backend |
| Zahlungsfunktion | Nicht Bestandteil des Prototypen |
| Push-Nachrichten | Erfordert Service Worker + Permission-Flow |
| Echte Datenbank | Nicht nötig für lokalen Demo-Test |
| Mehrere Kunden | Nicht skalierbar ohne Backend |
| Admin-Dashboard | Gehört zu einer späteren Version |
| Ernährungs-Tracking / Tagebuch | Zu komplex für v0.1 |
| Fortschrittsfotos | Datenschutz-Komplexität |
| E-Mail-Benachrichtigungen | Erfordert Backend |

---

### localStorage-Keys (Prefix: `fch_v0_1_`)

| Key | Inhalt |
|---|---|
| `fch_v0_1_checkins` | Array aller Check-in-Objekte |
| `fch_v0_1_training_logs` | Objekt mit Gewichten + Done-Status pro Woche |
| `fch_v0_1_coach_note` | Aktueller Coach-Kommentar (String) |

---

### Nächste sinnvolle Schritte (v0.2+)

1. **Mehrere Kundenprofile** – Auswahl über ein Dropdown oder separaten Bereich
2. **Ernährungs-Tagebuch** – einfaches Tracking von Protein-Mahlzeiten
3. **Wochenbericht-Funktion** – automatische Zusammenfassung als Text zum Kopieren für WhatsApp/E-Mail
4. **Fortschrittsfotos-Platzhalter** – Datei-Upload lokal ohne Server
5. **Einfacher PIN-Schutz** für Coach-Ansicht (localStorage-basiert als Interims-Lösung)
6. **Export-Funktion** – Check-in-Daten als CSV oder JSON downloaden
7. **Dark/Light Mode Toggle**
8. **Offline PWA** – Service Worker + Manifest für Installation auf dem iPhone

---

### Dateien dieser Version

| Datei | Status |
|---|---|
| `03_COACHING_APP/tests/coaching-hub-v0_1-test.html` | NEU erstellt |
| `03_COACHING_APP/changelogs/CHANGELOG_COACHING_HUB_V0.1.md` | NEU erstellt |
| `03_COACHING_APP/docs/README_COACHING_APP.md` | NEU erstellt |

Keine bestehenden Dateien wurden verändert.
