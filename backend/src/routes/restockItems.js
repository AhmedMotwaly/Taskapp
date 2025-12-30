const express = require('express');
const router = express.Router();
const { putItem, queryItems, deleteItem, getItem, TABLES } = require('../models/dynamodb');
const { v4: uuidv4 } = require('uuid');
const { fetchProductDetails } = require('../services/scraperService');
const { getPlanConfig } = require('../config/plans');

// ============================================
// GET ALL RESTOCK ITEMS (for current user)
// ============================================
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const items = await queryItems(
      TABLES.RESTOCK_ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );
    
    res.json(items);
  } catch (error) {
    console.error('[RESTOCK] Get error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// ============================================
// PREVIEW PRODUCT (With Enhanced Debugging)
// ============================================
router.post('/preview', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[RESTOCK] ========================================`);
    console.log(`[RESTOCK] Previewing product: ${url}`);
    console.log(`[RESTOCK] ========================================`);
    
    const data = await fetchProductDetails(url);

    // CRITICAL DEBUG LOGGING
    console.log(`[RESTOCK] ========================================`);
    console.log(`[RESTOCK] Preview Result:`);
    console.log(`[RESTOCK]   - Title: ${data?.title || 'MISSING'}`);
    console.log(`[RESTOCK]   - Price: ${data?.price || 'MISSING'}`);
    console.log(`[RESTOCK]   - Image: ${data?.image ? 'YES' : 'NO'}`);
    console.log(`[RESTOCK]   - In Stock: ${data?.inStock}`);
    console.log(`[RESTOCK]   - Has Variants: ${data?.hasVariants}`);
    console.log(`[RESTOCK]   - Variants Count: ${data?.variants?.length || 0}`);
    
    if (data?.variants && data.variants.length > 0) {
      data.variants.forEach((variant, i) => {
        console.log(`[RESTOCK]   - Variant ${i + 1}: ${variant.name} (${variant.options?.length || 0} options)`);
        if (variant.options && variant.options.length > 0) {
          console.log(`[RESTOCK]     Options: ${variant.options.map(o => o.value || o.label).join(', ')}`);
        }
      });
    } else {
      console.log(`[RESTOCK]   - NO VARIANTS FOUND!`);
    }
    console.log(`[RESTOCK] ========================================`);

    // Return variants if available
    res.json({
      title: data.title,
      price: data.price,
      image: data.image,
      inStock: data.inStock,
      hasVariants: data.hasVariants || false,
      variants: data.variants || []
    });

  } catch (error) {
    console.error('[RESTOCK] ========================================');
    console.error('[RESTOCK] Preview error:', error);
    console.error('[RESTOCK] Stack:', error.stack);
    console.error('[RESTOCK] ========================================');
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// ============================================
// ADD NEW RESTOCK ITEM (with plan limits)
// ============================================
router.post('/', async (req, res) => {
  try {
    const { url, notes, notifyEmail, notifySMS, notifyBrowser, selectedVariants } = req.body;
    const userId = req.user.userId;
    const userPlan = req.user.plan || 'free';

    console.log(`[RESTOCK] Add request from user ${userId} (plan: ${userPlan})`);

    // 1. GET PLAN CONFIG
    const planConfig = getPlanConfig(userPlan);

    // 2. DEFINE RESTOCK LIMITS (based on plan)
    const restockLimits = {
      free: 1,
      pro: 10,
      ultra: -1 // unlimited
    };

    const restockLimit = restockLimits[userPlan] || 1;

    // 3. COUNT EXISTING RESTOCK ITEMS
    const existingItems = await queryItems(
      TABLES.RESTOCK_ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );
    const currentCount = existingItems.length;

    console.log(`[RESTOCK] User has ${currentCount}/${restockLimit === -1 ? 'unlimited' : restockLimit} restock items`);

    // 4. CHECK LIMIT
    if (restockLimit !== -1 && currentCount >= restockLimit) {
      return res.status(403).json({
        error: `Restock limit reached! Your ${planConfig.name} plan allows ${restockLimit} item(s). Please upgrade.`,
        currentCount,
        limit: restockLimit,
        plan: userPlan
      });
    }

    // 5. FETCH PRODUCT DETAILS
    console.log(`[RESTOCK] Fetching product details...`);
    const productData = await fetchProductDetails(url);

    if (!productData) {
      return res.status(400).json({ error: 'Could not fetch product details from URL' });
    }

    // 6. CHECK SMS PERMISSION
    const allowSMS = planConfig.smsAlerts && notifySMS === true;

    // 7. CREATE RESTOCK ITEM (Now correctly includes Variants)
    const newItem = {
      restockId: uuidv4(),
      userId,
      url,
      title: productData.title || 'Unknown Product',
      imageUrl: productData.imageUrl || productData.image || 'https://placehold.co/100x100?text=No+Image',
      notes: notes || '',
      
      // VARIANTS DATA (Correctly merged here)
      hasVariants: productData.hasVariants || false,
      selectedVariants: selectedVariants || null, // { size: "M", color: "Blue" }
      availableVariants: productData.variants || [], // All available options
      
      // Stock tracking
      currentStatus: productData.inStock ? 'in-stock' : 'out-of-stock',
      lastChecked: new Date().toISOString(),
      lastNotified: null,
      
      // Notification preferences
      notifyEmail: notifyEmail !== false, // default true
      notifySMS: allowSMS,
      notifyBrowser: notifyBrowser !== false, // default true
      
      // Metadata
      checkCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await putItem(TABLES.RESTOCK_ITEMS, newItem);

    console.log(`[RESTOCK] Created: "${newItem.title}" (Status: ${newItem.currentStatus})`);

    res.status(201).json(newItem);

  } catch (error) {
    console.error('[RESTOCK] Add error:', error);
    res.status(500).json({ error: 'Failed to add restock item: ' + error.message });
  }
});

// ============================================
// DELETE RESTOCK ITEM
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const item = await getItem(TABLES.RESTOCK_ITEMS, { restockId: id });
    if (!item || item.userId !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await deleteItem(TABLES.RESTOCK_ITEMS, { restockId: id });

    console.log(`[RESTOCK] Deleted: ${id}`);
    res.json({ message: 'Item deleted' });

  } catch (error) {
    console.error('[RESTOCK] Delete error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;