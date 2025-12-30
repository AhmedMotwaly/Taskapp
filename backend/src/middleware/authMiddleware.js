const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Get the header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  // 2. Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key');
    
    // 4. Attach user info to request so routes can use it
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

module.exports = authMiddleware;