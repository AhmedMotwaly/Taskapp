const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import Routes
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const billingRoutes = require('./routes/billing');
const confirmRoutes = require('./routes/confirm');
const adminRoutes = require('./routes/admin');
const subscriptionRoutes = require('./routes/subscription'); 
const historyRoutes = require('./routes/history');
const restockItemsRoutes = require('./routes/restockItems'); 

const authenticate = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- SECURITY MIDDLEWARE (HELMET) ---
app.use(helmet());

// --- CORS CONFIGURATION (THE FIX) ---
// We explicitly list who is allowed to talk to this backend
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.autobuyguard.store",
  "https://autobuyguard.store",
  "https://api.autobuyguard.store" 
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      // If the origin is NOT in the list, block it
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Important for cookies/sessions if you use them
}));

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

// PARSERS
app.use('/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ message: 'AutoBuy Guard API', status: 'running' });
});

// ROUTES
app.use('/auth', authRoutes);
app.use('/items', authenticate, itemsRoutes);
app.use('/restock', authenticate, restockItemsRoutes);
app.use('/subscription', authenticate, subscriptionRoutes);
app.use('/billing', authenticate, billingRoutes);
app.use('/admin', authenticate, adminRoutes);
app.use('/confirm', confirmRoutes);
app.use('/history', require('./middleware/auth'), historyRoutes);

// 404 JSON fallback
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ERROR HANDLER
app.use(errorHandler);

module.exports = app;