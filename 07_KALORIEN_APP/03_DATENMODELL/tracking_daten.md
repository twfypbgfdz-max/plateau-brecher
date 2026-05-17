# Tracking-Daten

## Tagesdatensatz

Geplanter lokaler Datensatz pro Datum:

- `date`: eindeutiges Tagesdatum
- `kcal`: Kalorien
- `protein`: Protein in Gramm
- `carbs`: Kohlenhydrate in Gramm, optional
- `fat`: Fett in Gramm, optional
- `weight`: Koerpergewicht, optional aber im MVP sichtbar
- `water`: Wasser, optional
- `steps`: Schritte, optional
- `notes`: kurze Notiz, optional

## Ziele

Ziele sollen separat gespeichert werden:

- kcal-Ziel
- Protein-Ziel
- optional Gewichtsziel
- optionale Sichtbarkeit fuer carbs, fat, Wasser und Schritte

## Prinzip

Keine Werte raten. Fehlende Werte bleiben leer und werden nicht automatisch aufgefuellt.

