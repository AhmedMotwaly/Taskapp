const express = require('express');
const router = express.Router();
const { scanItems, queryItems, getItem, updateItem, deleteItem, TABLES } = require('../models/dynamodb');
const { PLANS, getPlanConfig } = require('../config/plans');

// ============================================
// ADMIN MIDDLEWARE - Check if user is admin
// ============================================
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Apply to all routes
router.use(requireAdmin);

// ============================================
// GET ALL USERS
// ============================================
router.get('/users', async (req, res) => {
  try {
    const users = await scanItems(TABLES.USERS);
    
    // Remove passwords from response
    const safeUsers = users.map(u => ({
      userId: u.userId,
      email: u.email,
      name: u.name,
      plan: u.plan || 'free',
      role: u.role || 'user',
      createdAt: u.createdAt,
      emailVerified: u.emailVerified,
      smsNumber: u.smsNumber
    }));

    res.json(safeUsers);

  } catch (error) {
    console.error('[ADMIN] Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ============================================
// GET SINGLE USER
// ============================================
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await getItem(TABLES.USERS, { userId: req.params.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's items count
    const items = await queryItems(
      TABLES.ITEMS,
      'userId = :uid',
      { ':uid': user.userId },
      'userId-index'
    );

    res.json({
      userId: user.userId,
      email: user.email,
      name: user.name,
      plan: user.plan || 'free',
      role: user.role || 'user',
      createdAt: user.createdAt,
      itemCount: items.length,
      planConfig: getPlanConfig(user.plan)
    });

  } catch (error) {
    console.error('[ADMIN] Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ============================================
// UPDATE USER PLAN
// ============================================
router.patch('/users/:userId/plan', async (req, res) => {
  try {
    const { plan } = req.body;
    const { userId } = req.params;

    // Validate plan
    if (!PLANS[plan]) {
      return res.status(400).json({ 
        error: 'Invalid plan',
        validPlans: Object.keys(PLANS)
      });
    }

    await updateItem(
      TABLES.USERS,
      { userId },
      'SET #p = :plan',
      { ':plan': plan },
      { '#p': 'plan' }
    );

    console.log(`[ADMIN] Updated user ${userId} to plan: ${plan}`);

    res.json({ 
      message: 'Plan updated',
      userId,
      plan 
    });

  } catch (error) {
    console.error('[ADMIN] Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// ============================================
// UPDATE USER ROLE
// ============================================
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles: ['user', 'admin']
      });
    }

    await updateItem(
      TABLES.USERS,
      { userId },
      'SET #r = :role',
      { ':role': role },
      { '#r': 'role' }
    );

    console.log(`[ADMIN] Updated user ${userId} to role: ${role}`);

    res.json({ 
      message: 'Role updated',
      userId,
      role 
    });

  } catch (error) {
    console.error('[ADMIN] Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ============================================
// DELETE USER
// ============================================
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Don't allow deleting yourself
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Delete user's items first
    const items = await queryItems(
      TABLES.ITEMS,
      'userId = :uid',
      { ':uid': userId },
      'userId-index'
    );

    for (const item of items) {
      await deleteItem(TABLES.ITEMS, { itemId: item.itemId });
    }

    // Delete user
    await deleteItem(TABLES.USERS, { userId });

    console.log(`[ADMIN] Deleted user ${userId} and ${items.length} items`);

    res.json({ 
      message: 'User deleted',
      itemsDeleted: items.length
    });

  } catch (error) {
    console.error('[ADMIN] Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ============================================
// GET SYSTEM STATS
// ============================================
router.get('/stats', async (req, res) => {
  try {
    const users = await scanItems(TABLES.USERS);
    const items = await scanItems(TABLES.ITEMS);

    // Count by plan
    const planCounts = { free: 0, pro: 0, ultra: 0 };
    for (const user of users) {
      const plan = user.plan || 'free';
      planCounts[plan] = (planCounts[plan] || 0) + 1;
    }

    res.json({
      totalUsers: users.length,
      totalItems: items.length,
      usersByPlan: planCounts,
      adminCount: users.filter(u => u.role === 'admin').length
    });

  } catch (error) {
    console.error('[ADMIN] Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ============================================
// GET ALL PLANS
// ============================================
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

module.exports = router;