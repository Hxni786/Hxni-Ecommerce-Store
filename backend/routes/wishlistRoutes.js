/**
 * routes/wishlistRoutes.js
 * 
 * Routes for managing user favorites.
 * All routes are protected by authMiddleware.
 */

'use strict';

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, wishlistController.getWishlist);
router.post('/toggle', authMiddleware, wishlistController.toggleWishlist);

module.exports = router;
