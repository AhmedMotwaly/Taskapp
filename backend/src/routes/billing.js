const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  getPublicKey,
} = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Route: Get Stripe Publishable Key
router.get('/public-key', getPublicKey);

// Public Route: Stripe Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected Route: Create Checkout Session
router.post('/create-checkout-session', authMiddleware, createCheckoutSession);

module.exports = router;
