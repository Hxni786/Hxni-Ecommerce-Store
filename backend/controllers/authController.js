/**
 * controllers/authController.js
 *
 * Handles user registration and authentication logically.
 */

'use strict';

const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hxnian_secret_key_123';
const JWT_EXPIRES_IN = '7d';

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const SQL = {
  CREATE_USER: `INSERT INTO users (email, password_hash) VALUES (?, ?)`,
  FIND_USER_BY_EMAIL: `SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1`,
};

/**
 * POST /api/auth/register
 */
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  // 1. Check if user already exists
  const [existing] = await pool.execute(SQL.FIND_USER_BY_EMAIL, [email]);
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // 3. Insert new user
  const [result] = await pool.execute(SQL.CREATE_USER, [email, passwordHash]);
  const userId = result.insertId;

  // 4. Generate token
  const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(201).json({
    data: { id: userId, email },
    token,
    message: 'Registration successful.'
  });
});

/**
 * POST /api/auth/login
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide both email and password.' });
  }

  // 1. Find user
  const [userRows] = await pool.execute(SQL.FIND_USER_BY_EMAIL, [email]);
  if (userRows.length === 0) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
  
  const user = userRows[0];

  // 2. Verify password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  // 3. Generate token
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.status(200).json({
    data: { id: user.id, email: user.email },
    token,
    message: 'Login successful.'
  });
});

module.exports = { registerUser, loginUser };
