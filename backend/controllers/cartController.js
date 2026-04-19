/**
 * controllers/cartController.js
 *
 * CRUD operations for the database-backed shopping cart.
 * All endpoints require authentication (req.user.id).
 */

'use strict';

const pool = require('../config/db');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const SQL = {
  GET_CART: `
    SELECT 
      ci.id         AS cartItemId,
      ci.quantity,
      p.id          AS id,
      p.name,
      p.price,
      p.description,
      p.image_url   AS imageUrl,
      p.category,
      p.created_at  AS createdAt
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `,
  ADD_ITEM: `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `,
  UPDATE_QTY: `
    UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?
  `,
  REMOVE_ITEM: `
    DELETE FROM cart_items WHERE user_id = ? AND product_id = ?
  `,
  CLEAR_CART: `
    DELETE FROM cart_items WHERE user_id = ?
  `,
  COUNT_ITEMS: `
    SELECT COALESCE(SUM(quantity), 0) AS total FROM cart_items WHERE user_id = ?
  `,
};

/**
 * GET /api/cart
 */
const getCart = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(SQL.GET_CART, [req.user.id]);
  const [countRows] = await pool.execute(SQL.COUNT_ITEMS, [req.user.id]);
  res.status(200).json({
    data: rows,
    count: countRows[0].total,
  });
});

/**
 * POST /api/cart   body: { productId, quantity? }
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required.' });
  }

  await pool.execute(SQL.ADD_ITEM, [req.user.id, productId, quantity]);

  // Return the updated cart
  const [rows] = await pool.execute(SQL.GET_CART, [req.user.id]);
  const [countRows] = await pool.execute(SQL.COUNT_ITEMS, [req.user.id]);
  res.status(200).json({
    data: rows,
    count: countRows[0].total,
    message: 'Item added to cart.',
  });
});

/**
 * PUT /api/cart/:productId   body: { quantity }
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be at least 1.' });
  }

  await pool.execute(SQL.UPDATE_QTY, [quantity, req.user.id, productId]);

  const [rows] = await pool.execute(SQL.GET_CART, [req.user.id]);
  const [countRows] = await pool.execute(SQL.COUNT_ITEMS, [req.user.id]);
  res.status(200).json({ data: rows, count: countRows[0].total });
});

/**
 * DELETE /api/cart/:productId
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  await pool.execute(SQL.REMOVE_ITEM, [req.user.id, productId]);

  const [rows] = await pool.execute(SQL.GET_CART, [req.user.id]);
  const [countRows] = await pool.execute(SQL.COUNT_ITEMS, [req.user.id]);
  res.status(200).json({ data: rows, count: countRows[0].total });
});

/**
 * DELETE /api/cart
 */
const clearCart = asyncHandler(async (req, res) => {
  await pool.execute(SQL.CLEAR_CART, [req.user.id]);
  res.status(200).json({ data: [], count: 0, message: 'Cart cleared.' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
