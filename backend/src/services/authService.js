const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const { putItem, queryItems, updateItem, TABLES } = require('../models/dynamodb');
const { generateToken } = require('../utils/jwt');
const { validateEmail, validatePassword } = require('../utils/validators');

// --- 1. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// --- 2. HELPER: Send Verification Email ---
const sendVerificationEmail = async (email, code) => {
  console.log(`[EMAIL SERVICE] Sending code to ${email}...`);
  const mailOptions = {
    from: '"AutoBuy Guard" <no-reply@autobuyguard.com>',
    to: email,
    subject: 'Your Verification Code',
    text: `Your AutoBuy Guard verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to AutoBuy Guard!</h2>
        <p>Please use the code below to verify your account:</p>
        <h1 style="color: #00f3ff; background: #000; display: inline-block; padding: 10px 20px; border-radius: 5px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Email sent successfully.`);
  } catch (error) {
    console.error('[EMAIL SERVICE ERROR]', error);
    console.log(`[DEV FALLBACK] The code is: ${code}`);
  }
};

// --- 3. HELPER: Send Reset Email ---
const sendResetEmail = async (email, code) => {
  console.log(`[EMAIL SERVICE] Sending reset code to ${email}...`);
  const mailOptions = {
    from: '"AutoBuy Guard Security" <no-reply@autobuyguard.com>',
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use this code:</p>
        <h1 style="color: #ff00ff; background: #000; display: inline-block; padding: 10px 20px; border-radius: 5px;">${code}</h1>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Reset email sent successfully.`);
  } catch (error) {
    console.error('[EMAIL ERROR]', error);
    console.log(`[DEV FALLBACK] Reset code is: ${code}`);
  }
};

// --- 4. CORE AUTH FUNCTIONS ---

const signup = async (email, password) => {
  if (!validateEmail(email)) throw new Error('Invalid email format');
  if (!validatePassword(password)) throw new Error('Password must be at least 8 characters');

  const existingUsers = await queryItems(TABLES.USERS, 'email = :email', { ':email': email }, 'email-index').catch(() => []);
  if (existingUsers.length > 0) throw new Error('User already exists');

  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  const user = { 
    userId, 
    email, 
    passwordHash, 
    createdAt: new Date().toISOString(),
    isVerified: false,
    verificationCode
  };

  await putItem(TABLES.USERS, user);
  await sendVerificationEmail(email, verificationCode);

  return { message: 'Verification code sent', userId }; 
};

const verifyEmail = async (email, code) => {
  const users = await queryItems(TABLES.USERS, 'email = :email', { ':email': email }, 'email-index');
  if (users.length === 0) throw new Error('User not found');
  const user = users[0];

  if (user.isVerified) return { message: 'User already verified' };
  if (user.verificationCode !== code) throw new Error('Invalid verification code');

  await updateItem(
    TABLES.USERS, 
    { userId: user.userId }, 
    'SET isVerified = :true REMOVE verificationCode', 
    { ':true': true }
  );

  const token = generateToken({ userId: user.userId, email: user.email });
  return { token, userId: user.userId, email: user.email };
};

const login = async (email, password) => {
  if (!validateEmail(email)) throw new Error('Invalid email format');

  const users = await queryItems(TABLES.USERS, 'email = :email', { ':email': email }, 'email-index').catch(() => []);
  if (users.length === 0) throw new Error('Invalid credentials');

  const user = users[0];
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) throw new Error('Invalid credentials');
  
  if (user.isVerified === false) {
    throw new Error('Please verify your email address first.');
  }

  const token = generateToken({ userId: user.userId, email: user.email });
  return { userId: user.userId, email: user.email, token };
};

const resendCode = async (email) => {
  const users = await queryItems(TABLES.USERS, 'email = :email', { ':email': email }, 'email-index');
  if (users.length === 0) throw new Error('User not found');
  const user = users[0];

  if (user.isVerified) throw new Error('Account already verified. Please login.');

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();

  await updateItem(
    TABLES.USERS,
    { userId: user.userId },
    'SET verificationCode = :code',
    { ':code': newCode }
  );

  await sendVerificationEmail(email, newCode);
  return { message: 'New verification code sent' };
};

const requestPasswordReset = async (email) => {
  console.log(`[DEBUG] Reset requested for: ${email}`);

  const users = await queryItems(TABLES.USERS, 'email = :email', { ':email': email }, 'email-index');
  
  if (users.length === 0) {
    console.log('[DEBUG] User not found in DB. Aborting silently.');
    // We return success to not reveal that the user doesn't exist (Security)
    return { message: 'If email exists, code sent.' };
  }

  const user = users[0];
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  await updateItem(
    TABLES.USERS,
    { userId: user.userId },
    'SET resetCode = :code',
    { ':code': resetCode }
  );

  await sendResetEmail(email, resetCode);
  return { message: 'Reset code sent' };
};

const resetPassword = async (email, code, newPassword) => {
  const users = await queryItems(TABLES.USERS, 'email = :email', { ':email': email }, 'email-index');
  if (users.length === 0) throw new Error('Invalid request');
  const user = users[0];

  if (user.resetCode !== code) throw new Error('Invalid or expired reset code');
  if (!validatePassword(newPassword)) throw new Error('New password must be at least 8 characters');
  
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await updateItem(
    TABLES.USERS,
    { userId: user.userId },
    'SET passwordHash = :hash REMOVE resetCode',
    { ':hash': passwordHash }
  );

  return { message: 'Password updated successfully' };
};

// --- 5. EXPORT EVERYTHING ---
module.exports = { 
  signup, 
  login, 
  verifyEmail, 
  resendCode, 
  requestPasswordReset, 
  resetPassword 
};