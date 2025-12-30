const { v4: uuidv4 } = require('uuid');
const { putItem, getItem, deleteItem, TABLES } = require('../models/dynamodb');

const createConfirmToken = async (userId, itemId) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const confirmToken = { token, userId, itemId, expiresAt };
  await putItem(TABLES.CONFIRM_TOKENS, confirmToken);
  return { token, expiresAt };
};

const confirmPurchase = async (token) => {
  const confirmToken = await getItem(TABLES.CONFIRM_TOKENS, { token });
  if (!confirmToken) throw new Error('Invalid or expired confirmation token');

  const now = new Date();
  const expiresAt = new Date(confirmToken.expiresAt);
  if (now > expiresAt) {
    await deleteItem(TABLES.CONFIRM_TOKENS, { token });
    throw new Error('Confirmation token has expired');
  }

  console.log('[PURCHASE CONFIRMED]', { userId: confirmToken.userId, itemId: confirmToken.itemId, token, confirmedAt: new Date().toISOString() });
  await deleteItem(TABLES.CONFIRM_TOKENS, { token });

  return { success: true, message: 'Purchase approved', userId: confirmToken.userId, itemId: confirmToken.itemId };
};

module.exports = { createConfirmToken, confirmPurchase };
