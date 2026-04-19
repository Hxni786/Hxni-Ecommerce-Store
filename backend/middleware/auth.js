/**
 * middleware/auth.js
 *
 * JWT verification middleware. Attaches req.user = { id, email }
 * on success, or returns 401 on failure.
 */

'use strict';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hxnian_secret_key_123';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
