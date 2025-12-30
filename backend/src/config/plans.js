// SaaS\Backend\src\config\plans.js

const PLANS = {
  free: {
    name: 'Free',
    itemLimit: 1,
    restockLimit: 1,
    checkIntervalSeconds: 24 * 60 * 60, // 24 Hours
    smsAlerts: false,
    autoCheckout: false,
    price: 0
  },
  pro: {
    name: 'Pro',
    itemLimit: 50,
    restockLimit: 10,
    checkIntervalSeconds: 12 * 60 * 60, // 12 Hours
    smsAlerts: true,
    autoCheckout: false,
    price: 5
  },
  ultra: {
    name: 'Ultra',
    itemLimit: 999999,
    restockLimit: 999999,
    checkIntervalSeconds: 6 * 60 * 60, // 6 Hours
    smsAlerts: true,
    autoCheckout: true,
    price: 10
  }
};

const getPlanConfig = (planName) => {
  return PLANS[planName?.toLowerCase()] || PLANS.free;
};

// Helper to check boolean features (like smsAlerts)
const isFeatureAllowed = (planName, feature) => {
  const plan = getPlanConfig(planName);
  return !!plan[feature]; 
};

module.exports = { PLANS, getPlanConfig, isFeatureAllowed };