/**
 * routes/orderRoutes.js
 * 
 * Routes for order operations.
 * All routes are protected by authMiddleware.
 */

'use strict';

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.post('/', authMiddleware, orderController.createOrder);
router.get('/', authMiddleware, orderController.getOrders);

module.exports = router;
