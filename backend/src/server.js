// src/server.js
require('dotenv').config();
const app = require('./app');
const schedulerService = require('./services/schedulerService');
const restockCheckerService = require('./services/restockCheckerService'); 

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] AutoBuy Guard API running on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ============================================
// SCHEDULER - Runs every 30 seconds
// The scheduler itself checks each user's plan
// and only processes if enough time has passed
// ============================================
let schedulerInterval;

if (process.env.ENABLE_SCHEDULER === 'true') {
  // Run every 30 seconds (the scheduler will respect per-plan intervals)
  const SCHEDULER_INTERVAL = 30 * 1000; // 30 seconds

  const runScheduler = () => {
    // Check price items
    schedulerService.checkAllItems().catch((error) => {
      console.error('[SCHEDULER ERROR]', error);
    });
    
    // Check restock items
    restockCheckerService.checkAllRestockItems().catch((error) => {
      console.error('[RESTOCK CHECKER ERROR]', error);
    });
  };

  // Run once at startup
  console.log('[SCHEDULER] Running initial check...');
  setTimeout(runScheduler, 5000); // Wait 5s for server to be ready

  // Then run every 30 seconds
  schedulerInterval = setInterval(runScheduler, SCHEDULER_INTERVAL);

  console.log('[SCHEDULER] Enabled - checking cycle active (30s)');
  console.log('[SCHEDULER] Plan Intervals: Free=24h, Pro=12h, Ultra=6h'); // <--- CORRECTED LOG
}

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('[SERVER] Shutting down gracefully...');
  if (schedulerInterval) clearInterval(schedulerInterval);
  server.close(() => {
    console.log('[SERVER] Server closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[SERVER] Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = server;