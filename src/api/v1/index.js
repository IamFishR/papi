/**
 * API v1 routes
 */
const express = require('express');
const authRoutes = require('./auth/auth.route');
const userRoutes = require('./users/users.route');
const productRoutes = require('./products/products.route');
const orderRoutes = require('./orders/orders.route');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
