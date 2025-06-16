/**
 * API v1 routes
 */
const express = require('express');
const authRoutes = require('./auth/auth.route');
const userRoutes = require('./users/users.route');
const productRoutes = require('./products/products.route');
const orderRoutes = require('./orders/orders.route');
const journalRoutes = require('./journal/journal.route');

// Alert system routes
const stocksRoutes = require('./stocks/stocks.route');
const alertsRoutes = require('./alerts/alerts.route');
const watchlistsRoutes = require('./watchlists/watchlists.route');
const notificationsRoutes = require('./notifications/notifications.route');
const referenceRoutes = require('./reference/reference.route');

const router = express.Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/journal', journalRoutes);

// Register alert system routes
router.use('/stocks', stocksRoutes);
router.use('/alerts', alertsRoutes);
router.use('/watchlists', watchlistsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/reference', referenceRoutes);

module.exports = router;
