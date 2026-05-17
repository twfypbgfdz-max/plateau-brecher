// Admin-Alert-Setup
// Trigger werden nur gezielt fuer scanAdminLogAlertsAndNotify verwaltet.

const ADMIN_ALERT_TRIGGER_FUNCTION = 'scanAdminLogAlertsAndNotify';

function setupAdminAlertTrigger() {
  const existing = getAdminAlertTriggers_();
  if (existing.length > 0) {
    Logger.log('Admin-Alert Trigger existiert bereits: ' + existing.length);
    return {
      skipped: true,
      existing: existing.length,
      handler: ADMIN_ALERT_TRIGGER_FUNCTION
    };
  }

  const trigger = ScriptApp.newTrigger(ADMIN_ALERT_TRIGGER_FUNCTION)
    .timeBased()
    .everyMinutes(30)
    .create();

  Logger.log('Admin-Alert Trigger erstellt fuer ' + ADMIN_ALERT_TRIGGER_FUNCTION + ' alle 30 Minuten.');
  return {
    created: true,
    triggerId: trigger.getUniqueId(),
    handler: ADMIN_ALERT_TRIGGER_FUNCTION,
    interval: '30 Minuten'
  };
}

function removeAdminAlertTriggers() {
  const triggers = getAdminAlertTriggers_();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });

  Logger.log('Admin-Alert Trigger entfernt: ' + triggers.length);
  return {
    removed: triggers.length,
    handler: ADMIN_ALERT_TRIGGER_FUNCTION
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

function getAdminAlertTriggers_() {
  return ScriptApp.getProjectTriggers().filter(trigger => {
    return trigger.getHandlerFunction() === ADMIN_ALERT_TRIGGER_FUNCTION;
  });
}
