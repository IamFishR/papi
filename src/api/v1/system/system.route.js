/**
 * System Management Routes - handles system-level operations
 */
const express = require('express');
const botRoutes = require('./bot.route');

const router = express.Router();

// Bot management routes
router.use('/bot', botRoutes);

module.exports = router;