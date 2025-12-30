require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { putItem, queryItems, TABLES } = require('../models/dynamodb');

const createAdmin = async () => {
  const email = 'admin@autobuyguard.com'; // ← Change this
  const password = 'YourSecurePassword123!'; // ← Change this

  try {
    // Check if exists
    const existing = await queryItems(
      TABLES.USERS,
      'email = :email',
      { ':email': email },
      'email-index'
    );

    if (existing.length > 0) {
      console.log('Admin already exists!');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = {
      userId: uuidv4(),
      email,
      password: hashedPassword,
      name: 'Admin',
      plan: 'ultra', // Admins get Ultra
      role: 'admin', // ← This makes them admin
      createdAt: new Date().toISOString(),
      emailVerified: true
    };

    await putItem(TABLES.USERS, admin);

    console.log('✅ Admin created!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role: admin');
    console.log('Plan: ultra');

  } catch (error) {
    console.error('Error:', error);
  }
};

createAdmin();