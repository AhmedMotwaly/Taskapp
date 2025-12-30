// SaaS\Backend\src\routes\history.js
const express = require('express');
const router = express.Router();
const { queryItems, TABLES } = require('../models/dynamodb');

router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1. Fetch Deal Sniper Items
    const dealItems = await queryItems(
      TABLES.ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );

    // 2. Fetch Restock Sniper Items
    const restockItems = await queryItems(
      TABLES.RESTOCK_ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );

    // 3. Format Deal Items
    const formattedDeals = dealItems.map(item => ({
      id: item.itemId,
      item: item.title || 'Unknown Deal',
      lastKnownPrice: item.lastPrice || item.currentPrice || 0,
      status: item.lastPrice && item.lastPrice <= item.targetPrice ? 'purchased' : 'simulated', // logic: if price met target, assume purchased
      timestamp: item.createdAt,
      type: 'Deal Sniper'
    }));

    // 4. Format Restock Items
    const formattedRestocks = restockItems.map(item => ({
      id: item.restockId,
      item: item.title || 'Unknown Product',
      lastKnownPrice: 0, // Restock items might not strictly have a "last price" tracked continuously
      status: item.currentStatus === 'in-stock' ? 'purchased' : 'simulated', // logic: if in stock, assume success
      timestamp: item.createdAt,
      type: 'Restock Sniper'
    }));

    // 5. Combine and Sort by Date (Newest First)
    const history = [...formattedDeals, ...formattedRestocks].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json(history);

  } catch (error) {
    console.error('[HISTORY] Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;