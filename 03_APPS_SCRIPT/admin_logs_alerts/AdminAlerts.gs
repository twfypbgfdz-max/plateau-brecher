// Admin-Log-Alerts
// Vorbereitungsstruktur fuer spaetere P0/P1-Benachrichtigungen.
// Keine echten Webhooks, Sheet-IDs oder Tokens in diese Datei schreiben.

const ADMIN_ALERT_DEDUP_PREFIX = 'ADMIN_ALERT_NOTIFIED_';

function scanAdminLogAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Admin-Log-Sheet ist nicht aktiv verfuegbar.');
  }

  const rows = findOpenP0P1Rows_(ss);
  Logger.log('Admin-Alert Dry-Run: ' + rows.length + ' offene P0/P1-Treffer gefunden.');

  rows.forEach(alert => {
    Logger.log('Admin-Alert Key: ' + buildAlertKey_(alert));
  });

  return rows;
}

function scanAdminLogAlertsWithDeduping() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Admin-Log-Sheet ist nicht aktiv verfuegbar.');
  }

  const props = PropertiesService.getScriptProperties();
  const alerts = findOpenP0P1Rows_(ss);
  const fresh = [];
  const known = [];

  alerts.forEach(alert => {
    const key = buildAlertKey_(alert);
    const propKey = buildDedupPropertyKey_(key);

    if (props.getProperty(propKey)) {
      known.push(alert);
      Logger.log('Admin-Alert Deduping: bereits bekannt: ' + key);
      return;
    }

    fresh.push(alert);
    props.setProperty(propKey, new Date().toISOString());
    Logger.log('Admin-Alert Deduping: neu gespeichert: ' + key);
  });

  Logger.log(
    'Admin-Alert Deduping: gesamt=' + alerts.length +
    ' neu=' + fresh.length +
    ' bekannt=' + known.length
  );

  return {
    total: alerts.length,
    fresh: fresh,
    known: known
  };
}

function findOpenP0P1Rows_(ss) {
  const tabs = [
    { name: 'Personal_Logs', app: 'PERSONAL' },
    { name: 'Public_Logs', app: 'PUBLIC' }
  ];
  const alerts = [];

  tabs.forEach(tab => {
    const sheet = ss.getSheetByName(tab.name);
    if (!sheet) {
      Logger.log('Admin-Alert Dry-Run: Tab fehlt: ' + tab.name);
      return;
    }

    const values = sheet.getDataRange().getValues();
    if (values.length < 2) return;

    const columns = buildHeaderMap_(values[0]);
    const required = getRequiredColumns_(columns);
    if (!required) {
      Logger.log('Admin-Alert Dry-Run: Pflichtspalten fehlen in ' + tab.name);
      return;
    }

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const status = cleanCell_(row[required.status]);
      const priority = cleanCell_(row[required.priority]).toUpperCase();

      if (normalizeHeader_(status) !== 'offen') continue;
      if (priority !== 'P0' && priority !== 'P1') continue;

      alerts.push({
        app: cleanCell_(row[required.env]) || tab.app,
        tabName: tab.name,
        priority: priority,
        type: cleanCell_(row[required.type]),
        version: cleanCell_(row[required.version]),
        area: cleanCell_(row[required.area]),
        file: cleanCell_(row[required.file]),
        message: cleanCell_(row[required.message]),
        timestamp: cleanCell_(row[required.timestamp]),
        status: status,
        teststatus: cleanCell_(row[required.teststatus]),
        rowNumber: i + 1
      });
    }
  });

  return alerts;
}

function buildAlertKey_(alert) {
  const stableParts = [
    alert && alert.app || '',
    alert && alert.priority || '',
    alert && alert.type || '',
    alert && alert.version || '',
    alert && alert.area || '',
    alert && alert.file || '',
    alert && alert.message || ''
  ];

  if (stableParts.join('').trim()) {
    return stableParts.join('|');
  }

  return [
    alert && alert.tabName || '',
    alert && alert.rowNumber || '',
    alert && alert.timestamp || '',
    alert && alert.type || '',
    alert && alert.message || ''
  ].join('|');
}

function buildDedupPropertyKey_(key) {
  return ADMIN_ALERT_DEDUP_PREFIX + hashAlertKey_(key);
}

function hashAlertKey_(key) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    key,
    Utilities.Charset.UTF_8
  );

  return digest.map(byte => {
    const value = byte < 0 ? byte + 256 : byte;
    return ('0' + value.toString(16)).slice(-2);
  }).join('');
}

function sendDiscordAlert_(alert) {
  // Platzhalter: noch keine echte Discord-Nachricht senden.
  // Spaeter DISCORD_WEBHOOK_URL ausschliesslich ueber PropertiesService lesen.
  // Keine Webhook-URL im Repo speichern.
  return {
    skipped: true,
    reason: 'Discord-Versand ist noch nicht implementiert.',
    alert: alert || null
  };
}

function dryRunAdminLogAlerts() {
  const alerts = scanAdminLogAlerts();
  Logger.log('Admin-Alert Dry-Run Anzahl: ' + alerts.length);

  alerts.forEach(alert => {
    Logger.log([
      alert.app,
      alert.priority,
      alert.type,
      alert.version,
      alert.area,
      'Zeile ' + alert.rowNumber,
      buildAlertKey_(alert)
    ].join(' | '));
  });

  return alerts;
}

function resetAdminAlertDedupingForTest() {
  // Nur manuell fuer Tests verwenden.
  // Loescht ausschliesslich Properties mit Prefix ADMIN_ALERT_NOTIFIED_.
  const props = PropertiesService.getScriptProperties();
  const all = props.getProperties();
  let deleted = 0;

  Object.keys(all).forEach(key => {
    if (!key.startsWith(ADMIN_ALERT_DEDUP_PREFIX)) return;
    props.deleteProperty(key);
    deleted++;
  });

  Logger.log('Admin-Alert Deduping Reset fuer Tests: ' + deleted + ' Keys geloescht.');
  return deleted;
}

function buildHeaderMap_(headerRow) {
  const map = {};
  headerRow.forEach((header, index) => {
    const key = normalizeHeader_(header);
    if (key && map[key] === undefined) map[key] = index;
  });
  return map;
}

function getRequiredColumns_(columns) {
  const required = {
    timestamp: findColumn_(columns, ['zeitstempel']),
    version: findColumn_(columns, ['app-version', 'app version', 'appversion']),
    env: findColumn_(columns, ['env']),
    type: findColumn_(columns, ['typ']),
    message: findColumn_(columns, ['fehlermeldung']),
    status: findColumn_(columns, ['status']),
    priority: findColumn_(columns, ['prioritat', 'prioritaet']),
    area: findColumn_(columns, ['bereich']),
    file: findColumn_(columns, ['datei']),
    teststatus: findColumn_(columns, ['teststatus'])
  };

  return Object.keys(required).every(key => required[key] !== null) ? required : null;
}

function findColumn_(columns, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    const key = normalizeHeader_(aliases[i]);
    if (columns[key] !== undefined) return columns[key];
  }
  return null;
}

function cleanCell_(value) {
  if (value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  }
  return String(value).trim();
}

function normalizeHeader_(value) {
  return cleanCell_(value)
    .toLowerCase()
    .replace(/\u00e4/g, 'a')
    .replace(/\u00f6/g, 'o')
    .replace(/\u00fc/g, 'u')
    .replace(/\u00df/g, 'ss')
    .trim();
}
