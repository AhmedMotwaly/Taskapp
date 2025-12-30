const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { signToken, verifyToken } = require('../utils/jwt');
const { putItem, queryItems, getItem, updateItem, TABLES } = require('../models/dynamodb');
const { getPlanConfig } = require('../config/plans');
const { sendEmail } = require('../services/emailService');

// ============================================
// REGISTER/SIGNUP - New users get "free" plan
// ============================================
const registerHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check if user exists
    const existingUsers = await queryItems(
      TABLES.USERS,
      'email = :email',
      { ':email': email.toLowerCase() },
      'email-index'
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password & generate verification code
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    // Create user with FREE plan by default
    const newUser = {
      userId: uuidv4(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0],
      plan: 'free', // ← ALWAYS FREE FOR NEW USERS
      role: 'user', // ← Regular user, not admin
      createdAt: new Date().toISOString(),
      emailVerified: false,
      verificationCode,
      verificationExpiresAt,
      smsNumber: null,
      lastCheckAt: null
    };

    await putItem(TABLES.USERS, newUser);

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Verify your AutoBuy Guard account</h2>
          <p>Use this code to verify your email. It expires in 15 minutes:</p>
          <h1 style="color: #00f3ff; background: #000; display: inline-block; padding: 10px 20px; border-radius: 5px;">${verificationCode}</h1>
        </div>
      `;
      await sendEmail(newUser.email, 'Your AutoBuy Guard verification code', html);
      console.log(`[AUTH] Verification email queued for ${newUser.email}`);
    } catch (emailError) {
      console.error('[AUTH] Failed to send verification email:', emailError.message);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    // Generate token
    const token = signToken({
      userId: newUser.userId,
      email: newUser.email,
      plan: newUser.plan,
      role: newUser.role
    });

    console.log(`[AUTH] New user registered: ${email} (plan: free)`);

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: newUser.userId,
      email: newUser.email,
      plan: newUser.plan
    });

  } catch (error) {
    console.error('[AUTH] Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

router.post('/register', registerHandler);
router.post('/signup', registerHandler);

// ============================================
// VERIFY EMAIL
// ============================================
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const users = await queryItems(
      TABLES.USERS,
      'email = :email',
      { ':email': email.toLowerCase() },
      'email-index'
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    if (user.emailVerified) {
      return res.json({ message: 'User already verified' });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.verificationExpiresAt && new Date() > new Date(user.verificationExpiresAt)) {
      return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
    }

    await updateItem(
      TABLES.USERS,
      { userId: user.userId },
      'SET emailVerified = :true REMOVE verificationCode, verificationExpiresAt',
      { ':true': true }
    );

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[AUTH] Verify error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[AUTH] Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    console.log('[AUTH] Searching for user in DB...');
    const users = await queryItems(
      TABLES.USERS,
      'email = :email',
      { ':email': email.toLowerCase() },
      'email-index'
    );

    console.log('[AUTH] Users found:', users.length);

    if (users.length === 0) {
      console.log('[AUTH] No user found with email:', email.toLowerCase());
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    console.log('[AUTH] Found user:', user.email, 'Plan:', user.plan, 'Role:', user.role);

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('[AUTH] Password valid:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = signToken({
      userId: user.userId,
      email: user.email,
      plan: user.plan || 'free',
      role: user.role || 'user'
    });

    console.log('[AUTH] Login successful for:', email);

    res.json({
      message: 'Login successful',
      token,
      userId: user.userId,
      email: user.email,
      plan: user.plan || 'free',
      role: user.role || 'user'
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// GET CURRENT USER
// ============================================
router.get('/me', async (req, res) => {
  try {
    // 1. Verify Token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const { verifyToken } = require('../utils/jwt');
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    // 2. Get User from DB
    const user = await getItem(TABLES.USERS, { userId: decoded.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { getPlanConfig } = require('../config/plans');
    const planConfig = getPlanConfig(user.plan);

    // 3. Return User Data (FIX: Send BOTH name and fullName)
    res.json({
      userId: user.userId,
      email: user.email,
      name: user.name,
      fullName: user.name, // <--- FIX: This makes the name show up in the frontend!
      plan: user.plan || 'free',
      role: user.role || 'user',
      planDetails: planConfig,
      smsNumber: user.smsNumber,
      smsEnabled: user.smsEnabled,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('[AUTH] Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// UPDATE PROFILE ROUTE
// ============================================
router.put('/profile', async (req, res) => {
  try {
    // 1. Verify Token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    const userId = decoded.userId;
    
    // 2. Get Data
    const name = req.body.fullName || req.body.name; 
    const email = req.body.email;
    const smsNumber = req.body.smsNumber;     // <--- NEW FIELD
    const smsEnabled = req.body.smsEnabled;   // <--- NEW FIELD

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // 3. Prepare Update Expression (Dynamic)
    // We start with name, email, and updatedAt
    let updateExp = 'SET #n = :name, email = :email, updatedAt = :now';
    let expValues = { 
      ':name': name, 
      ':email': email,
      ':now': new Date().toISOString()
    };
    let expNames = { '#n': 'name' };

    // Conditionally add smsNumber if provided
    if (smsNumber !== undefined) {
      updateExp += ', smsNumber = :sms';
      expValues[':sms'] = smsNumber;
    }

    // Conditionally add smsEnabled if provided
    if (smsEnabled !== undefined) {
      updateExp += ', smsEnabled = :enabled';
      expValues[':enabled'] = smsEnabled;
    }

    // 4. Update DynamoDB
    await updateItem(
      TABLES.USERS,
      { userId },
      updateExp,
      expValues,
      expNames
    );

    // 5. Return success
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: { 
        name, 
        email,
        smsNumber,
        smsEnabled 
      }
    });

  } catch (error) {
    console.error('[AUTH] Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ============================================
// UPDATE PASSWORD ROUTE
// ============================================
router.put('/password', async (req, res) => {
  try {
    // 1. Verify Token
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ error: 'Invalid token' });

    const userId = decoded.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }

    // 2. Get User to check current password
    const user = await getItem(TABLES.USERS, { userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // 3. Hash New Password and Save
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await updateItem(
      TABLES.USERS,
      { userId },
      'SET password = :pass, updatedAt = :now',
      { 
        ':pass': hashedPassword,
        ':now': new Date().toISOString()
      }
    );

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('[AUTH] Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;