// ============================================================
// PLATEAU-BRECHER — Admin-Log Receiver
// Version:       V11.8 (Personal) | V15.0 (Public)
// Sheet:         Plateau-Brecher Admin-Logs
// Sheet-ID:      1wYYujHKRM3E1HuScU2q5JWTGRJHhZp2FIhZlhVTctnk
// Tabs:          Personal_Logs | Public_Logs
// Spalten A-M:   Zeitstempel | App-Version | Env | Typ |
//                Fehlermeldung | Detail | URL | Gerät/OS |
//                Stacktrace | HTTP Status | Status | Notiz | Fix-Version
// ============================================================

const LOG_SHEET_ID = '1wYYujHKRM3E1HuScU2q5JWTGRJHhZp2FIhZlhVTctnk';

// Bekannte App-Versionen — nur zur Validierung / Dokumentation
const KNOWN_VERSIONS = ['V11.8', 'V15.0'];

function doPost(e) {
  // ── LockService: parallele Writes serialisieren ───────────
  const lock = LockService.getScriptLock();
  let lockAcquired = false;
  try {
    lock.waitLock(8000); // max 8s warten
    lockAcquired = true;
  } catch (lockErr) {
    // Lock-Timeout → trotzdem versuchen zu loggen, kein harter Abbruch
  }

  try {
    // ── Payload parsen ────────────────────────────────────────
    let data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (_) {
      return ok('ignored: invalid JSON');
    }

    // ── Felder normalisieren ──────────────────────────────────
    const appVersion = String(data.appVersion || data.ver || data.version || '').trim() || '—';
    const env        = String(data.env        || '').trim().toUpperCase();
    const rawType    = String(data.type       || data.typ || 'UNKNOWN').trim().toUpperCase();
    const typeDetail = String(data.type_detail || '').trim().toUpperCase();
    const type       = rawType === 'LOG' && typeDetail ? typeDetail : rawType;
    const message    = String(data.msg        || data.message || '').substring(0, 500);
    const detail     = String(data.detail     || '').substring(0, 500);
    const url        = String(data.url        || '').substring(0, 300);
    const device     = String(data.device     || data.userAgent || '').substring(0, 300);
    const stack      = String(data.stack      || data.stacktrace || '').substring(0, 800);
    const httpStatus = String(data.httpStatus || data.status || '').trim();
    const priority   = type === 'SYNC_FINAL_ERROR' ? 'P1' : '';
    const area       = type === 'SYNC_FINAL_ERROR'
      ? (env === 'PERSONAL' ? 'PERSONAL_SYNC' : 'SYNC')
      : '';

    // ── Version-Flag: unbekannte Version markieren ────────────
    // (kein Abbruch — nur Typ-Präfix für leichteres Filtern)
    const effectiveVersion = KNOWN_VERSIONS.includes(appVersion)
      ? appVersion
      : appVersion + ' [unbekannt]';

    // ── Ziel-Tab bestimmen ────────────────────────────────────
    let tabName;
    if (env === 'PERSONAL') {
      tabName = 'Personal_Logs';
    } else if (env === 'PUBLIC') {
      tabName = 'Public_Logs';
    } else {
      // Unbekannte env → Fallback Personal, Typ als UNKNOWN_ENV markieren
      tabName = 'Personal_Logs';
    }

    // ── Sheet holen ───────────────────────────────────────────
    const ss    = SpreadsheetApp.openById(LOG_SHEET_ID);
    const sheet = ss.getSheetByName(tabName);
    if (!sheet) return err('Tab nicht gefunden: ' + tabName);

    // ── Zeile schreiben — exakt A–M ──────────────────────────
    sheet.appendRow([
      new Date(),        // A — Zeitstempel (Script-seitig gesetzt)
      effectiveVersion,  // B — App-Version
      env,               // C — Env
      type,              // D — Typ
      message,           // E — Fehlermeldung
      detail,            // F — Detail
      url,               // G — URL
      device,            // H — Gerät / OS
      stack,             // I — Stacktrace
      httpStatus,        // J — HTTP Status
      'offen',           // K — Status (immer Standard)
      '',                // L — Notiz (manuell)
      '',                // M — Fix-Version (manuell)
      priority,          // N — Priorität
      area               // O — Bereich
    ]);

    return ok('logged → ' + tabName + ' (' + effectiveVersion + ')');

  } catch (fatalErr) {
    return err(fatalErr.toString());

  } finally {
    if (lockAcquired) {
      try { lock.releaseLock(); } catch (_) {}
    }
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Plateau-Brecher Admin-Log API aktiv ✓ | V11.8 / V15.0')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Hilfsfunktionen ───────────────────────────────────────────
function ok(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, msg: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function err(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
