const stripe = require('../config/stripe');
const { putItem, queryItems, updateItem, TABLES } = require('../models/dynamodb');

const createCheckoutSession = async (userId, plan) => {
  const validPlans = { basic: { price: 999, name: 'Basic Plan' }, pro: { price: 1999, name: 'Pro Plan' } };
  if (!validPlans[plan]) throw new Error('Invalid plan selected');

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: validPlans[plan].name },
        unit_amount: validPlans[plan].price,
        recurring: { interval: 'month' }
      },
      quantity: 1
    }],
    success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/billing/cancel`,
    client_reference_id: userId,
    metadata: { userId, plan }
  });

  return { sessionId: session.id, url: session.url };
};

const handleWebhook = async (payload, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancel(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
};

const handleCheckoutComplete = async (session) => {
  const userId = session.metadata.userId;
  const plan = session.metadata.plan;
  const customerId = session.customer;

  const existingBilling = await queryItems(TABLES.BILLING, 'userId = :userId', { ':userId': userId }, 'userId-index').catch(() => []);

  if (existingBilling.length > 0) {
    await updateItem(TABLES.BILLING, { customerId: existingBilling[0].customerId }, 'SET #plan = :plan, #status = :status', { ':plan': plan, ':status': 'active' }).catch(() => {});
  } else {
    await putItem(TABLES.BILLING, { customerId, userId, plan, status: 'active', createdAt: new Date().toISOString() });
  }

  console.log(`[BILLING] Subscription activated for user ${userId}`);
};

const handleSubscriptionUpdate = async (subscription) => {
  const customerId = subscription.customer;
  await updateItem(TABLES.BILLING, { customerId }, 'SET #status = :status', { ':status': subscription.status }).catch(() => {});
  console.log(`[BILLING] Subscription updated for customer ${customerId}`);
};

const handleSubscriptionCancel = async (subscription) => {
  const customerId = subscription.customer;
  await updateItem(TABLES.BILLING, { customerId }, 'SET #status = :status', { ':status': 'cancelled' }).catch(() => {});
  console.log(`[BILLING] Subscription cancelled for customer ${customerId}`);
};

module.exports = { createCheckoutSession, handleWebhook };
