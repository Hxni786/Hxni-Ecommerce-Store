/**
 * routes/cartRoutes.js
 *
 * All cart endpoints are protected by the auth middleware.
 */

'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.get('/',              auth, cartController.getCart);
router.post('/',             auth, cartController.addToCart);
router.put('/:productId',   auth, cartController.updateCartItem);
router.delete('/:productId', auth, cartController.removeFromCart);
router.delete('/',           auth, cartController.clearCart);

module.exports = router;
