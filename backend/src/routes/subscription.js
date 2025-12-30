const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getItem, putItem, queryItems, updateItem, TABLES } = require('../models/dynamodb');
const authenticate = require('../middleware/auth');

// Stripe config
const { stripe, PRICE_IDS } = require('../config/stripe');

// ==========================================
// 1. GET CURRENT SUBSCRIPTION
// ==========================================
router.get('/current', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    let subscription = await getItem(TABLES.SUBSCRIPTIONS, { userId });
    
    // Default to free if no record exists
    if (!subscription) {
      subscription = {
        userId,
        tier: 'free',
        status: 'active',
        price: 0,
        nextBillingDate: null
      };
    }
    
    res.json(subscription);
  } catch (error) {
    console.error('[SUB] Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// ==========================================
// 2. CHANGE PLAN (Start Checkout)
// ==========================================
const changePlanHandler = async (req, res) => {
  try {
    const { tier } = req.body; // 'free', 'pro', or 'ultra'
    const userId = req.user.userId;

    // A. Handle Downgrade to Free immediately
    if (tier === 'free') {
        const sub = await getItem(TABLES.SUBSCRIPTIONS, { userId });
        
        // If they have an active Stripe sub, cancel it at period end
        if (sub && sub.stripeSubscriptionId) {
            await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                cancel_at_period_end: true
            });
        }

        // Update DB
        const updatedSub = {
            ...sub,
            tier: 'free',
            status: 'cancelled',
            price: 0,
            updatedAt: new Date().toISOString()
        };
        await putItem(TABLES.SUBSCRIPTIONS, updatedSub);
        
        return res.json({ success: true, message: "Plan downgraded to Free" });
    }

    // B. Handle Upgrade (Create Stripe Session)
    if (!PRICE_IDS[tier]) {
      return res.status(400).json({ error: 'Invalid plan tier configuration' });
    }

    const user = await getItem(TABLES.USERS, { userId });
    
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: userId,
      payment_method_types: ['card'], // Removed 'paypal' to prevent crash
      line_items: [
        {
          price: PRICE_IDS[tier],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard/settings?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings/manage-subscription?payment=cancelled`,
      metadata: {
        userId: userId,
        tier: tier,
      },
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('[STRIPE] Checkout error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
};

router.post('/change', authenticate, changePlanHandler);
router.post('/create-checkout', authenticate, changePlanHandler);

// ==========================================
// 3. BILLING HISTORY (Direct from Stripe)
// ==========================================
router.get('/billing-history', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Get the user's Stripe Customer ID from the DB
    const userSub = await getItem(TABLES.SUBSCRIPTIONS, { userId });

    if (!userSub || !userSub.stripeCustomerId) {
      return res.json([]); // No history if never subscribed
    }

    // 2. Ask Stripe for the invoices
    const invoices = await stripe.invoices.list({
      customer: userSub.stripeCustomerId,
      limit: 100,
      status: 'paid', // Only show paid invoices
    });

    // 3. Map to clean JSON with PDF URL
    const history = invoices.data.map(invoice => ({
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: invoice.amount_paid / 100,
      status: invoice.status,
      description: invoice.lines.data[0]?.description || 'Subscription',
      pdfUrl: invoice.hosted_invoice_url || invoice.invoice_pdf 
    }));

    res.json(history);

  } catch (error) {
    console.error('[BILLING] Error fetching from Stripe:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

// ==========================================
// 4. STRIPE WEBHOOK
// ==========================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          await handleSuccessfulPayment(session);
          break;
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          await handleSubscriptionUpdate(subscription);
          break;
      }
  } catch (err) {
      console.error("[STRIPE] Webhook processing error:", err);
  }

  res.json({ received: true });
});

// --- HELPERS ---

async function handleSuccessfulPayment(session) {
  const userId = session.client_reference_id || session.metadata.userId;
  const tier = session.metadata.tier;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;
  
  console.log(`[PAYMENT SUCCESS] User ${userId} upgraded to ${tier}`);
  const now = new Date().toISOString();
  
  // Update Subscription DB
  const subscription = {
    userId,
    tier,
    status: 'active',
    price: tier === 'pro' ? 5 : 10,
    stripeCustomerId,
    stripeSubscriptionId,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: now
  };
  await putItem(TABLES.SUBSCRIPTIONS, subscription);
  
  // Update User DB
  try {
      const user = await getItem(TABLES.USERS, { userId });
      if (user) {
          user.plan = tier;
          await putItem(TABLES.USERS, user);
      }
  } catch (e) { console.error(e); }

  // (Optional) We still save a record to Billing table for backup, 
  // even though we now fetch history from Stripe directly.
  const invoice = {
    invoiceId: uuidv4(),
    userId,
    invoiceNumber: `INV-${Date.now()}`,
    date: now,
    description: `${tier.toUpperCase()} Plan Subscription`,
    amount: tier === 'pro' ? 5 : 10,
    status: 'paid',
    stripeInvoiceId: session.invoice,
  };
  await putItem(TABLES.BILLING, invoice);
}

async function handleSubscriptionUpdate(stripeSub) {
    console.log(`[STRIPE] Subscription ${stripeSub.id} updated to status: ${stripeSub.status}`);
}

module.exports = router;