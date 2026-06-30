# Felix Coaching Hub – README

Ordner: `03_COACHING_APP`

---

## Zweck

Der Felix Coaching Hub ist eine eigenständige Web-App für einfaches
Fitness- und Ernährungscoaching. Der Kunde sieht seinen Trainingsplan,
füllt wöchentliche Check-ins aus und verfolgt seinen Fortschritt.
Felix als Coach hat eine separate Demo-Ansicht zum Einsehen der Check-ins
und Hinterlassen von Nachrichten.

Die App ist als Single-File HTML gebaut: kein externes Framework,
kein Build-System, kein CDN, keine externen Requests.
Sie funktioniert vollständig offline lokal im Browser.

---

## Abgrenzung zu 01_PERSONAL_APP

| | PERSONAL_APP | COACHING_APP |
|---|---|---|
| Zielgruppe | Ich selbst (privat) | Coaching-Kunden |
| Daten | Meine echten Trainingsdaten | Demo-Daten / Kundendaten |
| Funktionen | PR-System, Readiness, Deload, Analyse | Trainingsplan, Check-in, Fortschritt |
| Komplexität | Hoch (multi-layer Logik) | Einfach, übersichtlich |
| Datenspeicher | Sheets + Apps Script | localStorage (lokal) |
| Öffentlichkeit | Rein privat | Für Coaching-Kunden |

**Keine Funktionen** aus der Personal App werden hier übernommen.
**Keine Sync-Logik** mit Sheets in v0.1.

---

## Abgrenzung zu 02_PUBLIC_APP

| | PUBLIC_APP | COACHING_APP |
|---|---|---|
| Zielgruppe | Allgemeine Öffentlichkeit | Spezifische Coaching-Kunden |
| Features | Öffentliches Training / Info | Individueller Plan + Check-in |
| Admin-Funktionen | Keine | Coach-Ansicht (Demo) |
| Design-Philosophie | Einfach, ruhig | Fitness-Hub, strukturiert |
| Deployment | GitHub Pages (Public-Brecher) | Lokal / separates Deploy |

**Keine Inhalte** aus der Public App werden hier übernommen.
**Kein Deployment** über Public-Brecher in v0.1.

---

## Aktueller Stand (v0.1)

- Einzelne HTML-Datei: `tests/coaching-hub-v0_1-test.html`
- Demo-Kundenprofil: Max Mustermann
- 3 Trainingstage (A, B, C) mit je 6 Übungen (Ganzkörper, Anfänger)
- Wochen-Check-in mit Speicherung in localStorage
- Gewichtskurve (einfaches Balkendiagramm)
- Ernährungs-Seite mit Zielen, Regeln, Beispielmahlzeiten
- Coach-Ansicht (Demo, ohne Login)
- Mobile Bottom Navigation
- iPhone-freundlich (safe-area-inset)

Kein echter Login, keine Datenbank, keine Zahlungsfunktion.

---

## Lokale Testanleitung

### Direkt im Browser öffnen (einfachste Methode)

```
03_COACHING_APP/tests/coaching-hub-v0_1-test.html
→ Doppelklick oder "Open with Browser"
```

Die Datei funktioniert direkt als `file://` URL.
localStorage funktioniert lokal ohne Server.

### Mit Live Server (VS Code)

1. Rechtsklick auf `coaching-hub-v0_1-test.html`
2. „Open with Live Server"
3. App öffnet sich unter `http://127.0.0.1:5500/...`

### Im Netzwerk testen (iPhone)

1. Live Server starten
2. IP-Adresse des Computers ermitteln (z.B. `192.168.1.42`)
3. Im iPhone-Browser aufrufen: `http://192.168.1.42:5500/03_COACHING_APP/tests/coaching-hub-v0_1-test.html`

---

## Daten zurücksetzen

Alle gespeicherten Daten können im Browser-Dev-Tools gelöscht werden:

```
Browser DevTools → Application → Local Storage → localhost
→ Alle Keys mit Prefix "fch_v0_1_" löschen
```

Oder in der Browser-Konsole:

```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('fch_v0_1_'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

---

## Geplante Versionen

### v0.2
- Mehrere Kundenprofile wählbar
- Einfacher PIN-Schutz für Coach-Ansicht
- Wochenbericht als kopierbarer Text

### v0.3
- Ernährungs-Tagebuch (einfaches Protein-Tracking)
- Export-Funktion (CSV / JSON Download)
- Fortschrittsfotos-Platzhalter

### v1.0
- Echter sicherer Login
- Backend-Anbindung (optional)
- PWA / installierbar auf iPhone

---

## Hinweise

- Die App enthält keine echten Kundendaten – nur Demo-Daten.
- Keine Secrets, Tokens, Webhooks oder echte Empfänger im Code.
- Kein automatischer Deploy in v0.1.
- Änderungen immer isoliert testen, bevor größere Refactors gemacht werden.
- Datei ist bewusst einfach gehalten – keine vorzeitige Abstraktion.
