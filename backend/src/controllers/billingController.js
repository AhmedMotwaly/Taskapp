const billingService = require('../services/billingService');
const { STRIPE_PUBLISHABLE_KEY } = require('../config/stripe');

const getPublicKey = (req, res) => {
  res.status(200).json({ publicKey: STRIPE_PUBLISHABLE_KEY });
};

const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;
    if (!plan) return res.status(400).json({ error: 'Plan is required' });
    const session = await billingService.createCheckoutSession(userId, plan);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;
    await billingService.handleWebhook(payload, signature);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = { createCheckoutSession, handleWebhook, getPublicKey };
