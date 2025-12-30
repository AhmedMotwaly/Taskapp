// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = require('../controllers/authController');
const { getItem, putItem, deleteItem, queryItems, TABLES } = require('../models/dynamodb');

const router = express.Router();

// ===========================
// PUBLIC ROUTES
// ===========================
router.post('/signup', authController.signup);

// ===========================
// AUTH MIDDLEWARE
// ===========================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// ===========================
// PROTECTED ROUTES
// ===========================

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getItem(TABLES.USERS, { userId: req.user.userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.userId;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email required' });
    }

    const user = await getItem(TABLES.USERS, { userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = {
      ...user,
      fullName,
      email,
      updatedAt: new Date().toISOString()
    };

    await putItem(TABLES.USERS, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await getItem(TABLES.USERS, { userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date().toISOString();

    await putItem(TABLES.USERS, user);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const items = await queryItems(
      TABLES.ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );

    for (const item of items) {
      await deleteItem(TABLES.ITEMS, { itemId: item.itemId });
    }

    await deleteItem(TABLES.SUBSCRIPTIONS, { userId }).catch(() => {});
    await deleteItem(TABLES.USERS, { userId });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;
