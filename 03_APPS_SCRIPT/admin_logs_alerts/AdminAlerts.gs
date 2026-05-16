// Admin-Log-Alerts
// Vorbereitungsstruktur fuer spaetere P0/P1-Benachrichtigungen.
// Keine echten Webhooks, Sheet-IDs oder Tokens in diese Datei schreiben.

function scanAdminLogAlerts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error('Admin-Log-Sheet ist nicht aktiv verfuegbar.');
  }

  // Spaeter:
  // - Personal_Logs und Public_Logs lesen
  // - offene P0/P1-Zeilen sammeln
  // - bereits gemeldete Keys via PropertiesService pruefen
  // - Discord-Benachrichtigung kontrolliert senden
  const rows = findOpenP0P1Rows_(ss);
  return rows.map(row => buildAlertKey_(row));
}

function findOpenP0P1Rows_(ss) {
  // Platzhalter: spaeter die Tabs Personal_Logs und Public_Logs auswerten.
  // Relevante Bedingung: Status = offen und Prioritaet = P0/P1.
  // PERSONAL/PUBLIC muessen in der Auswertung getrennt erkennbar bleiben.
  return [];
}

function buildAlertKey_(row) {
  // Platzhalter: spaeter stabilen Anti-Doppelbenachrichtigungs-Key bilden.
  // Beispiel-Basis ohne echte Werte: Env, Zeitstempel, Typ, Fehlermeldung, Datei.
  return [
    row && row.env || '',
    row && row.timestamp || '',
    row && row.type || '',
    row && row.file || ''
  ].join('|');
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
