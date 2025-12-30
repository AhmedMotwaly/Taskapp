const sendAlert = async (userId, itemId, alertType, data) => {
  const alertEvent = { userId, itemId, alertType, data, timestamp: new Date().toISOString() };
  console.log('[ALERT]', JSON.stringify(alertEvent, null, 2));
  return alertEvent;
};

module.exports = { sendAlert };
