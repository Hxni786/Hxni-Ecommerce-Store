/**
 * controllers/orderController.js
 * 
 * Handles order creation and retrieval.
 * Uses transactions to ensure data integrity during checkout.
 */

'use strict';

const pool = require('../config/db');

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const SQL = {
  GET_CART: `
    SELECT ci.quantity, p.id, p.name, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `,
  INSERT_ORDER: `
    INSERT INTO orders (user_id, total_price) VALUES (?, ?)
  `,
  INSERT_ORDER_ITEM: `
    INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
    VALUES (?, ?, ?, ?)
  `,
  CLEAR_CART: `
    DELETE FROM cart_items WHERE user_id = ?
  `,
  GET_ORDERS: `
    SELECT id, total_price, status, created_at
    FROM orders
    WHERE user_id = ?
    ORDER BY created_at DESC
  `,
  GET_ORDER_ITEMS: `
    SELECT oi.product_id, oi.quantity, oi.price_at_purchase, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `,
};

/**
 * POST /api/orders
 * Converts current cart into a permanent order.
 */
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Fetch current cart items
    const [cartItems] = await connection.execute(SQL.GET_CART, [userId]);
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Cannot checkout an empty cart.' });
    }

    // 2. Calculate subtotal
    const totalPrice = cartItems.reduce((acc, item) => {
      return acc + (parseFloat(item.price) * item.quantity);
    }, 0);

    // 3. Create the Order master record
    const [orderResult] = await connection.execute(SQL.INSERT_ORDER, [userId, totalPrice]);
    const orderId = orderResult.insertId;

    // 4. Create Order Items (snapshotting prices)
    for (const item of cartItems) {
      await connection.execute(SQL.INSERT_ORDER_ITEM, [
        orderId,
        item.id,
        item.quantity,
        item.price
      ]);
    }

    // 5. Wipe the user's cart
    await connection.execute(SQL.CLEAR_CART, [userId]);

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully.',
      orderId,
      total: totalPrice,
    });
  } catch (err) {
    await connection.rollback();
    console.error('[orderController] createOrder Error:', err.message);
    res.status(500).json({ error: 'Failed to process order.' });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/orders
 * Returns order history for the current user.
 */
const getOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.execute(SQL.GET_ORDERS, [req.user.id]);
  
  // We could also fetch items for each order, but for a summary, this is fine.
  res.status(200).json({ data: orders });
});

module.exports = { createOrder, getOrders };
