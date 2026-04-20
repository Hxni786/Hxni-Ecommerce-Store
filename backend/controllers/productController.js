/**
 * controllers/productController.js
 */

'use strict';

const pool = require('../config/db');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/products
 * Returns products with optional search and category filters.
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { search, category } = req.query;

  let query = `
    SELECT
      id, name, price, description,
      image_url AS imageUrl, category, created_at AS createdAt
    FROM products
  `;
  
  const queryParams = [];
  const whereClauses = [];

  if (search) {
    whereClauses.push(`(name LIKE ? OR description LIKE ?)`);
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern);
  }

  if (category && category !== 'All') {
    whereClauses.push(`category = ?`);
    queryParams.push(category);
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ` + whereClauses.join(' AND ');
  }

  query += ` ORDER BY created_at DESC`;

  const [rows] = await pool.execute(query, queryParams);

  res.status(200).json({
    data: rows,
    count: rows.length,
  });
});

/**
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid product id.' });
  }

  const [rows] = await pool.execute(`
    SELECT id, name, price, description, image_url AS imageUrl, category, created_at AS createdAt
    FROM products WHERE id = ? LIMIT 1
  `, [id]);

  if (rows.length === 0) {
    return res.status(404).json({ error: `Product not found.` });
  }
  res.status(200).json({ data: rows[0] });
});

module.exports = { getAllProducts, getProductById };
