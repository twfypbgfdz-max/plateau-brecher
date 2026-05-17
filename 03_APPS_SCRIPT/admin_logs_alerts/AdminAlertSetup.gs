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
  const props = PropertiesService.getScriptProperties();
  const emailTo = props.getProperty('ADMIN_ALERT_EMAIL_TO') || '';
  const emailEnabledRaw = props.getProperty('ADMIN_ALERT_EMAIL_ENABLED') || '';
  const emailEnabled = emailEnabledRaw === '' || /^(true|1|yes)$/i.test(emailEnabledRaw);

  return {
    active: emailEnabled && !!emailTo,
    checks: [
      'ADMIN_ALERT_EMAIL_TO gesetzt: ' + (!!emailTo),
      'ADMIN_ALERT_EMAIL_TO maskiert: ' + maskEmail_(emailTo),
      'ADMIN_ALERT_EMAIL_ENABLED aktiv: ' + emailEnabled,
      'DISCORD_WEBHOOK_URL wird spaeter optional ueber PropertiesService erwartet.',
      'ADMIN_LOG_SPREADSHEET_ID bleibt optional, wenn das Script gebunden laeuft.'
    ]
  };
}

function maskEmail_(email) {
  if (!email) return '';
  const parts = String(email).split('@');
  if (parts.length !== 2) return '[maskiert]';
  const name = parts[0];
  const domain = parts[1];
  return name.slice(0, 2) + '***@' + domain.slice(0, 2) + '***';
}
