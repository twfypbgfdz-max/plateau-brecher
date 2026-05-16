// Admin-Alert-Setup
// Vorbereitungsstruktur ohne aktive Trigger oder externe Verbindungen.

function setupAdminAlertTrigger() {
  // Platzhalter: noch keinen Trigger erstellen.
  // Spaeter erst nach Freigabe einen zeitgesteuerten Trigger fuer
  // scanAdminLogAlerts() anlegen.
  return {
    skipped: true,
    reason: 'Trigger-Setup ist noch nicht aktiv.'
  };
}

function removeAdminAlertTriggers() {
  // Platzhalter: noch keine Trigger entfernen.
  // Spaeter gezielt nur Trigger fuer scanAdminLogAlerts() suchen und entfernen.
  return {
    skipped: true,
    reason: 'Trigger-Entfernung ist noch nicht aktiv.'
  };
}

function testAdminAlertConfig() {
  // Platzhalter: spaeter PropertiesService-Konfiguration pruefen.
  // Keine echten Secrets oder URLs ausgeben.
  return {
    active: false,
    checks: [
      'DISCORD_WEBHOOK_URL wird spaeter ueber PropertiesService erwartet.',
      'ADMIN_LOG_SPREADSHEET_ID bleibt optional, wenn das Script gebunden laeuft.'
    ]
  };
}
