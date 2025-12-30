const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_min_32_chars_long_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============================================
// SIGN TOKEN (Create JWT)
// ============================================
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// ============================================
// VERIFY TOKEN (Decode JWT)
// ============================================
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.log('[JWT] Verify failed:', error.message);
    return null;
  }
};

// ============================================
// DECODE TOKEN (Without verification)
// ============================================
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = { signToken, verifyToken, decodeToken };