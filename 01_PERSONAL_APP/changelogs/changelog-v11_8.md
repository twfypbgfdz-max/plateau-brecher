# Plateau-Brecher — Changelog V11.8

**Datum:** 10.05.2026  
**Datei:** `plateau-brecher-v11_8.html`  
**Storage Key:** `pb_v11_8`  
**Migration von:** `pb_v11_7` → `pb_v11_6` → ... → `pb_v9_2`

---

## Änderungen

### Gemini komplett entfernt
- Gemini API Key Input, Model-Button, alle API Calls entfernt
- `saveGeminiKey()`, `runExpertAnalysis()` entfernt
- Alle `generativelanguage.googleapis.com` Referenzen weg
- **Groq bleibt als einzige externe KI**

### Smart Deload Signal (regelbasiert, lokal)
- `calcDeloadSignal()` — Score aus 5 Regeln: RPE-Niveau, RPE-Trend, 1RM-Trend, Stagnation, Wochen seit Deload
- Anzeige im `selfCheck()`-Banner — keine Planänderung, nur Empfehlung
- Deload-Signal fließt in `buildKiContext()` ein

### Datenquellen-Info im Setup
- Info-Box: `Aktive Datenquelle: ZYKLUS 1–6 · ZYKLUS MASTER wird nicht verwendet`

### SCRIPT_CODE aktualisiert
- V10.8.1 → V11.8

---

## Deployment

- **GitHub:** als `index.html` pushen
- **Apps Script:** keine Änderung nötig
- **Sheet:** keine Änderung nötig
