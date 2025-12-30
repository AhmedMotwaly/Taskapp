const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
  throw new Error('STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY must be set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
});

const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  ultra: process.env.STRIPE_ULTRA_PRICE_ID,
};

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

module.exports = { stripe, PRICE_IDS, STRIPE_PUBLISHABLE_KEY };
