/**
 * controllers/wishlistController.js
 * 
 * Logic for managing user favorites.
 */

'use strict';

const pool = require('../config/db');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const SQL = {
  GET_WISHLIST: `
    SELECT p.id, p.name, p.price, p.description, p.image_url AS imageUrl, p.category
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
    ORDER BY w.created_at DESC
  `,
  CHECK_WISHLIST: `
    SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?
  `,
  ADD_TO_WISHLIST: `
    INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)
  `,
  REMOVE_FROM_WISHLIST: `
    DELETE FROM wishlists WHERE user_id = ? AND product_id = ?
  `,
};

/**
 * GET /api/wishlist
 * Returns all products in the user's wishlist.
 */
const getWishlist = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(SQL.GET_WISHLIST, [req.user.id]);
  res.status(200).json({ data: rows });
});

/**
 * POST /api/wishlist/toggle
 * Adds to wishlist if absent, removes if already present.
 */
const toggleWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  // Check if already in wishlist
  const [existing] = await pool.execute(SQL.CHECK_WISHLIST, [userId, productId]);

  if (existing.length > 0) {
    // Remove it
    await pool.execute(SQL.REMOVE_FROM_WISHLIST, [userId, productId]);
    return res.status(200).json({ message: 'Removed from wishlist', inWishlist: false });
  } else {
    // Add it
    await pool.execute(SQL.ADD_TO_WISHLIST, [userId, productId]);
    return res.status(201).json({ message: 'Added to wishlist', inWishlist: true });
  }
});

module.exports = { getWishlist, toggleWishlist };
