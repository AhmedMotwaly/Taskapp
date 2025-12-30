const confirmService = require('../services/confirmService');

const confirmPurchase = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });
    const result = await confirmService.confirmPurchase(token);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const createConfirmToken = async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.userId;
    if (!itemId) return res.status(400).json({ error: 'Item ID is required' });
    const result = await confirmService.createConfirmToken(userId, itemId);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { confirmPurchase, createConfirmToken };
