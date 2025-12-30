// src/services/schedulerService.js

const { scanItems, updateItem, getItem, TABLES } = require('../models/dynamodb');
const { fetchProductDetails } = require('./scraperService');
const { getPlanConfig } = require('../config/plans');
const { sendEmail } = require('./emailService');

// ============================================
// CHECK ALL ITEMS (Called by scheduler)
// ============================================
const checkAllItems = async () => {
  try {
    const allItems = await scanItems(TABLES.ITEMS);
    
    // Group items by userId
    const itemsByUser = {};
    for (const item of allItems) {
      if (item.userId) {
        if (!itemsByUser[item.userId]) itemsByUser[item.userId] = [];
        itemsByUser[item.userId].push(item);
      }
    }

    // Process each user
    for (const userId of Object.keys(itemsByUser)) {
      await checkUserItems(userId, itemsByUser[userId]);
    }

  } catch (error) {
    console.error('[SCHEDULER] Error:', error);
  }
};

// ============================================
// CHECK ITEMS FOR A SPECIFIC USER
// ============================================
const checkUserItems = async (userId, items) => {
  try {
    const user = await getItem(TABLES.USERS, { userId });
    if (!user) {
      console.warn(`[SCHEDULER] User ${userId} not found in database`);
      return;
    }

    const planConfig = getPlanConfig(user.plan);
    const checkIntervalMs = planConfig.checkIntervalSeconds * 1000;
    const now = Date.now();

    // console.log(`[SCHEDULER] 👤 Checking ${items.length} items for user ${userId}...`);

    let checkedCount = 0;

    // Check each item individually based on its OWN last check time from DB
    for (const item of items) {
      // ✅ USE DATABASE TIMESTAMP (persists across restarts)
      const lastCheck = item.lastCheckedAt ? new Date(item.lastCheckedAt).getTime() : 0;
      const timeSinceLastCheck = now - lastCheck;
      
      // Skip if not enough time passed
      if (timeSinceLastCheck < checkIntervalMs) {
        // 🔇 DISABLED FOR AWS: Prevents log flooding (Cost/Noise reduction)
        // console.log(`[SCHEDULER] ⏭️ Skip: "${item.title?.substring(0, 15)}..." (Wait ${(checkIntervalMs - timeSinceLastCheck)/60000}m)`);
        continue; 
      }

      // Time to check this item
      console.log(`[SCHEDULER] ✅ Check: "${item.title?.substring(0, 30)}..." (Last: ${(timeSinceLastCheck / 3600000).toFixed(1)}h ago)`);
      await checkSingleItem(item, user, planConfig);
      checkedCount++;
      
      // Delay to prevent blocking / rate limiting
      await new Promise(r => setTimeout(r, 2000));
    }

    if (checkedCount > 0) {
      console.log(`[SCHEDULER] 📊 User ${userId} summary: ${checkedCount} checked`);
    }

  } catch (error) {
    console.error(`[SCHEDULER] Error checking user ${userId}:`, error);
  }
};

// ============================================
// CHECK A SINGLE ITEM
// ============================================
const checkSingleItem = async (item, user, planConfig) => {
  try {
    console.log(`[SCHEDULER] 🔍 Fetching product data from ${item.url.substring(0, 50)}...`);

    const productData = await fetchProductDetails(item.url);
    
    if (!productData || !productData.price) {
      console.log(`[SCHEDULER] ❌ Could not get price for item`);
      
      // Update lastCheckedAt to prevent immediate retries on fail
      await updateItem(
        TABLES.ITEMS,
        { itemId: item.itemId },
        'SET lastCheckedAt = :checked',
        { ':checked': new Date().toISOString() }
      );
      
      return;
    }

    const newPrice = parseFloat(productData.price);
    const oldPrice = parseFloat(item.lastPrice) || 0;
    const targetPrice = parseFloat(item.targetPrice) || 0;

    // Update price history
    const priceHistory = item.priceHistory || [];
    priceHistory.push({ price: newPrice, date: new Date().toISOString() });
    if (priceHistory.length > 100) priceHistory.shift();

    // ✅ ALWAYS UPDATE lastCheckedAt (this persists to database)
    await updateItem(
      TABLES.ITEMS,
      { itemId: item.itemId },
      'SET lastPrice = :price, lastCheckedAt = :checked, priceHistory = :history',
      {
        ':price': newPrice,
        ':checked': new Date().toISOString(), // ← KEY: This prevents immediate re-check after restart
        ':history': priceHistory
      }
    );

    const priceChange = newPrice - oldPrice;
    const changePercent = oldPrice > 0 ? ((priceChange / oldPrice) * 100).toFixed(1) : 0;
    
    console.log(`[SCHEDULER] Price: €${oldPrice.toFixed(2)} → €${newPrice.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent}%)`);

    // Check if target hit
    if (newPrice <= targetPrice && newPrice > 0) {
      console.log(`[SCHEDULER] 🎯 TARGET HIT! Sending alert...`);
      await sendPriceAlert(user, item, newPrice, oldPrice);
      
      if (planConfig.smsAlerts && user.smsNumber) {
        // SMS Logic placeholder
      }
    }

  } catch (error) {
    console.error(`[SCHEDULER] ❌ Error checking item:`, error.message);
    
    // Update timestamp even on error to prevent spam retries
    try {
      await updateItem(
        TABLES.ITEMS,
        { itemId: item.itemId },
        'SET lastCheckedAt = :checked',
        { ':checked': new Date().toISOString() }
      );
    } catch (e) {
      console.error('[SCHEDULER] Failed to update timestamp after error:', e);
    }
  }
};

const sendPriceAlert = async (user, item, newPrice, oldPrice) => {
  try {
    const priceDropPercent = oldPrice > 0 ? (((oldPrice - newPrice) / oldPrice) * 100).toFixed(0) : 0;
    const subject = `🎯 Price Alert: ${item.title?.substring(0, 50)}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ff00ff;">🎯 Price Target Hit!</h2>
        <p>The item you're tracking has reached your target price!</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${item.title}</h3>
          <p style="margin: 5px 0; font-size: 24px;"><strong>Now: €${newPrice.toFixed(2)}</strong></p>
          ${oldPrice > 0 ? `<p style="margin: 5px 0; color: #999; text-decoration: line-through;">Was: €${oldPrice.toFixed(2)}</p>` : ''}
          ${priceDropPercent > 0 ? `<p style="margin: 5px 0; color: #00cc00;"><strong>Save ${priceDropPercent}%!</strong></p>` : ''}
          <p style="margin: 5px 0;"><strong>Your Target:</strong> €${item.targetPrice}</p>
        </div>
        
        <a href="${item.url}" style="display: inline-block; background: #ff00ff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Buy Now →
        </a>
        
        <p style="margin-top: 30px; color: #666; font-size: 12px;">
          You received this because you set a price alert on AutoBuy Guard Deal Sniper.
        </p>
      </div>
    `;
    
    await sendEmail(user.email, subject, html);
    console.log(`[SCHEDULER] 📧 Alert email sent to ${user.email}`);
  } catch (e) { 
    console.error('[SCHEDULER] ❌ Email error:', e); 
  }
};

module.exports = { checkAllItems, checkUserItems, checkSingleItem };