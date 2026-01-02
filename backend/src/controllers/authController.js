// src/controllers/authController.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { putItem, getItem, queryItems, TABLES } = require('../models/dynamodb');

// ============================================
// SIGNUP - Create user with isVerified: false
// ============================================
exports.signup = async (req, res) => {
  try {
    const { email, password, plan } = req.body;

    // 1. Check if user exists
    const existingUsers = await queryItems(
      TABLES.USERS,
      'email = :e',
      { ':e': email },
      'email-index'
    );

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // 4. Create User in DynamoDB (NOT VERIFIED YET)
    const userId = uuidv4();
    const newUser = {
      userId,
      email,
      password: hashedPassword,
      plan: plan || 'free',
      role: 'user',
      isVerified: false,  // <-- NEW: User is NOT verified
      verificationCode,   // <-- NEW: Store the code
      verificationCodeExpires, // <-- NEW: Code expiration
      createdAt: new Date().toISOString()
    };

    await putItem(TABLES.USERS, newUser);

    // 5. Return userId and email (NO TOKEN - they must verify first!)
    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email.',
      data: {
        userId: newUser.userId,
        email: newUser.email,
        verificationCode: verificationCode // Send to frontend for EmailJS
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};

// ============================================
// VERIFY EMAIL - Check verification code
// ============================================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    // 1. Find user by email
    const users = await queryItems(
      TABLES.USERS,
      'email = :e',
      { ':e': email },
      'email-index'
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // 2. Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // 3. Check if code matches
    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // 4. Check if code expired
    if (new Date() > new Date(user.verificationCodeExpires)) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    // 5. Mark user as verified
    const updatedUser = {
      ...user,
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
      verifiedAt: new Date().toISOString()
    };

    await putItem(TABLES.USERS, updatedUser);

    // 6. Generate token (NOW they can login)
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully!',
      token,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          plan: user.plan
        }
      }
    });

  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// ============================================
// RESEND VERIFICATION CODE
// ============================================
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // 1. Find user
    const users = await queryItems(
      TABLES.USERS,
      'email = :e',
      { ':e': email },
      'email-index'
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // 2. Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // 3. Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // 4. Update user with new code
    const updatedUser = {
      ...user,
      verificationCode,
      verificationCodeExpires
    };

    await putItem(TABLES.USERS, updatedUser);

    res.status(200).json({
      success: true,
      message: 'New verification code generated',
      data: {
        email: user.email,
        verificationCode // Send to frontend for EmailJS
      }
    });

  } catch (err) {
    console.error("Resend Code Error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ============================================
// LOGIN - Only allow verified users
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // 1. Find user
    const users = await queryItems(
      TABLES.USERS,
      'email = :e',
      { ':e': email },
      'email-index'
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // 2. Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. CHECK IF VERIFIED - This is the important part!
    if (!user.isVerified) {
      // Generate new code for them
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const updatedUser = {
        ...user,
        verificationCode,
        verificationCodeExpires
      };

      await putItem(TABLES.USERS, updatedUser);

      return res.status(403).json({
        message: 'Please verify your email first',
        needsVerification: true,
        email: user.email,
        verificationCode // Send to frontend for EmailJS
      });
    }

    // 4. Generate token
    const token = jwt.sign(
      { userId: user.userId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 5. Return success
    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          id: user.userId,
          email: user.email,
          plan: user.plan,
          role: user.role
        }
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
};