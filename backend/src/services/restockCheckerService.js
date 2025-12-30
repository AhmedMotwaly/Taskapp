// src/services/restockCheckerService.js
const { scanItems, updateItem, getItem, TABLES } = require('../models/dynamodb');
const { fetchProductDetails } = require('./scraperService');
const { getPlanConfig } = require('../config/plans');
const { sendEmail } = require('./emailService');

// ❌ REMOVED: In-memory tracking (gets wiped on restart)
// No Map() objects here - everything uses database timestamps

// ============================================
// CHECK ALL RESTOCK ITEMS
// ============================================
const checkAllRestockItems = async () => {
  try {
    const allItems = await scanItems(TABLES.RESTOCK_ITEMS);
    
    // Group by userId
    const itemsByUser = {};
    for (const item of allItems) {
      if (item.userId) {
        if (!itemsByUser[item.userId]) itemsByUser[item.userId] = [];
        itemsByUser[item.userId].push(item);
      }
    }

    for (const userId of Object.keys(itemsByUser)) {
      await checkUserRestockItems(userId, itemsByUser[userId]);
    }

  } catch (error) {
    console.error('[RESTOCK CHECKER] Error:', error);
  }
};

// ============================================
// CHECK USER ITEMS
// ============================================
const checkUserRestockItems = async (userId, items) => {
  try {
    const user = await getItem(TABLES.USERS, { userId });
    if (!user) {
      console.warn(`[RESTOCK] User ${userId} not found in database`);
      return;
    }

    const planConfig = getPlanConfig(user.plan);
    const checkIntervalMs = planConfig.checkIntervalSeconds * 1000;
    const now = Date.now();

    // ✅ NO USER-LEVEL CHECK - Just check each item individually based on DB timestamp
    // console.log(`[RESTOCK] 👤 Checking ${items.length} items for user ${userId}...`);

    let checkedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      // ✅ USE DATABASE TIMESTAMP (persists across restarts)
      const lastCheck = item.lastChecked ? new Date(item.lastChecked).getTime() : 0;
      const timeSinceLastCheck = now - lastCheck;
      
      // Skip if not enough time passed
      if (timeSinceLastCheck < checkIntervalMs) {
        // Log is kept as requested, but be aware this generates volume in CloudWatch
        const hoursRemaining = Math.max(0, (checkIntervalMs - timeSinceLastCheck) / (1000 * 60 * 60));
        console.log(`[RESTOCK] ⏭️  Skip: "${item.title?.substring(0, 30)}..." (Next in ${hoursRemaining.toFixed(1)}h)`);
        skippedCount++;
        continue;
      }

      // Time to check this item
      console.log(`[RESTOCK] ✅ Check: "${item.title?.substring(0, 30)}..."`);
      await checkSingleRestockItem(item, user, planConfig);
      checkedCount++;
      
      // Delay to prevent rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    if (checkedCount > 0) {
      console.log(`[RESTOCK] 📊 User ${userId}: ${checkedCount} checked, ${skippedCount} skipped`);
    }

  } catch (error) {
    console.error(`[RESTOCK CHECKER] Error for user ${userId}:`, error);
  }
};

// ============================================
// CHECK SINGLE ITEM
// ============================================
const checkSingleRestockItem = async (item, user, planConfig) => {
  try {
    console.log(`[RESTOCK] 🔍 Fetching product data...`);

    const productData = await fetchProductDetails(item.url, item.selectedVariants);
    
    if (!productData) {
      console.log(`[RESTOCK] ❌ Failed to fetch data`);
      
      // Still update lastChecked so we don't retry immediately
      await updateItem(
        TABLES.RESTOCK_ITEMS,
        { restockId: item.restockId },
        'SET lastChecked = :checked, checkCount = :count',
        {
          ':checked': new Date().toISOString(),
          ':count': (item.checkCount || 0) + 1
        }
      );
      
      return;
    }

    const newStatus = productData.inStock ? 'in-stock' : 'out-of-stock';
    const oldStatus = item.currentStatus || 'out-of-stock';

    // ✅ ALWAYS UPDATE lastChecked (this persists to database)
    await updateItem(
      TABLES.RESTOCK_ITEMS,
      { restockId: item.restockId },
      'SET currentStatus = :status, lastChecked = :checked, checkCount = :count, updatedAt = :updated',
      {
        ':status': newStatus,
        ':checked': new Date().toISOString(), // ← KEY: This prevents immediate re-check after restart
        ':count': (item.checkCount || 0) + 1,
        ':updated': new Date().toISOString()
      }
    );

    console.log(`[RESTOCK] 📦 Status: ${oldStatus} → ${newStatus}`);

    // Send notification if back in stock
    if (newStatus === 'in-stock' && oldStatus === 'out-of-stock') {
      console.log(`[RESTOCK] 🎉 BACK IN STOCK! "${item.title}"`);
      await sendRestockNotifications(item, user, planConfig, productData);
    }

  } catch (error) {
    console.error(`[RESTOCK] ❌ Error checking ${item.restockId}:`, error);
    
    // Update timestamp even on error to prevent spam retries
    try {
      await updateItem(
        TABLES.RESTOCK_ITEMS,
        { restockId: item.restockId },
        'SET lastChecked = :checked',
        { ':checked': new Date().toISOString() }
      );
    } catch (e) {
      console.error('[RESTOCK] Failed to update timestamp after error:', e);
    }
  }
};

const sendRestockNotifications = async (item, user, planConfig, productData) => {
  try {
    // Cooldown check (don't spam notifications)
    if (item.lastNotified) {
      const timeSinceLast = Date.now() - new Date(item.lastNotified).getTime();
      
      if (timeSinceLast < 60 * 60 * 1000) { // 1 hour cooldown
        console.log(`[RESTOCK] ⏰ Notification cooldown active`);
        return;
      }
    }

    if (item.notifyEmail !== false) {
      await sendRestockEmail(user, item, productData);
    }
    
    await updateItem(
      TABLES.RESTOCK_ITEMS,
      { restockId: item.restockId },
      'SET lastNotified = :notified',
      { ':notified': new Date().toISOString() }
    );
    
    console.log(`[RESTOCK] ✅ Notifications sent successfully`);
  } catch (e) { 
    console.error('[RESTOCK] ❌ Notification error:', e); 
  }
};

const sendRestockEmail = async (user, item, productData) => {
  try {
    const subject = `🎉 Back in Stock: ${item.title?.substring(0, 50)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00f3ff;">🎉 Great News!</h2>
        <p>The item you're tracking is back in stock!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${item.title}</h3>
          ${productData.price ? `<p style="margin: 5px 0;"><strong>Price:</strong> €${productData.price}</p>` : ''}
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #00cc00;">✅ In Stock</span></p>
        </div>
        
        <a href="${item.url}" style="display: inline-block; background: #00f3ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Buy Now →
        </a>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          You received this because you're monitoring this item on AutoBuy Guard Restock Sniper.
        </p>
      </div>
    `;

    await sendEmail(user.email, subject, html);
    console.log(`[RESTOCK] 📧 Email sent successfully`);
  } catch (e) { 
    console.error('[RESTOCK] ❌ Email error:', e); 
  }
};

module.exports = { checkAllRestockItems, checkUserRestockItems, checkSingleRestockItem };