const express = require('express');
const router = express.Router();
const confirmService = require('../services/confirmService');

// GET /confirm?token=abc-123
router.get('/', async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing confirmation token' });
    }

    const result = await confirmService.confirmPurchase(token);
    
    // Success: You might want to redirect them to a "Success" page on your frontend
    // res.redirect('https://autobuy-guard.com/purchase-success');
    
    // For now, we just return JSON
    res.json(result);
  } catch (error) {
    // If token is expired or invalid
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;