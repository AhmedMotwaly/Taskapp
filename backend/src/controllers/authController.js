// src/controllers/authController.js (CORRECTED FOR DYNAMODB)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { putItem, queryItems, TABLES } = require('../models/dynamodb'); // Using your AWS helper

exports.signup = async (req, res) => {
  try {
    const { email, password, plan } = req.body;

    // 1. Check if user exists (Using the Index you created in AWS)
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

    // 3. Create User in DynamoDB
    const userId = uuidv4();
    const newUser = {
      userId,
      email,
      password: hashedPassword,
      plan: plan || 'free',
      role: 'user',
      createdAt: new Date().toISOString()
    };

    await putItem(TABLES.USERS, newUser);

    // 4. Generate Token (So they are logged in immediately)
    const token = jwt.sign(
      { userId: newUser.userId, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token, // Send token back so frontend can log them in
      data: {
        user: {
          id: newUser.userId,
          email: newUser.email,
          plan: newUser.plan
        }
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: 'Server error during signup' });
  }
};