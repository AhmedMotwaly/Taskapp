const express = require('express');
const router = express.Router();
const { putItem, queryItems, deleteItem, getItem, TABLES } = require('../models/dynamodb');
const { v4: uuidv4 } = require('uuid');
const { fetchProductDetails } = require('../services/scraperService');
const { getPlanConfig, isFeatureAllowed } = require('../config/plans');

// ============================================
// GET ALL ITEMS (for current user)
// ============================================
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const items = await queryItems(
      TABLES.ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );
    
    res.json(items);
  } catch (error) {
    console.error('[ITEMS] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// ============================================
// PREVIEW ITEM (Scrape without saving)
// ============================================
router.post('/preview', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const data = await fetchProductDetails(url);
    res.json(data);
    
  } catch (error) {
    console.error('[ITEMS] Preview error:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// ============================================
// ADD NEW ITEM (with plan limits)
// ============================================
router.post('/', async (req, res) => {
  try {
    const { url, title, targetPrice, mode, currentPrice, imageUrl, autoBuy } = req.body;
    const userId = req.user.userId;
    const userPlan = req.user.plan || 'free';

    console.log(`[ITEMS] Add request from user ${userId} (plan: ${userPlan})`);

    // 1. GET PLAN CONFIG
    const planConfig = getPlanConfig(userPlan);

    // 2. COUNT EXISTING ITEMS
    const existingItems = await queryItems(
      TABLES.ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );
    const currentCount = existingItems.length;

    console.log(`[ITEMS] User has ${currentCount}/${planConfig.itemLimit} items`);

    // 3. CHECK ITEM LIMIT
    if (currentCount >= planConfig.itemLimit) {
      return res.status(403).json({
        error: `Item limit reached! Your ${planConfig.name} plan allows ${planConfig.itemLimit} item(s). Please upgrade to add more.`,
        currentCount,
        limit: planConfig.itemLimit,
        plan: userPlan
      });
    }

    // 4. CHECK AUTO-CHECKOUT PERMISSION
    let allowedAutoBuy = false;
    if (autoBuy === true) {
      if (planConfig.autoCheckout) {
        allowedAutoBuy = true;
      } else {
        console.log(`[ITEMS] Auto-checkout not allowed for ${userPlan} plan`);
        // Don't fail, just disable it
        allowedAutoBuy = false;
      }
    }

    // 5. SANITIZE DATA
    let safeTitle = String(title || 'Unknown Product').trim().substring(0, 500);
    if (!safeTitle) safeTitle = 'Unknown Product';

    let safeLastPrice = parseFloat(currentPrice) || 0;
    let safeTargetPrice = parseFloat(targetPrice) || 0;

    let safeImage = 'https://placehold.co/100x100?text=No+Image';
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      safeImage = imageUrl;
    }

    // 6. CREATE ITEM
    const newItem = {
      itemId: uuidv4(),
      userId,
      url: url || '',
      title: safeTitle,
      targetPrice: safeTargetPrice,
      mode: mode || 'deal',
      lastPrice: safeLastPrice,
      imageUrl: safeImage,
      autoBuy: allowedAutoBuy,
      createdAt: new Date().toISOString(),
      lastCheckedAt: null,
      priceHistory: [
        {
          price: safeLastPrice,
          date: new Date().toISOString()
        }
      ]
    };

    await putItem(TABLES.ITEMS, newItem);

    console.log(`[ITEMS] Created: "${safeTitle}" for user ${userId}`);

    res.status(201).json(newItem);

  } catch (error) {
    console.error('[ITEMS] Add error:', error);
    res.status(500).json({ error: 'Failed to add item: ' + error.message });
  }
});

// ============================================
// DELETE ITEM
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const item = await getItem(TABLES.ITEMS, { itemId: id });
    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await deleteItem(TABLES.ITEMS, { itemId: id });

    console.log(`[ITEMS] Deleted: ${id}`);
    res.json({ message: 'Item deleted' });

  } catch (error) {
    console.error('[ITEMS] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ============================================
// UPDATE TARGET PRICE
// ============================================
router.patch('/:id/target-price', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetPrice } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (typeof targetPrice !== 'number' || targetPrice < 0) {
      return res.status(400).json({ error: 'Target price must be a positive number' });
    }

    // Verify ownership
    const item = await getItem(TABLES.ITEMS, { itemId: id });
    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Update the target price
    const updatedItem = await updateItem(
      TABLES.ITEMS,
      { itemId: id },
      'SET targetPrice = :targetPrice, updatedAt = :updatedAt',
      {
        ':targetPrice': targetPrice,
        ':updatedAt': new Date().toISOString()
      }
    );

    console.log(`[ITEMS] Updated target price for ${id}: €${targetPrice}`);
    res.json(updatedItem);

  } catch (error) {
    console.error('[ITEMS] Update error:', error);
    res.status(500).json({ error: 'Failed to update target price' });
  }
});

module.exports = router;