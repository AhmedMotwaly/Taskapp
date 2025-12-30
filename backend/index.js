const express = require('express');
const cors = require('cors');

// --- 1. IMPORT YOUR PROJECT'S AUTH TOOL ---
// Test deployment pipeline
// Deployment test - GitHub Actions workflow
// This ensures we verify tokens EXACTLY the same way login does
// (It handles the Secret Key and decoding automatically)
const { verifyToken } = require('./src/utils/jwt'); 

// --- 2. IMPORT ROUTE FILES ---
const authRoutes = require('./src/routes/auth'); 
const itemRoutes = require('./src/routes/items');
const historyRoutes = require('./src/routes/history');
const restockRoutes = require('./src/routes/restockItems');
const adminRoutes = require('./src/routes/admin');
const billingRoutes = require('./src/routes/billing');
const subRoutes = require('./src/routes/subscription');
const confirmRoutes = require('./src/routes/confirm');

const app = express();

const origin = process.env.FRONTEND_URL;
const port = process.env.PORT || 3000;

app.use(cors({
  origin: origin,
  credentials: true
}));
app.use(express.json());

console.log(`CORS is set to allow: ${origin}`);

// --- 3. DEFINE AUTH MIDDLEWARE (USING YOUR UTILITY) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract "Bearer <token>"

  if (!token) {
    console.log("[Auth] No token provided");
    return res.status(401).json({ error: 'No token' });
  }

  // Use the utility function from src/utils/jwt.js
  const user = verifyToken(token);

  if (!user) {
    console.log("[Auth] Invalid token");
    return res.status(403).json({ error: 'Invalid token' });
  }

  // Success! Attach the user to the request so items.js can use it
  req.user = user;
  next();
};

// --- 4. MOUNT ROUTES ---

// Public Routes (Login handles its own auth)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

// Protected Routes (Wrapped with authenticateToken)
app.use('/api/items', authenticateToken, itemRoutes);
app.use('/items', authenticateToken, itemRoutes);

app.use('/api/history', authenticateToken, historyRoutes);
app.use('/history', authenticateToken, historyRoutes);

app.use('/api/restock', authenticateToken, restockRoutes);
app.use('/restock', authenticateToken, restockRoutes);

app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/admin', authenticateToken, adminRoutes);

app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/billing', authenticateToken, billingRoutes);

app.use('/api/subscription', authenticateToken, subRoutes);
app.use('/subscription', authenticateToken, subRoutes);

// Confirmation is usually public
app.use('/api/confirm', confirmRoutes);
app.use('/confirm', confirmRoutes);

// --- 5. START SERVER ---
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running and listening on port ${port}`);
  console.log('Routes loaded with Project-Native Authentication.');
});